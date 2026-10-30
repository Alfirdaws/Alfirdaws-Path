(function () {
  var T = { ar: {}, en: {
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
    reg_h:"Create a new account", f_name:"Full name", f_role:"I am a", r_student:"Student", r_parent:"Parent",
    f_phone:"Mobile number (WhatsApp)", f_email:"Email", f_pass:"Password (8 characters or more)", f_pass2:"Repeat the password",
    reg_btn:"Create account", have_acc:"Already have an account?",
    login_h:"Log in", f_pass_login:"Password", login_btn:"Log in", no_acc:"Don't have an account?",
    logout:"Log out", acc_h:"My account", acc_role:"Account type:", save:"Save changes"
  } };
  var els = document.querySelectorAll("[data-i18n]");
  els.forEach(function (el) { T.ar[el.dataset.i18n] = el.textContent; });
  var titles = { ar: document.title, en: "AlFirdaws Path" };
  var page = document.body.dataset.page;
  var enTitles = { register:"Create account | AlFirdaws Path", login:"Log in | AlFirdaws Path", account:"My account | AlFirdaws Path" };
  if (enTitles[page]) titles.en = enTitles[page];
  function setLang(l) {
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    els.forEach(function (el) { if (T[l][el.dataset.i18n] !== undefined) el.textContent = T[l][el.dataset.i18n]; });
    document.getElementById("langBtn").textContent = l === "ar" ? "English" : "العربية";
    document.title = titles[l];
    try { localStorage.setItem("lang", l); } catch (e) {}
    document.dispatchEvent(new CustomEvent("af-lang", { detail: l }));
  }
  document.getElementById("langBtn").addEventListener("click", function () {
    setLang(document.documentElement.lang === "ar" ? "en" : "ar");
  });
  try { if (localStorage.getItem("lang") === "en") setLang("en"); } catch (e) {}
})();
