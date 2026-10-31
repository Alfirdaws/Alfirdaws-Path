(function () {
  var sb = window.AF_sb;
  var msg = document.getElementById("msg");
  function say(kind, text) { msg.className = "msg " + kind; msg.textContent = text; }
  if (!sb) { say("err", "تعذر تحميل الخدمة. اتأكد من الإنترنت وجرّب تاني."); return; }
  var ROLE = { student: "طالب", parent: "ولي أمر", teacher: "معلم", admin: "مدير الأكاديمية" };
  var ST = { pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض", cancelled: "ملغي" };
  var SETTING_KEYS = ["stat_students", "stat_countries", "stat_teachers", "rating", "hero_title_ar", "hero_title_en", "hero_sub_ar", "hero_sub_en", "contact_text_ar", "contact_text_en", "contact_whatsapp", "contact_email"];
  var STAT_LABELS = [
    ["students", "طلاب"], ["parents", "أولياء أمور"], ["teachers", "معلمون"], ["published_teachers", "معلمون ظاهرون في الموقع"],
    ["programs", "برامج نشطة"], ["pending", "طلبات قيد المراجعة"], ["approved", "تسجيلات مقبولة"], ["rejected", "طلبات مرفوضة"],
    ["cancelled", "طلبات ملغاة"], ["lessons_30d", "حصص آخر 30 يوم"], ["lessons_total", "إجمالي الحصص"]
  ];
  var me = null;
  var EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  var S = { users: [], teachers: [], programs: [], tp: [], enr: [], settings: {}, stats: null };

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function el(id) { return document.getElementById(id); }
  function info(name, sub) {
    var d = h("div", "info");
    d.appendChild(h("strong", "", name));
    d.appendChild(h("small", "", sub));
    return d;
  }
  function byId(arr) { var m = {}; arr.forEach(function (x) { m[x.id] = x; }); return m; }
  function fail(e) { say("err", "حصلت مشكلة: " + ((e && e.message) || "")); }
  function done(text) { return function (r) { if (r.error) return fail(r.error); say("ok", text); return load(); }; }

  // ---------- tabs
  function showTab(name) {
    document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.dataset.panel !== name; });
    document.querySelectorAll("#tabs button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === name ? "true" : "false"); });
  }
  document.querySelectorAll("#tabs button").forEach(function (b) {
    b.addEventListener("click", function () { showTab(b.dataset.tab); });
  });

  // ---------- overview
  function renderStats() {
    var box = el("stats");
    box.textContent = "";
    if (!S.stats) return;
    STAT_LABELS.forEach(function (p) {
      var d = h("div", "stat");
      d.appendChild(h("b", "", String(S.stats[p[0]] == null ? 0 : S.stats[p[0]])));
      d.appendChild(h("span", "", p[1]));
      box.appendChild(d);
    });
    var pend = S.stats.pending || 0;
    el("tabReq").textContent = "الطلبات" + (pend ? " (" + pend + ")" : "");
  }

  // ---------- requests
  function teacherSelect(programId, current, tm) {
    var sel = h("select");
    sel.setAttribute("aria-label", "المعلم");
    var o0 = h("option", "", "اختاري المعلم"); o0.value = ""; sel.appendChild(o0);
    S.tp.filter(function (x) { return x.program_id === programId; }).forEach(function (x) {
      var t = tm[x.teacher_id];
      if (!t) return;
      var o = h("option", "", t.display_name || "(بدون اسم)"); o.value = t.id; sel.appendChild(o);
    });
    if (current) sel.value = current;
    return sel;
  }
  function renderEnrollments() {
    var box = el("enrollments");
    box.textContent = "";
    var pm = byId(S.programs), um = byId(S.users), tm = byId(S.teachers);
    var f = el("reqFilter").value;
    var list = S.enr.filter(function (e) { return f === "all" || e.status === f; }).sort(function (a, b) {
      return a.created_at < b.created_at ? 1 : -1;
    });
    if (!list.length) { box.appendChild(h("p", "meta", "مفيش طلبات في القسم ده.")); return; }
    list.forEach(function (e) {
      var u = um[e.account_id] || {};
      var prog = pm[e.program_id];
      var sub = (u.full_name || "") + " | " + (u.phone || "") + " | " + (u.email || "") +
        (e.notes ? " | ملاحظات: " + e.notes : "") + " | " + ST[e.status] +
        (e.teacher_id && tm[e.teacher_id] ? " | المعلم: " + (tm[e.teacher_id].display_name || "") : "");
      var row = h("div", "row");
      row.appendChild(info(e.student_name + " — " + (prog ? prog.title_ar : "—"), sub));
      if (e.status === "pending") {
        var sel = teacherSelect(e.program_id, "", tm);
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
      if (e.status === "approved") {
        var sel2 = teacherSelect(e.program_id, e.teacher_id, tm);
        var chg = h("button", "btn small", "تغيير المعلم"); chg.type = "button";
        chg.addEventListener("click", function () {
          if (!sel2.value || sel2.value === e.teacher_id) return say("err", "اختاري معلم مختلف.");
          sb.rpc("admin_reassign_teacher", { enrollment_id: e.id, new_teacher: sel2.value }).then(done("تم تغيير المعلم."));
        });
        row.appendChild(sel2); row.appendChild(chg);
      }
      if (e.status === "pending" || e.status === "approved") {
        var cx = h("button", "btn ghost small", "إلغاء التسجيل"); cx.type = "button";
        cx.addEventListener("click", function () {
          if (!window.confirm("إلغاء تسجيل " + e.student_name + "؟")) return;
          sb.rpc("admin_cancel_enrollment", { enrollment_id: e.id }).then(done("تم إلغاء التسجيل."));
        });
        row.appendChild(cx);
      }
      box.appendChild(row);
    });
  }

  // ---------- programs
  var editingId = null;
  function imgUrl(path) { return (path.indexOf("assets/") === 0 ? path : sb.storage.from("program-images").getPublicUrl(path).data.publicUrl); }
  function resetProgForm() {
    editingId = null;
    document.getElementById("progForm").reset();
    document.getElementById("progSubmit").textContent = "إضافة برنامج";
    document.getElementById("progCancel").hidden = true;
  }
  function renderPrograms() {
    var box = document.getElementById("programs");
    box.textContent = "";
    S.programs.forEach(function (p) {
      var row = h("div", "row");
      if (p.image_path) { var im = h("img", "thumb"); im.src = imgUrl(p.image_path); im.alt = ""; row.appendChild(im); }
      row.appendChild(info(p.title_ar + "  /  " + p.title_en, (p.is_active ? "ظاهر للجمهور" : "متوقف") + (p.image_path ? "  |  له صورة" : "  |  بدون صورة")));
      var ed = h("button", "btn ghost small", "تعديل"); ed.type = "button";
      ed.addEventListener("click", function () {
        editingId = p.id;
        document.getElementById("p_cat").value = p.category;
        document.getElementById("p_ar").value = p.title_ar;
        document.getElementById("p_en").value = p.title_en;
        document.getElementById("p_dar").value = p.description_ar || "";
        document.getElementById("p_den").value = p.description_en || "";
        document.getElementById("p_img").value = "";
        document.getElementById("progSubmit").textContent = "حفظ التعديلات";
        document.getElementById("progCancel").hidden = false;
        document.getElementById("progForm").scrollIntoView({ behavior: "smooth", block: "center" });
        say("ok", "بتعدّلي دلوقتي برنامج: " + p.title_ar + ". لو مش هتغيّري الصورة سيبي خانة الصورة فاضية.");
      });
      var b = h("button", "btn small" + (p.is_active ? " ghost" : ""), p.is_active ? "إيقاف" : "تفعيل"); b.type = "button";
      b.addEventListener("click", function () {
        sb.from("programs").update({ is_active: !p.is_active }).eq("id", p.id).then(done(p.is_active ? "تم إيقاف البرنامج." : "تم تفعيل البرنامج."));
      });
      row.appendChild(ed); row.appendChild(b);
      box.appendChild(row);
    });
  }

  function renderTeachers() {
    var box = el("teachers");
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
    var box = el("users");
    box.textContent = "";
    var q = el("uSearch").value.trim().toLowerCase(), rf = el("uRole").value;
    var counts = {};
    S.enr.forEach(function (e) { if (e.status === "approved") counts[e.account_id] = (counts[e.account_id] || 0) + 1; });
    var list = S.users.filter(function (u) {
      if (rf !== "all" && u.role !== rf) return false;
      if (!q) return true;
      return ((u.full_name || "") + " " + (u.email || "") + " " + (u.phone || "")).toLowerCase().indexOf(q) > -1;
    });
    if (!list.length) { box.appendChild(h("p", "meta", "مفيش نتائج.")); return; }
    list.forEach(function (u) {
      var row = h("div", "row");
      var sub = (u.email || "") + (u.phone ? "  |  " + u.phone : "") + ((u.role === "student" || u.role === "parent") ? "  |  برامج مقبولة: " + (counts[u.id] || 0) : "");
      row.appendChild(info(u.full_name || "(بدون اسم)", sub));
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

  // ---------- site content
  function renderContent() {
    SETTING_KEYS.forEach(function (k) { el("s_" + k).value = S.settings[k] || ""; });
    el("heroImgState").textContent = S.settings.hero_image ? "فيه صورة مرفوعة حاليًا. ارفعي صورة جديدة لو عايزة تغيّريها." : "لسه ما فيش صورة، الموقع بيعرض رسم افتراضي.";
  }
  function normalizeWa(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.indexOf("00") === 0) d = d.slice(2);
    if (/^01\d{9}$/.test(d)) d = "2" + d;
    return d;
  }
  el("contentForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var wa = normalizeWa(el("s_contact_whatsapp").value);
    if (el("s_contact_whatsapp").value.trim() && wa.length < 8) return say("err", "رقم الواتساب مش صحيح. اكتبيه مع كود الدولة.");
    var mail = el("s_contact_email").value.trim();
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return say("err", "الإيميل مش مكتوب صح.");
    var rows = SETTING_KEYS.map(function (k) {
      var v = el("s_" + k).value.trim();
      if (k === "contact_whatsapp") v = wa;
      return { key: k, value: v };
    });
    var bad = ["stat_students", "stat_countries", "stat_teachers"].filter(function (k) { var v = el("s_" + k).value.trim(); return v && !/^\d{1,7}$/.test(v); });
    if (bad.length) return say("err", "أرقام الطلاب والدول والمعلمين لازم تكون أرقام فقط.");
    var rt = el("s_rating").value.trim();
    if (rt && (!/^\d(\.\d)?$/.test(rt) || parseFloat(rt) > 5)) return say("err", "التقييم لازم يكون رقم من 0 لـ 5 (مثال 4.7).");
    var heroFile = el("s_hero_image").files[0];
    if (heroFile && !EXT[heroFile.type]) return say("err", "صورة الصفحة الرئيسية لازم تكون JPG أو PNG أو WEBP.");
    if (heroFile && heroFile.size > 2 * 1024 * 1024) return say("err", "حجم الصورة أكبر من 2 ميجا. صغّريها وجرّبي تاني.");
    var btn = el("contentSubmit");
    btn.disabled = true;
    sb.from("site_settings").upsert(rows, { onConflict: "key" }).then(function (r) {
      if (r.error) { btn.disabled = false; return fail(r.error); }
      if (!heroFile) { btn.disabled = false; say("ok", "تم حفظ محتوى الموقع. افتحي الصفحة الرئيسية وشوفي النتيجة."); return load(); }
      var path = "hero-" + Date.now() + "." + EXT[heroFile.type];
      var oldHero = S.settings.hero_image;
      return sb.storage.from("program-images").upload(path, heroFile, { contentType: heroFile.type, upsert: false }).then(function (u) {
        if (u.error) { btn.disabled = false; return fail(u.error); }
        return sb.from("site_settings").upsert([{ key: "hero_image", value: path }], { onConflict: "key" }).then(function (up) {
          btn.disabled = false;
          if (up.error) return fail(up.error);
          if (oldHero) sb.storage.from("program-images").remove([oldHero]);
          el("s_hero_image").value = "";
          say("ok", "تم حفظ المحتوى وصورة الصفحة الرئيسية.");
          return load();
        });
      });
    }).catch(function () { btn.disabled = false; say("err", "حصلت مشكلة. جرّب تاني بعد شوية."); });
  });

  function renderAll() { renderStats(); renderEnrollments(); renderPrograms(); renderTeachers(); renderUsers(); renderContent(); }
  function load() {
    return Promise.all([
      sb.from("profiles").select("id,full_name,email,phone,role,created_at").order("created_at", { ascending: false }),
      sb.from("teachers").select("id,display_name,is_published"),
      sb.from("programs").select("id,category,title_ar,title_en,description_ar,description_en,image_path,is_active,sort_order").order("sort_order"),
      sb.from("teacher_programs").select("teacher_id,program_id"),
      sb.from("enrollments").select("id,account_id,program_id,teacher_id,student_name,notes,status,created_at"),
      sb.from("site_settings").select("key,value"),
      sb.rpc("admin_stats")
    ]).then(function (res) {
      for (var i = 0; i < res.length; i++) if (res[i].error) return fail(res[i].error);
      S.users = res[0].data; S.teachers = res[1].data; S.programs = res[2].data; S.tp = res[3].data; S.enr = res[4].data;
      S.settings = {}; res[5].data.forEach(function (x) { S.settings[x.key] = x.value; });
      S.stats = res[6].data;
      renderAll();
    });
  }
  el("reqFilter").addEventListener("change", renderEnrollments);
  el("uSearch").addEventListener("input", renderUsers);
  el("uRole").addEventListener("change", renderUsers);

  document.getElementById("progCancel").addEventListener("click", function () { resetProgForm(); say("ok", "تم إلغاء التعديل."); });
  document.getElementById("progForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ar = document.getElementById("p_ar").value.trim(), en = document.getElementById("p_en").value.trim();
    if (!ar || !en) return say("err", "اكتبي اسم البرنامج بالعربي والإنجليزي.");
    var file = document.getElementById("p_img").files[0];
    if (file && !EXT[file.type]) return say("err", "الصورة لازم تكون JPG أو PNG أو WEBP.");
    if (file && file.size > 2 * 1024 * 1024) return say("err", "حجم الصورة أكبر من 2 ميجا. صغّريها وجرّبي تاني.");
    var payload = {
      category: document.getElementById("p_cat").value, title_ar: ar, title_en: en,
      description_ar: document.getElementById("p_dar").value.trim(), description_en: document.getElementById("p_den").value.trim()
    };
    var btn = document.getElementById("progSubmit");
    btn.disabled = true;
    var oldImage = null;
    var q;
    if (editingId) {
      var cur = S.programs.filter(function (x) { return x.id === editingId; })[0];
      oldImage = cur ? cur.image_path : null;
      q = sb.from("programs").update(payload).eq("id", editingId).select("id").single();
    } else {
      var next = S.programs.reduce(function (m, p) { return Math.max(m, p.sort_order || 0); }, 0) + 1;
      payload.sort_order = next;
      q = sb.from("programs").insert(payload).select("id").single();
    }
    q.then(function (r) {
      if (r.error) { btn.disabled = false; return fail(r.error); }
      if (!file) { btn.disabled = false; resetProgForm(); say("ok", "تم حفظ البرنامج."); return load(); }
      var path = r.data.id + "-" + Date.now() + "." + EXT[file.type];
      return sb.storage.from("program-images").upload(path, file, { contentType: file.type, upsert: false }).then(function (u) {
        if (u.error) { btn.disabled = false; return fail(u.error); }
        return sb.from("programs").update({ image_path: path }).eq("id", r.data.id).then(function (up) {
          btn.disabled = false;
          if (up.error) return fail(up.error);
          if (oldImage && oldImage.indexOf("assets/") !== 0) sb.storage.from("program-images").remove([oldImage]);
          resetProgForm();
          say("ok", "تم حفظ البرنامج وصورته.");
          return load();
        });
      });
    }).catch(function () { btn.disabled = false; say("err", "حصلت مشكلة. جرّب تاني بعد شوية."); });
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
