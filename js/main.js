(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Page loader ---------- */
  window.addEventListener("load", function () {
    var loader = document.querySelector(".page-loader");
    if (loader) setTimeout(function () { loader.classList.add("is-hidden"); }, 250);
  });

  /* ---------- Sticky header ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  onScroll();
  document.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navMain = document.querySelector(".nav-main");
  if (navToggle && navMain) {
    navToggle.addEventListener("click", function () {
      var open = navMain.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    navMain.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navMain.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Active nav link ---------- */
  var here = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav-main a[href]").forEach(function (a) {
    var href = a.getAttribute("href").split("#")[0];
    if (href === here || (here === "" && href === "index.html")) a.classList.add("active");
  });

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = null;
    var dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); cIo.unobserve(entry.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cIo.observe(el); });
  }

  /* ---------- Results lightbox ---------- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector(".lightbox-cap");
    document.querySelectorAll("[data-lightbox]").forEach(function (item) {
      item.addEventListener("click", function () {
        var full = item.getAttribute("data-lightbox");
        var cap = item.getAttribute("data-caption") || "";
        lbImg.src = full;
        lbImg.alt = cap;
        if (lbCap) lbCap.textContent = cap;
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });
    function closeLb() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.closest(".lightbox-close")) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLb();
    });
  }

  /* ---------- Hero entrance (GSAP if present) ---------- */
  function splitWords(el) {
    var text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = text
      .split(" ")
      .map(function (w) { return '<span class="w"><span class="wi">' + w + "</span></span>"; })
      .join(" ");
  }
  var heroHead = document.querySelector("[data-split-hero]");
  if (heroHead) splitWords(heroHead);

  function runHeroAnim() {
    if (!window.gsap) return;
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (heroHead) {
      gsap.set(heroHead.querySelectorAll(".wi"), { yPercent: 120 });
      tl.to(heroHead.querySelectorAll(".wi"), { yPercent: 0, duration: 0.9, stagger: 0.06 });
    }
    tl.fromTo(
      "[data-hero-fade]",
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
      heroHead ? "-=0.5" : 0
    );
    tl.fromTo("[data-hero-visual]", { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1 }, "-=0.7");
  }

  if (reduceMotion) {
    document.querySelectorAll("[data-hero-fade],[data-hero-visual]").forEach(function (el) {
      el.style.opacity = 1;
    });
    if (heroHead) heroHead.querySelectorAll(".wi").forEach(function (w) { w.style.transform = "none"; });
  } else if (window.gsap) {
    /* The mobile/tablet static hero's photo columns scroll continuously via
       pure CSS (@keyframes hero-col-up/down), so no scroll-linked GSAP work
       is needed here beyond the shared entrance fade below. */
    runHeroAnim();
  } else {
    document.querySelectorAll("[data-hero-fade],[data-hero-visual]").forEach(function (el) {
      el.style.opacity = 1;
    });
  }

  /* ---------- View Transitions between internal pages ---------- */
  if (document.startViewTransition) {
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      var url;
      try { url = new URL(a.href); } catch (e) { return; }
      if (url.origin !== location.origin) return;
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        document.startViewTransition(function () {
          location.href = a.href;
        });
      });
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Today highlight in hours table ---------- */
  var dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var todayKey = dayMap[new Date().getDay()];
  document.querySelectorAll("[data-day]").forEach(function (row) {
    if (row.getAttribute("data-day") === todayKey) row.classList.add("today");
  });
})();
