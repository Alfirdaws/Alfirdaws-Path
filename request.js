(function () {
  var C = window.AF_INVITE || {};
  var form = document.getElementById("reqForm"), msg = document.getElementById("msg"), btn = document.getElementById("submit");
  var M = {
    ar: {
      name: "اكتب اسمك الكامل.", email: "اكتب إيميل صحيح.", phone: "اكتب رقم هاتف صحيح مع كود الدولة.", country: "اكتب بلد الإقامة.", age: "اختر الفئة العمرية.", prog: "اختر البرنامج.",
      consent: "لازم توافق على إرسال بياناتك عشان نقدر نراجع الطلب.", fast: "استنى ثواني وجرّب تاني.",
      setup: "الإرسال المباشر لسه بيتجهّز. من فضلك افتح النموذج الأصلي لإرسال طلبك.",
      neterr: "ما قدرناش نرسل الطلب. اتأكد من الإنترنت وجرّب تاني، أو افتح النموذج الأصلي.", sending: "جارٍ الإرسال..."
    },
    en: {
      name: "Please enter your full name.", email: "Please enter a valid email.", phone: "Please enter a valid phone number with country code.", country: "Please enter your country.", age: "Please choose an age group.", prog: "Please choose a program.",
      consent: "You must agree to send your details so we can review the request.", fast: "Please wait a few seconds and try again.",
      setup: "Direct submission is still being set up. Please open the original form to send your request.",
      neterr: "We could not send the request. Check your internet and try again, or open the original form.", sending: "Sending..."
    }
  };
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function t(k) { return M[lang()][k]; }
  function val(id) { return document.getElementById(id).value.trim(); }
  var started = Date.now(), lastKey = "";
  function show(kind, key, withLink) {
    lastKey = key; msg.className = "msg " + kind; msg.textContent = t(key);
    document.getElementById("origLink").hidden = !withLink;
  }
  document.addEventListener("af-lang", function () { if (lastKey) msg.textContent = t(lastKey); });

  function configured() {
    var e = C.ENTRY || {};
    return !!C.FORM_ID && ["name", "email", "phone", "country", "age", "program"].every(function (k) { return e[k]; });
  }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = val("r_name"), email = val("r_email"), phone = val("r_phone"), country = val("r_country"), program = document.getElementById("r_program").value, goal = val("r_goal");
    var ageEl = form.querySelector('input[name="age"]:checked'), age = ageEl ? ageEl.value : "";
    if (name.length < 2) return show("err", "name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show("err", "email");
    if (!/^\+?[\d\s\-()]{6,25}$/.test(phone)) return show("err", "phone");
    if (country.length < 2) return show("err", "country");
    if (!age) return show("err", "age");
    if (!program) return show("err", "prog");
    if (!document.getElementById("r_consent").checked) return show("err", "consent");
    if (val("r_site")) { done(); return; }                         // hidden field filled by bots: pretend success
    if (Date.now() - started < 2500) return show("err", "fast");
    if (!configured()) return show("err", "setup", true);

    var E = C.ENTRY, body = new URLSearchParams();
    body.append("entry." + E.name, name); body.append("entry." + E.email, email); body.append("entry." + E.phone, phone);
    body.append("entry." + E.country, country); body.append("entry." + E.age, age); body.append("entry." + E.program, program);
    if (E.goal && goal) body.append("entry." + E.goal, goal);
    btn.disabled = true; show("ok", "sending");
    fetch("https://docs.google.com/forms/d/e/" + C.FORM_ID + "/formResponse", { method: "POST", mode: "no-cors", body: body })
      .then(done)
      .catch(function () { btn.disabled = false; show("err", "neterr", true); });
  });
  function done() {
    form.hidden = true; document.getElementById("done").hidden = false; window.scrollTo(0, 0);
  }
})();
