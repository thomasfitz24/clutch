/* CLUTCH Co. — small enhancements: mobile nav, background video, form handling. */
(function () {
  "use strict";

  // Mobile navigation ------------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) toggle.click();
    });
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

  // Forms -----------------------------------------------------------------
  // Each form posts to its `action` URL (Formspree, Netlify, Basin, your own endpoint).
  // Until `action` is set, submissions are kept on the page and the owner is told
  // what to configure. Set data-mode="native" to skip the fetch and post normally.
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var say = function (state, text) {
      if (!status) return;
      status.dataset.state = state;
      status.textContent = text;
    };

    var validate = function () {
      var ok = true;
      form.querySelectorAll(".form-group").forEach(function (group) {
        var invalid = false;
        var required = group.querySelectorAll("[required]");
        required.forEach(function (el) {
          if (el.type === "checkbox" || el.type === "radio") {
            var any = group.querySelector('input[name="' + el.name + '"]:checked');
            if (!any) invalid = true;
          } else if (!el.value.trim() || (el.type === "email" && !el.checkValidity())) {
            invalid = true;
          }
        });
        group.classList.toggle("invalid", invalid);
        if (invalid) ok = false;
      });
      return ok;
    };

    form.addEventListener("input", function (e) {
      var g = e.target.closest(".form-group");
      if (g && g.classList.contains("invalid")) validate();
    });

    form.addEventListener("submit", function (e) {
      if (!validate()) {
        e.preventDefault();
        var first = form.querySelector(".form-group.invalid");
        if (first) first.scrollIntoView({ block: "center", behavior: reduce.matches ? "auto" : "smooth" });
        say("error", "Please complete the highlighted fields.");
        return;
      }
      if (form.dataset.mode === "native") return;
      e.preventDefault();

      var honeypot = form.querySelector(".hp input");
      if (honeypot && honeypot.value) { say("ok", "Thanks, we'll be in touch."); form.reset(); return; }

      var action = form.getAttribute("action") || "";
      if (!action || /REPLACE/i.test(action)) {
        say("error", "This form isn't connected yet. Add your form endpoint to the form's action attribute.");
        return;
      }

      var button = form.querySelector('[type="submit"]');
      if (button) { button.disabled = true; button.dataset.label = button.textContent; button.textContent = "Sending…"; }
      say("", "");

      fetch(action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      }).then(function (r) {
        if (!r.ok) throw new Error("bad status");
        say("ok", "Thanks, your message has been sent. We'll be in touch.");
        form.reset();
      }).catch(function () {
        say("error", "Something went wrong sending the form. Please email us instead.");
      }).finally(function () {
        if (button) { button.disabled = false; button.textContent = button.dataset.label; }
      });
    });
  });
})();
