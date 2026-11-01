(function () {
  var sb = window.AF_sb;
  var msg = document.getElementById("msg");
  var NS = "http://www.w3.org/2000/svg";
  var M = {
    ar: {
      lib: "تعذر تحميل الخدمة. اتأكد من الإنترنت وجرّب تاني.", generic: "حصلت مشكلة. جرّب تاني بعد شوية.",
      search: "ابحث في الحصص والبرامج...", site: "عرض الموقع", student: "طالب", parent: "ولي أمر",
      hello: "السلام عليكم، ", helloSub: "كمّل، إنت ماشي في رحلة تعلّم جميلة.",
      navDash: "لوحتي", navCourses: "برامجي", navLessons: "الحصص", navHomework: "الواجبات", navProgress: "تقدّمي",
      navEnroll: "التسجيل في برنامج", navSettings: "الضبط", navLive: "الحصص المباشرة", navCerts: "الشهادات", navMsgs: "الرسائل", soon: "قريبًا",
      cont: "كمّل التعلّم", lastLesson: "آخر حصة", noLessonYet: "لسه ما اتسجّلتش حصص", viewLessons: "عرض الحصص", completed: "مكتمل",
      noProg: "لسه ما عندكش برنامج مقبول", noProgSub: "ابعت طلب تسجيل وهنتواصل معاك.", enroll: "التسجيل في برنامج",
      sPrograms: "برامجي", sAttended: "حصص حضرتها", sPending: "طلبات قيد المراجعة", sProgress: "متوسط التقدّم",
      myCourses: "برامجي", viewAll: "التسجيل في برنامج جديد", teacher: "المعلم", inProg: "جارٍ", notStarted: "لسه ما بدأش", done: "مكتمل", lessonsBtn: "الحصص",
      recent: "آخر الحصص", showMore: "عرض المزيد", showLess: "عرض أقل", noLessons: "لسه مفيش حصص مسجلة.",
      attended: "حضر", absent: "غاب", excused: "اعتذر", notes: "ملاحظات المعلم", homework: "الواجب",
      myProgress: "تقدّمي", overall: "الإجمالي", lAttended: "حصص حضرتها", lAbsent: "غياب", lTotal: "إجمالي الحصص",
      hwTitle: "الواجبات", noHw: "مفيش واجبات حاليًا.",
      schedTitle: "الحصص المباشرة والجدول", schedSoon: "ده القسم هيتفعّل قريبًا بعد ما نضيف الحصص المباشرة.",
      navMaterial: "المادة العلمية", navAdventure: "مغامرة العربية 🌙", matTitle: "المادة العلمية", noMat: "لسه مفيش حصص مرسلة ليك من المعلم.", due: "الموعد", markDone: "علّمي كمكتملة", markDoneM: "علّم كمكتملة", undo: "إلغاء الإتمام", doneLbl: "تمّت", open: "فتح", openLink: "فتح الرابط", fromMat: "من مادة",
      remTitle: "تذكير للدراسة", hadith: "طلب العلم فريضة على كل مسلم", hadithTr: "رواه ابن ماجه"
    },
    en: {
      lib: "Could not load the service. Check your internet and try again.", generic: "Something went wrong. Please try again shortly.",
      search: "Search lessons and programs...", site: "View website", student: "Student", parent: "Parent",
      hello: "Assalamu alaikum, ", helloSub: "Keep going! You're on a beautiful learning journey.",
      navDash: "Dashboard", navCourses: "My Programs", navLessons: "Lessons", navHomework: "Homework", navProgress: "Progress",
      navEnroll: "Enroll in a program", navSettings: "Settings", navLive: "Live Classes", navCerts: "Certificates", navMsgs: "Messages", soon: "Soon",
      cont: "Continue Learning", lastLesson: "Last lesson", noLessonYet: "No lessons recorded yet", viewLessons: "View lessons", completed: "Completed",
      noProg: "You have no approved programs yet", noProgSub: "Send an enrollment request and we will contact you.", enroll: "Enroll in a program",
      sPrograms: "My Programs", sAttended: "Lessons Attended", sPending: "Requests Under Review", sProgress: "Average Progress",
      myCourses: "My Programs", viewAll: "Enroll in a new program", teacher: "Teacher", inProg: "In Progress", notStarted: "Not Started", done: "Completed", lessonsBtn: "Lessons",
      recent: "Recent Lessons", showMore: "Show more", showLess: "Show less", noLessons: "No lessons recorded yet.",
      attended: "Attended", absent: "Absent", excused: "Excused", notes: "Teacher notes", homework: "Homework",
      myProgress: "My Progress", overall: "Overall", lAttended: "Lessons attended", lAbsent: "Absences", lTotal: "Total lessons",
      hwTitle: "Homework", noHw: "No homework right now.",
      schedTitle: "Live Classes & Schedule", schedSoon: "This section will be activated soon, once live classes are added.",
      navMaterial: "Study Material", navAdventure: "Arabic Adventure 🌙", matTitle: "Study Material", noMat: "No lessons have been sent to you yet.", due: "Due", markDone: "Mark as done", markDoneM: "Mark as done", undo: "Undo", doneLbl: "Done", open: "Open", openLink: "Open link", fromMat: "From",
      remTitle: "Study Reminder", hadith: "Seeking knowledge is an obligation upon every Muslim", hadithTr: "Narrated by Ibn Majah"
    }
  };
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function t(k) { return M[lang()][k]; }
  function el(id) { return document.getElementById(id); }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function s(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function icon(id) { var v = s("svg", { "class": "ic" }); s("use", { href: "#a-" + id }, v); return v; }
  function fail(extra) { msg.className = "msg err"; msg.textContent = t("generic") + (extra ? " [" + extra + "]" : ""); }
  if (!sb) { msg.className = "msg err"; msg.textContent = t("lib"); return; }

  var st = { profile: null, email: "", enr: [], pending: 0, query: "", more: false };
  function fmt(d) { return new Date(d + "T00:00:00").toLocaleDateString(lang() === "ar" ? "ar-EG" : "en-GB"); }
  function title(p) { return p ? p["title_" + lang()] : ""; }
  function imgUrl(path) { return path.indexOf("assets/") === 0 ? path : sb.storage.from("program-images").getPublicUrl(path).data.publicUrl; }
  function ring(pct, size, big) {
    var r = size / 2 - 7, C = 2 * Math.PI * r;
    var v = s("svg", { width: size, height: size, viewBox: "0 0 " + size + " " + size, role: "img", "aria-label": pct + "%" });
    s("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: "#DCE8E0", "stroke-width": 8 }, v);
    s("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: "#0F5A3C", "stroke-width": 8, "stroke-linecap": "round", "stroke-dasharray": (C * pct / 100) + " " + C, transform: "rotate(-90 " + size / 2 + " " + size / 2 + ")" }, v);
    var tx = s("text", { x: size / 2, y: size / 2 + (big ? 8 : 6), "text-anchor": "middle", "font-size": big ? 24 : 18, "font-weight": 700, fill: "#0B3B2B" }, v);
    tx.textContent = pct + "%";
    return v;
  }
  function pbar(pct) { var b = h("div", "pbar"); var f = h("span"); f.style.width = pct + "%"; b.appendChild(f); b.setAttribute("role", "progressbar"); b.setAttribute("aria-valuenow", pct); return b; }
  function allLessons() {
    var out = [];
    st.enr.forEach(function (e) { (e.lessons || []).forEach(function (l) { out.push({ l: l, e: e }); }); });
    out.sort(function (a, b) { return a.l.held_on < b.l.held_on ? 1 : -1; });
    return out;
  }

  function renderNav() {
    var nav = el("nav"); nav.textContent = "";
    [["#top", "home", "navDash"], ["#courses", "book", "navCourses"], ["#material", "file", "navMaterial"], ["adventure.html", "award", "navAdventure"], ["#lessons", "file", "navLessons"], ["#homework", "clip", "navHomework"], ["#progress", "award", "navProgress"], ["enroll.html", "users", "navEnroll"], ["#settings", "gear", "navSettings"]].forEach(function (n, i) {
      var a = h("a", i === 0 ? "on" : ""); a.href = n[0]; a.appendChild(icon(n[1])); a.appendChild(h("span", "", t(n[2])));
      a.addEventListener("click", function () { document.body.classList.remove("side-open"); nav.querySelectorAll("a").forEach(function (x) { x.classList.toggle("on", x === a); }); });
      nav.appendChild(a);
    });
    nav.appendChild(h("p", "grp", t("soon")));
    [["video", "navLive"], ["award", "navCerts"], ["mega", "navMsgs"]].forEach(function (n) {
      var a = h("a", "soon"); a.setAttribute("aria-disabled", "true"); a.appendChild(icon(n[0])); a.appendChild(h("span", "", t(n[1]))); a.appendChild(h("em", "", t("soon"))); nav.appendChild(a);
    });
  }

  function renderHero() {
    var box = el("hero"); box.textContent = "";
    var moon = s("svg", { "class": "moon", viewBox: "0 0 200 200", "aria-hidden": "true" });
    s("path", { d: "M120 20a80 80 0 1 0 60 130 62 62 0 1 1-60-130z", fill: "#E4CF9A" }, moon);
    box.appendChild(moon);
    var ht = h("div", "ht");
    if (!st.enr.length) {
      ht.appendChild(h("h2", "", t("noProg")));
      ht.appendChild(h("p", "hs", t("noProgSub")));
      var a = h("a", "btn", t("enroll")); a.href = "enroll.html"; ht.appendChild(a);
      box.appendChild(ht); return;
    }
    var best = st.enr.slice().sort(function (a, b) {
      var la = (a.lessons || []).map(function (x) { return x.held_on; }).sort().pop() || "", lb = (b.lessons || []).map(function (x) { return x.held_on; }).sort().pop() || "";
      return lb.localeCompare(la);
    })[0];
    var ls = (best.lessons || []).slice().sort(function (a, b) { return a.held_on < b.held_on ? 1 : -1; });
    ht.appendChild(h("small", "", t("cont")));
    ht.appendChild(h("h2", "", title(best.programs) + " — " + best.student_name));
    ht.appendChild(pbar(best.progress_percent));
    ht.appendChild(h("p", "hs", ls.length ? t("lastLesson") + ": " + ls[0].topic + " (" + fmt(ls[0].held_on) + ")" : t("noLessonYet")));
    var b = h("a", "btn", t("viewLessons")); b.href = "#lessons"; ht.appendChild(b);
    box.appendChild(ht);
    var rg = h("div", "ring"); rg.appendChild(ring(best.progress_percent, 120, true)); box.appendChild(rg);
  }

  function renderStats() {
    var box = el("stats"); box.textContent = "";
    var all = allLessons();
    var att = all.filter(function (x) { return x.l.attendance === "attended"; }).length;
    var avg = st.enr.length ? Math.round(st.enr.reduce(function (a, e) { return a + e.progress_percent; }, 0) / st.enr.length) : 0;
    [["book", t("sPrograms"), st.enr.length, ""], ["file", t("sAttended"), att, "amber"], ["clip", t("sPending"), st.pending, "blue"], ["award", t("sProgress"), avg + "%", ""]].forEach(function (c) {
      var d = h("div", "sc " + c[3]); var ic = h("span", "ico-c"); ic.appendChild(icon(c[0])); d.appendChild(ic);
      var x = h("div"); x.appendChild(h("small", "", c[1])); x.appendChild(h("b", "", String(c[2]))); d.appendChild(x); box.appendChild(d);
    });
  }

  function renderCourses() {
    var box = el("courses"); box.textContent = "";
    var ph = h("div", "ph"); ph.appendChild(h("h2", "", t("myCourses")));
    var a = h("a", "lnk", t("viewAll")); a.href = "enroll.html"; ph.appendChild(a); box.appendChild(ph);
    var q = st.query.toLowerCase();
    var list = st.enr.filter(function (e) { return !q || (title(e.programs) + " " + e.student_name).toLowerCase().indexOf(q) > -1; });
    var grid = h("div", "course-grid");
    list.forEach(function (e) {
      var c = h("article", "cc"); var ci = h("div", "ci");
      if (e.programs && e.programs.image_path) { var im = h("img"); im.src = imgUrl(e.programs.image_path); im.alt = ""; im.loading = "lazy"; ci.appendChild(im); } else ci.appendChild(icon("book"));
      var p = e.progress_percent;
      ci.appendChild(h("span", "tag " + (p >= 100 ? "done" : p > 0 ? "" : "new"), p >= 100 ? t("done") : p > 0 ? t("inProg") : t("notStarted")));
      c.appendChild(ci);
      var cb = h("div", "cb"); cb.appendChild(h("h3", "", title(e.programs)));
      cb.appendChild(h("small", "", e.student_name + (e.teachers && e.teachers.display_name ? " · " + t("teacher") + ": " + e.teachers.display_name : "")));
      var pr = h("div", "pr"); pr.appendChild(pbar(p)); pr.appendChild(h("span", "", p + "%")); cb.appendChild(pr);
      var b = h("button", "btn ghost small", t("lessonsBtn")); b.type = "button";
      b.addEventListener("click", function () { el("q").value = title(e.programs); st.query = el("q").value; renderCourses(); renderLessons(); el("lessons").scrollIntoView({ behavior: "smooth" }); });
      cb.appendChild(b); c.appendChild(cb); grid.appendChild(c);
    });
    if (!list.length) grid.appendChild(h("p", "meta", st.enr.length ? "—" : t("noProg")));
    box.appendChild(grid);
  }

  function renderLessons() {
    var box = el("lessons"); box.textContent = "";
    var ph = h("div", "ph"); ph.appendChild(h("h2", "", t("recent"))); box.appendChild(ph);
    var q = st.query.toLowerCase();
    var all = allLessons().filter(function (x) { return !q || (x.l.topic + " " + title(x.e.programs) + " " + x.e.student_name).toLowerCase().indexOf(q) > -1; });
    if (!all.length) { box.appendChild(h("p", "meta", t("noLessons"))); return; }
    all.slice(0, st.more ? 40 : 8).forEach(function (x) {
      var r = h("div", "lrow");
      var k = x.l.attendance;
      var li = h("span", "li " + (k === "absent" ? "x" : k === "excused" ? "e" : "")); li.appendChild(icon(k === "absent" ? "x" : k === "excused" ? "half" : "check")); r.appendChild(li);
      var lt = h("div", "lt"); lt.appendChild(h("b", "", x.l.topic));
      lt.appendChild(h("small", "", title(x.e.programs) + " — " + x.e.student_name + " — " + fmt(x.l.held_on)));
      if (x.l.notes) lt.appendChild(h("small", "", t("notes") + ": " + x.l.notes));
      if (x.l.homework) lt.appendChild(h("small", "", t("homework") + ": " + x.l.homework));
      r.appendChild(lt); r.appendChild(h("span", "st", t(k))); box.appendChild(r);
    });
    if (all.length > 8) { var b = h("button", "lnk", st.more ? t("showLess") : t("showMore")); b.type = "button"; b.addEventListener("click", function () { st.more = !st.more; renderLessons(); }); box.appendChild(b); }
  }

  function renderMaterial() {
    var box = el("material"); box.textContent = "";
    var ph = h("div", "ph"); ph.appendChild(h("h2", "", t("matTitle"))); box.appendChild(ph);
    var items = [];
    st.enr.forEach(function (e) { (e.lesson_assignments || []).forEach(function (a) { if (a.material_lessons) items.push({ a: a, e: e }); }); });
    if (!items.length) { box.appendChild(h("p", "meta", t("noMat"))); return; }
    items.sort(function (x, y) {
      var dx = x.a.completed_at ? 1 : 0, dy = y.a.completed_at ? 1 : 0;
      if (dx !== dy) return dx - dy;
      var ax = x.a.due_date || "9999", ay = y.a.due_date || "9999";
      return ax < ay ? -1 : ax > ay ? 1 : (x.a.material_lessons.position || 0) - (y.a.material_lessons.position || 0);
    });
    items.forEach(function (x) {
      var a = x.a, l = a.material_lessons, done = !!a.completed_at;
      var det = h("details", "lessonbox");
      var sm = h("summary", "", (done ? "✓ " : "") + l.title); det.appendChild(sm);
      var sub = (l.materials ? t("fromMat") + ": " + l.materials.title + " — " : "") + title(x.e.programs) + " — " + x.e.student_name + (a.due_date ? " — " + t("due") + ": " + fmt(a.due_date) : "");
      det.appendChild(h("small", "", sub));
      if (a.note) det.appendChild(h("p", "meta", a.note));
      if (l.content) det.appendChild(h("div", "pre", l.content));
      var row = h("div", "btnrow");
      if (l.link_url && /^https?:\/\//i.test(l.link_url)) { var lk = h("a", "btn ghost small", t("openLink")); lk.href = l.link_url; lk.target = "_blank"; lk.rel = "noopener noreferrer"; row.appendChild(lk); }
      var b = h("button", "btn small" + (done ? " ghost" : ""), done ? t("undo") : t("markDone")); b.type = "button";
      b.addEventListener("click", function () {
        b.disabled = true;
        sb.rpc("student_set_lesson_done", { aid: a.id, done: !done }).then(function (r) {
          if (r.error) { b.disabled = false; return fail(r.error.message); }
          a.completed_at = done ? null : new Date().toISOString();
          renderMaterial();
        });
      });
      row.appendChild(b); det.appendChild(row);
      box.appendChild(det);
    });
  }

  function renderSide() {
    var all = allLessons();
    var att = all.filter(function (x) { return x.l.attendance === "attended"; }).length;
    var abs = all.filter(function (x) { return x.l.attendance === "absent"; }).length;
    var avg = st.enr.length ? Math.round(st.enr.reduce(function (a, e) { return a + e.progress_percent; }, 0) / st.enr.length) : 0;
    var pb = el("progress"); pb.textContent = "";
    var ph = h("div", "ph"); ph.appendChild(h("h2", "", t("myProgress"))); pb.appendChild(ph);
    var body = h("div", "prog-body"); body.appendChild(ring(avg, 110, true));
    var ms = h("div"); ms.style.flex = "1";
    [[t("lAttended"), att], [t("lAbsent"), abs], [t("lTotal"), all.length]].forEach(function (m) { var r = h("div", "metric"); r.appendChild(h("span", "", m[0])); r.appendChild(h("b", "", String(m[1]))); ms.appendChild(r); });
    body.appendChild(ms); pb.appendChild(body);

    var hb = el("homework"); hb.textContent = "";
    var hh = h("div", "ph"); hh.appendChild(h("h2", "", t("hwTitle"))); hb.appendChild(hh);
    var hw = all.filter(function (x) { return x.l.homework; }).slice(0, 5);
    if (!hw.length) hb.appendChild(h("p", "meta", t("noHw")));
    hw.forEach(function (x) {
      var r = h("div", "lrow"); var li = h("span", "li e"); li.appendChild(icon("clip")); r.appendChild(li);
      var lt = h("div", "lt"); lt.appendChild(h("b", "", x.l.homework)); lt.appendChild(h("small", "", x.l.topic + " — " + fmt(x.l.held_on))); r.appendChild(lt); hb.appendChild(r);
    });

    var sc = el("schedule"); sc.textContent = "";
    var sh = h("div", "ph"); sh.appendChild(h("h2", "", t("schedTitle"))); sc.appendChild(sh);
    sc.appendChild(h("p", "meta", t("schedSoon")));
    var rm = el("reminder"); rm.textContent = "";
    rm.appendChild(h("h2", "", t("remTitle")));
    rm.appendChild(h("p", "ar", "“طلب العلم فريضة على كل مسلم”"));
    if (lang() === "en") rm.appendChild(h("p", "tr", "“" + t("hadith") + "” — " + t("hadithTr"))); else rm.appendChild(h("p", "tr", t("hadithTr")));
  }

  function renderTop() {
    if (!st.profile) return;
    var nm = (st.profile.full_name || "").trim();
    el("hello").textContent = t("hello") + (nm ? nm.split(" ")[0] : "") + "! 👋";
    el("helloSub").textContent = t("helloSub");
    el("meName").textContent = nm || "—";
    el("meAv").textContent = (nm || "؟").charAt(0);
    el("meRole").textContent = t(st.profile.role);
    el("q").placeholder = t("search");
    el("siteLink").textContent = t("site");
    el("settingsTitle").textContent = t("navSettings");
  }
  function renderAll() { renderTop(); renderNav(); renderHero(); renderStats(); renderCourses(); renderMaterial(); renderLessons(); renderSide(); }
  document.addEventListener("af-lang", renderAll);

  el("sideBtn").addEventListener("click", function () { document.body.classList.toggle("side-open"); });
  el("scrim").addEventListener("click", function () { document.body.classList.remove("side-open"); });
  el("logout").addEventListener("click", function () { sb.auth.signOut().then(function () { window.location.href = "login.html"; }); });
  el("q").addEventListener("input", function () { st.query = el("q").value.trim(); renderCourses(); renderLessons(); });

  sb.auth.getSession().then(function (r) {
    var sess = r.data && r.data.session;
    if (!sess) { window.location.href = "login.html"; return; }
    st.email = sess.user.email;
    return sb.from("profiles").select("role,full_name,phone").eq("id", sess.user.id).single().then(function (p) {
      if (p.error || !p.data || (p.data.role !== "student" && p.data.role !== "parent")) { window.location.href = "account.html"; return; }
      st.profile = p.data;
      renderAll();
      return sb.from("enrollments")
        .select("id,student_name,status,progress_percent,progress_note,programs(title_ar,title_en,image_path),teachers(display_name),lessons(id,held_on,topic,notes,homework,attendance),lesson_assignments(id,due_date,note,completed_at,material_lessons(id,title,content,link_url,position,materials(title)))")
        .in("status", ["approved", "pending"]).then(function (e) {
          if (e.error) return fail(e.error.message);
          st.enr = (e.data || []).filter(function (x) { return x.status === "approved"; });
          st.pending = (e.data || []).length - st.enr.length;
          renderAll();
        });
    });
  }).catch(function () { fail(); });
})();
