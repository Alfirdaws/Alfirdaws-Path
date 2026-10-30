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
      adminLink: "Admin dashboard", teacherLink: "Teacher dashboard",
      student: "Student", parent: "Parent", teacher: "Teacher", admin: "Academy director"
    }
  };
  function t(k) { return M[lang()][k]; }
  function show(kind, key) {
    if (!msg) return;
    msg.className = "msg " + kind;
    msg.textContent = t(key);
    msg.dataset.key = key;
  }
  document.addEventListener("af-lang", function () { if (msg && msg.dataset.key) msg.textContent = t(msg.dataset.key); renderRole(); });

  if (!window.supabase || !cfg) { show("err", "lib"); return; }
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);
  window.AF_sb = sb;

  function mapError(e) {
    var m = (e && e.message || "").toLowerCase();
    if (m.indexOf("invalid login") > -1) return "badLogin";
    if (m.indexOf("not confirmed") > -1) return "notConfirmed";
    if (m.indexOf("rate limit") > -1 || m.indexOf("too many") > -1) return "rate";
    return "generic";
  }
  function busy(b) { submit.disabled = b; }
  function val(id) { return document.getElementById(id).value.trim(); }
  var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var currentRole = null;
  function renderRole() {
    var el = document.getElementById("roleLabel");
    if (el && currentRole) el.textContent = t(currentRole) || currentRole;
    var box = document.getElementById("links");
    if (box && currentRole) {
      box.textContent = "";
      var target = currentRole === "admin" ? ["admin.html", "adminLink"] : currentRole === "teacher" ? ["teacher.html", "teacherLink"] : null;
      if (target) {
        var a = document.createElement("a");
        a.className = "btn";
        a.href = target[0];
        a.textContent = t(target[1]);
        box.appendChild(a);
      }
    }
  }

  if (page === "register") {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = val("full_name"), phone = val("phone"), email = val("email");
      var pass = document.getElementById("password").value, pass2 = document.getElementById("password2").value;
      var role = document.getElementById("role").value === "parent" ? "parent" : "student";
      if (!name || !phone || !email || !pass) return show("err", "fill");
      if (!emailOk.test(email)) return show("err", "email");
      if (pass.length < 8) return show("err", "short");
      if (pass !== pass2) return show("err", "mismatch");
      busy(true);
      sb.auth.signUp({
        email: email, password: pass,
        options: {
          data: { full_name: name, phone: phone, role: role, preferred_language: lang() },
          emailRedirectTo: new URL("login.html", window.location.href).href
        }
      }).then(function (r) {
        busy(false);
        if (r.error) return show("err", mapError(r.error));
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
})();
