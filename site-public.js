(function () {
  var sb = window.AF_sb;
  if (!sb) return;
  var data = {};
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function apply() {
    var l = lang();
    var map = [["heroTitle", "hero_title_"], ["heroSub", "hero_sub_"], ["contactText", "contact_text_"]];
    map.forEach(function (m) {
      var node = document.getElementById(m[0]);
      if (node && data[m[1] + l]) node.textContent = data[m[1] + l];
    });
    var box = document.getElementById("contactLinks");
    if (!box) return;
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
  document.addEventListener("af-lang", apply);
  sb.from("site_settings").select("key,value").then(function (r) {
    if (r.error || !r.data) return;
    r.data.forEach(function (x) { data[x.key] = x.value; });
    apply();
  });
})();
