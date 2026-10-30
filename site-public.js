(function () {
  var sb = window.AF_sb;
  if (!sb) return;
  var data = {}, stats = null;
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function apply() {
    var l = lang();
    [["heroTitle", "hero_title_"], ["heroSub", "hero_sub_"], ["contactText", "contact_text_"]].forEach(function (m) {
      var node = document.getElementById(m[0]);
      if (node && data[m[1] + l]) node.textContent = data[m[1] + l];
    });
    var photo = document.getElementById("heroPhoto"), fb = document.getElementById("heroFallback");
    if (photo && data.hero_image && /^[\w.\-]+$/.test(data.hero_image)) {
      photo.setAttribute("href", sb.storage.from("program-images").getPublicUrl(data.hero_image).data.publicUrl);
      photo.setAttribute("visibility", "visible");
      if (fb) fb.setAttribute("display", "none");
    }
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
    renderStats();
  }
  function renderStats() {
    var band = document.getElementById("statsBand");
    if (!band || !stats) return;
    var any = false;
    band.querySelectorAll("[data-stat]").forEach(function (item) {
      var v = Number(stats[item.dataset.stat]) || 0;
      item.hidden = v <= 0;
      if (v > 0) {
        any = true;
        item.querySelector("b").textContent = v.toLocaleString(lang() === "ar" ? "ar-EG" : "en-US");
      }
    });
    band.hidden = !any;
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
    renderStats();
  });
})();
