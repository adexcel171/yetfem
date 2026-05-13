/**
 * ============================================================
 *  YETFEM HOTEL — Booking System Server  (booking.js)
 *  Stack : Node.js · Express · MongoDB (Mongoose) · JWT
 *  Run   : node booking.js   (or: nodemon booking.js)
 *  Env   : copy .env.example → .env and fill values
 * ============================================================
 *
 *  ROOM INVENTORY  (17 total)
 *  ─────────────────────────────────────────────────────────
 *  Standard  · 8 rooms  · ₦12,000 / night  (101–108)
 *  Deluxe    · 6 rooms  · ₦15,000 / night  (201–206)
 *  Executive · 3 rooms  · ₦55,000 / night  (301–303)
 *
 *  PUBLIC ENDPOINTS
 *  ─────────────────────────────────────────────────────────
 *  GET  /api/availability?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD
 *  POST /api/bookings          – create booking
 *  GET  /api/bookings/:ref     – guest: look up own booking
 *
 *  ADMIN ENDPOINTS  (Bearer JWT required)
 *  ─────────────────────────────────────────────────────────
 *  POST /api/admin/login
 *  GET  /api/admin/bookings
 *  GET  /api/admin/bookings/:id
 *  PATCH /api/admin/bookings/:id   { status }
 *  DELETE /api/admin/bookings/:id
 *  GET  /api/admin/rooms           – live room grid
 *  GET  /api/admin/stats
 * ============================================================
 */

"use strict";

// ── Dependencies ────────────────────────────────────────────
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// ── Config ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yetfem";
const JWT_SECRET =
  process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION_SECRET_KEY";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "8h";

// ── Room master data ─────────────────────────────────────────
const ROOM_CATALOGUE = [
  // Standard  (101–108)
  ...Array.from({ length: 8 }, (_, i) => ({
    number: `10${i + 1}`,
    category: "standard",
    label: "Standard Room",
    price: 12000,
    maxGuests: 2,
    floor: 1,
  })),
  // Deluxe  (201–206)
  ...Array.from({ length: 6 }, (_, i) => ({
    number: `20${i + 1}`,
    category: "deluxe",
    label: "Deluxe Room",
    price: 15000,
    maxGuests: 2,
    floor: 2,
  })),
  // Executive  (301–303)
  ...Array.from({ length: 3 }, (_, i) => ({
    number: `30${i + 1}`,
    category: "executive",
    label: "Executive Suite",
    price: 55000,
    maxGuests: 3,
    floor: 3,
  })),
];

// ── Mongoose schemas ─────────────────────────────────────────

/* Booking */
const bookingSchema = new mongoose.Schema(
  {
    ref: {
      type: String,
      unique: true,
      default: () => "YH" + Date.now().toString(36).toUpperCase(),
    },
    // guest details
    guestName: { type: String, required: true, trim: true },
    guestPhone: { type: String, required: true, trim: true },
    guestEmail: { type: String, trim: true, lowercase: true },
    guestCount: { type: Number, required: true, min: 1 },
    // room
    roomNumber: { type: String, required: true },
    roomCategory: {
      type: String,
      required: true,
      enum: ["standard", "deluxe", "executive"],
    },
    roomLabel: { type: String },
    pricePerNight: { type: Number, required: true },
    // dates  (stored as UTC date strings "YYYY-MM-DD" for simplicity)
    checkin: { type: String, required: true }, // "YYYY-MM-DD"
    checkout: { type: String, required: true }, // "YYYY-MM-DD"
    nights: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    // status
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "checked-out", "cancelled"],
      default: "pending",
    },
    notes: { type: String, trim: true },
    paymentRef: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

/* Ensure no double booking: unique compound index on roomNumber + date overlap
   We enforce this logic in the route rather than a DB index (easier for range checks) */
bookingSchema.index({ roomNumber: 1, checkin: 1 });

/* Admin user */
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["superadmin", "receptionist"],
    default: "receptionist",
  },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
const Admin = mongoose.model("Admin", adminSchema);

// ── Helpers ──────────────────────────────────────────────────

/** Returns number of nights between two "YYYY-MM-DD" strings */
function calcNights(checkin, checkout) {
  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  return Math.round((d2 - d1) / 86_400_000);
}

/**
 * Find all room numbers of a category that are AVAILABLE
 * for the given date range (no overlap with active bookings).
 */
async function getAvailableRooms(category, checkin, checkout) {
  // A booking conflicts if: booking.checkin < checkout AND booking.checkout > checkin
  const conflicts = await Booking.find({
    roomCategory: category,
    status: { $nin: ["cancelled"] },
    checkin: { $lt: checkout },
    checkout: { $gt: checkin },
  }).select("roomNumber");

  const bookedNums = new Set(conflicts.map((b) => b.roomNumber));

  return ROOM_CATALOGUE.filter(
    (r) => r.category === category && !bookedNums.has(r.number),
  ).map((r) => r.number);
}

