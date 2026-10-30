(function () {
  var list = document.getElementById("programList");
  if (!list) return;
  var data = [];
  var CAT = {
    ar: { quran: "القرآن", arabic: "العربية", islamic: "إسلاميات", other: "برنامج", level: "كل المستويات", enroll: "سجّل في البرنامج" },
    en: { quran: "Quran", arabic: "Arabic", islamic: "Islamic", other: "Course", level: "All Levels", enroll: "Enroll" }
  };
  var ICON = { quran: "i-book", arabic: "i-chat", islamic: "i-dome", other: "i-cap" };
  var SVGNS = "http://www.w3.org/2000/svg";
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function icon(id) {
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("class", "ico");
    var u = document.createElementNS(SVGNS, "use");
    u.setAttribute("href", "#" + id);
    s.appendChild(u);
    return s;
  }
  function render() {
    var l = lang(), c = CAT[l];
    list.textContent = "";
    data.forEach(function (p) {
      var cat = ICON[p.category] ? p.category : "other";
      var card = el("article", "course");
      var imgBox = el("div", "course-img" + (p.image_path ? "" : " course-fallback cat-" + cat));
      if (p.image_path) {
        var im = document.createElement("img");
        im.src = window.AF_sb.storage.from("program-images").getPublicUrl(p.image_path).data.publicUrl;
        im.alt = p["title_" + l];
        im.loading = "lazy";
        imgBox.appendChild(im);
      } else {
        imgBox.appendChild(icon(ICON[cat]));
      }
      imgBox.appendChild(el("span", "tag cat-" + cat, c[cat]));
      card.appendChild(imgBox);
      var body = el("div", "course-body");
      body.appendChild(el("h3", "", p["title_" + l]));
      body.appendChild(el("p", "level", c.level));
      var d = p["description_" + l];
      if (d) body.appendChild(el("p", "more", d));
      var a = el("a", "course-link", c.enroll + " ›");
      a.href = "enroll.html";
      body.appendChild(a);
      card.appendChild(body);
      list.appendChild(card);
    });
  }
  document.addEventListener("af-lang", function () { if (data.length) render(); });
  var sb = window.AF_sb;
  if (!sb) return;
  sb.from("programs").select("category,title_ar,title_en,description_ar,description_en,image_path,sort_order").order("sort_order").then(function (r) {
    if (r.error || !r.data || !r.data.length) return;
    data = r.data;
    render();
  });
})();
