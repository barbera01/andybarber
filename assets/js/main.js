// andy-barber.co.uk — the TUI's behaviour.
// No frameworks. Every feature here is an enhancement: the page is complete
// and navigable with JavaScript off, by mouse, and by Tab.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SECTIONS = ["about", "skills", "experience", "certifications", "projects", "contact"];

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var locEl = document.querySelector("[data-loc]");
  var helpEl = document.getElementById("help");
  var filterEl = document.getElementById("skill-filter");

  // --- Status line messages ----------------------------------------
  var locTimer = null;
  var locHome = "~";

  function setLoc(text) {
    if (locEl && !locTimer) locEl.textContent = text;
  }

  function flash(msg) {
    if (!locEl) return;
    clearTimeout(locTimer);
    locEl.textContent = msg;
    locTimer = setTimeout(function () {
      locTimer = null;
      updateLoc();
    }, 1600);
  }

  // --- Which section am I in? --------------------------------------
  var targets = SECTIONS.map(function (id) {
    return document.getElementById(id);
  });

  function currentIndex() {
    var line = window.scrollY + 90;
    var found = -1;
    targets.forEach(function (el, i) {
      if (el && el.offsetTop <= line) found = i;
    });
    return found;
  }

  function updateLoc() {
    var i = currentIndex();
    tabs.forEach(function (t, n) {
      t.classList.toggle("is-current", n === i);
    });
    setLoc(i < 0 ? locHome : "~/" + SECTIONS[i]);
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        updateLoc();
      });
    },
    { passive: true }
  );

  // --- Help overlay -------------------------------------------------
  var lastFocus = null;

  function helpOpen() {
    return helpEl && !helpEl.hidden;
  }

  function toggleHelp(force) {
    if (!helpEl) return;
    var open = typeof force === "boolean" ? force : helpEl.hidden;
    if (open) {
      lastFocus = document.activeElement;
      helpEl.hidden = false;
      var box = helpEl.querySelector(".help__box");
      if (box) {
        box.setAttribute("tabindex", "-1");
        box.focus();
      }
    } else {
      helpEl.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
  }

  if (helpEl) {
    helpEl.addEventListener("click", function (e) {
      if (e.target === helpEl) toggleHelp(false);
    });
  }

  // --- Skill filter -------------------------------------------------
  var lsRows = Array.prototype.slice.call(document.querySelectorAll(".ls__row"));
  var countEl = document.querySelector("[data-filter-count]");

  function applyFilter(qRaw) {
    var q = (qRaw || "").trim().toLowerCase();
    var shown = 0;

    lsRows.forEach(function (row) {
      var visible = 0;
      var dir = (row.querySelector(".ls__dir") || {}).textContent || "";
      var dirHit = q && dir.toLowerCase().indexOf(q) > -1;

      row.querySelectorAll(".ls__item").forEach(function (item) {
        var hit = !q || dirHit || item.textContent.toLowerCase().indexOf(q) > -1;
        item.classList.toggle("is-hidden", !hit);
        item.classList.toggle("is-match", !!(q && hit));
        if (hit) visible++;
      });

      row.classList.toggle("is-empty", visible === 0);
      shown += visible;
    });

    if (countEl) {
      countEl.textContent = q ? shown + " matching" : shown + " shown";
    }
    return shown;
  }

  if (filterEl) {
    filterEl.addEventListener("input", function () {
      applyFilter(filterEl.value);
    });
    filterEl.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (filterEl.value) {
          filterEl.value = "";
          applyFilter("");
        } else {
          filterEl.blur();
        }
      }
    });
  }

  // --- Expand / collapse the career tree ----------------------------
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".tree__node"));

  function toggleTree() {
    var anyClosed = nodes.some(function (n) {
      return !n.open;
    });
    nodes.forEach(function (n) {
      n.open = anyClosed;
    });
    flash(anyClosed ? "expanded all" : "collapsed all");
  }

  // --- Copy the email address ---------------------------------------
  function copyEmail() {
    var el = document.querySelector("[data-email]");
    if (!el || !navigator.clipboard) return;
    navigator.clipboard.writeText(el.getAttribute("data-email")).then(
      function () {
        flash("copied " + el.getAttribute("data-email"));
      },
      function () {
        flash("copy failed");
      }
    );
  }

  // --- Navigation ----------------------------------------------------
  function goTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }

  // Anchors scroll smoothly and move focus with them.
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (href.length < 2) return;
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      goTo(el.id);
    });
  });

  // --- Keys ----------------------------------------------------------
  function isTyping(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }

  document.addEventListener("keydown", function (e) {
    // Never steal a browser or OS shortcut.
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === "Escape") {
      if (helpOpen()) toggleHelp(false);
      return;
    }

    // While typing, only Escape (handled on the field itself) applies.
    if (isTyping(document.activeElement)) return;

    if (helpOpen() && e.key !== "?") {
      return;
    }

    var step = 78; // three lines, as a terminal scrolls

    switch (e.key) {
      case "?":
        e.preventDefault();
        toggleHelp();
        break;
      case "/":
        if (filterEl) {
          e.preventDefault();
          goTo("skills");
          filterEl.focus();
        }
        break;
      case "j":
        e.preventDefault();
        window.scrollBy(0, step);
        break;
      case "k":
        e.preventDefault();
        window.scrollBy(0, -step);
        break;
      case "g":
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        break;
      case "G":
        e.preventDefault();
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: reduceMotion ? "auto" : "smooth"
        });
        break;
      case "e":
        if (nodes.length) {
          e.preventDefault();
          toggleTree();
        }
        break;
      case "c":
        e.preventDefault();
        copyEmail();
        break;
      default:
        if (e.key >= "1" && e.key <= "6") {
          e.preventDefault();
          goTo(SECTIONS[parseInt(e.key, 10) - 1]);
        }
    }
  });

  // --- On-call week: mark the reader's current hour ------------------
  var rota = document.querySelector("[data-rota]");
  if (rota) {
    var clockEl = rota.querySelector(".rota__clock");
    var stateEl = rota.querySelector(".rota-box__state");
    var dayNames = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
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
          "on-call week · " + dayNames[day] + " " + pad(hour) + ":" + pad(now.getMinutes());
      }
      if (stateEl && cell) {
        stateEl.textContent = cell.classList.contains("is-out")
          ? "out of hours"
          : "working hours";
      }
    }

    markNow();
    setInterval(markNow, 30000);
  }

  // --- Reveal ---------------------------------------------------------
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && !reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  // --- Footer year ------------------------------------------------------
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  updateLoc();
})();
