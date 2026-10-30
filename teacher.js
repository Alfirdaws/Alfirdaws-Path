(function () {
  var sb = window.AF_sb;
  var msg = document.getElementById("msg"), msg2 = document.getElementById("msg2");
  function say(m, kind, text) { m.className = "msg " + kind; m.textContent = text; }
  if (!sb) { say(msg, "err", "تعذر تحميل الخدمة. اتأكد من الإنترنت وجرّب تاني."); return; }
  var DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  var ORDER = [6, 0, 1, 2, 3, 4, 5];
  var uid = null;
  function fail(m, e) { say(m, "err", "حصلت مشكلة: " + ((e && e.message) || "")); }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function hhmm(t) { return String(t).slice(0, 5); }

  function fill(r) {
    if (r.error || !r.data) return fail(msg, r.error);
    var d = r.data;
    document.getElementById("display_name").value = d.display_name || "";
    document.getElementById("years").value = d.years_experience == null ? "" : d.years_experience;
    document.getElementById("bio").value = d.bio || "";
    document.querySelectorAll("#specs input").forEach(function (c) { c.checked = (d.specialties || []).indexOf(c.value) > -1; });
    document.getElementById("status").textContent = d.is_published ? "ظاهر للجمهور" : "غير ظاهر (الإدارة هتراجع بياناتك وتنشرها)";
  }
  function loadSlots() {
    return sb.from("teacher_availability").select("id,weekday,start_time,end_time").eq("teacher_id", uid).then(function (r) {
      var box = document.getElementById("slots");
      box.textContent = "";
      if (r.error) return fail(msg2, r.error);
      if (!r.data.length) { box.appendChild(h("p", "meta", "لسه ما أضفتش مواعيد.")); return; }
      r.data.sort(function (a, b) {
        return ORDER.indexOf(a.weekday) - ORDER.indexOf(b.weekday) || String(a.start_time).localeCompare(String(b.start_time));
      });
      r.data.forEach(function (s) {
        var row = h("div", "row");
        row.appendChild(h("strong", "", DAYS[s.weekday] + "  " + hhmm(s.start_time) + " - " + hhmm(s.end_time)));
        var b = h("button", "btn ghost", "حذف");
        b.type = "button";
        b.addEventListener("click", function () {
          sb.from("teacher_availability").delete().eq("id", s.id).then(function (d) {
            if (d.error) return fail(msg2, d.error);
            say(msg2, "ok", "تم حذف الموعد.");
            loadSlots();
          });
        });
        row.appendChild(b);
        box.appendChild(row);
      });
    });
  }
  function loadStudents() {
    return sb.from("enrollments").select("id,student_name,reviewed_at,programs(title_ar)").eq("teacher_id", uid).eq("status", "approved").then(function (r) {
      var box = document.getElementById("students");
      box.textContent = "";
      if (r.error) return fail(msg2, r.error);
      if (!r.data.length) { box.appendChild(h("p", "meta", "لسه ما فيش طلاب مسندين ليك.")); return; }
      r.data.forEach(function (s) {
        var row = h("div", "row");
        row.appendChild(h("strong", "", s.student_name + " — " + (s.programs ? s.programs.title_ar : "")));
        box.appendChild(row);
      });
    });
  }
  function loadAll() {
    return sb.from("teachers").select("display_name,bio,specialties,years_experience,is_published").eq("id", uid).single().then(fill).then(loadSlots).then(loadStudents);
  }

  document.getElementById("form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = document.getElementById("display_name").value.trim();
    if (!name) return say(msg, "err", "اكتبي الاسم اللي هيظهر للطلاب.");
    var y = document.getElementById("years").value;
    var years = y === "" ? null : parseInt(y, 10);
    if (years !== null && (isNaN(years) || years < 0 || years > 80)) return say(msg, "err", "سنوات الخبرة لازم تكون رقم من 0 لـ 80.");
    var specs = [];
    document.querySelectorAll("#specs input:checked").forEach(function (c) { specs.push(c.value); });
    var btn = document.getElementById("submit");
    btn.disabled = true;
    sb.from("teachers").update({ display_name: name, years_experience: years, specialties: specs, bio: document.getElementById("bio").value.trim() })
      .eq("id", uid).then(function (r) {
        btn.disabled = false;
        if (r.error) return fail(msg, r.error);
        say(msg, "ok", "تم حفظ البيانات.");
      });
  });
  document.getElementById("slotForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var st = document.getElementById("start").value, en = document.getElementById("end").value;
    if (!st || !en) return say(msg2, "err", "اختاري وقت البداية والنهاية.");
    if (en <= st) return say(msg2, "err", "وقت النهاية لازم يكون بعد وقت البداية.");
    var btn = document.getElementById("addSlot");
    btn.disabled = true;
    sb.from("teacher_availability").insert({ teacher_id: uid, weekday: parseInt(document.getElementById("weekday").value, 10), start_time: st, end_time: en })
      .then(function (r) {
        btn.disabled = false;
        if (r.error) return fail(msg2, r.error);
        say(msg2, "ok", "تمت إضافة الموعد.");
        loadSlots();
      });
  });

  sb.auth.getSession().then(function (r) {
    var s = r.data && r.data.session;
    if (!s) { window.location.href = "login.html"; return; }
    uid = s.user.id;
    return sb.from("profiles").select("role").eq("id", uid).single().then(function (p) {
      if (p.error || !p.data || p.data.role !== "teacher") { window.location.href = "account.html"; return; }
      return loadAll();
    });
  }).catch(function () { say(msg, "err", "حصلت مشكلة. جرّب تاني بعد شوية."); });
})();
