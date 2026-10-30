(function () {
  var sb = window.AF_sb;
  var msg = document.getElementById("msg");
  function say(kind, text) { msg.className = "msg " + kind; msg.textContent = text; }
  if (!sb) { say("err", "تعذر تحميل الخدمة. اتأكد من الإنترنت وجرّب تاني."); return; }
  var ROLE = { student: "طالب", parent: "ولي أمر", teacher: "معلم", admin: "مدير الأكاديمية" };
  var ST = { pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض", cancelled: "ملغي" };
  var me = null;
  var S = { users: [], teachers: [], programs: [], tp: [], enr: [] };

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function info(name, sub) {
    var d = h("div", "info");
    d.appendChild(h("strong", "", name));
    d.appendChild(h("small", "", sub));
    return d;
  }
  function byId(arr) { var m = {}; arr.forEach(function (x) { m[x.id] = x; }); return m; }
  function fail(e) { say("err", "حصلت مشكلة: " + ((e && e.message) || "")); }
  function done(text) { return function (r) { if (r.error) return fail(r.error); say("ok", text); return load(); }; }

  function renderEnrollments() {
    var box = document.getElementById("enrollments");
    box.textContent = "";
    var pm = byId(S.programs), um = byId(S.users), tm = byId(S.teachers);
    var list = S.enr.slice().sort(function (a, b) {
      var pa = a.status === "pending" ? 0 : 1, pb = b.status === "pending" ? 0 : 1;
      return pa - pb || (a.created_at < b.created_at ? 1 : -1);
    });
    if (!list.length) { box.appendChild(h("p", "meta", "مفيش طلبات تسجيل لسه.")); return; }
    list.forEach(function (e) {
      var u = um[e.account_id] || {};
      var prog = pm[e.program_id];
      var sub = (u.full_name || "") + " | " + (u.phone || "") + " | " + (u.email || "") +
        (e.notes ? " | ملاحظات: " + e.notes : "") + " | " + ST[e.status] +
        (e.teacher_id && tm[e.teacher_id] ? " | المعلم: " + (tm[e.teacher_id].display_name || "") : "");
      var row = h("div", "row");
      row.appendChild(info(e.student_name + " — " + (prog ? prog.title_ar : "—"), sub));
      if (e.status === "pending") {
        var sel = h("select");
        sel.setAttribute("aria-label", "المعلم");
        var o0 = h("option", "", "اختاري المعلم"); o0.value = ""; sel.appendChild(o0);
        S.tp.filter(function (x) { return x.program_id === e.program_id; }).forEach(function (x) {
          var t = tm[x.teacher_id];
          if (!t) return;
          var o = h("option", "", t.display_name || "(بدون اسم)"); o.value = t.id; sel.appendChild(o);
        });
        var ok = h("button", "btn small", "قبول"); ok.type = "button";
        ok.addEventListener("click", function () {
          if (!sel.value) return say("err", "اختاري المعلم الأول.");
          sb.rpc("admin_review_enrollment", { enrollment_id: e.id, decision: "approved", assign_teacher: sel.value }).then(done("تم قبول الطلب."));
        });
        var no = h("button", "btn ghost small", "رفض"); no.type = "button";
        no.addEventListener("click", function () {
          if (!window.confirm("رفض طلب " + e.student_name + "؟")) return;
          sb.rpc("admin_review_enrollment", { enrollment_id: e.id, decision: "rejected", assign_teacher: null }).then(done("تم رفض الطلب."));
        });
        row.appendChild(sel); row.appendChild(ok); row.appendChild(no);
      }
      box.appendChild(row);
    });
  }

  function renderPrograms() {
    var box = document.getElementById("programs");
    box.textContent = "";
    S.programs.forEach(function (p) {
      var row = h("div", "row");
      row.appendChild(info(p.title_ar + "  /  " + p.title_en, p.is_active ? "ظاهر للجمهور" : "متوقف"));
      var b = h("button", "btn small" + (p.is_active ? " ghost" : ""), p.is_active ? "إيقاف" : "تفعيل"); b.type = "button";
      b.addEventListener("click", function () {
        sb.from("programs").update({ is_active: !p.is_active }).eq("id", p.id).then(done(p.is_active ? "تم إيقاف البرنامج." : "تم تفعيل البرنامج."));
      });
      row.appendChild(b);
      box.appendChild(row);
    });
  }

  function renderTeachers() {
    var box = document.getElementById("teachers");
    box.textContent = "";
    if (!S.teachers.length) { box.appendChild(h("p", "meta", "لسه مفيش معلمين.")); return; }
    var um = byId(S.users);
    S.teachers.forEach(function (t) {
      var u = um[t.id] || {};
      var row = h("div", "row");
      row.appendChild(info(t.display_name || u.full_name || "(بدون اسم)", (u.email || "") + "  |  " + (t.is_published ? "ظاهر في الموقع" : "غير ظاهر")));
      var b = h("button", "btn small" + (t.is_published ? " ghost" : ""), t.is_published ? "إخفاء" : "نشر"); b.type = "button";
      b.addEventListener("click", function () {
        sb.rpc("admin_set_teacher_published", { target_id: t.id, publish: !t.is_published }).then(done(t.is_published ? "تم إخفاء المعلم." : "تم نشر المعلم."));
      });
      row.appendChild(b);
      var chips = h("div", "chips full");
      S.programs.forEach(function (p) {
        var lab = h("label");
        var cb = h("input"); cb.type = "checkbox";
        cb.checked = S.tp.some(function (x) { return x.teacher_id === t.id && x.program_id === p.id; });
        cb.addEventListener("change", function () {
          var q = cb.checked
            ? sb.from("teacher_programs").insert({ teacher_id: t.id, program_id: p.id })
            : sb.from("teacher_programs").delete().eq("teacher_id", t.id).eq("program_id", p.id);
          q.then(done("تم حفظ البرامج."));
        });
        lab.appendChild(cb); lab.appendChild(document.createTextNode(" " + p.title_ar));
        chips.appendChild(lab);
      });
      row.appendChild(chips);
      box.appendChild(row);
    });
  }

  function renderUsers() {
    var box = document.getElementById("users");
    box.textContent = "";
    S.users.forEach(function (u) {
      var row = h("div", "row");
      row.appendChild(info(u.full_name || "(بدون اسم)", (u.email || "") + (u.phone ? "  |  " + u.phone : "")));
      var sel = h("select");
      Object.keys(ROLE).forEach(function (k) { var o = h("option", "", ROLE[k]); o.value = k; sel.appendChild(o); });
      sel.value = u.role;
      sel.setAttribute("aria-label", "نوع الحساب");
      if (u.id === me) sel.disabled = true;
      sel.addEventListener("change", function () {
        var v = sel.value;
        if (!window.confirm("تغيير نوع حساب " + (u.full_name || u.email) + " إلى " + ROLE[v] + "؟")) { sel.value = u.role; return; }
        sb.rpc("admin_set_role", { target_id: u.id, new_role: v }).then(function (r) {
          if (r.error) { fail(r.error); sel.value = u.role; return; }
          say("ok", "تم تغيير نوع الحساب.");
          load();
        });
      });
      row.appendChild(sel);
      if (u.email) {
        var rb = h("button", "btn ghost small", "رابط كلمة المرور"); rb.type = "button";
        rb.addEventListener("click", function () {
          if (!window.confirm("إرسال رابط إعادة تعيين كلمة المرور إلى " + u.email + "؟")) return;
          sb.auth.resetPasswordForEmail(u.email, { redirectTo: new URL("reset.html", window.location.href).href }).then(function (r) {
            if (r.error) return fail(r.error);
            say("ok", "تم إرسال الرابط إلى " + u.email);
          });
        });
        row.appendChild(rb);
      }
      box.appendChild(row);
    });
  }

  function load() {
    return Promise.all([
      sb.from("profiles").select("id,full_name,email,phone,role,created_at").order("created_at", { ascending: false }),
      sb.from("teachers").select("id,display_name,is_published"),
      sb.from("programs").select("id,title_ar,title_en,is_active,sort_order").order("sort_order"),
      sb.from("teacher_programs").select("teacher_id,program_id"),
      sb.from("enrollments").select("id,account_id,program_id,teacher_id,student_name,notes,status,created_at")
    ]).then(function (res) {
      for (var i = 0; i < res.length; i++) if (res[i].error) return fail(res[i].error);
      S.users = res[0].data; S.teachers = res[1].data; S.programs = res[2].data; S.tp = res[3].data; S.enr = res[4].data;
      renderEnrollments(); renderPrograms(); renderTeachers(); renderUsers();
    });
  }

  document.getElementById("progForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ar = document.getElementById("p_ar").value.trim(), en = document.getElementById("p_en").value.trim();
    if (!ar || !en) return say("err", "اكتبي اسم البرنامج بالعربي والإنجليزي.");
    var next = S.programs.reduce(function (m, p) { return Math.max(m, p.sort_order || 0); }, 0) + 1;
    sb.from("programs").insert({
      category: document.getElementById("p_cat").value, title_ar: ar, title_en: en,
      description_ar: document.getElementById("p_dar").value.trim(), description_en: document.getElementById("p_den").value.trim(),
      sort_order: next
    }).then(function (r) {
      if (r.error) return fail(r.error);
      document.getElementById("progForm").reset();
      say("ok", "تمت إضافة البرنامج.");
      load();
    });
  });

  sb.auth.getSession().then(function (r) {
    var s = r.data && r.data.session;
    if (!s) { window.location.href = "login.html"; return; }
    me = s.user.id;
    return sb.from("profiles").select("role").eq("id", me).single().then(function (p) {
      if (p.error || !p.data || p.data.role !== "admin") { window.location.href = "account.html"; return; }
      return load();
    });
  }).catch(function () { say("err", "حصلت مشكلة. جرّب تاني بعد شوية."); });
})();
