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
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (m) {
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

  // --- Section reveal, staggered within each group -----------------
  var revealEls = document.querySelectorAll("[data-reveal]");

  function showAll() {
    revealEls.forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  if (revealEls.length && !reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          // Respect a delay already authored in the markup; otherwise
          // stagger siblings so a grid arrives in reading order.
          if (!el.style.getPropertyValue("--reveal-delay")) {
            var siblings = Array.prototype.filter.call(
              el.parentNode.children,
              function (n) {
                return n.hasAttribute && n.hasAttribute("data-reveal");
              }
            );
            var i = siblings.indexOf(el);
            if (i > 0) el.style.setProperty("--reveal-delay", Math.min(i, 6) * 55 + "ms");
          }
          el.classList.add("is-revealed");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    // Content is never hidden if JS or IntersectionObserver is unavailable.
    showAll();
  }

  // --- Scroll gauge + current section ------------------------------
  var rail = document.querySelector(".nav__rail");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  var ticking = false;

  function update() {
    ticking = false;

    if (rail) {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      rail.style.setProperty("--progress", Math.min(1, Math.max(0, progress)).toFixed(4));
    }

    if (sections.length) {
      // The current section is the last one whose top has passed the nav.
      var line = window.scrollY + (nav ? nav.offsetHeight : 0) + 8;
      var current = -1;
      sections.forEach(function (section, i) {
        if (section.offsetTop <= line) current = i;
      });
      navLinks.forEach(function (link, i) {
        link.classList.toggle("is-current", i === current);
      });
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();

  // --- On-call week: mark the reader's current hour -----------------
  var rota = document.querySelector("[data-rota]");
  if (rota) {
    var clockEl = rota.querySelector(".rota__clock");
    var stateEl = rota.querySelector(".rota__state");
    var dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var nowCell = null;

    function pad(n) {
      return (n < 10 ? "0" : "") + n;
    }

    function markNow() {
      var now = new Date();
      var day = (now.getDay() + 6) % 7; // shift so Monday is 0
      var hour = now.getHours();
      var cell = rota.querySelector(
        '.rota__cell[data-d="' + day + '"][data-h="' + hour + '"]'
      );

      if (cell !== nowCell) {
        if (nowCell) nowCell.classList.remove("is-now");
        if (cell) cell.classList.add("is-now");
        nowCell = cell;
      }

      if (clockEl) {
        clockEl.textContent =
          dayNames[day] + " " + pad(hour) + ":" + pad(now.getMinutes());
      }
      if (stateEl && cell) {
        stateEl.textContent = cell.classList.contains("is-out")
          ? "Out of hours"
          : "Working hours";
      }
    }

    markNow();
    setInterval(markNow, 30000);
  }

  // --- Footer year --------------------------------------------------
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