/**
 * Assign the first available room for a category + dates.
 * Returns null when fully booked.
 */
async function assignRoom(category, checkin, checkout) {
  const available = await getAvailableRooms(category, checkin, checkout);
  return available.length ? available[0] : null;
}

// ── JWT middleware ────────────────────────────────────────────
function authAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token invalid or expired" });
  }
}

// ── App setup ────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: "*" }));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdnjs.cloudflare.com",
          "fonts.googleapis.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "cdnjs.cloudflare.com",
          "fonts.googleapis.com",
          "fonts.gstatic.com",
        ],
        fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
        imgSrc: [
          "'self'",
          "data:",
          "images.unsplash.com",
          "*.googleapis.com",
          "maps.gstatic.com",
        ],
        connectSrc: ["'self'"],
        frameSrc: ["'self'", "www.google.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json());
app.use(express.static(".")); // serve HTML files from same directory

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Stricter limit on booking creation (prevent spam)
const bookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Booking limit reached. Please call us directly." },
});

// ── PUBLIC ROUTES ────────────────────────────────────────────

/**
 * GET /api/availability?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD
 * Returns available room counts and sample room numbers per category.
 */
app.get("/api/availability", async (req, res) => {
  try {
    const { checkin, checkout } = req.query;
    if (!checkin || !checkout) {
      return res
        .status(400)
        .json({ error: "checkin and checkout are required" });
    }
    if (checkin >= checkout) {
      return res.status(400).json({ error: "checkout must be after checkin" });
    }

    const categories = ["standard", "deluxe", "executive"];
    const result = {};

    for (const cat of categories) {
      const rooms = await getAvailableRooms(cat, checkin, checkout);
      const meta = ROOM_CATALOGUE.find((r) => r.category === cat);
      result[cat] = {
        available: rooms.length,
        total: ROOM_CATALOGUE.filter((r) => r.category === cat).length,
        pricePerNight: meta?.price,
        label: meta?.label,
        maxGuests: meta?.maxGuests,
      };
    }

    res.json({ checkin, checkout, availability: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/bookings
 * Body: { guestName, guestPhone, guestEmail?, guestCount, category, checkin, checkout, notes? }
 */
app.post("/api/bookings", bookLimiter, async (req, res) => {
  try {
    const {
      guestName,
      guestPhone,
      guestEmail,
      guestCount,
      category,
      checkin,
      checkout,
      notes,
    } = req.body;

    // Validate required
    if (!guestName || !guestPhone || !category || !checkin || !checkout) {
      return res.status(400).json({
        error:
          "Missing required fields: guestName, guestPhone, category, checkin, checkout",
      });
    }
    if (!["standard", "deluxe", "executive"].includes(category)) {
      return res.status(400).json({ error: "Invalid room category" });
    }
    if (checkin >= checkout) {
      return res.status(400).json({ error: "checkout must be after checkin" });
    }

    const today = new Date().toISOString().split("T")[0];
    if (checkin < today) {
      return res.status(400).json({ error: "checkin cannot be in the past" });
    }

    const nights = calcNights(checkin, checkout);
    if (nights < 1)
      return res.status(400).json({ error: "Minimum 1 night stay" });

    // Find and assign available room
    const roomNumber = await assignRoom(category, checkin, checkout);
    if (!roomNumber) {
      return res.status(409).json({
        error: `No ${category} rooms available for the selected dates. Please choose different dates or a different room type.`,
      });
    }

    const roomMeta = ROOM_CATALOGUE.find((r) => r.number === roomNumber);
    const totalAmount = roomMeta.price * nights;

    const booking = await Booking.create({
      guestName,
      guestPhone,
      guestEmail: guestEmail || "",
      guestCount: parseInt(guestCount) || 1,
      roomNumber,
      roomCategory: category,
      roomLabel: roomMeta.label,
      pricePerNight: roomMeta.price,
      checkin,
      checkout,
      nights,
      totalAmount,
      notes: notes || "",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        "Booking request received! We will confirm via WhatsApp or phone shortly.",
      booking: {
        ref: booking.ref,
        roomNumber: booking.roomNumber,
        roomLabel: booking.roomLabel,
        checkin: booking.checkin,
        checkout: booking.checkout,
        nights: booking.nights,
        pricePerNight: booking.pricePerNight,
        totalAmount: booking.totalAmount,
        status: booking.status,
      },
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Booking reference conflict, please retry." });
    }
    res.status(500).json({ error: "Server error. Please call us directly." });
  }
});

/**
 * GET /api/bookings/:ref
 * Guest self-service lookup by booking reference.
 */
app.get("/api/bookings/:ref", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      ref: req.params.ref.toUpperCase(),
    }).select("-__v -updatedAt");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── ADMIN ROUTES ─────────────────────────────────────────────

/**
 * POST /api/admin/login
 * Body: { username, password }
 */
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );
    res.json({ token, username: admin.username, role: admin.role });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/bookings
 * Query params: status, category, date (YYYY-MM-DD), search, page, limit
 */
app.get("/api/admin/bookings", authAdmin, async (req, res) => {
  try {
    const { status, category, date, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.roomCategory = category;
    if (date) {
      // bookings that overlap with this date
      filter.checkin = { $lte: date };
      filter.checkout = { $gt: date };
    }
    if (search) {
      filter.$or = [
        { guestName: { $regex: search, $options: "i" } },
        { guestPhone: { $regex: search, $options: "i" } },
        { ref: { $regex: search.toUpperCase(), $options: "i" } },
        { roomNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    res.json({ total, page: parseInt(page), limit: parseInt(limit), bookings });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/bookings/:id
 */
app.get("/api/admin/bookings/:id", authAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).select("-__v");
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PATCH /api/admin/bookings/:id
 * Body: { status?, notes?, paymentRef? }
 */
app.patch("/api/admin/bookings/:id", authAdmin, async (req, res) => {
  try {
    const { status, notes, paymentRef } = req.body;
    const allowed = [
      "pending",
      "confirmed",
      "checked-in",
      "checked-out",
      "cancelled",
    ];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;
    if (paymentRef) update.paymentRef = paymentRef;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true },
    );
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/admin/bookings/:id  (superadmin only)
 */
app.delete("/api/admin/bookings/:id", authAdmin, async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({ error: "Superadmin access required" });
    }
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/rooms?date=YYYY-MM-DD
 * Returns live grid of all 17 rooms with occupancy for a given date.
 */
app.get("/api/admin/rooms", authAdmin, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];

    // Bookings that are active on this date
    const active = await Booking.find({
      status: { $nin: ["cancelled"] },
      checkin: { $lte: date },
      checkout: { $gt: date },
    }).select("roomNumber guestName guestPhone checkin checkout status ref");

    const activeMap = {};
    active.forEach((b) => {
      activeMap[b.roomNumber] = b;
    });

    const rooms = ROOM_CATALOGUE.map((r) => ({
      ...r,
      occupied: !!activeMap[r.number],
      booking: activeMap[r.number] || null,
    }));

    res.json({ date, rooms });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/stats
 * Summary stats for dashboard.
 */
app.get("/api/admin/stats", authAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [
      totalBookings,
      pending,
      confirmed,
      checkedIn,
      checkedOut,
      cancelled,
      todayArrivals,
      todayDepartures,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "checked-in" }),
      Booking.countDocuments({ status: "checked-out" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({
        checkin: today,
        status: { $nin: ["cancelled"] },
      }),
      Booking.countDocuments({
        checkout: today,
        status: { $nin: ["cancelled"] },
      }),
    ]);

    // Occupancy today per category
    const occupancyData = {};
    for (const cat of ["standard", "deluxe", "executive"]) {
      const occ = await Booking.countDocuments({
        roomCategory: cat,
        status: { $nin: ["cancelled"] },
        checkin: { $lte: today },
        checkout: { $gt: today },
      });
      const total = ROOM_CATALOGUE.filter((r) => r.category === cat).length;
      occupancyData[cat] = { occupied: occ, total, free: total - occ };
    }

    // Revenue (confirmed + checked-in + checked-out)
    const revenueAgg = await Booking.aggregate([
      {
        $match: { status: { $in: ["confirmed", "checked-in", "checked-out"] } },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalBookings,
      byStatus: { pending, confirmed, checkedIn, checkedOut, cancelled },
      today: { arrivals: todayArrivals, departures: todayDepartures },
      occupancy: occupancyData,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Seed admin on first run ──────────────────────────────────
async function seedAdmin() {
  const exists = await Admin.findOne({ username: "admin" });
  if (!exists) {
    const hash = await bcrypt.hash("Yetfem@2025!", 12);
    await Admin.create({
      username: "admin",
      passwordHash: hash,
      role: "superadmin",
    });
    console.log("✅  Default admin created  →  admin / Yetfem@2025!");
    console.log("    ⚠️  Change the password immediately after first login!");
  }
}

// ── Bootstrap ────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅  MongoDB connected:", MONGO_URI);
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(
        `🚀  Yetfem Booking Server running at http://localhost:${PORT}`,
      );
      console.log(`    Admin dashboard → http://localhost:${PORT}/admin.html`);
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });

/*
 * ============================================================
 *  .env.example  (create a .env file with these values)
 * ============================================================
 *  PORT=3000
 *  MONGO_URI=mongodb://127.0.0.1:27017/yetfem
 *  JWT_SECRET=replace_with_a_long_random_secret_string
 *  JWT_EXPIRY=8h
 *
 *  INSTALL DEPENDENCIES
 *  npm install express mongoose bcryptjs jsonwebtoken cors helmet express-rate-limit dotenv
 *
 *  START
 *  node booking.js
 * ============================================================
 */
