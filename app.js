// ============================================
// YETFEM HOTEL - MODERN JAVASCRIPT
// ============================================

"use strict";

// ===== CONFIGURATION =====
const CONFIG = {
  heroSlideInterval: 7000,
  testimonialInterval: 5000,
  scrollThreshold: 500,
  animationDelay: 100,
};

// ===== ROOM DATA =====
const roomsData = {
  standard: {
    title: "Standard Room",
    price: "₦25,000",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    description:
      "Our cozy Standard Room is perfect for solo travelers or couples seeking comfort and value. Featuring a comfortable queen-size bed, modern furnishings, and all essential amenities, this room provides everything you need for a pleasant stay. The room is tastefully decorated with warm tones and includes a work desk, making it suitable for both leisure and business travelers.",
    features: [
      { icon: "bed", text: "Queen Size Bed" },
      { icon: "users", text: "Sleeps 2 Guests" },
      { icon: "wifi", text: "Free High-Speed WiFi" },
      { icon: "tv", text: "Flat Screen TV" },
      { icon: "wind", text: "Air Conditioning" },
      { icon: "shower", text: "Private Bathroom" },
      { icon: "mug-hot", text: "Tea/Coffee Maker" },
      { icon: "concierge-bell", text: "Room Service Available" },
    ],
  },
  deluxe: {
    title: "Deluxe Room",
    price: "₦15,000",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    description:
      "Experience enhanced comfort in our Deluxe Room, featuring upgraded amenities and more space. This room boasts a luxurious king-size bed, premium linens, a spacious work area, and a modern bathroom with upgraded fixtures. Perfect for guests who appreciate the finer details and extra space to relax after a busy day exploring Abuja.",
    features: [
      { icon: "bed", text: "King Size Bed" },
      { icon: "users", text: "Sleeps 2 Guests" },
      { icon: "wifi", text: "Free High-Speed WiFi" },
      { icon: "tv", text: "Smart TV with Netflix" },
      { icon: "wind", text: "Climate Control AC" },
      { icon: "bath", text: "Premium Bathroom Amenities" },
      { icon: "couch", text: "Seating Area" },
      { icon: "briefcase", text: "Work Desk & Chair" },
      { icon: "mug-hot", text: "Mini Bar" },
      { icon: "lock", text: "In-Room Safe" },
    ],
  },
  executive: {
    title: "Executive Suite",
    price: "₦50,000",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    description:
      "Indulge in luxury with our Executive Suite, the crown jewel of Yetfem Hotel. This spacious suite features a separate living area, king-size bed, premium furnishings, and stunning city views. The elegant bathroom includes a bathtub for ultimate relaxation. Perfect for special occasions, extended stays, or guests who demand the very best in comfort and style.",
    features: [
      { icon: "bed", text: "Luxury King Bed" },
      { icon: "users", text: "Sleeps 2-3 Guests" },
      { icon: "couch", text: "Separate Living Room" },
      { icon: "tv", text: "2 Smart TVs" },
      { icon: "wifi", text: "Premium WiFi" },
      { icon: "wind", text: "Climate Control" },
      { icon: "bath", text: "Bathtub & Rain Shower" },
      { icon: "mug-hot", text: "Full Mini Bar" },
      { icon: "eye", text: "City Views" },
      { icon: "briefcase", text: "Executive Work Station" },
      { icon: "concierge-bell", text: "Priority Room Service" },
      { icon: "spa", text: "Complimentary Toiletries" },
    ],
  },
  family: {
    title: "Family Room",
    price: "₦45,000",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
    description:
      "Our spacious Family Room is designed with families in mind, offering comfort and convenience for everyone. With two queen-size beds, extra seating space, and child-friendly amenities, this room ensures a comfortable stay for the whole family. The room is thoughtfully laid out to provide privacy and relaxation for both parents and children.",
    features: [
      { icon: "bed", text: "2 Queen Size Beds" },
      { icon: "users", text: "Sleeps 4 Guests" },
      { icon: "child", text: "Child-Friendly Setup" },
      { icon: "wifi", text: "Free WiFi" },
      { icon: "tv", text: "Large Smart TV" },
      { icon: "wind", text: "Air Conditioning" },
      { icon: "couch", text: "Extra Seating Area" },
      { icon: "shower", text: "Spacious Bathroom" },
      { icon: "mug-hot", text: "Tea/Coffee Facilities" },
      { icon: "gamepad", text: "Kids Entertainment" },
    ],
  },
};

