(function () {
  var btn = document.getElementById("menuBtn"), nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); });
    });
  }
  var label = document.getElementById("langLabel");
  function syncLabel() { if (label) label.textContent = document.documentElement.lang === "ar" ? "English" : "العربية"; }
  document.addEventListener("af-lang", syncLabel);
  syncLabel();
  // highlight the current section in the menu
  var links = nav ? nav.querySelectorAll("a") : [];
  function onScroll() {
    var cur = "home";
    ["programs", "teachers", "kids", "pricing", "why", "contact"].forEach(function (id) {
      var s = document.getElementById(id);
      if (s && s.getBoundingClientRect().top < 140) cur = id;
    });
    links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + cur); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
