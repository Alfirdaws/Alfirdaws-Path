(function () {
  var sb = window.AF_sb;
  var root = document.getElementById("advMain"), side = document.getElementById("advSide"), msg = document.getElementById("msg"), pl = document.getElementById("player");
  var ORDER = ["pre-a1", "a1", "a2", "b1", "b2", "c1"];
  var M = {
    ar: {
      lib: "تعذر تحميل الخدمة. اتأكد من الإنترنت وجرّب تاني.", generic: "حصلت مشكلة. جرّب تاني بعد شوية.", title: "مغامرة العربية", back: "لوحتي",
      welcome: "أهلًا بك في مغامرة العربية! 🌙", wsub: "خلّينا نظبط رحلتك في دقيقة.", nativeL: "لغتك الأم", age: "عمرك", goal: "هدفك من تعلّم العربية",
      g1: "أفهم القرآن والمصطلحات الإسلامية", g2: "المحادثة اليومية", g3: "العمل أو الدراسة", g4: "لطفلي", g5: "غير ذلك",
      pickTrack: "اختر مسارك", know: "مستواك الحالي", zero: "مبتدئ من الصفر", some: "عندي خلفية (ابدأ من A1)",
      daily: "هدفك اليومي (نقاط)", start: "ابدأ المغامرة", needAge: "اكتب عمرك (من 3 لـ 100).",
      noContent: "المحتوى الخاص بالمسار ده لسه بيتجهّز. ارجع قريبًا! 🌱", locked: "الدرس ده مقفول. خلّص اللي قبله الأول.",
      level: "المستوى", unit: "وحدة", achievements: "الإنجازات", dailyGoal: "الهدف اليومي", today: "النهاردة", changePath: "تغيير المسار", best: "أفضل سلسلة",
      check: "تحقق", cont: "متابعة", correct: "إجابة صحيحة! ✓", incorrect: "إجابة غير صحيحة. الإجابة الصحيحة: ", incorrect2: "إجابة غير صحيحة.",
      t: "صح", f: "غلط", typeHere: "اكتب إجابتك هنا", noVoice: "جهازك مفيهوش صوت عربي. جرّب متصفح تاني أو سماعات.",
      lessonDone: "أحسنت! خلّصت الدرس 🎉", tryAgain: "قريب جدًا! حاول تاني 💪", score: "النتيجة", xpGained: "نقاط", streak: "سلسلة أيام",
      next: "الدرس التالي", toPath: "رجوع للمسار", retry: "حاول تاني", quit: "تخرج من الدرس؟ مش هتتحفظ النتيجة.",
      meaning: "المعنى", example: "مثال", firstLevelHint: "ابدأ من هنا",
      b_first: "أول درس", b_five: "5 دروس", b_tw: "25 درس", b_s3: "3 أيام", b_s7: "7 أيام", b_s30: "30 يوم", b_x1: "100 نقطة", b_x5: "500 نقطة", b_unit: "وحدة كاملة",
      langs: ["العربية", "English", "Français", "Español", "Türkçe", "اردو", "Bahasa", "Other"]
    },
    en: {
      lib: "Could not load the service. Check your internet and try again.", generic: "Something went wrong. Please try again shortly.", title: "Arabic Adventure", back: "Dashboard",
      welcome: "Welcome to the Arabic Adventure! 🌙", wsub: "Let's set up your journey in a minute.", nativeL: "Your native language", age: "Your age", goal: "Why do you want to learn Arabic?",
      g1: "Understand the Quran and Islamic terms", g2: "Everyday conversation", g3: "Work or study", g4: "For my child", g5: "Something else",
      pickTrack: "Choose your path", know: "Your current level", zero: "Beginner from zero", some: "I know some Arabic (start at A1)",
      daily: "Daily goal (points)", start: "Start the adventure", needAge: "Enter your age (3 to 100).",
      noContent: "This path's content is still being prepared. Please come back soon! 🌱", locked: "This lesson is locked. Finish the previous one first.",
      level: "Level", unit: "Unit", achievements: "Achievements", dailyGoal: "Daily goal", today: "Today", changePath: "Change path", best: "Best streak",
      check: "Check", cont: "Continue", correct: "Correct! ✓", incorrect: "Not quite. The correct answer: ", incorrect2: "Not quite.",
      t: "True", f: "False", typeHere: "Type your answer here", noVoice: "Your device has no Arabic voice. Try another browser or headphones.",
      lessonDone: "Well done! Lesson complete 🎉", tryAgain: "So close! Try again 💪", score: "Score", xpGained: "XP", streak: "Day streak",
      next: "Next lesson", toPath: "Back to path", retry: "Try again", quit: "Leave the lesson? Your result will not be saved.",
      meaning: "Meaning", example: "Example", firstLevelHint: "Start here",
      b_first: "First lesson", b_five: "5 lessons", b_tw: "25 lessons", b_s3: "3 days", b_s7: "7 days", b_s30: "30 days", b_x1: "100 XP", b_x5: "500 XP", b_unit: "Full unit",
      langs: ["Arabic", "English", "Français", "Español", "Türkçe", "Urdu", "Bahasa", "Other"]
    }
  };
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function t(k) { return M[lang()][k]; }
  function el(id) { return document.getElementById(id); }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function say(kind, text) { msg.className = "msg " + kind; msg.textContent = text; }
  function pick(o, base) { return o[base + "_" + lang()] || o[base + "_ar"] || o[base + "_en"] || ""; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function norm(s) { return String(s || "").toLowerCase().replace(/[\u064B-\u0652\u0670\u0640]/g, "").replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/[.,!?؟،:;"'“”]/g, "").replace(/\s+/g, " ").trim(); }
  function cairoToday() { return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" }); }
  if (!sb) { say("err", t("lib")); return; }

  var S = { uid: null, adv: null, tracks: [], levels: [], units: [], lessons: [], prog: {}, daily: [], seq: [] };
  var warned = false;

  function speak(text, url) {
    if (url) { try { new Audio(url).play(); } catch (e) { } return; }
    if (!("speechSynthesis" in window)) { say("err", t("noVoice")); return; }
    var u = new SpeechSynthesisUtterance(text); u.lang = "ar-SA"; u.rate = 0.85;
    var v = (window.speechSynthesis.getVoices() || []).filter(function (x) { return /^ar/i.test(x.lang); })[0];
    if (v) u.voice = v; else if (!warned) { warned = true; say("err", t("noVoice")); }
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  }

  // ---------------- top chips
  function chips() {
    var a = S.adv; if (!a) return;
    var todayXp = 0; S.daily.forEach(function (d) { if (d.day === cairoToday()) todayXp = d.xp; });
    el("chipXp").textContent = "⭐ " + a.xp; el("chipStreak").textContent = "🔥 " + a.streak; el("chipGoal").textContent = "🎯 " + todayXp + "/" + a.daily_goal;
    el("advTitle").textContent = t("title"); el("backLink").textContent = t("back");
  }

  // ---------------- onboarding
  function onboarding() {
    root.textContent = ""; side.textContent = "";
    var c = h("div", "card"); c.appendChild(h("h2", "", t("welcome"))); c.appendChild(h("p", "sub", t("wsub")));
    function label(text, input) { var l = h("label"); l.appendChild(h("span", "", text)); l.appendChild(input); return l; }
    var nl = h("select"); M[lang()].langs.forEach(function (x) { var o = h("option", "", x); o.value = x; nl.appendChild(o); });
    var age = h("input"); age.type = "number"; age.min = 3; age.max = 100; age.setAttribute("dir", "ltr");
    var goal = h("select"); [["g1", "islamic"], ["g2", "general"], ["g3", "general"], ["g4", "kids"], ["g5", "general"]].forEach(function (g) { var o = h("option", "", t(g[0])); o.value = g[1] + "|" + g[0]; goal.appendChild(o); });
    var lvl = h("select"); [["pre-a1", "zero"], ["a1", "some"]].forEach(function (g) { var o = h("option", "", t(g[1])); o.value = g[0]; lvl.appendChild(o); });
    var dg = h("select"); [10, 20, 30, 50].forEach(function (v) { var o = h("option", "", v + " XP"); o.value = v; if (v === 20) o.selected = true; dg.appendChild(o); });
    c.appendChild(label(t("nativeL"), nl)); c.appendChild(label(t("age"), age)); c.appendChild(label(t("goal"), goal));
    c.appendChild(h("h3", "", t("pickTrack")));
    var chosen = null, holder = h("div");
    function pickTrack(slug) { chosen = slug; holder.querySelectorAll(".track-opt").forEach(function (b) { b.classList.toggle("sel", b.dataset.slug === slug); }); }
    S.tracks.forEach(function (tr) {
      var b = h("button", "track-opt"); b.type = "button"; b.dataset.slug = tr.slug; b.appendChild(h("b", "", pick(tr, "title"))); b.appendChild(h("small", "", pick(tr, "description")));
      b.addEventListener("click", function () { pickTrack(tr.slug); }); holder.appendChild(b);
    });
    c.appendChild(holder);
    function suggest() { var a = parseInt(age.value, 10), g = goal.value.split("|")[0]; pickTrack(g === "islamic" ? "islamic" : (a && a <= 12) || g === "kids" ? "kids" : "general"); }
    age.addEventListener("input", suggest); goal.addEventListener("change", suggest);
    c.appendChild(label(t("know"), lvl)); c.appendChild(label(t("daily"), dg));
    var go = h("button", "btn big", t("start")); go.type = "button";
    go.addEventListener("click", function () {
      var a = parseInt(age.value, 10);
      if (!a || a < 3 || a > 100) return say("err", t("needAge"));
      var tr = S.tracks.filter(function (x) { return x.slug === chosen; })[0] || S.tracks[0];
      if (!tr) return say("err", t("generic"));
      go.disabled = true;
      sb.from("adv_students").insert({ user_id: S.uid, track_id: tr.id, native_lang: nl.value, age: a, goal: goal.value.split("|")[1], start_level: lvl.value, daily_goal: parseInt(dg.value, 10) }).then(function (r) {
        go.disabled = false;
        if (r.error) return say("err", t("generic") + " [" + r.error.message + "]");
        msg.textContent = ""; loadAll();
      });
    });
    c.appendChild(go); root.appendChild(c); suggest();
  }

  // ---------------- data + path
  function loadAll() {
    Promise.all([
      sb.from("adv_students").select("*").eq("user_id", S.uid).maybeSingle(),
      sb.from("adv_tracks").select("*").order("sort_order")
    ]).then(function (res) {
      if (res[1].error) return say("err", t("generic") + " [" + res[1].error.message + "]");
      S.tracks = res[1].data || [];
      S.adv = res[0].data;
      if (!S.adv) return onboarding();
      return loadPath();
    });
  }
  function loadPath() {
    return sb.from("adv_levels").select("*").eq("track_id", S.adv.track_id).order("sort_order").then(function (lv) {
      if (lv.error) return say("err", t("generic"));
      S.levels = lv.data || [];
      var lids = S.levels.map(function (l) { return l.id; });
      if (!lids.length) { S.units = []; S.lessons = []; return finishLoad(); }
      return sb.from("adv_units").select("*").in("level_id", lids).order("sort_order").then(function (u) {
        S.units = u.data || [];
        var uids = S.units.map(function (x) { return x.id; });
        if (!uids.length) { S.lessons = []; return finishLoad(); }
        return sb.from("adv_lessons").select("*").in("unit_id", uids).order("sort_order").then(function (l) { S.lessons = l.data || []; return finishLoad(); });
      });
    });
  }
  function finishLoad() {
    return Promise.all([sb.from("adv_progress").select("lesson_id,best_score,completed_at"), sb.from("adv_daily").select("day,xp").order("day", { ascending: false }).limit(14)]).then(function (r) {
      S.prog = {}; (r[0].data || []).forEach(function (p) { S.prog[p.lesson_id] = p; });
      S.daily = r[1].data || [];
      buildSeq(); chips(); renderPath(); renderSide();
    });
  }
  function buildSeq() {
    var lvById = {}; S.levels.forEach(function (l) { lvById[l.id] = l; });
    var unById = {}; S.units.forEach(function (u) { unById[u.id] = u; });
    S.seq = [];
    S.levels.forEach(function (lv) {
      S.units.filter(function (u) { return u.level_id === lv.id; }).forEach(function (u) {
        S.lessons.filter(function (l) { return l.unit_id === u.id; }).forEach(function (l) { S.seq.push({ l: l, u: u, lv: lv }); });
      });
    });
    var start = ORDER.indexOf(S.adv.start_level || "pre-a1");
    S.startIdx = S.seq.findIndex(function (x) { return ORDER.indexOf(x.lv.code) >= start; });
    if (S.startIdx < 0) S.startIdx = 0;
  }
  function done(i) { var p = S.seq[i] && S.prog[S.seq[i].l.id]; return !!(p && p.completed_at); }
  function unlocked(i) { return i <= S.startIdx || done(i - 1); }

  function renderPath() {
    root.textContent = "";
    if (!S.seq.length) { var e = h("div", "card empty", t("noContent")); root.appendChild(e); return; }
    var cur = -1; for (var i = S.startIdx; i < S.seq.length; i++) { if (!done(i) && unlocked(i)) { cur = i; break; } }
    var idx = 0;
    S.levels.forEach(function (lv) {
      var units = S.units.filter(function (u) { return u.level_id === lv.id && S.lessons.some(function (l) { return l.unit_id === u.id; }); });
      if (!units.length) return;
      var hd = h("div", "level-h"); var bb = h("div"); bb.appendChild(h("b", "", lv.code.toUpperCase() + " — " + pick(lv, "title"))); hd.appendChild(bb); root.appendChild(hd);
      units.forEach(function (u) {
        root.appendChild(h("div", "unit-t", pick(u, "title")));
        var nodes = h("div", "nodes");
        S.lessons.filter(function (l) { return l.unit_id === u.id; }).forEach(function (l, n) {
          var gi = idx++; var st = done(gi) ? "done" : unlocked(gi) ? (gi === cur ? "cur" : "") : "locked";
          var b = h("button", "node " + st, st === "done" ? "✓" : st === "locked" ? "🔒" : String(n + 1)); b.type = "button";
          b.appendChild(h("em", "", pick(l, "title")));
          b.addEventListener("click", function () { if (st === "locked") return say("err", t("locked")); msg.textContent = ""; startLesson(gi); });
          nodes.appendChild(b);
        });
        root.appendChild(nodes);
      });
    });
  }

  function renderSide() {
    side.textContent = "";
    var a = S.adv, completed = Object.keys(S.prog).filter(function (k) { return S.prog[k].completed_at; }).length;
    var unitDone = S.units.some(function (u) { var ls = S.lessons.filter(function (l) { return l.unit_id === u.id; }); return ls.length && ls.every(function (l) { return S.prog[l.id] && S.prog[l.id].completed_at; }); });
    var B = [["🌱", "b_first", completed >= 1], ["📘", "b_five", completed >= 5], ["🏅", "b_tw", completed >= 25], ["🔥", "b_s3", a.best_streak >= 3], ["⚡", "b_s7", a.best_streak >= 7], ["👑", "b_s30", a.best_streak >= 30], ["⭐", "b_x1", a.xp >= 100], ["🌟", "b_x5", a.xp >= 500], ["🏆", "b_unit", unitDone]];
    var c1 = h("div", "card"); c1.appendChild(h("h3", "", t("achievements")));
    var g = h("div", "badges"); B.forEach(function (b) { var d = h("div", "bdg" + (b[2] ? " on" : "")); d.appendChild(h("i", "", b[0])); d.appendChild(h("span", "", t(b[1]))); g.appendChild(d); }); c1.appendChild(g); side.appendChild(c1);
    var todayXp = 0; S.daily.forEach(function (d) { if (d.day === cairoToday()) todayXp = d.xp; });
    var c2 = h("div", "card"); c2.appendChild(h("h3", "", t("dailyGoal")));
    var bar = h("div"); bar.style.cssText = "height:12px;background:#E3ECE6;border-radius:999px;overflow:hidden"; var f = h("span"); f.style.cssText = "display:block;height:100%;background:#C8A24A;width:" + Math.min(100, Math.round(100 * todayXp / a.daily_goal)) + "%"; bar.appendChild(f); c2.appendChild(bar);
    c2.appendChild(h("p", "sub", t("today") + ": " + todayXp + " / " + a.daily_goal + " XP  ·  " + t("best") + ": " + a.best_streak + " 🔥")); side.appendChild(c2);
    var c3 = h("div", "card"); var sel = h("select"); S.tracks.forEach(function (tr) { var o = h("option", "", pick(tr, "title")); o.value = tr.id; if (tr.id === a.track_id) o.selected = true; sel.appendChild(o); });
    sel.addEventListener("change", function () { sb.from("adv_students").update({ track_id: sel.value }).eq("user_id", S.uid).then(function () { S.adv.track_id = sel.value; loadPath(); }); });
    c3.appendChild(h("h3", "", t("changePath"))); c3.appendChild(sel); side.appendChild(c3);
  }

  // ---------------- player
  var P = null;
  function startLesson(gi) {
    var item = S.seq[gi];
    sb.from("adv_activities").select("id,type,data,position").eq("lesson_id", item.l.id).order("position").then(function (r) {
      if (r.error) return say("err", t("generic") + " [" + r.error.message + "]");
      var acts = r.data || [];
      if (!acts.length) return say("err", t("noContent"));
      P = { gi: gi, lesson: item.l, q: acts.map(function (a) { return { a: a, review: false }; }), i: 0, graded: acts.filter(function (a) { return a.type !== "flashcard"; }).length, correct: 0, state: "check", api: null };
      pl.hidden = false; document.body.style.overflow = "hidden"; step();
    });
  }
  function closePlayer() { pl.hidden = true; pl.textContent = ""; document.body.style.overflow = ""; P = null; window.speechSynthesis && window.speechSynthesis.cancel(); }

  function frame() {
    pl.textContent = "";
    var top = h("div", "p-top"); var x = h("button", "p-x", "✕"); x.type = "button"; x.addEventListener("click", function () { if (window.confirm(t("quit"))) closePlayer(); });
    var bar = h("div", "p-bar"); var f = h("span"); f.style.width = Math.round(100 * P.i / P.q.length) + "%"; bar.appendChild(f); top.appendChild(x); top.appendChild(bar);
    var body = h("div", "p-body"), foot = h("div", "p-foot"), inn = h("div", "in"), fb = h("div", "fb"), btn = h("button", "btn", t("check")); btn.type = "button";
    inn.appendChild(fb); inn.appendChild(btn); foot.appendChild(inn);
    pl.appendChild(top); pl.appendChild(body); pl.appendChild(foot);
    return { body: body, foot: foot, fb: fb, btn: btn };
  }
  function step() {
    if (P.i >= P.q.length) return finish();
    var it = P.q[P.i], a = it.a, d = a.data || {}, F = frame();
    P.F = F; P.state = "check"; P.api = null;
    var ui = {
      ready: function (b) { F.btn.disabled = !b; },
      done: function (ok) { after(ok, it); }
    };
    var api = R[a.type](d, F.body, ui);
    P.api = api;
    if (api.auto) { F.btn.style.visibility = "hidden"; }
    else if (api.gradable === false) { F.btn.textContent = t("cont"); F.btn.disabled = false; P.state = "after"; }
    else F.btn.disabled = true;
    F.btn.addEventListener("click", function () {
      if (P.state === "check") { var res = api.check(); after(res, it); }
      else { P.i++; step(); }
    });
  }
  function after(ok, it) {
    var F = P.F, d = it.a.data || {}; P.state = "after";
    F.foot.className = "p-foot " + (ok ? "ok" : "bad"); F.fb.textContent = "";
    var b = h("b", "", ok ? t("correct") : (P.api.answerText ? t("incorrect") + P.api.answerText() : t("incorrect2"))); F.fb.appendChild(b);
    if (d.feedback) F.fb.appendChild(h("span", "", d.feedback));
    F.btn.style.visibility = "visible"; F.btn.disabled = false; F.btn.textContent = t("cont");
    if (!it.review) { if (ok) P.correct++; }
    if (!ok && !it.review) P.q.push({ a: it.a, review: true });
    var bar = pl.querySelector(".p-bar span"); if (bar) bar.style.width = Math.round(100 * (P.i + 1) / P.q.length) + "%";
  }
  function finish() {
    var score = P.graded ? Math.round(100 * P.correct / P.graded) : 100;
    pl.textContent = ""; var w = h("div", "p-body"); w.appendChild(h("div", "res", "…")); pl.appendChild(w);
    sb.rpc("adv_complete_lesson", { p_lesson: P.lesson.id, p_score: score }).then(function (r) {
      if (r.error) { closePlayer(); return say("err", t("generic") + " [" + r.error.message + "]"); }
      var o = r.data, gi = P.gi, lessonId = P.lesson.id;
      S.adv.xp = o.total_xp; S.adv.streak = o.streak; if (o.streak > S.adv.best_streak) S.adv.best_streak = o.streak;
      var old = S.prog[lessonId] || { best_score: 0, completed_at: null };
      S.prog[lessonId] = { lesson_id: lessonId, best_score: Math.max(old.best_score, score), completed_at: old.completed_at || (o.passed ? new Date().toISOString() : null) };
      var found = false; S.daily.forEach(function (d) { if (d.day === cairoToday()) { d.xp += o.xp_gained; found = true; } }); if (!found) S.daily.unshift({ day: cairoToday(), xp: o.xp_gained });
      chips(); renderSide(); renderPath();
      w.textContent = ""; var res = h("div", "res"); res.appendChild(h("div", "big", o.passed ? "🎉" : "💪")); res.appendChild(h("h2", "", o.passed ? t("lessonDone") : t("tryAgain")));
      var st = h("div", "stat3"); st.appendChild(h("span", "chip", t("score") + ": " + score + "%")); st.appendChild(h("span", "chip", "⭐ +" + o.xp_gained + " " + t("xpGained"))); st.appendChild(h("span", "chip", "🔥 " + o.streak)); res.appendChild(st);
      var row = h("div", "center"); row.style.gap = "10px"; row.style.flexWrap = "wrap";
      if (o.passed && S.seq[gi + 1] && unlocked(gi + 1)) { var nb = h("button", "btn big", t("next")); nb.type = "button"; nb.addEventListener("click", function () { closePlayer(); startLesson(gi + 1); }); row.appendChild(nb); }
      if (!o.passed) { var rb = h("button", "btn big", t("retry")); rb.type = "button"; rb.addEventListener("click", function () { closePlayer(); startLesson(gi); }); row.appendChild(rb); }
      var bb = h("button", "btn ghost big", t("toPath")); bb.type = "button"; bb.addEventListener("click", closePlayer); row.appendChild(bb);
      res.appendChild(row); w.appendChild(res);
    });
  }

  // ---------------- activity renderers
  function pic(body, d) { if (d.image_url && /^https?:\/\//i.test(d.image_url)) { var i = h("img", "pic"); i.src = d.image_url; i.alt = ""; body.appendChild(i); } }
  function spk(body, d) { var c = h("div", "center"); var b = h("button", "spk", "🔊"); b.type = "button"; b.addEventListener("click", function () { speak(d.speak || d.word || d.prompt, d.audio_url); }); c.appendChild(b); body.appendChild(c); return b; }
  function options(body, d, ui, mark) {
    var sel = -1, btns = [];
    d.options.forEach(function (o, i) {
      var b = h("button", "opt", o); b.type = "button"; b.setAttribute("dir", "auto");
      b.addEventListener("click", function () { if (P.state !== "check") return; sel = i; btns.forEach(function (x, k) { x.classList.toggle("sel", k === i); }); ui.ready(true); });
      btns.push(b); body.appendChild(b);
    });
    return { check: function () { var ok = sel === d.answer; btns.forEach(function (b, i) { b.disabled = true; b.classList.remove("sel"); if (i === d.answer) b.classList.add("ok"); else if (i === sel) b.classList.add("bad"); }); return ok; }, answerText: function () { return d.options[d.answer]; } };
  }
  var R = {
    flashcard: function (d, body) {
      pic(body, d); body.appendChild(h("div", "bigar", d.word)).setAttribute("dir", "rtl"); spk(body, d);
      var m = d["meaning_" + lang()] || d.meaning_en || d.meaning_ar; if (m) body.appendChild(h("p", "sub", t("meaning") + ": " + m));
      if (d.example) { var ex = h("p", "sub", d.example); ex.setAttribute("dir", "auto"); body.appendChild(ex); }
      return { gradable: false };
    },
    choice: function (d, body, ui) { pic(body, d); body.appendChild(h("h2", "", d.prompt)).setAttribute("dir", "auto"); if (d.speak || d.audio_url) spk(body, d); return options(body, d, ui); },
    listen: function (d, body, ui) { body.appendChild(h("h2", "", d.prompt || "")).setAttribute("dir", "auto"); spk(body, d); return options(body, d, ui); },
    fill: function (d, body, ui) { body.appendChild(h("h2", "", d.prompt.replace("___", "______"))).setAttribute("dir", "auto"); return options(body, d, ui); },
    true_false: function (d, body, ui) {
      pic(body, d); body.appendChild(h("h2", "", d.prompt)).setAttribute("dir", "auto");
      var sel = null, bt = h("button", "opt", t("t")), bf = h("button", "opt", t("f")); bt.type = bf.type = "button";
      function s(v, b) { if (P.state !== "check") return; sel = v; bt.classList.toggle("sel", v === true); bf.classList.toggle("sel", v === false); ui.ready(true); }
      bt.addEventListener("click", function () { s(true); }); bf.addEventListener("click", function () { s(false); });
      body.appendChild(bt); body.appendChild(bf);
      return { check: function () { var ok = sel === d.answer; bt.disabled = bf.disabled = true; bt.classList.remove("sel"); bf.classList.remove("sel"); (d.answer ? bt : bf).classList.add("ok"); if (!ok) (sel ? bt : bf).classList.add("bad"); return ok; }, answerText: function () { return d.answer ? t("t") : t("f"); } };
    },
    match: function (d, body, ui) {
      body.appendChild(h("h2", "", lang() === "ar" ? "وصّل كل عنصر بما يناسبه" : "Match each pair"));
      var grid = h("div", "mgrid"), L = h("div"), Rr = h("div"), left = null, mistakes = 0, remain = d.pairs.length;
      var lb = d.pairs.map(function (p, i) { var b = h("button", "opt", p.l); b.type = "button"; b.setAttribute("dir", "auto"); b.dataset.i = i; return b; });
      var rb = shuffle(d.pairs.map(function (p, i) { var b = h("button", "opt", p.r); b.type = "button"; b.setAttribute("dir", "auto"); b.dataset.i = i; return b; }));
      lb.forEach(function (b) { b.addEventListener("click", function () { if (b.classList.contains("done")) return; lb.forEach(function (x) { x.classList.remove("sel"); }); b.classList.add("sel"); left = b; }); L.appendChild(b); });
      rb.forEach(function (b) {
        b.addEventListener("click", function () {
          if (!left || b.classList.contains("done")) return;
          if (left.dataset.i === b.dataset.i) { left.classList.remove("sel"); left.classList.add("done"); b.classList.add("done"); left = null; remain--; if (remain === 0) setTimeout(function () { ui.done(mistakes === 0); }, 250); }
          else { mistakes++; b.classList.add("bad"); var l = left; setTimeout(function () { b.classList.remove("bad"); l.classList.remove("sel"); }, 500); left = null; }
        }); Rr.appendChild(b);
      });
      grid.appendChild(L); grid.appendChild(Rr); body.appendChild(grid);
      return { auto: true, answerText: null };
    },
    order: function (d, body, ui) {
      body.appendChild(h("h2", "", lang() === "ar" ? "رتّب الكلمات لتكوين جملة صحيحة" : "Put the words in order"));
      var hint = d["meaning_" + lang()] || d.meaning_en || d.meaning_ar; if (hint) body.appendChild(h("p", "sub", hint));
      var zone = h("div", "zone"); zone.setAttribute("dir", "rtl"); var bank = h("div"); bank.setAttribute("dir", "rtl"); var chosen = [];
      var tiles = shuffle(d.words.map(function (w, i) { return { w: w, i: i }; }));
      function draw() { zone.textContent = ""; bank.textContent = ""; chosen.forEach(function (x) { var b = h("button", "tile", x.w); b.type = "button"; b.addEventListener("click", function () { if (P.state !== "check") return; chosen = chosen.filter(function (y) { return y !== x; }); draw(); }); zone.appendChild(b); });
        tiles.forEach(function (x) { if (chosen.indexOf(x) > -1) return; var b = h("button", "tile", x.w); b.type = "button"; b.addEventListener("click", function () { if (P.state !== "check") return; chosen.push(x); draw(); }); bank.appendChild(b); }); ui.ready(chosen.length === d.words.length); }
      body.appendChild(zone); body.appendChild(bank); draw();
      return { check: function () { return chosen.map(function (x) { return x.w; }).join(" ") === d.words.join(" "); }, answerText: function () { return d.words.join(" "); } };
    },
    translate: function (d, body, ui) {
      pic(body, d); body.appendChild(h("h2", "", d.prompt)).setAttribute("dir", "auto");
      var i = h("input"); i.type = "text"; i.placeholder = t("typeHere"); i.setAttribute("dir", "auto"); i.autocomplete = "off"; body.appendChild(i);
      i.addEventListener("input", function () { ui.ready(i.value.trim().length > 0); });
      i.addEventListener("keydown", function (e) { if (e.key === "Enter" && P.F.btn && !P.F.btn.disabled) P.F.btn.click(); });
      setTimeout(function () { i.focus(); }, 50);
      return { check: function () { var ok = [d.answer].concat(d.accept || []).map(norm).indexOf(norm(i.value)) > -1; i.disabled = true; return ok; }, answerText: function () { return d.answer; } };
    }
  };

  function init() {
    sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session; if (!s) { window.location.href = "login.html"; return; }
      S.uid = s.user.id;
      return sb.from("profiles").select("role,password_set").eq("id", S.uid).single().then(function (p) {
        if (p.error || !p.data || (p.data.role !== "student" && p.data.role !== "parent")) { window.location.href = "account.html"; return; }
        if (p.data.password_set === false) { window.location.href = "set-password.html"; return; }
        loadAll();
      });
    }).catch(function () { say("err", t("generic")); });
  }
  document.addEventListener("af-lang", function () { if (!S.adv) { if (S.tracks.length) onboarding(); return; } chips(); renderPath(); renderSide(); });
  init();
})();
