(function () {
  var sb = window.AF_sb;
  var box = document.getElementById("settingsBox");
  if (!sb || !box) return;
  var M = {
    ar: {
      mine: "بياناتي", account: "الحساب", email: "البريد الإلكتروني", type: "نوع الحساب", name: "الاسم الكامل", phone: "رقم الموبايل (واتساب)", save: "حفظ التغييرات",
      pwTitle: "تغيير كلمة المرور", p1: "كلمة المرور الجديدة (8 حروف أو أكتر)", p2: "أعد كتابة كلمة المرور الجديدة", pwBtn: "تغيير كلمة المرور",
      saved: "تم حفظ التغييرات.", pwDone: "تم تغيير كلمة المرور.", short: "كلمة المرور لازم تكون 8 حروف أو أكتر.", mismatch: "كلمتا المرور مش متطابقتين.",
      generic: "حصلت مشكلة. جرّب تاني بعد شوية.", student: "طالب", parent: "ولي أمر", teacher: "معلم", admin: "مدير الأكاديمية"
    },
    en: {
      mine: "My details", account: "Account", email: "Email", type: "Account type", name: "Full name", phone: "Mobile number (WhatsApp)", save: "Save changes",
      pwTitle: "Change password", p1: "New password (8 characters or more)", p2: "Repeat the new password", pwBtn: "Change password",
      saved: "Changes saved.", pwDone: "Your password has been changed.", short: "The password must be at least 8 characters.", mismatch: "The two passwords do not match.",
      generic: "Something went wrong. Please try again shortly.", student: "Student", parent: "Parent", teacher: "Teacher", admin: "Academy director"
    }
  };
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function t(k) { return M[lang()][k]; }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function field(label, input) {
    var l = h("label"); l.appendChild(h("span", "", label)); l.appendChild(input); return l;
  }
  function input(type, value, auto) {
    var i = h("input"); i.type = type;
    if (value !== undefined) i.value = value;
    if (auto) i.autocomplete = auto;
    return i;
  }
  var st = { uid: null, email: "", p: null };
  var typed = { name: null, phone: null };

  function say(el, kind, key, extra) { el.className = "msg " + kind; el.textContent = t(key) + (extra ? " [" + extra + "]" : ""); }

  function render() {
    box.textContent = "";
    if (!st.p) return;
    var wrap = h("div"); wrap.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px";

    // --- profile
    var f1 = h("form"); f1.noValidate = true; f1.style.cssText = "display:flex;flex-direction:column;gap:12px";
    f1.appendChild(h("h3", "", t("mine")));
    var info = h("p", "meta"); info.appendChild(document.createTextNode(t("email") + ": ")); var em = h("b", "", st.email); em.setAttribute("dir", "ltr"); info.appendChild(em); f1.appendChild(info);
    f1.appendChild(h("p", "meta", t("type") + ": " + (t(st.p.role) || st.p.role)));
    var nm = input("text", typed.name !== null ? typed.name : (st.p.full_name || ""), "name"); nm.maxLength = 120;
    var ph = input("tel", typed.phone !== null ? typed.phone : (st.p.phone || ""), "tel"); ph.maxLength = 30; ph.setAttribute("dir", "ltr");
    nm.addEventListener("input", function () { typed.name = nm.value; });
    ph.addEventListener("input", function () { typed.phone = ph.value; });
    f1.appendChild(field(t("name"), nm)); f1.appendChild(field(t("phone"), ph));
    var b1 = h("button", "btn", t("save")); b1.type = "submit"; f1.appendChild(b1);
    var m1 = h("p", "msg"); m1.setAttribute("role", "status"); f1.appendChild(m1);
    f1.addEventListener("submit", function (ev) {
      ev.preventDefault();
      b1.disabled = true;
      sb.from("profiles").update({ full_name: nm.value.trim(), phone: ph.value.trim(), preferred_language: lang() }).eq("id", st.uid).then(function (r) {
        b1.disabled = false;
        if (r.error) return say(m1, "err", "generic", r.error.message);
        st.p.full_name = nm.value.trim(); st.p.phone = ph.value.trim(); typed.name = null; typed.phone = null;
        say(m1, "ok", "saved");
        document.dispatchEvent(new CustomEvent("af-profile-updated", { detail: st.p }));
      });
    });
    wrap.appendChild(f1);

    // --- password
    var f2 = h("form"); f2.noValidate = true; f2.style.cssText = "display:flex;flex-direction:column;gap:12px";
    f2.appendChild(h("h3", "", t("pwTitle")));
    var a = input("password", "", "new-password"); a.setAttribute("dir", "ltr");
    var b = input("password", "", "new-password"); b.setAttribute("dir", "ltr");
    f2.appendChild(field(t("p1"), a)); f2.appendChild(field(t("p2"), b));
    var b2 = h("button", "btn", t("pwBtn")); b2.type = "submit"; f2.appendChild(b2);
    var m2 = h("p", "msg"); m2.setAttribute("role", "status"); f2.appendChild(m2);
    f2.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (a.value.length < 8) return say(m2, "err", "short");
      if (a.value !== b.value) return say(m2, "err", "mismatch");
      b2.disabled = true;
      sb.auth.updateUser({ password: a.value }).then(function (r) {
        b2.disabled = false;
        if (r.error) return say(m2, "err", "generic", r.error.message);
        a.value = ""; b.value = "";
        say(m2, "ok", "pwDone");
      }).catch(function () { b2.disabled = false; say(m2, "err", "generic"); });
    });
    wrap.appendChild(f2);
    box.appendChild(wrap);
  }
  document.addEventListener("af-lang", render);

  sb.auth.getSession().then(function (r) {
    var s = r.data && r.data.session;
    if (!s) return;
    st.uid = s.user.id; st.email = s.user.email || "";
    return sb.from("profiles").select("full_name,phone,role").eq("id", st.uid).single().then(function (p) {
      if (p.error || !p.data) return;
      st.p = p.data;
      render();
    });
  });
})();
