/* CLUTCH Co. — small enhancements: mobile nav and the background video. */
(function () {
  "use strict";

  // Mobile navigation ------------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) setOpen(false);
    });
  }

  // Header bar: solid at the top of the page, glass once scrolled ------------
  var bar = document.getElementById("site-bar");
  if (bar) {
    var ticking = false;
    var update = function () {
      bar.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // Background video: respect reduced motion, pause when off screen --------
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("video[data-bg]").forEach(function (video) {
    if (reduce.matches) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    var play = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? play() : video.pause(); });
      }, { threshold: 0.1 }).observe(video);
    } else {
      play();
    }
    document.addEventListener("visibilitychange", function () {
      document.hidden ? video.pause() : play();
    });
  });
})();
