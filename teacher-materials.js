(function () {
  var sb = window.AF_sb;
  var box = document.getElementById("matBox"), msg = document.getElementById("matMsg");
  if (!sb || !box) return;
  var ST = { draft: "مسودة", pending: "قيد المراجعة", published: "منشورة", rejected: "مرجّعة للتعديل" };
  var uid = null, programs = [], materials = [], students = [];
  var view = { id: null }, cur = null, openL = {};

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function say(kind, text) { msg.className = "msg " + kind; msg.textContent = text; }
  function fail(e) { say("err", "حصلت مشكلة: " + ((e && e.message) || "")); }
  function field(label, input, full) {
    var l = h("label", full ? "full" : ""); l.appendChild(h("span", "", label)); l.appendChild(input); return l;
  }
  function inp(type, value, max) { var i = h("input"); i.type = type; if (value !== undefined && value !== null) i.value = value; if (max) i.maxLength = max; return i; }
  function badge(st) { return h("span", "sbadge " + st, ST[st]); }
  function btn(text, cls, fn) { var b = h("button", "btn small " + (cls || ""), text); b.type = "button"; b.addEventListener("click", fn); return b; }

  // ---------------- data
  function loadBase() {
    return Promise.all([
      sb.from("teacher_programs").select("program_id,programs(id,title_ar)"),
      sb.from("enrollments").select("id,student_name,program_id").eq("teacher_id", uid).eq("status", "approved")
    ]).then(function (res) {
      if (res[0].error) return fail(res[0].error);
      programs = (res[0].data || []).map(function (x) { return x.programs; }).filter(Boolean);
      students = res[1].data || [];
    });
  }
  function loadList() {
    return sb.from("materials").select("id,program_id,title,description,status,reject_reason,created_at,programs(title_ar),material_lessons(id)").order("created_at", { ascending: false }).then(function (r) {
      if (r.error) return fail(r.error);
      materials = r.data || [];
    });
  }
  function loadEditor(id) {
    return Promise.all([
      sb.from("materials").select("id,program_id,title,description,status,reject_reason,programs(title_ar)").eq("id", id).single(),
      sb.from("material_lessons").select("id,position,title,content,link_url,created_at").eq("material_id", id).order("position").order("created_at")
    ]).then(function (res) {
      if (res[0].error) return fail(res[0].error);
      if (res[1].error) return fail(res[1].error);
      cur = { m: res[0].data, lessons: res[1].data || [], asg: [] };
      var ids = cur.lessons.map(function (l) { return l.id; });
      if (cur.m.status !== "published" || !ids.length) return;
      return sb.from("lesson_assignments").select("id,lesson_id,enrollment_id,due_date,completed_at").in("lesson_id", ids).then(function (a) {
        if (a.error) return fail(a.error);
        cur.asg = a.data || [];
      });
    });
  }
  function refresh() {
    if (view.id) return loadEditor(view.id).then(renderEditor);
    return loadList().then(renderList);
  }
  function openMaterial(id) { view.id = id; openL = {}; msg.textContent = ""; msg.className = "msg"; return loadEditor(id).then(renderEditor); }
  function backToList() { view.id = null; cur = null; return loadList().then(renderList); }

  // ---------------- list view
  function renderList() {
    box.textContent = "";
    var f = h("form", "tfields"); f.noValidate = true;
    var sel = h("select");
    programs.forEach(function (p) { var o = h("option", "", p.title_ar); o.value = p.id; sel.appendChild(o); });
    var title = inp("text", "", 150), desc = h("textarea"); desc.maxLength = 1000;
    f.appendChild(field("البرنامج", sel)); f.appendChild(field("اسم المادة العلمية", title));
    f.appendChild(field("وصف مختصر (اختياري)", desc, true));
    var go = h("button", "btn", "إنشاء مادة جديدة"); go.type = "submit"; f.appendChild(go);
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!programs.length) return say("err", "الإدارة لسه ما ربطتكيش بأي برنامج. اطلبي منها تربطك من لوحة الإدارة.");
      if (!title.value.trim()) return say("err", "اكتبي اسم المادة.");
      go.disabled = true;
      sb.from("materials").insert({ program_id: sel.value, title: title.value.trim(), description: desc.value.trim() }).select("id").single().then(function (r) {
        go.disabled = false;
        if (r.error) return fail(r.error);
        say("ok", "تم إنشاء المادة. ضيفي لها الحصص.");
        openMaterial(r.data.id);
      });
    });
    var nb = h("div", "mbox"); nb.appendChild(h("h3", "", "مادة علمية جديدة")); nb.appendChild(f); box.appendChild(nb);

    box.appendChild(h("h3", "", "موادي"));
    if (!materials.length) { box.appendChild(h("p", "meta", "لسه ما عملتيش مواد علمية.")); return; }
    var rows = h("div", "rows");
    materials.forEach(function (m) {
      var row = h("div", "row");
      var info = h("div", "info"); info.appendChild(h("strong", "", m.title));
      info.appendChild(h("small", "", (m.programs ? m.programs.title_ar : "") + "  |  الحصص: " + (m.material_lessons ? m.material_lessons.length : 0)));
      if (m.status === "rejected" && m.reject_reason) info.appendChild(h("small", "", "سبب الرجوع: " + m.reject_reason));
      row.appendChild(info); row.appendChild(badge(m.status));
      row.appendChild(btn("فتح", "", function () { openMaterial(m.id); }));
      rows.appendChild(row);
    });
    box.appendChild(rows);
  }

  // ---------------- editor view
  function renderEditor() {
    box.textContent = "";
    var m = cur.m, editable = m.status === "draft" || m.status === "rejected";
    var top = h("div", "btnrow");
    top.appendChild(btn("← كل المواد", "ghost", backToList));
    box.appendChild(top);

    var head = h("div", "mbox");
    var hh = h("h3", "", m.title + "  "); hh.appendChild(badge(m.status)); head.appendChild(hh);
    head.appendChild(h("small", "", "البرنامج: " + (m.programs ? m.programs.title_ar : "")));
    if (m.status === "rejected" && m.reject_reason) head.appendChild(h("div", "reason", "الإدارة رجّعت المادة: " + m.reject_reason));
    if (m.status === "pending") head.appendChild(h("p", "meta", "المادة عند الإدارة للمراجعة. لو عايزة تعدّلي فيها اسحبيها من المراجعة."));
    if (m.status === "published") head.appendChild(h("p", "meta", "المادة منشورة. تقدري تبعتي أي حصة منها للطلاب من تحت."));

    var tf = h("div", "tfields");
    var title = inp("text", m.title, 150), desc = h("textarea"); desc.maxLength = 1000; desc.value = m.description || "";
    title.disabled = !editable; desc.disabled = !editable;
    tf.appendChild(field("اسم المادة", title)); tf.appendChild(field("الوصف", desc, true));
    head.appendChild(tf);
    var acts = h("div", "btnrow");
    if (editable) {
      acts.appendChild(btn("حفظ بيانات المادة", "", function () {
        if (!title.value.trim()) return say("err", "اكتبي اسم المادة.");
        sb.from("materials").update({ title: title.value.trim(), description: desc.value.trim() }).eq("id", m.id).then(function (r) {
          if (r.error) return fail(r.error); say("ok", "تم حفظ بيانات المادة."); refresh();
        });
      }));
      acts.appendChild(btn("إرسال للمراجعة", "", function () {
        if (!window.confirm("إرسال المادة لمدير الأكاديمية للمراجعة؟ مش هتقدري تعدّلي فيها وهي في المراجعة.")) return;
        sb.rpc("teacher_submit_material", { mid: m.id }).then(function (r) {
          if (r.error) return fail(r.error); say("ok", "تم إرسال المادة للمراجعة."); refresh();
        });
      }));
      acts.appendChild(btn("حذف المادة", "ghost", function () {
        if (!window.confirm("حذف المادة وكل حصصها؟ مش هترجع.")) return;
        sb.from("materials").delete().eq("id", m.id).then(function (r) {
          if (r.error) return fail(r.error); say("ok", "تم حذف المادة."); backToList();
        });
      }));
    } else if (m.status === "pending") {
      acts.appendChild(btn("سحب من المراجعة", "ghost", function () {
        sb.rpc("teacher_reopen_material", { mid: m.id }).then(function (r) { if (r.error) return fail(r.error); say("ok", "تم سحب المادة، تقدري تعدّلي فيها."); refresh(); });
      }));
    } else if (m.status === "published") {
      acts.appendChild(btn("تعديل المادة", "ghost", function () {
        if (!window.confirm("تعديل المادة هيسحبها من الطلاب لحد ما الإدارة توافق عليها تاني. تكملي؟")) return;
        sb.rpc("teacher_reopen_material", { mid: m.id }).then(function (r) { if (r.error) return fail(r.error); say("ok", "المادة رجعت مسودة. عدّلي وابعتيها للمراجعة."); refresh(); });
      }));
    }
    head.appendChild(acts);
    box.appendChild(head);

    box.appendChild(h("h3", "", "حصص المادة (" + cur.lessons.length + ")"));
    if (!cur.lessons.length) box.appendChild(h("p", "meta", editable ? "لسه مفيش حصص. اضغطي \"إضافة حصة\"." : "مفيش حصص."));
    cur.lessons.forEach(function (l, i) { box.appendChild(lessonBox(l, i, editable)); });
    if (editable) {
      box.appendChild(btn("+ إضافة حصة", "", function () {
        var pos = cur.lessons.reduce(function (mx, x) { return Math.max(mx, x.position || 0); }, 0) + 1;
        sb.from("material_lessons").insert({ material_id: m.id, position: pos, title: "حصة " + pos }).select("id").single().then(function (r) {
          if (r.error) return fail(r.error);
          openL[r.data.id] = true; say("ok", "تمت إضافة الحصة. اكتبي محتواها."); refresh();
        });
      }));
    }
  }

  function lessonBox(l, i, editable) {
    var d = h("details", "lessonbox"); d.open = !!openL[l.id];
    d.addEventListener("toggle", function () { openL[l.id] = d.open; });
    d.appendChild(h("summary", "", (i + 1) + ". " + l.title));
    if (editable) {
      var tf = h("div", "tfields");
      var t = inp("text", l.title, 150), c = h("textarea"); c.maxLength = 20000; c.value = l.content || "";
      var u = inp("url", l.link_url || "", 500); u.setAttribute("dir", "ltr"); u.placeholder = "https://...";
      tf.appendChild(field("عنوان الحصة", t, true)); tf.appendChild(field("محتوى الحصة (نص: شرح، أهداف، تمارين...)", c, true)); tf.appendChild(field("رابط (اختياري: فيديو أو ملف على Drive)", u, true));
      d.appendChild(tf);
      var row = h("div", "btnrow");
      row.appendChild(btn("حفظ الحصة", "", function () {
        var link = u.value.trim();
        if (link && !/^https?:\/\//i.test(link)) return say("err", "الرابط لازم يبدأ بـ https://");
        if (!t.value.trim()) return say("err", "اكتبي عنوان الحصة.");
        sb.from("material_lessons").update({ title: t.value.trim(), content: c.value, link_url: link || null }).eq("id", l.id).then(function (r) {
          if (r.error) return fail(r.error); say("ok", "تم حفظ الحصة."); refresh();
        });
      }));
      function move(dir) {
        var j = i + dir; if (j < 0 || j >= cur.lessons.length) return;
        var other = cur.lessons[j];
        Promise.all([
          sb.from("material_lessons").update({ position: j + 1 }).eq("id", l.id),
          sb.from("material_lessons").update({ position: i + 1 }).eq("id", other.id)
        ]).then(function (rs) { if (rs[0].error || rs[1].error) return fail(rs[0].error || rs[1].error); refresh(); });
      }
      row.appendChild(btn("↑", "ghost", function () { move(-1); }));
      row.appendChild(btn("↓", "ghost", function () { move(1); }));
      row.appendChild(btn("حذف الحصة", "ghost", function () {
        if (!window.confirm("حذف الحصة \"" + l.title + "\"؟")) return;
        sb.from("material_lessons").delete().eq("id", l.id).then(function (r) { if (r.error) return fail(r.error); say("ok", "تم حذف الحصة."); refresh(); });
      }));
      d.appendChild(row);
    } else {
      if (l.content) d.appendChild(h("div", "pre", l.content));
      if (l.link_url) { var a = h("a", "btn ghost small", "فتح الرابط"); a.href = l.link_url; a.target = "_blank"; a.rel = "noopener noreferrer"; d.appendChild(a); }
      if (cur.m.status === "published") d.appendChild(assignBlock(l));
    }
    return d;
  }

  // ---------------- sending lessons to students
  function assignBlock(l) {
    var wrap = h("div", "mbox");
    wrap.appendChild(h("h3", "", "إرسال الحصة للطلاب"));
    var list = students.filter(function (s) { return s.program_id === cur.m.program_id; });
    var done = {}; cur.asg.filter(function (a) { return a.lesson_id === l.id; }).forEach(function (a) { done[a.enrollment_id] = a; });
    var todo = list.filter(function (s) { return !done[s.id]; });
    if (!list.length) wrap.appendChild(h("p", "meta", "مفيش طلاب مقبولين عندك في البرنامج ده لسه."));
    else if (!todo.length) wrap.appendChild(h("p", "meta", "الحصة اتبعتت لكل طلابك في البرنامج ده."));
    else {
      var chk = h("div", "stuchk"), boxes = [];
      var all = h("label"); var ac = h("input"); ac.type = "checkbox"; all.appendChild(ac); all.appendChild(document.createTextNode(" تحديد الكل"));
      ac.addEventListener("change", function () { boxes.forEach(function (b) { b.checked = ac.checked; }); });
      chk.appendChild(all);
      todo.forEach(function (s) {
        var lb = h("label"); var cb = h("input"); cb.type = "checkbox"; cb.value = s.id; boxes.push(cb);
        lb.appendChild(cb); lb.appendChild(document.createTextNode(" " + s.student_name)); chk.appendChild(lb);
      });
      wrap.appendChild(chk);
      var tf = h("div", "tfields");
      var due = inp("date", ""); due.setAttribute("dir", "ltr"); var note = inp("text", "", 500);
      tf.appendChild(field("الموعد النهائي (اختياري)", due)); tf.appendChild(field("ملاحظة للطالب (اختياري)", note, true));
      wrap.appendChild(tf);
      wrap.appendChild(btn("إرسال للطلاب المحددين", "", function () {
        var ids = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
        if (!ids.length) return say("err", "اختاري طالب واحد على الأقل.");
        var rows = ids.map(function (eid) { return { lesson_id: l.id, enrollment_id: eid, due_date: due.value || null, note: note.value.trim() }; });
        sb.from("lesson_assignments").insert(rows).then(function (r) {
          if (r.error) return fail(r.error);
          say("ok", "تم إرسال الحصة لـ " + ids.length + " طالب."); openL[l.id] = true; refresh();
        });
      }));
    }
    var sent = list.filter(function (s) { return done[s.id]; });
    if (sent.length) wrap.appendChild(h("h3", "", "اتبعتت لـ"));
    sent.forEach(function (s) {
      var a = done[s.id], row = h("div", "asg");
      row.appendChild(h("span", "", s.student_name + (a.due_date ? "  |  الموعد: " + a.due_date : "") + "  |  " + (a.completed_at ? "تمّت ✓" : "لسه")));
      row.appendChild(btn("إلغاء الإرسال", "ghost", function () {
        if (!window.confirm("إلغاء إرسال الحصة لـ " + s.student_name + "؟")) return;
        sb.from("lesson_assignments").delete().eq("id", a.id).then(function (r) { if (r.error) return fail(r.error); say("ok", "تم إلغاء الإرسال."); openL[l.id] = true; refresh(); });
      }));
      wrap.appendChild(row);
    });
    return wrap;
  }

  document.addEventListener("af-materials-refresh", function () { refresh(); });
  sb.auth.getSession().then(function (r) {
    var s = r.data && r.data.session;
    if (!s) return;
    uid = s.user.id;
    return sb.from("profiles").select("role").eq("id", uid).single().then(function (p) {
      if (p.error || !p.data || p.data.role !== "teacher") return;
      return loadBase().then(loadList).then(renderList);
    });
  }).catch(function () { say("err", "حصلت مشكلة. جرّب تاني بعد شوية."); });
})();
