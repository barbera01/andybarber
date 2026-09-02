// andy-barber.co.uk — minimal progressive enhancement.
// No frameworks. Everything degrades gracefully without JS.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Mobile navigation -------------------------------------------
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.querySelector(".nav__menu");

  function closeMenu() {
    if (!nav || !menu) return;
    nav.classList.remove("nav--open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("nav--open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close after choosing a destination.
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });

    // Close on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Close if the viewport grows past the mobile breakpoint.
    window.matchMedia("(min-width: 860px)").addEventListener("change", function (m) {
      if (m.matches) closeMenu();
    });
  }

  // --- Smooth anchor scrolling (respects reduced motion) -----------
  if (!reduceMotion) {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Move focus for keyboard users without jumping the view.
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  // --- Gentle section reveal (respects reduced motion) -------------
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && !reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    // Ensure content is never hidden if JS/IO is unavailable.
    revealEls.forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  // --- Footer year --------------------------------------------------
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