// ===== TESTIMONIALS DATA =====
const testimonialsData = [
  {
    text: "Amazing experience! The staff were incredibly friendly and the rooms were spotless. Yetfem Hotel exceeded all my expectations. Will definitely return!",
    author: "Adebayo Johnson",
    role: "Business Traveler",
    avatar: "AJ",
  },
  {
    text: "Perfect location and excellent service! The rooms are beautiful and very clean. The restaurant food was delicious. Highly recommend for anyone visiting Abuja.",
    author: "Chioma Okafor",
    role: "Tourist",
    avatar: "CO",
  },
  {
    text: "Best hotel experience in Abuja! The family room was spacious and comfortable. Staff went above and beyond to make our stay memorable. Five stars!",
    author: "Michael Adekunle",
    role: "Family Vacation",
    avatar: "MA",
  },
];

// ===== DOM ELEMENTS =====
const DOM = {
  preloader: document.getElementById("preloader"),
  navbar: document.getElementById("navbar"),
  hamburger: document.getElementById("hamburger"),
  navLinks: document.getElementById("navLinks"),
  navLinksItems: document.querySelectorAll(".nav-link"),
  heroSlides: document.querySelectorAll(".hero-slide"),
  roomCards: document.querySelectorAll(".room-card"),
  modal: document.getElementById("roomModal"),
  modalClose: document.getElementById("modalClose"),
  modalBackdrop: document.querySelector(".modal-backdrop"),
  contactForm: document.getElementById("contactForm"),
  scrollTop: document.getElementById("scrollTop"),
  testimonialPrev: document.querySelector(".testimonial-nav.prev"),
  testimonialNext: document.querySelector(".testimonial-nav.next"),
  testimonialDots: document.querySelectorAll(".testimonial-dots .dot"),
};

// ===== STATE =====
const state = {
  currentTestimonial: 0,
  currentHeroSlide: 0,
  intervals: {
    hero: null,
    testimonial: null,
  },
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// ===== PRELOADER =====
const Preloader = {
  init() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        if (DOM.preloader) {
          DOM.preloader.classList.add("hidden");
          document.body.style.overflow = "";
          AOS.init();
        }
      }, 1000);
    });
  },
};

// ===== ANIMATE ON SCROLL =====
const AOS = {
  init() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("aos-animate");
        }
      });
    }, observerOptions);

    document
      .querySelectorAll("[data-aos]")
      .forEach((el) => observer.observe(el));
  },
};

// ===== NAVIGATION =====
const Navigation = {
  init() {
    this.setupHamburger();
    this.setupScrollEffect();
    this.setupActiveLinks();
  },

  setupHamburger() {
    if (!DOM.hamburger || !DOM.navLinks) return;

    DOM.hamburger.addEventListener("click", () => {
      DOM.hamburger.classList.toggle("active");
      DOM.navLinks.classList.toggle("active");
      document.body.style.overflow = DOM.navLinks.classList.contains("active")
        ? "hidden"
        : "";
    });

    DOM.navLinksItems.forEach((link) => {
      link.addEventListener("click", () => {
        DOM.hamburger.classList.remove("active");
        DOM.navLinks.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  },

  setupScrollEffect() {
    if (!DOM.navbar) return;

    const handleScroll = Utils.throttle(() => {
      if (window.pageYOffset > 100) {
        DOM.navbar.classList.add("scrolled");
      } else {
        DOM.navbar.classList.remove("scrolled");
      }
      this.updateActiveNavLink();
    }, 100);

    window.addEventListener("scroll", handleScroll);
  },

  updateActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        DOM.navLinksItems.forEach((link) => link.classList.remove("active"));
        if (navLink) navLink.classList.add("active");
      }
    });
  },

  setupActiveLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#") return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      });
    });
  },
};

