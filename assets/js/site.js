/* CLUTCH Co. — small enhancements: mobile nav, background video, form handling. */
(function () {
  "use strict";

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
