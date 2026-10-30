(function () {
  var T = {
    ar: {},
    en: {
      brand:"AlFirdaws Path", nav_programs:"Programs", nav_why:"Why us", nav_teachers:"Teachers", nav_contact:"Contact",
      login:"Log in", register:"Register now", see_programs:"See programs",
      hero_title:"Learn the Quran and Arabic with a teacher just for you",
      hero_sub:"Live 1-on-1 online classes for children and adults, at a time that suits you.",
      programs_h:"Our programs",
      p1_h:"Quran recitation and Tajweed", p1_t:"From correcting basic reading to mastering Tajweed rules.",
      p2_h:"Quran memorization", p2_t:"A memorization and revision plan that fits your level and schedule.",
      p3_h:"Arabic language", p3_t:"Reading, writing, speaking and grammar, for children and non-native speakers.",
      p4_h:"Islamic studies", p4_t:"Creed, fiqh and the Prophet's biography, explained simply and clearly.",
      why_h:"Why AlFirdaws Path?",
      w1_h:"One-on-one classes", w1_t:"The teacher is with you alone and focuses on your level.",
      w2_h:"Flexible times", w2_t:"Choose the time that works for you and your family.",
      w3_h:"For kids and adults", w3_t:"Curricula for every age, with progress updates for parents.",
      w4_h:"From home", w4_t:"Live online classes with no commuting.",
      teachers_h:"Our teachers", teachers_t:"A selected team of specialist teachers. Each teacher's details will be added here soon.",
      contact_h:"Contact us", contact_t:"Contact details (WhatsApp, email) will be added here.",
      footer:"© AlFirdaws Path. All rights reserved.",
      soon:"Registration and login will be available soon."
    }
  };
  var els = document.querySelectorAll("[data-i18n]");
  els.forEach(function (el) { T.ar[el.dataset.i18n] = el.textContent; });
  T.ar.soon = "التسجيل وتسجيل الدخول هيشتغلوا قريبًا.";
  var lang = "ar";
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    els.forEach(function (el) { el.textContent = T[l][el.dataset.i18n]; });
    document.getElementById("langBtn").textContent = l === "ar" ? "English" : "العربية";
    document.title = l === "ar" ? "AlFirdaws Path | مسار الفردوس" : "AlFirdaws Path";
    try { localStorage.setItem("lang", l); } catch (e) {}
  }
  document.getElementById("langBtn").addEventListener("click", function () { setLang(lang === "ar" ? "en" : "ar"); });
  var toast = document.getElementById("toast"), timer;
  document.querySelectorAll("[data-soon]").forEach(function (b) {
    b.addEventListener("click", function () {
      toast.textContent = T[lang].soon; toast.classList.add("show");
      clearTimeout(timer); timer = setTimeout(function () { toast.classList.remove("show"); }, 2800);
    });
  });
  try { var s = localStorage.getItem("lang"); if (s === "en") setLang("en"); } catch (e) {}
})();
