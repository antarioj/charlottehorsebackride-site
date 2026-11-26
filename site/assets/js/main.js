/* Charlotte Horseback Ride — site behavior
   - Tab nav toggle (phones)
   - "What to expect" checklist checks itself off on arrival (one authored moment)
   - Booking form validation (client-side only; see directives/bookings.md)
   - Footer year, ?ride= preselect */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fetch the hero video only when it enters the viewport, then play it muted.
  var heroVideo = document.querySelector("[data-hero-video]");
  if (heroVideo) {
    var startHeroVideo = function () {
      if (!heroVideo.src) heroVideo.src = heroVideo.getAttribute("data-src");
      heroVideo.play().catch(function () { /* The poster remains visible if autoplay is blocked. */ });
    };
    if ("IntersectionObserver" in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          startHeroVideo();
          heroObserver.disconnect();
        }
      }, { threshold: 0.1 });
      heroObserver.observe(heroVideo);
    } else {
      startHeroVideo();
    }
  }

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var tabs = document.querySelector(".tabs");
  if (toggle && tabs) {
    toggle.addEventListener("click", function () {
      var open = tabs.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector(".ic-menu").hidden = open;
      toggle.querySelector(".ic-close").hidden = !open;
    });
  }

  // Footer year
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  // Checklist self-check: once, in sequence, after the sheet has settled
  var checklist = document.querySelector(".checklist[data-autocheck]");
  if (checklist) {
    var items = checklist.querySelectorAll("li");
    if (reduceMotion) {
      items.forEach(function (li) { li.classList.add("done"); });
    } else {
      items.forEach(function (li, i) {
        setTimeout(function () { li.classList.add("done"); }, 900 + i * 260);
      });
    }
  }

  // Preselect ride from ?ride=
  var params = new URLSearchParams(window.location.search);
  var rideSel = document.querySelector("#ride_type");
  if (rideSel && params.get("ride")) rideSel.value = params.get("ride");

  // Booking form
  var form = document.querySelector("#booking-form");
  if (!form) return;

  var dateInput = form.querySelector("input[name='ride_date']");
  if (dateInput) dateInput.setAttribute("min", new Date().toISOString().slice(0, 10));

  function setInvalid(field, invalid) {
    var wrap = field.closest(".field");
    if (wrap) wrap.classList.toggle("invalid", invalid);
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function validate() {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (el) {
      var bad = !el.value || (el.type === "checkbox" && !el.checked);
      setInvalid(el, bad);
      if (bad) ok = false;
    });
    var email = form.querySelector("input[type='email']");
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { setInvalid(email, true); ok = false; }
    var phone = form.querySelector("input[type='tel']");
    if (phone && phone.value && phone.value.replace(/\D/g, "").length < 10) { setInvalid(phone, true); ok = false; }
    return ok;
  }

  form.addEventListener("submit", function (e) {
    var hp = form.querySelector("input[name='website']");
    if (hp && hp.value) { e.preventDefault(); return; }
    if (!validate()) {
      e.preventDefault();
      var first = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
      if (first) first.focus();
      return;
    }
    // No backend configured yet → show the success panel locally.
    // Set data-endpoint on the form to a real handler to submit for real (see directives/bookings.md).
    var endpoint = form.getAttribute("data-endpoint");
    if (!endpoint || endpoint === "#") {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      setTimeout(function () {
        form.hidden = true;
        var success = document.querySelector(".form-success");
        if (success) { success.style.display = "block"; success.focus(); }
      }, reduceMotion ? 0 : 500);
    }
  });

  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () { setInvalid(el, false); });
  });
})();
