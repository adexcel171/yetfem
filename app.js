/* ============================================
   YETFEM HOTEL — Shared JavaScript
   ============================================ */

// ── Preloader ──────────────────────────────────────────
window.addEventListener("load", () => {
  const pre = document.getElementById("preloader");
  if (pre) {
    setTimeout(() => pre.classList.add("hidden"), 500);
  }
});

// ── Navbar scroll ──────────────────────────────────────
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}

// ── Hamburger ──────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
  });
  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });
}

// ── Active nav link (multipage) ────────────────────────
(function setActiveNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.includes(page) && !href.startsWith("#")) {
      link.classList.add("active");
    }
  });
})();

// ── Scroll to top ──────────────────────────────────────
const scrollTopBtn = document.getElementById("scrollTop");
if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
  });
  scrollTopBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

// ── Simple AOS (Animate on scroll) ────────────────────
(function initAOS() {
  const elements = document.querySelectorAll("[data-aos]");
  if (!elements.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.aosDelay
            ? parseInt(e.target.dataset.aosDelay)
            : 0;
          setTimeout(() => e.target.classList.add("aos-animate"), delay);
        }
      });
    },
    { threshold: 0.12 },
  );
  elements.forEach((el) => observer.observe(el));
})();

// ── Contact Form ───────────────────────────────────────
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i><span>Message Sent!</span>';
    btn.style.background = "linear-gradient(135deg,#10b981,#059669)";
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = "";
      contactForm.reset();
    }, 3000);
  });
}

// ── Room Modal (index page) ────────────────────────────
const roomData = {
  standard: {
    title: "Standard Room",
    price: "₦25,000",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900",
    description:
      "Perfect for couples or solo travelers, our Standard Room offers cozy comfort with modern amenities. Thoughtfully designed with elegant furnishings and all the essentials for a restful stay.",
    features: [
      "Queen Bed",
      "Free WiFi",
      "Smart TV",
      "Air Conditioning",
      "Private Bathroom",
      "Room Service",
      "2 Guests Max",
      "City View",
    ],
  },
  deluxe: {
    title: "Deluxe Room",
    price: "₦35,000",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900",
    description:
      "Enhanced comfort with premium furnishings. Our Deluxe Room is ideal for guests seeking extra space and a touch of luxury, featuring a separate seating area and upgraded amenities.",
    features: [
      "King Bed",
      "Seating Area",
      "Mini Bar",
      "Free WiFi",
      "Smart TV",
      "Air Conditioning",
      "Private Bathroom",
      "2 Guests Max",
    ],
  },
  executive: {
    title: "Executive Suite",
    price: "₦55,000",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900",
    description:
      "Our Executive Suite represents the pinnacle of luxury. Featuring a separate living area, premium minibar, and panoramic views—perfect for distinguished guests and special occasions.",
    features: [
      "King Bed",
      "Living Room",
      "Jacuzzi Bath",
      "Premium Minibar",
      "Butler Service",
      "City Panorama",
      "Free WiFi",
      "2–3 Guests",
    ],
  },
  family: {
    title: "Family Room",
    price: "₦45,000",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900",
    description:
      "Spacious and welcoming, our Family Room is designed to accommodate the whole family. With multiple beds, extra space, and child-friendly amenities, it is the perfect home away from home.",
    features: [
      "2 Queen Beds",
      "Bunk Bed Option",
      "Large Bathroom",
      "Kids Amenities",
      "Free WiFi",
      "Smart TV",
      "Air Conditioning",
      "4 Guests Max",
    ],
  },
};

document.querySelectorAll(".room-detail-btn, [data-room]").forEach((el) => {
  el.addEventListener("click", () => {
    const card = el.closest("[data-room]");
    if (!card) return;
    const key = card.dataset.room;
    const data = roomData[key];
    if (!data) return;
    document.getElementById("modalTitle").textContent = data.title;
    document.getElementById("modalAmount").textContent = data.price;
    document.getElementById("modalImage").src = data.image;
    document.getElementById("modalImage").alt = data.title;
    document.getElementById("modalDescription").textContent = data.description;
    const featsEl = document.getElementById("modalFeatures");
    featsEl.innerHTML = data.features
      .map(
        (f) =>
          `<div class="modal-feature"><i class="fas fa-check-circle"></i><span>${f}</span></div>`,
      )
      .join("");
    document.getElementById("roomModal").classList.add("active");
    document.body.style.overflow = "hidden";
  });
});
["modalClose", "roomModal"].forEach((id) => {
  const el = document.getElementById(id);
  if (el)
    el.addEventListener("click", (e) => {
      if (id === "roomModal" && e.target !== el) return;
      document.getElementById("roomModal").classList.remove("active");
      document.body.style.overflow = "";
    });
});

