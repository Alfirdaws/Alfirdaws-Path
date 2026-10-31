(function () {
  var page = document.body.dataset.page;
  var cfg = window.AF_CONFIG;
  var msg = document.getElementById("msg");
  var submit = document.getElementById("submit");
  var form = document.getElementById("form");
  var lang = function () { return document.documentElement.lang === "en" ? "en" : "ar"; };

  var M = {
    ar: {
      lib: "تعذر تحميل خدمة الحسابات. اتأكد من الإنترنت وجرّب تاني.",
      fill: "من فضلك املا كل الخانات.",
      email: "البريد الإلكتروني مش مكتوب صح.",
      short: "كلمة المرور لازم تكون 8 حروف أو أكتر.",
      mismatch: "كلمتا المرور مش متطابقتين.",
      checkMail: "تم إنشاء الحساب. بص في بريدك الإلكتروني (وفولدر Spam) وافتح رسالة التأكيد، وبعدين سجّل دخولك.",
      badLogin: "البريد الإلكتروني أو كلمة المرور غلط.",
      notConfirmed: "لازم تأكد بريدك الإلكتروني الأول. بص في رسالة التأكيد (وفولدر Spam).",
      rate: "محاولات كتير. استنى شوية وجرّب تاني.",
      generic: "حصلت مشكلة. جرّب تاني بعد شوية.",
      saved: "تم حفظ التغييرات.",
      badInvite: "الدعوة غير صحيحة أو منتهية. اتأكد من الإيميل ومفتاح الدعوة، أو اطلب من الإدارة مفتاح جديد.",
      exists: "الإيميل ده عنده حساب بالفعل. سجّل دخولك.",
      banned: "الحساب موقوف. تواصل مع إدارة الأكاديمية.",
      resetSent: "لو الإيميل ده مسجّل عندنا، هنبعت لك رابط لاختيار كلمة مرور جديدة. بص في بريدك (وفولدر Spam).",
      linkExpired: "الرابط منتهي أو غير صالح. اطلب رابط جديد.",
      passChanged: "تم تغيير كلمة المرور.",
      enrollLink: "التسجيل في البرامج", studentLink: "لوحة الطالب",
      adminLink: "لوحة الإدارة", teacherLink: "لوحة المعلم",
      student: "طالب", parent: "ولي أمر", teacher: "معلم", admin: "مدير الأكاديمية"
    },
    en: {
      lib: "Could not load the accounts service. Check your internet and try again.",
      fill: "Please fill in all fields.",
      email: "The email address is not valid.",
      short: "The password must be at least 8 characters.",
      mismatch: "The two passwords do not match.",
      checkMail: "Account created. Check your email (and the Spam folder), open the confirmation message, then log in.",
      badLogin: "Wrong email or password.",
      notConfirmed: "Please confirm your email first. Check the confirmation message (and Spam).",
      rate: "Too many attempts. Please wait a moment and try again.",
      generic: "Something went wrong. Please try again shortly.",
      saved: "Changes saved.",
      badInvite: "The invitation is invalid or expired. Check the email and the invitation key, or ask the academy for a new key.",
      exists: "This email already has an account. Please log in.",
      banned: "This account is suspended. Please contact the academy.",
      resetSent: "If this email is registered, we will send you a link to choose a new password. Check your inbox (and Spam).",
      linkExpired: "The link is expired or invalid. Please request a new one.",
      passChanged: "Your password has been changed.",
      enrollLink: "Enroll in programs", studentLink: "Student dashboard",
      adminLink: "Admin dashboard", teacherLink: "Teacher dashboard",
      student: "Student", parent: "Parent", teacher: "Teacher", admin: "Academy director"
    }
  };
  function t(k) { return M[lang()][k]; }
  function show(kind, key, el) {
    el = el || msg;
    if (!el) return;
    el.className = "msg " + kind;
    el.textContent = t(key);
    el.dataset.key = key;
  }
  document.addEventListener("af-lang", function () {
    document.querySelectorAll(".msg").forEach(function (m) { if (m.dataset.key) m.textContent = t(m.dataset.key); });
    renderRole();
  });

  if (!window.supabase || !cfg) { show("err", "lib"); return; }
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);
  window.AF_sb = sb;

  function mapError(e) {
    var m = (e && e.message || "").toLowerCase();
    if (m.indexOf("invalid login") > -1) return "badLogin";
    if (m.indexOf("banned") > -1) return "banned";
    if (m.indexOf("not confirmed") > -1) return "notConfirmed";
    if (m.indexOf("rate limit") > -1 || m.indexOf("too many") > -1) return "rate";
    return "generic";
  }
  function busy(b) { if (submit) submit.disabled = b; }
  function val(id) { return document.getElementById(id).value.trim(); }
  var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var currentRole = null;
  function renderRole() {
    var el = document.getElementById("roleLabel");
    if (el && currentRole) el.textContent = t(currentRole) || currentRole;
    var box = document.getElementById("links");
    if (box && currentRole) {
      box.textContent = "";
      var targets = currentRole === "admin" ? [["admin.html", "adminLink"]] : currentRole === "teacher" ? [["teacher.html", "teacherLink"]] : (currentRole === "student" || currentRole === "parent") ? [["student.html", "studentLink"], ["enroll.html", "enrollLink"]] : [];
      targets.forEach(function (tg) {
        var a = document.createElement("a");
        a.className = "btn small";
        a.href = tg[0];
        a.style.marginInlineEnd = "8px";
        a.textContent = t(tg[1]);
        box.appendChild(a);
      });
    }
  }

  if (page === "register") {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = val("email").toLowerCase(), key = val("invite_key");
      var pass = document.getElementById("password").value, pass2 = document.getElementById("password2").value;
      if (!email || !key || !pass) return show("err", "fill");
      if (!emailOk.test(email)) return show("err", "email");
      if (pass.length < 8) return show("err", "short");
      if (pass !== pass2) return show("err", "mismatch");
      busy(true);
      sb.auth.signUp({
        email: email, password: pass,
        options: { data: { invite_key: key, preferred_language: lang() } }
      }).then(function (r) {
        busy(false);
        if (r.error) {
          var m = (r.error.message || "").toLowerCase();
          if (m.indexOf("already") > -1) return show("err", "exists");
          if (m.indexOf("database") > -1 || r.error.status === 500 || r.error.status === 422) return show("err", "badInvite");
          return show("err", mapError(r.error));
        }
        if (r.data && r.data.session) { window.location.href = "account.html"; return; }
        form.reset();
        show("ok", "checkMail");
      }).catch(function () { busy(false); show("err", "generic"); });
    });
  }

  if (page === "login") {
    sb.auth.getSession().then(function (r) { if (r.data && r.data.session) window.location.href = "account.html"; });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = val("email"), pass = document.getElementById("password").value;
      if (!email || !pass) return show("err", "fill");
      busy(true);
      sb.auth.signInWithPassword({ email: email, password: pass }).then(function (r) {
        if (r.error) { busy(false); return show("err", mapError(r.error)); }
        window.location.href = "account.html";
      }).catch(function () { busy(false); show("err", "generic"); });
    });
  }

  if (page === "account") {
    var uid = null;
    document.getElementById("logout").addEventListener("click", function () {
      sb.auth.signOut().then(function () { window.location.href = "login.html"; });
    });
    sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      if (!s) { window.location.href = "login.html"; return; }
      uid = s.user.id;
      document.getElementById("emailLabel").textContent = s.user.email;
      return sb.from("profiles").select("full_name,phone,role").eq("id", uid).single().then(function (p) {
        if (p.error || !p.data) { show("err", "generic"); if (p.error) msg.textContent += " [" + (p.error.code || "") + " " + (p.error.message || "") + "]"; return; }
        document.getElementById("full_name").value = p.data.full_name || "";
        document.getElementById("phone").value = p.data.phone || "";
        currentRole = p.data.role; renderRole();
      });
    }).catch(function () { show("err", "generic"); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!uid) return;
      busy(true);
      sb.from("profiles").update({ full_name: val("full_name"), phone: val("phone"), preferred_language: lang() })
        .eq("id", uid).then(function (r) {
          busy(false);
          if (r.error) { show("err", "generic"); msg.textContent += " [" + (r.error.code || "") + " " + (r.error.message || "") + "]"; return; }
          show("ok", "saved");
        });
    });
  }
  function newPassFlow(f, passId, pass2Id, msgEl, done) {
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var p1 = document.getElementById(passId).value, p2 = document.getElementById(pass2Id).value;
      if (p1.length < 8) return show("err", "short", msgEl);
      if (p1 !== p2) return show("err", "mismatch", msgEl);
      var b = f.querySelector("button[type=submit]");
      b.disabled = true;
      sb.auth.updateUser({ password: p1 }).then(function (r) {
        b.disabled = false;
        if (r.error) { show("err", "generic", msgEl); msgEl.textContent += " [" + (r.error.message || "") + "]"; return; }
        f.reset();
        show("ok", "passChanged", msgEl);
        if (done) done();
      }).catch(function () { b.disabled = false; show("err", "generic", msgEl); });
    });
  }

  if (page === "reset") {
    var reqForm = document.getElementById("form"), newForm = document.getElementById("newForm");
    var showNew = function () { reqForm.hidden = true; newForm.hidden = false; if (msg) { msg.textContent = ""; msg.dataset.key = ""; } };
    if (/error_code|error_description/.test(window.location.hash)) show("err", "linkExpired");
    if (/type=recovery/.test(window.location.hash)) showNew();
    sb.auth.onAuthStateChange(function (ev) { if (ev === "PASSWORD_RECOVERY") showNew(); });
    reqForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = val("email");
      if (!email) return show("err", "fill");
      if (!emailOk.test(email)) return show("err", "email");
      var b = reqForm.querySelector("button[type=submit]");
      b.disabled = true;
      sb.auth.resetPasswordForEmail(email, { redirectTo: new URL("reset.html", window.location.href).href }).then(function (r) {
        b.disabled = false;
        if (r.error && mapError(r.error) === "rate") return show("err", "rate");
        show("ok", "resetSent");
      }).catch(function () { b.disabled = false; show("err", "generic"); });
    });
    newPassFlow(newForm, "newpass", "newpass2", msg, function () {
      setTimeout(function () { window.location.href = "account.html"; }, 1500);
    });
  }

  if (page === "account") {
    var pwForm = document.getElementById("pwForm");
    if (pwForm) newPassFlow(pwForm, "pw1", "pw2", document.getElementById("pwMsg"));
  }
  if (page === "setpass") {
    sb.auth.getSession().then(function (r) { if (!(r.data && r.data.session)) window.location.href = "login.html"; });
    newPassFlow(form, "newpass", "newpass2", msg, function () {
      setTimeout(function () { window.location.href = "account.html"; }, 1200);
    });
  }

  // Accounts with a temporary password must choose their own before using the site
  if (["account", "student", "teacher", "enroll"].indexOf(page) > -1) {
    sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      if (!s) return;
      return sb.from("profiles").select("password_set").eq("id", s.user.id).single().then(function (p) {
        if (p.data && p.data.password_set === false) window.location.href = "set-password.html";
      });
    });
  }
})();
