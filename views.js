(function () {
  var dash = document.getElementById("dashView"), set = document.getElementById("settingsView");
  if (!dash || !set) return;
  function route() {
    var isSet = window.location.hash === "#settings";
    dash.hidden = isSet; set.hidden = !isSet;
    document.querySelectorAll("#nav a").forEach(function (a) {
      var href = a.getAttribute("href");
      a.classList.toggle("on", isSet ? href === "#settings" : href === (window.location.hash || "#top"));
    });
    if (isSet) { window.scrollTo(0, 0); return; }
    if (window.location.hash && window.location.hash !== "#top") {
      var t = document.getElementById(window.location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
  }
  window.addEventListener("hashchange", route);
  route();
})();
