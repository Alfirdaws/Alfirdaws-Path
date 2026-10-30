(function () {
  var list = document.getElementById("teacherList");
  if (!list) return;
  var lead = document.querySelector("#teachers .lead");
  var L = {
    ar: { quran: "تلاوة القرآن", tajweed: "التجويد", memorization: "حفظ القرآن", arabic: "اللغة العربية", islamic: "الدراسات الإسلامية", years: "سنوات خبرة", sep: "، " },
    en: { quran: "Quran recitation", tajweed: "Tajweed", memorization: "Quran memorization", arabic: "Arabic language", islamic: "Islamic studies", years: "years of experience", sep: ", " }
  };
  var data = [];
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function add(parent, tag, text) {
    var e = document.createElement(tag);
    e.textContent = text;
    parent.appendChild(e);
    return e;
  }
  function render() {
    var l = L[lang()];
    list.textContent = "";
    if (lead) lead.hidden = data.length > 0;
    data.forEach(function (t) {
      var card = document.createElement("article");
      card.className = "card";
      add(card, "h3", t.display_name);
      var specs = (t.specialties || []).map(function (s) { return l[s] || s; }).join(l.sep);
      if (specs) add(card, "p", specs);
      if (t.bio) add(card, "p", t.bio);
      if (t.years_experience) add(card, "small", t.years_experience + " " + l.years);
      list.appendChild(card);
    });
  }
  document.addEventListener("af-lang", render);
  var sb = window.AF_sb;
  if (!sb) return;
  sb.from("teachers").select("display_name,bio,specialties,years_experience").then(function (r) {
    if (r.error || !r.data || !r.data.length) return;
    data = r.data;
    render();
  });
})();
