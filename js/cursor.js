(function () {
  "use strict";
  if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var dot = document.createElement("div");
  dot.className = "cursor-dot";
  var ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.documentElement.classList.add("has-cursor");

  var mouseX = -100, mouseY = -100;
  var ringX = -100, ringY = -100;
  var primed = false;

  function setDotPos(x, y) {
    dot.style.transform = "translate3d(" + (x - 3) + "px," + (y - 3) + "px,0)";
  }
  function setRingPos(x, y, size) {
    var half = size / 2;
    ring.style.transform = "translate3d(" + (x - half) + "px," + (y - half) + "px,0)";
  }

  window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setDotPos(mouseX, mouseY);
    if (!primed) {
      ringX = mouseX;
      ringY = mouseY;
      primed = true;
    }
  }, { passive: true });

  function tick() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    var size = ring.classList.contains("is-hover") ? 60 : 32;
    setRingPos(ringX, ringY, size);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  var hoverSelector = "a, button, .btn, .card, .service-card, .team-card, .review-card, .svc-item, [data-cursor-hover]";
  var textSelector = "input, textarea, select, [contenteditable]";

  document.addEventListener("mouseover", function (e) {
    var target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest(textSelector)) {
      dot.classList.remove("is-hover");
      ring.classList.remove("is-hover");
      dot.classList.add("is-text");
      ring.classList.add("is-text");
    } else if (target.closest(hoverSelector)) {
      dot.classList.remove("is-text");
      ring.classList.remove("is-text");
      dot.classList.add("is-hover");
      ring.classList.add("is-hover");
    }
  });

  document.addEventListener("mouseout", function (e) {
    var target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest(hoverSelector) || target.closest(textSelector)) {
      dot.classList.remove("is-hover", "is-text");
      ring.classList.remove("is-hover", "is-text");
    }
  });

  document.addEventListener("mousedown", function () {
    dot.classList.add("is-down");
    ring.classList.add("is-down");
  });
  document.addEventListener("mouseup", function () {
    dot.classList.remove("is-down");
    ring.classList.remove("is-down");
  });

  document.addEventListener("mouseleave", function () {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });
  document.addEventListener("mouseenter", function () {
    dot.style.opacity = "";
    ring.style.opacity = "";
  });

  /* Magnetic pull on the site's highest-intent CTAs only, so it stays a
     rare, deliberate touch rather than a blanket hover effect. */
  var magnets = document.querySelectorAll(
    ".hero-copy .btn-primary, .hero .btn-primary, .cta-band .btn, .booking-shell .btn-primary"
  );
  magnets.forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width / 2) * 0.25;
      var dy = (e.clientY - r.top - r.height / 2) * 0.25;
      el.style.transition = "";
      el.style.transform = "translate(" + dx + "px," + (dy - 3) + "px)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transition = "transform .4s cubic-bezier(.16,1,.3,1)";
      el.style.transform = "";
    });
  });
})();
