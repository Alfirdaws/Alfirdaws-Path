(function () {
  var sb = window.AF_sb, box = document.getElementById("advBox"), A = window.AF_ADV;
  if (!sb || !box || !A) return;
  var msg = document.getElementById("msg");
  var nav = { track: null, level: null, unit: null, lesson: null };
  var BUCKET = "adventure-media";

  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function say(kind, text) { msg.className = "msg " + kind; msg.textContent = text; }
  function fail(e) { say("err", "حصلت مشكلة: " + ((e && e.message) || e || "")); }
  function btn(text, cls, fn) { var b = h("button", "btn small " + (cls || ""), text); b.type = "button"; b.addEventListener("click", fn); return b; }
  function field(label, input, full) { var l = h("label", full ? "full" : ""); l.appendChild(h("span", "", label)); l.appendChild(input); return l; }
  function inp(v, max, ltr) { var i = h("input"); i.type = "text"; i.value = v == null ? "" : v; if (max) i.maxLength = max; if (ltr) i.setAttribute("dir", "ltr"); return i; }
  function ta(v, rows, ltr) { var t = h("textarea"); t.value = v == null ? "" : v; t.rows = rows || 3; if (ltr) t.setAttribute("dir", "ltr"); return t; }
  function num(v, min, max) { var i = h("input"); i.type = "number"; i.value = v; i.min = min; i.max = max; i.setAttribute("dir", "ltr"); return i; }
  function lines(s) { return String(s || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean); }
  function publicUrl(path) { return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl; }

  // ---------------- breadcrumb
  function crumbs() {
    var bar = h("div", "btnrow");
    function c(text, fn) { var b = btn(text, "ghost", fn); return b; }
    bar.appendChild(c("كل المسارات", function () { nav = { track: null, level: null, unit: null, lesson: null }; go(); }));
    if (nav.track) bar.appendChild(c(nav.track.title_ar, function () { nav.level = nav.unit = nav.lesson = null; go(); }));
    if (nav.level) bar.appendChild(c(nav.level.title_ar, function () { nav.unit = nav.lesson = null; go(); }));
    if (nav.unit) bar.appendChild(c(nav.unit.title_ar, function () { nav.lesson = null; go(); }));
    if (nav.lesson) bar.appendChild(h("span", "sbadge", nav.lesson.title_ar));
    return bar;
  }
  function go() {
    box.textContent = "";
    box.appendChild(crumbs());
    if (nav.lesson) return viewLesson();
    if (nav.unit) return viewUnit();
    if (nav.level) return viewLevel();
    if (nav.track) return viewTrack();
    return viewTracks();
  }
  function swap(table, a, b, field) {
    var pa = {}, pb = {}; pa[field] = b.index; pb[field] = a.index;
    return Promise.all([sb.from(table).update(pa).eq("id", a.id), sb.from(table).update(pb).eq("id", b.id)]).then(function (r) { if (r[0].error || r[1].error) fail(r[0].error || r[1].error); });
  }

  // ---------------- 1) tracks
  function viewTracks() {
    box.appendChild(h("h3", "", "المسارات"));
    sb.from("adv_tracks").select("*").order("sort_order").then(function (r) {
      if (r.error) return fail(r.error);
      var rows = h("div", "rows");
      r.data.forEach(function (t) {
        var row = h("div", "row"); var info = h("div", "info"); info.appendChild(h("strong", "", t.title_ar + " / " + t.title_en)); info.appendChild(h("small", "", t.description_ar));
        row.appendChild(info); row.appendChild(btn("فتح", "", function () { nav.track = t; go(); })); rows.appendChild(row);
      });
      box.appendChild(rows);
    });
  }

  // ---------------- 2) levels of a track
  function viewTrack() {
    box.appendChild(h("h3", "", "مستويات: " + nav.track.title_ar));
    Promise.all([sb.from("adv_levels").select("*").eq("track_id", nav.track.id).order("sort_order"), sb.from("adv_units").select("id,level_id")]).then(function (res) {
      if (res[0].error) return fail(res[0].error);
      var cnt = {}; (res[1].data || []).forEach(function (u) { cnt[u.level_id] = (cnt[u.level_id] || 0) + 1; });
      var rows = h("div", "rows");
      res[0].data.forEach(function (l) {
        var row = h("div", "row"); var info = h("div", "info");
        info.appendChild(h("strong", "", l.code.toUpperCase() + " — " + l.title_ar + " / " + l.title_en));
        info.appendChild(h("small", "", "الوحدات: " + (cnt[l.id] || 0) + "  |  " + (l.is_published ? "ظاهر للطلاب" : "مخفي")));
        row.appendChild(info);
        row.appendChild(btn("فتح", "", function () { nav.level = l; go(); }));
        row.appendChild(btn(l.is_published ? "إخفاء" : "إظهار", "ghost", function () {
          sb.from("adv_levels").update({ is_published: !l.is_published }).eq("id", l.id).then(function (x) { if (x.error) return fail(x.error); go(); });
        }));
        rows.appendChild(row);
      });
      box.appendChild(rows);
    });
  }

  // ---------------- 3) units of a level
  function viewLevel() {
    box.appendChild(h("h3", "", "وحدات: " + nav.level.title_ar));
    Promise.all([sb.from("adv_units").select("*").eq("level_id", nav.level.id).order("sort_order"), sb.from("adv_lessons").select("id,unit_id")]).then(function (res) {
      if (res[0].error) return fail(res[0].error);
      var units = res[0].data, cnt = {}; (res[1].data || []).forEach(function (l) { cnt[l.unit_id] = (cnt[l.unit_id] || 0) + 1; });
      var rows = h("div", "rows");
      if (!units.length) rows.appendChild(h("p", "meta", "لسه مفيش وحدات. أضيفي وحدة أو استوردي JSON."));
      units.forEach(function (u, i) {
        var row = h("div", "row"); var info = h("div", "info");
        info.appendChild(h("strong", "", (i + 1) + ". " + u.title_ar + (u.title_en ? " / " + u.title_en : "")));
        info.appendChild(h("small", "", "الدروس: " + (cnt[u.id] || 0) + "  |  " + (u.is_published ? "منشورة" : "مسودة")));
        row.appendChild(info);
        row.appendChild(btn("فتح", "", function () { nav.unit = u; go(); }));
        row.appendChild(btn(u.is_published ? "إخفاء" : "نشر", "ghost", function () { sb.from("adv_units").update({ is_published: !u.is_published }).eq("id", u.id).then(function (x) { if (x.error) return fail(x.error); go(); }); }));
        row.appendChild(btn("↑", "ghost", function () { if (i > 0) swap("adv_units", { id: u.id, index: i + 1 }, { id: units[i - 1].id, index: i }, "sort_order").then(go); }));
        row.appendChild(btn("↓", "ghost", function () { if (i < units.length - 1) swap("adv_units", { id: u.id, index: i + 1 }, { id: units[i + 1].id, index: i + 2 }, "sort_order").then(go); }));
        row.appendChild(btn("حذف", "ghost", function () { if (!window.confirm("حذف الوحدة وكل دروسها؟")) return; sb.from("adv_units").delete().eq("id", u.id).then(function (x) { if (x.error) return fail(x.error); go(); }); }));
        rows.appendChild(row);
      });
      box.appendChild(rows);

      var f = h("div", "tfields");
      var tar = inp("", 150), ten = inp("", 150, true);
      f.appendChild(field("اسم الوحدة (عربي)", tar)); f.appendChild(field("اسم الوحدة (إنجليزي)", ten));
      f.appendChild(btn("إضافة وحدة", "", function () {
        if (!tar.value.trim()) return say("err", "اكتبي اسم الوحدة.");
        sb.from("adv_units").insert({ level_id: nav.level.id, title_ar: tar.value.trim(), title_en: ten.value.trim(), sort_order: units.length + 1 }).then(function (x) { if (x.error) return fail(x.error); say("ok", "تمت إضافة الوحدة."); go(); });
      }));
      box.appendChild(h("h3", "", "وحدة جديدة")); box.appendChild(f);
      box.appendChild(importBox("level"));
    });
  }

  // ---------------- 4) lessons of a unit
  function viewUnit() {
    box.appendChild(h("h3", "", "دروس: " + nav.unit.title_ar));
    Promise.all([sb.from("adv_lessons").select("*").eq("unit_id", nav.unit.id).order("sort_order"), sb.from("adv_activities").select("id,lesson_id")]).then(function (res) {
      if (res[0].error) return fail(res[0].error);
      var ls = res[0].data, cnt = {}; (res[1].data || []).forEach(function (a) { cnt[a.lesson_id] = (cnt[a.lesson_id] || 0) + 1; });
      var rows = h("div", "rows");
      if (!ls.length) rows.appendChild(h("p", "meta", "لسه مفيش دروس."));
      ls.forEach(function (l, i) {
        var row = h("div", "row"); var info = h("div", "info");
        info.appendChild(h("strong", "", (i + 1) + ". " + l.title_ar));
        info.appendChild(h("small", "", "الأنشطة: " + (cnt[l.id] || 0) + "  |  XP: " + l.xp_reward + "  |  النجاح: " + l.pass_percent + "%  |  " + (l.status === "published" ? "منشور" : "مسودة")));
        row.appendChild(info);
        row.appendChild(btn("فتح المحرر", "", function () { nav.lesson = l; go(); }));
        row.appendChild(btn("↑", "ghost", function () { if (i > 0) swap("adv_lessons", { id: l.id, index: i + 1 }, { id: ls[i - 1].id, index: i }, "sort_order").then(go); }));
        row.appendChild(btn("↓", "ghost", function () { if (i < ls.length - 1) swap("adv_lessons", { id: l.id, index: i + 1 }, { id: ls[i + 1].id, index: i + 2 }, "sort_order").then(go); }));
        row.appendChild(btn("حذف", "ghost", function () { if (!window.confirm("حذف الدرس وكل أنشطته؟")) return; sb.from("adv_lessons").delete().eq("id", l.id).then(function (x) { if (x.error) return fail(x.error); go(); }); }));
        rows.appendChild(row);
      });
      box.appendChild(rows);
      var f = h("div", "tfields"); var tar = inp("", 150), ten = inp("", 150, true);
      f.appendChild(field("اسم الدرس (عربي)", tar)); f.appendChild(field("اسم الدرس (إنجليزي)", ten));
      f.appendChild(btn("إضافة درس", "", function () {
        if (!tar.value.trim()) return say("err", "اكتبي اسم الدرس.");
        sb.from("adv_lessons").insert({ unit_id: nav.unit.id, title_ar: tar.value.trim(), title_en: ten.value.trim(), sort_order: ls.length + 1 }).select("*").single().then(function (x) {
          if (x.error) return fail(x.error); nav.lesson = x.data; say("ok", "تم إنشاء الدرس. ضيفي له الأنشطة."); go();
        });
      }));
      box.appendChild(h("h3", "", "درس جديد")); box.appendChild(f);
      box.appendChild(importBox("unit"));
    });
  }

  // ---------------- JSON import
  function importBox(scope) {
    var w = h("div", "mbox");
    w.appendChild(h("h3", "", "استيراد JSON"));
    w.appendChild(h("p", "meta", scope === "level"
      ? "الصيغة: { \"unit\": { \"title_ar\": \"...\", \"title_en\": \"...\" }, \"lessons\": [ { \"title_ar\": \"...\", \"xp_reward\": 10, \"pass_percent\": 70, \"activities\": [ { \"type\": \"choice\", \"data\": { ... } } ] } ] }. بيتعمل كمسودة."
      : "الصيغة: { \"lessons\": [ { \"title_ar\": \"...\", \"activities\": [ { \"type\": \"choice\", \"data\": { ... } } ] } ] }. بيتضاف كمسودة للوحدة الحالية."));
    var t = ta("", 8, true); t.placeholder = "{ ... }";
    w.appendChild(t);
    w.appendChild(btn("استيراد", "", function () {
      var obj; try { obj = JSON.parse(t.value); } catch (e) { return say("err", "الـ JSON فيه خطأ في الكتابة: " + e.message); }
      importData(scope, obj).then(function (ok) { if (ok) { t.value = ""; go(); } });
    }));
    return w;
  }
  function checkLessons(lessons) {
    if (!Array.isArray(lessons) || !lessons.length) return "لازم يكون فيه lessons (قايمة دروس).";
    for (var i = 0; i < lessons.length; i++) {
      var l = lessons[i];
      if (!l || typeof l.title_ar !== "string" || !l.title_ar.trim()) return "الدرس رقم " + (i + 1) + " ناقصه title_ar.";
      var acts = l.activities || [];
      for (var j = 0; j < acts.length; j++) {
        var e = A.validate(acts[j].type, acts[j].data);
        if (e) return "الدرس " + (i + 1) + " النشاط " + (j + 1) + ": " + e;
      }
    }
    return null;
  }
  function importData(scope, obj) {
    var lessons = Array.isArray(obj) ? obj : obj && obj.lessons;
    var err = checkLessons(lessons);
    if (err) { say("err", err); return Promise.resolve(false); }
    var unitP;
    if (scope === "level") {
      var u = obj.unit || {};
      if (typeof u.title_ar !== "string" || !u.title_ar.trim()) { say("err", "لازم unit.title_ar."); return Promise.resolve(false); }
      unitP = sb.from("adv_units").select("id", { count: "exact", head: true }).eq("level_id", nav.level.id).then(function (c) {
        return sb.from("adv_units").insert({ level_id: nav.level.id, title_ar: u.title_ar.trim(), title_en: String(u.title_en || "").trim(), sort_order: (c.count || 0) + 1 }).select("id").single();
      }).then(function (r) { if (r.error) throw r.error; return r.data.id; });
    } else unitP = Promise.resolve(nav.unit.id);
    return unitP.then(function (unitId) {
      return sb.from("adv_lessons").select("id", { count: "exact", head: true }).eq("unit_id", unitId).then(function (c) {
        var base = c.count || 0, chain = Promise.resolve();
        lessons.forEach(function (l, i) {
          chain = chain.then(function () {
            return sb.from("adv_lessons").insert({
              unit_id: unitId, title_ar: l.title_ar.trim(), title_en: String(l.title_en || "").slice(0, 150), objective_ar: String(l.objective_ar || "").slice(0, 400), objective_en: String(l.objective_en || "").slice(0, 400),
              xp_reward: Math.min(100, Math.max(0, parseInt(l.xp_reward, 10) || 10)), pass_percent: Math.min(100, Math.max(0, l.pass_percent == null ? 70 : parseInt(l.pass_percent, 10) || 0)), sort_order: base + i + 1
            }).select("id").single().then(function (r) {
              if (r.error) throw r.error;
              var acts = (l.activities || []).map(function (a, k) { return { lesson_id: r.data.id, position: k + 1, type: a.type, data: a.data }; });
              if (!acts.length) return;
              return sb.from("adv_activities").insert(acts).then(function (x) { if (x.error) throw x.error; });
            });
          });
        });
        return chain;
      });
    }).then(function () { say("ok", "تم الاستيراد كمسودة. راجعيه وانشريه."); return true; })
      .catch(function (e) { fail(e); return false; });
  }

  // ---------------- 5) lesson builder
  function viewLesson() {
    var l = nav.lesson;
    sb.from("adv_lessons").select("*").eq("id", l.id).single().then(function (r) {
      if (r.error) return fail(r.error);
      l = nav.lesson = r.data;
      var head = h("div", "mbox");
      head.appendChild(h("h3", "", "بيانات الدرس  "));
      head.firstChild.appendChild(h("span", "sbadge " + (l.status === "published" ? "" : "draft"), l.status === "published" ? "منشور" : "مسودة"));
      var f = h("div", "tfields");
      var tar = inp(l.title_ar, 150), ten = inp(l.title_en, 150, true), oar = ta(l.objective_ar, 2), oen = ta(l.objective_en, 2, true), xp = num(l.xp_reward, 0, 100), ps = num(l.pass_percent, 0, 100);
      f.appendChild(field("عنوان الدرس (عربي)", tar)); f.appendChild(field("عنوان الدرس (إنجليزي)", ten));
      f.appendChild(field("الهدف التعليمي (عربي)", oar, true)); f.appendChild(field("الهدف التعليمي (إنجليزي)", oen, true));
      f.appendChild(field("نقاط الدرس XP", xp)); f.appendChild(field("درجة النجاح %", ps));
      head.appendChild(f);
      var row = h("div", "btnrow");
      row.appendChild(btn("حفظ بيانات الدرس", "", function () {
        if (!tar.value.trim()) return say("err", "اكتبي عنوان الدرس.");
        sb.from("adv_lessons").update({ title_ar: tar.value.trim(), title_en: ten.value.trim(), objective_ar: oar.value.trim(), objective_en: oen.value.trim(), xp_reward: parseInt(xp.value, 10) || 0, pass_percent: parseInt(ps.value, 10) || 0 }).eq("id", l.id).then(function (x) { if (x.error) return fail(x.error); say("ok", "تم حفظ الدرس."); go(); });
      }));
      row.appendChild(btn(l.status === "published" ? "سحب النشر" : "نشر الدرس", "ghost", function () {
        sb.from("adv_lessons").update({ status: l.status === "published" ? "draft" : "published" }).eq("id", l.id).then(function (x) { if (x.error) return fail(x.error); say("ok", l.status === "published" ? "تم سحب الدرس." : "تم نشر الدرس. تأكدي إن الوحدة والمستوى منشورين."); go(); });
      }));
      head.appendChild(row);
      box.appendChild(head);
      loadActivities();
    });
  }
  function summary(a) {
    var d = a.data || {};
    return d.word || d.prompt || d.speak || (d.words ? d.words.join(" ") : "") || (d.pairs ? d.pairs.map(function (p) { return p.l; }).join("، ") : "");
  }
  function loadActivities() {
    var holder = h("div"); box.appendChild(holder);
    sb.from("adv_activities").select("*").eq("lesson_id", nav.lesson.id).order("position").then(function (r) {
      if (r.error) return fail(r.error);
      var acts = r.data;
      holder.appendChild(h("h3", "", "الأنشطة (" + acts.length + ")"));
      var rows = h("div", "rows");
      if (!acts.length) rows.appendChild(h("p", "meta", "لسه مفيش أنشطة."));
      acts.forEach(function (a, i) {
        var row = h("div", "row"); var info = h("div", "info");
        info.appendChild(h("strong", "", (i + 1) + ". " + A.TYPES[a.type])); info.appendChild(h("small", "", summary(a)));
        row.appendChild(info);
        row.appendChild(btn("تعديل", "", function () { editor(holder, a, acts.length); }));
        row.appendChild(btn("↑", "ghost", function () { if (i > 0) swap("adv_activities", { id: a.id, index: i + 1 }, { id: acts[i - 1].id, index: i }, "position").then(go); }));
        row.appendChild(btn("↓", "ghost", function () { if (i < acts.length - 1) swap("adv_activities", { id: a.id, index: i + 1 }, { id: acts[i + 1].id, index: i + 2 }, "position").then(go); }));
        row.appendChild(btn("حذف", "ghost", function () { if (!window.confirm("حذف النشاط؟")) return; sb.from("adv_activities").delete().eq("id", a.id).then(function (x) { if (x.error) return fail(x.error); go(); }); }));
        rows.appendChild(row);
      });
      holder.appendChild(rows);
      var add = h("div", "mbox"); add.appendChild(h("h3", "", "إضافة نشاط"));
      var sel = h("select"); Object.keys(A.TYPES).forEach(function (k) { var o = h("option", "", A.TYPES[k]); o.value = k; sel.appendChild(o); });
      var bar = h("div", "tfields"); bar.appendChild(field("نوع النشاط", sel));
      bar.appendChild(btn("إنشاء", "", function () { editor(holder, { type: sel.value, data: {} }, acts.length, true); }));
      add.appendChild(bar); holder.appendChild(add);
    });
  }

  // ---------------- media upload field
  function media(label, value, kind) {
    var wrap = h("div", "full"); var t = inp(value, 500, true); t.placeholder = "https://... أو ارفعي ملف";
    var f = h("input"); f.type = "file"; f.accept = kind === "audio" ? "audio/mpeg,audio/ogg,audio/wav,audio/webm,audio/mp4" : "image/jpeg,image/png,image/webp";
    var st = h("small", "", "");
    f.addEventListener("change", function () {
      var file = f.files[0]; if (!file) return;
      if (file.size > 5 * 1024 * 1024) { st.textContent = "الملف أكبر من 5 ميجا."; return; }
      var ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      var path = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      st.textContent = "جارٍ الرفع...";
      sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false }).then(function (u) {
        if (u.error) { st.textContent = "فشل الرفع: " + u.error.message; return; }
        t.value = publicUrl(path); st.textContent = "تم الرفع ✓";
      });
    });
    var l = h("label"); l.appendChild(h("span", "", label)); l.appendChild(t); wrap.appendChild(l); wrap.appendChild(f); wrap.appendChild(st);
    wrap.value = function () { return t.value.trim(); };
    return wrap;
  }

  // ---------------- activity editor (one form per type)
  function editor(holder, a, count, isNew) {
    var d = a.data || {}, type = a.type;
    var old = holder.querySelector(".act-editor"); if (old) old.remove();
    var w = h("div", "mbox act-editor"); w.appendChild(h("h3", "", (isNew ? "نشاط جديد: " : "تعديل: ") + A.TYPES[type]));
    var f = h("div", "tfields"); w.appendChild(f);
    var get = {};
    function add(key, label, el, full) { get[key] = el; f.appendChild(field(label, el, full)); }
    function optsBlock() { add("options", "الاختيارات (كل اختيار في سطر)", ta((d.options || []).join("\n"), 4), true); add("answer", "رقم الإجابة الصحيحة (1 = أول اختيار)", num(d.answer != null && type !== "true_false" ? d.answer + 1 : 1, 1, 6)); }
    if (type === "flashcard") { add("word", "الكلمة / الحرف (بالعربي)", inp(d.word, 200)); add("meaning_ar", "المعنى بالعربي", inp(d.meaning_ar, 200)); add("meaning_en", "المعنى بالإنجليزي", inp(d.meaning_en, 200, true)); add("example", "مثال في جملة", inp(d.example, 300), true); add("speak", "النص اللي يتقرأ بصوت عالي (اختياري)", inp(d.speak, 200)); }
    if (type === "choice") { add("prompt", "السؤال", inp(d.prompt, 300), true); optsBlock(); add("speak", "نص يتقرأ بصوت (اختياري)", inp(d.speak, 200)); }
    if (type === "listen") { add("prompt", "نص السؤال (مثال: ماذا سمعت؟)", inp(d.prompt || "ماذا سمعت؟", 300), true); add("speak", "النص اللي هيتقرأ بصوت", inp(d.speak, 200)); optsBlock(); }
    if (type === "true_false") { add("prompt", "العبارة", inp(d.prompt, 300), true); var s = h("select"); [["true", "صح"], ["false", "غلط"]].forEach(function (p) { var o = h("option", "", p[1]); o.value = p[0]; s.appendChild(o); }); s.value = d.answer === false ? "false" : "true"; add("answer", "الإجابة الصحيحة", s); }
    if (type === "match") { add("pairs", "الأزواج (كل سطر: اليسار | اليمين)", ta((d.pairs || []).map(function (p) { return p.l + " | " + p.r; }).join("\n"), 5), true); }
    if (type === "order") { add("sentence", "الجملة الصحيحة (الكلمات بترتيبها، مفصولة بمسافة)", inp((d.words || []).join(" "), 300), true); add("meaning_ar", "معناها بالعربي (تلميح)", inp(d.meaning_ar, 200)); add("meaning_en", "معناها بالإنجليزي (تلميح)", inp(d.meaning_en, 200, true)); }
    if (type === "fill") { add("prompt", "الجملة (حطي ___ مكان الفراغ)", inp(d.prompt, 300), true); optsBlock(); }
    if (type === "translate") { add("prompt", "السؤال (مثال: اكتبي بالعربي: Book)", inp(d.prompt, 300), true); add("answer", "الإجابة الصحيحة", inp(d.answer, 200)); add("accept", "إجابات بديلة مقبولة (كل واحدة في سطر)", ta((d.accept || []).join("\n"), 3), true); }
    add("feedback", "تعليق بعد الإجابة (اختياري)", inp(d.feedback, 300), true);
    var im = media("صورة (اختياري)", d.image_url, "image"); f.appendChild(im);
    var au = null; if (type === "choice" || type === "listen" || type === "flashcard") { au = media("ملف صوتي (اختياري)", d.audio_url, "audio"); f.appendChild(au); }

    function collect() {
      var o = {}; function v(k) { return get[k] && get[k].value != null ? String(get[k].value).trim() : ""; }
      if (type === "flashcard") { o = { word: v("word"), meaning_ar: v("meaning_ar"), meaning_en: v("meaning_en"), example: v("example"), speak: v("speak") }; }
      if (type === "choice") { o = { prompt: v("prompt"), options: lines(get.options.value), answer: parseInt(v("answer"), 10) - 1, speak: v("speak") }; }
      if (type === "listen") { o = { prompt: v("prompt"), speak: v("speak"), options: lines(get.options.value), answer: parseInt(v("answer"), 10) - 1 }; }
      if (type === "true_false") { o = { prompt: v("prompt"), answer: v("answer") === "true" }; }
      if (type === "match") { o = { pairs: lines(get.pairs.value).map(function (x) { var p = x.split("|"); return { l: (p[0] || "").trim(), r: (p[1] || "").trim() }; }) }; }
      if (type === "order") { o = { words: v("sentence").split(/\s+/).filter(Boolean), meaning_ar: v("meaning_ar"), meaning_en: v("meaning_en") }; }
      if (type === "fill") { o = { prompt: v("prompt"), options: lines(get.options.value), answer: parseInt(v("answer"), 10) - 1 }; }
      if (type === "translate") { o = { prompt: v("prompt"), answer: v("answer"), accept: lines(get.accept.value) }; }
      o.feedback = v("feedback");
      var img = im.value(); if (img) o.image_url = img;
      if (au) { var aud = au.value(); if (aud) o.audio_url = aud; }
      Object.keys(o).forEach(function (k) { if (o[k] === "" || (Array.isArray(o[k]) && !o[k].length && k === "accept")) delete o[k]; });
      return o;
    }
    var row = h("div", "btnrow");
    row.appendChild(btn("حفظ النشاط", "", function () {
      var o = collect(), e = A.validate(type, o);
      if (e) return say("err", e);
      var q = a.id ? sb.from("adv_activities").update({ data: o }).eq("id", a.id) : sb.from("adv_activities").insert({ lesson_id: nav.lesson.id, position: count + 1, type: type, data: o });
      q.then(function (x) { if (x.error) return fail(x.error); say("ok", "تم حفظ النشاط."); go(); });
    }));
    row.appendChild(btn("إلغاء", "ghost", function () { w.remove(); }));
    w.appendChild(row);
    holder.appendChild(w);
    w.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  document.addEventListener("af-open-adventure", go);
  sb.auth.getSession().then(function (r) {
    var s = r.data && r.data.session; if (!s) return;
    return sb.from("profiles").select("role").eq("id", s.user.id).single().then(function (p) { if (p.data && p.data.role === "admin") go(); });
  });
})();
