(function () {
  var list = document.getElementById("programList");
  if (!list) return;
  var data = [];
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function add(parent, tag, text) {
    var e = document.createElement(tag);
    e.textContent = text;
    parent.appendChild(e);
  }
  function render() {
    var l = lang();
    list.textContent = "";
    data.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "card";
      if (p.image_path) {
        var im = document.createElement("img");
        im.src = window.AF_sb.storage.from("program-images").getPublicUrl(p.image_path).data.publicUrl;
        im.alt = p["title_" + l];
        im.loading = "lazy";
        card.appendChild(im);
      }
      add(card, "h3", p["title_" + l]);
      var d = p["description_" + l];
      if (d) add(card, "p", d);
      list.appendChild(card);
    });
  }
  document.addEventListener("af-lang", function () { if (data.length) render(); });
  var sb = window.AF_sb;
  if (!sb) return;
  sb.from("programs").select("title_ar,title_en,description_ar,description_en,image_path,sort_order").order("sort_order").then(function (r) {
    if (r.error || !r.data || !r.data.length) return;
    data = r.data;
    render();
  });
})();