// ===== HERO SLIDER =====
// ===== HERO SLIDER =====
const HeroSlider = {
  init() {
    if (DOM.heroSlides.length === 0) return;
    // Ensure first slide is active
    DOM.heroSlides[0].classList.add("active");
    this.startAutoSlide();
  },

  changeSlide() {
    DOM.heroSlides[state.currentHeroSlide].classList.remove("active");
    state.currentHeroSlide =
      (state.currentHeroSlide + 1) % DOM.heroSlides.length;
    DOM.heroSlides[state.currentHeroSlide].classList.add("active");
  },

  startAutoSlide() {
    setInterval(() => this.changeSlide(), CONFIG.heroSlideInterval);
  },
};
// ===== ROOM MODAL =====
const RoomModal = {
  init() {
    this.setupOpenHandlers();
    this.setupCloseHandlers();
    this.setupKeyboardNav();
  },

  setupOpenHandlers() {
    DOM.roomCards.forEach((card) => {
      const buttons = card.querySelectorAll(".room-detail-btn, .btn-ghost");
      buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          const roomType = card.getAttribute("data-room");
          this.open(roomType);
        });
      });
    });
  },

  setupCloseHandlers() {
    if (DOM.modalClose) {
      DOM.modalClose.addEventListener("click", () => this.close());
    }

    if (DOM.modalBackdrop) {
      DOM.modalBackdrop.addEventListener("click", () => this.close());
    }
  },

  setupKeyboardNav() {
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        DOM.modal &&
        DOM.modal.classList.contains("active")
      ) {
        this.close();
      }
    });
  },

  open(roomType) {
    const room = roomsData[roomType];
    if (!room) return;

    document.getElementById("modalImage").src = room.image;
    document.getElementById("modalTitle").textContent = room.title;
    document.getElementById("modalAmount").textContent = room.price;
    document.getElementById("modalDescription").textContent = room.description;

    const featuresHTML = room.features
      .map(
        (feature) => `
      <div class="modal-feature">
        <i class="fas fa-${feature.icon}"></i>
        <span>${feature.text}</span>
      </div>
    `,
      )
      .join("");

    document.getElementById("modalFeatures").innerHTML = featuresHTML;

    DOM.modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  close() {
    DOM.modal.classList.remove("active");
    document.body.style.overflow = "";
  },
};

// ===== TESTIMONIALS =====
const Testimonials = {
  init() {
    this.setupNavigation();
    this.startAutoRotate();
  },

  update(index) {
    const testimonial = testimonialsData[index];

    const textEl = document.querySelector(".testimonial-text");
    const avatarEl = document.querySelector(".author-avatar");
    const nameEl = document.querySelector(".author-info h5");
    const roleEl = document.querySelector(".author-info p");

    if (textEl) textEl.textContent = `"${testimonial.text}"`;
    if (avatarEl) avatarEl.textContent = testimonial.avatar;
    if (nameEl) nameEl.textContent = testimonial.author;
    if (roleEl) roleEl.textContent = testimonial.role;

    DOM.testimonialDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  },

  setupNavigation() {
    if (DOM.testimonialPrev) {
      DOM.testimonialPrev.addEventListener("click", () => {
        state.currentTestimonial =
          (state.currentTestimonial - 1 + testimonialsData.length) %
          testimonialsData.length;
        this.update(state.currentTestimonial);
      });
    }

    if (DOM.testimonialNext) {
      DOM.testimonialNext.addEventListener("click", () => {
        state.currentTestimonial =
          (state.currentTestimonial + 1) % testimonialsData.length;
        this.update(state.currentTestimonial);
      });
    }

    DOM.testimonialDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        state.currentTestimonial = index;
        this.update(state.currentTestimonial);
      });
    });
  },

  startAutoRotate() {
    state.intervals.testimonial = setInterval(() => {
      state.currentTestimonial =
        (state.currentTestimonial + 1) % testimonialsData.length;
      this.update(state.currentTestimonial);
    }, CONFIG.testimonialInterval);
  },
};

