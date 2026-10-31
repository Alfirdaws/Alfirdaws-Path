(function () {
  var sb = window.AF_sb;
  if (!sb) return;
  var data = {}, stats = null;
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function num(v) { return Number(v).toLocaleString("en-US"); }
  function setText(sel, text) { var n = document.querySelector(sel); if (n) n.textContent = text; }
  function apply() {
    var l = lang();
    [["heroTitle", "hero_title_"], ["heroSub", "hero_sub_"], ["contactText", "contact_text_"]].forEach(function (m) {
      var node = document.getElementById(m[0]);
      if (node && data[m[1] + l]) node.textContent = data[m[1] + l];
    });
    var photo = document.getElementById("heroPhoto");
    if (photo && data.hero_image && /^[\w.\-]+$/.test(data.hero_image)) {
      photo.setAttribute("href", sb.storage.from("program-images").getPublicUrl(data.hero_image).data.publicUrl);
    }
    // numbers and rating
    [["students", "stat_students"], ["countries", "stat_countries"], ["teachers", "stat_teachers"]].forEach(function (p) {
      var v = parseInt(data[p[1]], 10);
      if (v > 0) setText('[data-stat="' + p[0] + '"] b', num(v) + "+");
    });
    var ts = parseInt(data.stat_students, 10);
    if (ts > 0) setText("#trustStudents", num(ts) + "+");
    var r = parseFloat(data.rating);
    if (r > 0 && r <= 5) {
      setText("#trustRating", r.toFixed(1));
      var fill = document.getElementById("starsFill");
      if (fill) fill.style.width = (r / 5 * 100) + "%";
    }
    var pr = stats ? Number(stats.programs) : 0;
    var pi = document.querySelector('[data-stat="programs"]');
    if (pi) { pi.hidden = !(pr > 0); if (pr > 0) setText('[data-stat="programs"] b', num(pr)); }
    // contact buttons
    var box = document.getElementById("contactLinks");
    if (box) {
      box.textContent = "";
      var wa = String(data.contact_whatsapp || "").replace(/\D/g, "");
      if (wa.length >= 8) {
        var a = document.createElement("a");
        a.className = "btn";
        a.href = "https://wa.me/" + wa;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = l === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp";
        box.appendChild(a);
      }
      var mail = String(data.contact_email || "");
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        var b = document.createElement("a");
        b.className = "btn ghost";
        b.href = "mailto:" + mail;
        b.textContent = mail;
        b.setAttribute("dir", "ltr");
        box.appendChild(b);
      }
    }
  }
  document.addEventListener("af-lang", apply);
  sb.from("site_settings").select("key,value").then(function (r) {
    if (r.error || !r.data) return;
    r.data.forEach(function (x) { data[x.key] = x.value; });
    apply();
  });
  sb.rpc("public_stats").then(function (r) {
    if (r.error || !r.data) return;
    stats = r.data;
    apply();
  });
})();
