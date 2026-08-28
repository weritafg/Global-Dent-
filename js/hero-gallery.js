(function () {
  "use strict";
  var wrap = document.getElementById("heroScroll");
  if (!wrap || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.matchMedia({
    "(min-width: 1000px) and (prefers-reduced-motion: no-preference)": function () {
      var stage = wrap.querySelector(".hero-stage");
      var gridInner = document.getElementById("heroGridInner");
      var scrim = document.getElementById("heroScrim");
      var logo = document.getElementById("heroOpenLogo");
      var copy = document.getElementById("heroCopy");
      var cue = document.getElementById("heroCue");
      var cols = [
        document.getElementById("heroCol1"),
        document.getElementById("heroCol2"),
        document.getElementById("heroCol3"),
        document.getElementById("heroCol4"),
      ];

      var colStart = [0, -22, 5, -12];
      var colEnd = [-20, 8, -18, 10];

      gsap.set(gridInner, { rotateY: -26, rotateX: 14, rotateZ: 7, z: -420, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(scrim, { opacity: 1 });
      gsap.set(logo, { opacity: 0, scale: 0.92 });
      gsap.set(copy, { opacity: 0, y: 26, pointerEvents: "none" });
      cols.forEach(function (col, i) { if (col) gsap.set(col, { yPercent: colStart[i] }); });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: stage,
          anticipatePin: 1,
        },
      });

      // Phase 1a — the logo greets first, alone on black
      tl.to(logo, { opacity: 1, scale: 1, duration: 0.035, ease: "power1.out" }, 0)
        .to(logo, { opacity: 0, scale: 1.05, duration: 0.05, ease: "power1.in" }, 0.06);

      // Phase 1b — then the black fades to reveal the photo grid
      tl.to(cue, { opacity: 0, duration: 0.08 }, 0.09)
        .to(scrim, { opacity: 0, duration: 0.12, ease: "power1.out" }, 0.07)
        .to(gridInner, { opacity: 1, duration: 0.12, ease: "power1.out" }, 0.07);

      // Phase 2 — 3D tilt settles while columns drift (parallax)
      tl.to(gridInner, { rotateY: -4, rotateX: 2, rotateZ: 0.5, z: 0, duration: 0.66, ease: "power1.inOut" }, 0.18);

      cols.forEach(function (col, i) {
        if (col) tl.to(col, { yPercent: colEnd[i], duration: 0.66, ease: "none" }, 0.18);
      });

      // Phase 3 — dim to reveal the headline in white
      tl.to(gridInner, { opacity: 0.3, duration: 0.16, ease: "power1.in" }, 0.84)
        .to(scrim, { opacity: 1, duration: 0.16 }, 0.82)
        .to(copy, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.16, ease: "power2.out" }, 0.86);

      return function () {
        tl.kill();
      };
    },
  });
})();