// ===== CONTACT FORM =====
const ContactForm = {
  init() {
    if (!DOM.contactForm) return;

    DOM.contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit(e.target);
    });
  },

  handleSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    Notification.show(
      "Thank you for your message! We will get back to you soon.",
      "success",
    );
    form.reset();
  },
};

// ===== SMOOTH SCROLL =====
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#") return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      });
    });
  },
};

// ===== SCROLL TO TOP =====
const ScrollToTop = {
  init() {
    if (!DOM.scrollTop) return;

    const handleScroll = Utils.throttle(() => {
      if (window.pageYOffset > CONFIG.scrollThreshold) {
        DOM.scrollTop.classList.add("visible");
      } else {
        DOM.scrollTop.classList.remove("visible");
      }
    }, 100);

    window.addEventListener("scroll", handleScroll);

    DOM.scrollTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  },
};

// ===== NOTIFICATION SYSTEM =====
const Notification = {
  show(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    const icon = type === "success" ? "check-circle" : "info-circle";
    const bgColor = type === "success" ? "#10B981" : "#3B82F6";

    notification.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    `;

    Object.assign(notification.style, {
      position: "fixed",
      top: "100px",
      right: "30px",
      background: bgColor,
      color: "white",
      padding: "18px 25px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      zIndex: "10000",
      animation: "slideInRight 0.4s ease",
      fontSize: "0.95rem",
      fontWeight: "500",
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.4s ease";
      setTimeout(() => notification.remove(), 400);
    }, 4000);
  },
};

// ===== PARALLAX EFFECT =====
const Parallax = {
  init() {
    const parallaxElements = document.querySelectorAll(".hero-slide");
    if (parallaxElements.length === 0) return;

    const handleScroll = Utils.throttle(() => {
      const scrolled = window.pageYOffset;
      parallaxElements.forEach((el) => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    }, 50);

    window.addEventListener("scroll", handleScroll);
  },
};

// ===== ANIMATIONS =====
const Animations = {
  addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
      }
    `;
    document.head.appendChild(style);
  },
};

// ===== PERFORMANCE OPTIMIZATION =====
const Performance = {
  init() {
    this.lazyLoadImages();
    this.preloadCriticalImages();
  },

  lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]");
    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          observer.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  },

  preloadCriticalImages() {
    const criticalImages = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600",
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    });
  },
};

// ===== MAIN INITIALIZATION =====
const App = {
  init() {
    console.log(
      "%c🏨 Yetfem Hotel - Luxury Boutique Experience",
      "color: #C9A55C; font-size: 20px; font-weight: bold;",
    );
    console.log(
      "%c✨ Website Loaded Successfully",
      "color: #10B981; font-size: 14px;",
    );

    Preloader.init();
    Navigation.init();
    HeroSlider.init();
    RoomModal.init();
    Testimonials.init();
    ContactForm.init();
    SmoothScroll.init();
    ScrollToTop.init();
    Parallax.init();
    Animations.addStyles();
    Performance.init();
  },
};

// ===== EXECUTE ON DOM READY =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => App.init());
} else {
  App.init();
}

// ===== CLEANUP ON PAGE UNLOAD =====
window.addEventListener("beforeunload", () => {
  if (state.intervals.hero) clearInterval(state.intervals.hero);
  if (state.intervals.testimonial) clearInterval(state.intervals.testimonial);
});

// ===== EXPORT FOR MODULE USAGE =====
if (typeof module !== "undefined" && module.exports) {
  module.exports = { roomsData, testimonialsData, App };
}
