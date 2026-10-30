(function () {
  var sb = window.AF_sb;
  var msg = document.getElementById("msg");
  function say(kind, text) { msg.className = "msg " + kind; msg.textContent = text; }
  if (!sb) { say("err", "تعذر تحميل الخدمة. اتأكد من الإنترنت وجرّب تاني."); return; }
  var ROLE = { student: "طالب", parent: "ولي أمر", teacher: "معلم", admin: "مدير الأكاديمية" };
  var me = null;
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
  function fail(e) { say("err", "حصلت مشكلة: " + ((e && e.message) || "")); }

  function renderUsers(users) {
    var box = document.getElementById("users");
    box.textContent = "";
    users.forEach(function (u) {
      var row = h("div", "row");
      row.appendChild(info(u.full_name || "(بدون اسم)", (u.email || "") + (u.phone ? "  |  " + u.phone : "")));
      var sel = h("select");
      Object.keys(ROLE).forEach(function (k) {
        var o = h("option", "", ROLE[k]); o.value = k; sel.appendChild(o);
      });
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
      box.appendChild(row);
    });
  }
  function renderTeachers(list, users) {
    var box = document.getElementById("teachers");
    box.textContent = "";
    if (!list.length) { box.appendChild(h("p", "meta", "لسه مفيش معلمين.")); return; }
    var byId = {};
    users.forEach(function (u) { byId[u.id] = u; });
    list.forEach(function (t) {
      var u = byId[t.id] || {};
      var row = h("div", "row");
      row.appendChild(info(t.display_name || u.full_name || "(بدون اسم)", (u.email || "") + "  |  " + (t.is_published ? "ظاهر في الموقع" : "غير ظاهر")));
      var b = h("button", "btn" + (t.is_published ? " ghost" : ""), t.is_published ? "إخفاء" : "نشر");
      b.type = "button";
      b.addEventListener("click", function () {
        sb.rpc("admin_set_teacher_published", { target_id: t.id, publish: !t.is_published }).then(function (r) {
          if (r.error) return fail(r.error);
          say("ok", t.is_published ? "تم إخفاء المعلم." : "تم نشر المعلم.");
          load();
        });
      });
      row.appendChild(b);
      box.appendChild(row);
    });
  }
  function load() {
    return Promise.all([
      sb.from("profiles").select("id,full_name,email,phone,role,created_at").order("created_at", { ascending: false }),
      sb.from("teachers").select("id,display_name,is_published")
    ]).then(function (res) {
      if (res[0].error) return fail(res[0].error);
      if (res[1].error) return fail(res[1].error);
      renderUsers(res[0].data);
      renderTeachers(res[1].data, res[0].data);
    });
  }
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
