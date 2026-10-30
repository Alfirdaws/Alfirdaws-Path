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
  var msg3 = document.getElementById("msg3");
  var ATT = { attended: "حضر", absent: "غاب", excused: "اعتذر" };
  var openIds = {};
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function field(text, input, full) {
    var l = h("label", full ? "full" : "");
    l.appendChild(h("span", "", text));
    l.appendChild(input);
    return l;
  }
  function inp(type, value) { var i = h("input"); i.type = type; if (value !== undefined) i.value = value; return i; }
  function loadStudents() {
    return Promise.all([
      sb.from("enrollments").select("id,student_name,progress_percent,progress_note,programs(title_ar)").eq("teacher_id", uid).eq("status", "approved"),
      sb.from("lessons").select("id,enrollment_id,held_on,topic,attendance").order("held_on", { ascending: false })
    ]).then(function (res) {
      var box = document.getElementById("students");
      box.textContent = "";
      if (res[0].error) return fail(msg3, res[0].error);
      if (res[1].error) return fail(msg3, res[1].error);
      if (!res[0].data.length) { box.appendChild(h("p", "meta", "لسه ما فيش طلاب مسندين ليك.")); return; }
      res[0].data.forEach(function (s) {
        var row = h("div", "row");
        var det = h("details", "full");
        det.open = !!openIds[s.id];
        det.addEventListener("toggle", function () { openIds[s.id] = det.open; });
        det.appendChild(h("summary", "", s.student_name + " — " + (s.programs ? s.programs.title_ar : "") + " — " + s.progress_percent + "%"));

        // progress
        det.appendChild(h("h3", "", "التقدم"));
        var pf = h("div", "tfields");
        var pct = inp("number", s.progress_percent); pct.min = 0; pct.max = 100; pct.setAttribute("dir", "ltr");
        var note = inp("text", s.progress_note || ""); note.maxLength = 500;
        var sv = h("button", "btn small", "حفظ التقدم"); sv.type = "button";
        sv.addEventListener("click", function () {
          var v = parseInt(pct.value, 10);
          if (isNaN(v) || v < 0 || v > 100) return say(msg3, "err", "التقدم لازم يكون رقم من 0 لـ 100.");
          sb.rpc("teacher_update_progress", { enrollment_id: s.id, percent: v, note: note.value.trim() }).then(function (r) {
            if (r.error) return fail(msg3, r.error);
            say(msg3, "ok", "تم حفظ التقدم.");
            loadStudents();
          });
        });
        pf.appendChild(field("نسبة التقدم %", pct)); pf.appendChild(field("ملاحظة عن التقدم", note, true)); pf.appendChild(sv);
        det.appendChild(pf);

        // new lesson
        det.appendChild(h("h3", "", "تسجيل حصة"));
        var lf = h("div", "tfields");
        var dt = inp("date", todayStr()); dt.setAttribute("dir", "ltr");
        var topic = inp("text", ""); topic.maxLength = 200;
        var att = h("select");
        Object.keys(ATT).forEach(function (k2) { var o = h("option", "", ATT[k2]); o.value = k2; att.appendChild(o); });
        var notes = h("textarea"); notes.maxLength = 1000;
        var hw = inp("text", ""); hw.maxLength = 500;
        var add = h("button", "btn small", "إضافة الحصة"); add.type = "button";
        add.addEventListener("click", function () {
          if (!dt.value) return say(msg3, "err", "اختاري تاريخ الحصة.");
          if (!topic.value.trim()) return say(msg3, "err", "اكتبي موضوع الحصة.");
          add.disabled = true;
          sb.from("lessons").insert({
            enrollment_id: s.id, held_on: dt.value, topic: topic.value.trim(), notes: notes.value.trim(),
            homework: hw.value.trim(), attendance: att.value
          }).then(function (r) {
            add.disabled = false;
            if (r.error) return fail(msg3, r.error);
            say(msg3, "ok", "تمت إضافة الحصة.");
            loadStudents();
          });
        });
        lf.appendChild(field("التاريخ", dt)); lf.appendChild(field("الحضور", att)); lf.appendChild(field("موضوع الحصة", topic, true));
        lf.appendChild(field("ملاحظات للطالب", notes, true)); lf.appendChild(field("الواجب", hw, true)); lf.appendChild(add);
        det.appendChild(lf);

        // recent lessons
        det.appendChild(h("h3", "", "آخر الحصص"));
        var mine = res[1].data.filter(function (x) { return x.enrollment_id === s.id; }).slice(0, 8);
        if (!mine.length) det.appendChild(h("p", "meta", "لسه ما سجلتيش حصص."));
        mine.forEach(function (x) {
          var lr = h("div", "lesson");
          lr.appendChild(h("strong", "", x.held_on + " — " + x.topic + " (" + ATT[x.attendance] + ")"));
          var del = h("button", "btn ghost small", "حذف"); del.type = "button";
          del.style.marginInlineStart = "10px";
          del.addEventListener("click", function () {
            if (!window.confirm("حذف حصة " + x.topic + "؟")) return;
            sb.from("lessons").delete().eq("id", x.id).then(function (r) {
              if (r.error) return fail(msg3, r.error);
              say(msg3, "ok", "تم حذف الحصة.");
              loadStudents();
            });
          });
          lr.appendChild(del);
          det.appendChild(lr);
        });
        row.appendChild(det);
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
