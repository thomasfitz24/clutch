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

  // Services dropdown (desktop): opens on hover or click of the Services link,
  // closes when the pointer leaves the bar or moves to another link ---------
  var bar = document.getElementById("site-bar");
  var trigger = document.querySelector(".bar-nav .has-menu");
  var mega = document.getElementById("mega-services");
  var desktop = window.matchMedia("(min-width: 761px)");
  if (bar && trigger && mega) {
    var closeTimer;
    var setMega = function (open) {
      clearTimeout(closeTimer);
      bar.classList.toggle("mega-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    };
    var scheduleClose = function () { clearTimeout(closeTimer); closeTimer = setTimeout(function () { setMega(false); }, 120); };
    trigger.addEventListener("mouseenter", function () { if (desktop.matches) setMega(true); });
    bar.addEventListener("mouseleave", function () { if (desktop.matches) scheduleClose(); });
    bar.addEventListener("mouseenter", function () { clearTimeout(closeTimer); });
    bar.querySelectorAll(".bar-nav a:not(.has-menu), .bar-cta, .bar-logo").forEach(function (el) {
      el.addEventListener("mouseenter", function () { if (desktop.matches) setMega(false); });
    });
    trigger.addEventListener("click", function (e) {
      if (!desktop.matches) return;
      e.preventDefault();
      setMega(!bar.classList.contains("mega-open"));
    });
    bar.addEventListener("focusout", function (e) {
      if (!bar.contains(e.relatedTarget)) setMega(false);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMega(false); });
    document.addEventListener("click", function (e) { if (!bar.contains(e.target)) setMega(false); });

    // Hovering a service previews it in the card
    var megaTitle = mega.querySelector(".mega-card-title");
    var megaText = mega.querySelector(".mega-card-text");
    var megaDefault = { title: megaTitle.textContent, text: megaText.textContent };
    var showPreview = function (link) {
      var key = link ? link.dataset.serviceJump : "all";
      mega.querySelectorAll(".mega-list li").forEach(function (li) { li.classList.toggle("is-active", !!link && li.contains(link)); });
      mega.querySelectorAll(".mega-figure img").forEach(function (img) { img.classList.toggle("is-active", img.dataset.for === key); });
      megaTitle.textContent = link ? link.querySelector("strong").textContent : megaDefault.title;
      megaText.textContent = link ? link.querySelector("span").textContent : megaDefault.text;
    };
    mega.addEventListener("mouseover", function (e) { var a = e.target.closest("a[data-service-jump]"); if (a) showPreview(a); });
    mega.addEventListener("focusin", function (e) { var a = e.target.closest("a[data-service-jump]"); if (a) showPreview(a); });
    mega.querySelector(".mega-list").addEventListener("mouseleave", function () { showPreview(null); });

    mega.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-service-jump]");
      if (a) {
        var target = document.querySelector('.services-list a[data-service="' + a.dataset.serviceJump + '"]');
        if (target) target.dispatchEvent(new Event("focusin", { bubbles: true }));
      }
      setMega(false);
    });
  }

  // Header bar: solid at the top of the page, glass once scrolled ------------
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

  // Services: hovering or focusing a service swaps the portrait ---------------
  var list = document.querySelector(".services-list");
  var figure = document.querySelector(".services-figure");
  if (list && figure) {
    var activate = function (link) {
      var key = link.dataset.service;
      list.querySelectorAll("li").forEach(function (li) { li.classList.toggle("is-active", li.contains(link)); });
      figure.querySelectorAll("img").forEach(function (img) { img.classList.toggle("is-active", img.dataset.for === key); });
    };
    list.addEventListener("mouseover", function (e) { var a = e.target.closest("a[data-service]"); if (a) activate(a); });
    list.addEventListener("focusin", function (e) { var a = e.target.closest("a[data-service]"); if (a) activate(a); });
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