// ── Testimonial slider ─────────────────────────────────
(function initTestimonials() {
  const testimonials = [
    {
      text: "Amazing experience! The staff were incredibly friendly and the rooms were spotless. Yetfem Hotel exceeded all my expectations. Will definitely return!",
      name: "Adebayo Johnson",
      role: "Business Traveler",
      initials: "AJ",
    },
    {
      text: "A hidden gem in Abuja! The location is perfect, the rooms are beautiful and the service is outstanding. I felt completely at home throughout my stay.",
      name: "Ngozi Okonkwo",
      role: "Leisure Traveler",
      initials: "NO",
    },
    {
      text: "Absolutely love this place. The ambiance is top notch and the staff goes above and beyond. Perfect for both business and leisure stays in Abuja.",
      name: "Emeka Chukwu",
      role: "Corporate Guest",
      initials: "EC",
    },
  ];
  let current = 0;
  const card = document.querySelector(".testimonial-card");
  const dots = document.querySelectorAll(".dot");
  if (!card) return;

  function render(i) {
    const t = testimonials[i];
    card.style.opacity = "0";
    setTimeout(() => {
      card.querySelector(".testimonial-text").textContent = t.text;
      card.querySelector(".author-avatar").textContent = t.initials;
      card.querySelector("h5").textContent = t.name;
      card.querySelector(".author-info > p").textContent = t.role;
      dots.forEach((d, di) => d.classList.toggle("active", di === i));
      card.style.opacity = "1";
    }, 300);
  }
  card.style.transition = "opacity 0.3s ease";
  document
    .querySelector(".testimonial-nav.next")
    ?.addEventListener("click", () => {
      current = (current + 1) % testimonials.length;
      render(current);
    });
  document
    .querySelector(".testimonial-nav.prev")
    ?.addEventListener("click", () => {
      current = (current - 1 + testimonials.length) % testimonials.length;
      render(current);
    });
  dots.forEach((d, i) =>
    d.addEventListener("click", () => {
      current = i;
      render(i);
    }),
  );
  setInterval(() => {
    current = (current + 1) % testimonials.length;
    render(current);
  }, 6000);
})();

// ── Hero slide show (index page) ────────────────────────
(function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides.length) return;
  let idx = 0;
  setInterval(() => {
    slides[idx].classList.remove("active");
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add("active");
  }, 5000);
})();

// ── Abstract Canvas Video (Hero) ───────────────────────
(function initAbstractHero() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Particle system
  const particles = [];
  const PARTICLE_COUNT = 90;
  const gold = [
    "rgba(212,175,55,",
    "rgba(224,164,88,",
    "rgba(176,141,31,",
    "rgba(255,215,80,",
    "rgba(255,255,255,",
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 10;
      this.r = Math.random() * 2.5 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.15);
      this.alpha = Math.random() * 0.7 + 0.1;
      this.fade = Math.random() * 0.003 + 0.001;
      this.color = gold[Math.floor(Math.random() * gold.length)];
      this.life = 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.fade;
      if (this.life <= 0 || this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha * this.life + ")";
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Flowing wave lines
  let t = 0;
  function drawWaves() {
    const W = canvas.width,
      H = canvas.height;
    for (let w = 0; w < 5; w++) {
      ctx.beginPath();
      const amp = 40 + w * 18;
      const freq = 0.003 + w * 0.0008;
      const yBase = H * (0.3 + w * 0.12);
      const speed = 0.6 + w * 0.3;
      const alpha = 0.04 + w * 0.012;

      ctx.moveTo(0, yBase);
      for (let x = 0; x <= W; x += 4) {
        const y =
          yBase +
          Math.sin(x * freq + t * speed) * amp +
          Math.sin(x * freq * 2.1 + t * (speed * 0.7)) * (amp * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
      ctx.lineWidth = 1.5 - w * 0.15;
      ctx.stroke();
    }
  }

  // Bokeh / glow orbs
  const orbs = Array.from({ length: 8 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 180 + 80,
    a: Math.random() * 0.06 + 0.015,
    vx: (Math.random() - 0.5) * 0.00015,
    vy: (Math.random() - 0.5) * 0.0001,
  }));
  function drawOrbs() {
    const W = canvas.width,
      H = canvas.height;
    orbs.forEach((o) => {
      o.x += o.vx;
      o.y += o.vy;
      if (o.x < 0 || o.x > 1) o.vx *= -1;
      if (o.y < 0 || o.y > 1) o.vy *= -1;
      const grd = ctx.createRadialGradient(
        o.x * W,
        o.y * H,
        0,
        o.x * W,
        o.y * H,
        o.r,
      );
      grd.addColorStop(0, `rgba(212,175,55,${o.a})`);
      grd.addColorStop(1, "rgba(212,175,55,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(o.x * W, o.y * H, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep background gradient
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, "#07081a");
    bg.addColorStop(0.5, "#0b132b");
    bg.addColorStop(1, "#0d1b38");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawOrbs();
    drawWaves();
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    t += 0.012;
    requestAnimationFrame(animate);
  }
  animate();
})();

// ── Gallery Lightbox ───────────────────────────────────
(function initLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const lbImg = lb.querySelector(".lightbox-img");
  const lbClose = lb.querySelector(".lightbox-close");

  document
    .querySelectorAll(".gallery-item img, .gallery-item")
    .forEach((el) => {
      el.addEventListener("click", () => {
        const img = el.tagName === "IMG" ? el : el.querySelector("img");
        if (!img) return;
        lbImg.src = img.src;
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
  lbClose?.addEventListener("click", () => {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb) {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
})();

// ── Rooms filter (rooms.html) ──────────────────────────
(function initRoomsFilter() {
  const btns = document.querySelectorAll(".filter-btn");
  if (!btns.length) return;
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      document.querySelectorAll(".room-card").forEach((card) => {
        if (filter === "all" || card.dataset.filter === filter) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
})();
