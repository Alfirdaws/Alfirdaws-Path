(function () {
  var NS = "http://www.w3.org/2000/svg";
  var DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  var ATT = { attended: "حضر", absent: "غاب", excused: "اعتذر" };
  var S = { teacher: null, students: [], lessons: [], slots: [] };
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
  function hhmm(x) { return String(x).slice(0, 5); }
  function dayKey(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function imgUrl(path) {
    if (path.indexOf("assets/") === 0) return path;
    return window.AF_sb.storage.from("program-images").getPublicUrl(path).data.publicUrl;
  }
  function pbar(pct) { var b = h("div", "pbar"); var f = h("span"); f.style.width = pct + "%"; b.appendChild(f); return b; }

  // ---- layout wiring
  el("sideBtn").addEventListener("click", function () { document.body.classList.toggle("side-open"); });
  el("scrim").addEventListener("click", function () { document.body.classList.remove("side-open"); });
  document.querySelectorAll("#nav a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function () {
      document.body.classList.remove("side-open");
      document.querySelectorAll("#nav a").forEach(function (x) { x.classList.toggle("on", x === a); });
    });
  });
  el("logout").addEventListener("click", function () {
    if (window.AF_sb) window.AF_sb.auth.signOut().then(function () { window.location.href = "login.html"; });
  });
  el("tq").addEventListener("input", function () {
    var q = el("tq").value.trim().toLowerCase();
    document.querySelectorAll("#students > .row").forEach(function (r) { r.hidden = !!q && r.textContent.toLowerCase().indexOf(q) === -1; });
    document.querySelectorAll("#tStudents .sr").forEach(function (r) { r.hidden = !!q && r.textContent.toLowerCase().indexOf(q) === -1; });
    if (q) el("studentsSec").scrollIntoView({ behavior: "smooth" });
  });

  // ---- widgets
  function cards() {
    var box = el("tCards"); box.textContent = "";
    var weekAgo = Date.now() - 7 * 86400000;
    var week = S.lessons.filter(function (l) { return new Date(l.held_on + "T00:00:00").getTime() >= weekAgo; }).length;
    var avg = S.students.length ? Math.round(S.students.reduce(function (a, x) { return a + x.progress_percent; }, 0) / S.students.length) : 0;
    var pub = S.teacher && S.teacher.is_published;
    [["users", "طلابي", S.students.length, "عدد الطلاب المسندين ليكي", ""], ["cal", "حصص هذا الأسبوع", week, "آخر 7 أيام", "blue"], ["file", "إجمالي الحصص", S.lessons.length, "حصص سجّلتيها", "amber"],
     ["award", "متوسط تقدّم الطلاب", avg + "%", "على كل طلابك", ""], ["cap", "ظهورك في الموقع", pub ? "ظاهر" : "غير ظاهر", pub ? "الطلاب بيشوفوا ملفك" : "الإدارة هتنشر ملفك بعد المراجعة", "amber"]].forEach(function (c) {
      var d = h("div", "sc " + c[4]); var ic = h("span", "ico-c"); ic.appendChild(icon(c[0])); d.appendChild(ic);
      var x = h("div"); x.appendChild(h("small", "", c[1])); x.appendChild(h("b", "", String(c[2]))); x.appendChild(h("span", "sub", c[3])); d.appendChild(x); box.appendChild(d);
    });
  }

  function today() {
    var box = el("tToday"); box.textContent = "";
    var wd = new Date().getDay();
    function row(sl, label) {
      var r = h("div", "lrow"); var li = h("span", "li"); li.appendChild(icon("cal")); r.appendChild(li);
      var lt = h("div", "lt"); lt.appendChild(h("b", "", hhmm(sl.start_time) + " – " + hhmm(sl.end_time))); lt.appendChild(h("small", "", label)); r.appendChild(lt); return r;
    }
    var td = S.slots.filter(function (x) { return x.weekday === wd; }).sort(function (a, b) { return String(a.start_time).localeCompare(String(b.start_time)); });
    box.appendChild(h("small", "", "النهاردة (" + DAYS[wd] + ")"));
    if (!td.length) box.appendChild(h("p", "meta", "مفيش مواعيد متاحة النهاردة."));
    td.forEach(function (sl) { box.appendChild(row(sl, "موعد متاح")); });
    var up = [];
    for (var i = 1; i <= 6 && up.length < 3; i++) {
      var d = (wd + i) % 7;
      S.slots.filter(function (x) { return x.weekday === d; }).sort(function (a, b) { return String(a.start_time).localeCompare(String(b.start_time)); }).forEach(function (sl) { if (up.length < 3) up.push({ sl: sl, d: d }); });
    }
    if (up.length) { var hd = h("small", "", "المواعيد القادمة"); hd.style.display = "block"; hd.style.marginTop = "12px"; box.appendChild(hd); }
    up.forEach(function (u) { box.appendChild(row(u.sl, DAYS[u.d])); });
    if (!S.slots.length) { var a = h("a", "btn small", "إضافة موعد"); a.href = "#schedule"; box.appendChild(a); }
  }

  function students() {
    var box = el("tStudents"); box.textContent = "";
    if (!S.students.length) { box.appendChild(h("p", "meta", "لسه ما فيش طلاب مسندين ليكي.")); return; }
    S.students.forEach(function (st) {
      var b = h("button", "sr"); b.type = "button";
      if (st.programs && st.programs.image_path) { var im = h("img", "th"); im.src = imgUrl(st.programs.image_path); im.alt = ""; im.loading = "lazy"; b.appendChild(im); } else b.appendChild(h("span", "th"));
      var sx = h("div", "sx"); sx.appendChild(h("b", "", st.student_name)); sx.appendChild(h("small", "", st.programs ? st.programs.title_ar : "")); b.appendChild(sx);
      var pc = h("div", "pc"); pc.appendChild(pbar(st.progress_percent)); pc.appendChild(h("span", "", st.progress_percent + "%")); b.appendChild(pc);
      b.addEventListener("click", function () { document.dispatchEvent(new CustomEvent("af-open-student", { detail: st.id })); });
      box.appendChild(b);
    });
  }

  function attention() {
    var box = el("tAttn"); box.textContent = "";
    var items = [];
    S.students.forEach(function (st) {
      var ls = S.lessons.filter(function (l) { return l.enrollment_id === st.id; }).sort(function (a, b) { return a.held_on < b.held_on ? 1 : -1; });
      if (!ls.length) { items.push([st.student_name, "لسه ما اتسجّلتش له حصة."]); return; }
      var days = Math.floor((Date.now() - new Date(ls[0].held_on + "T00:00:00").getTime()) / 86400000);
      if (days > 14) items.push([st.student_name, "آخر حصة من " + days + " يوم."]);
      var abs = ls.slice(0, 5).filter(function (l) { return l.attendance === "absent"; }).length;
      if (abs >= 2) items.push([st.student_name, "غياب متكرر (" + abs + " من آخر 5 حصص)."]);
    });
    if (!items.length) { box.appendChild(h("p", "meta", S.students.length ? "كل طلابك ماشيين تمام ✓" : "—")); return; }
    items.slice(0, 6).forEach(function (it) {
      var a = h("div", "a"); a.appendChild(h("i")); var d = h("div"); d.appendChild(h("b", "", it[0])); d.appendChild(h("small", "", it[1])); a.appendChild(d); box.appendChild(a);
    });
  }

  function chart() {
    var box = el("tChart"); box.textContent = "";
    var days = [], d0 = new Date(); d0.setHours(0, 0, 0, 0);
    for (var i = 6; i >= 0; i--) { var x = new Date(d0); x.setDate(d0.getDate() - i); days.push(x); }
    var keys = days.map(dayKey), labels = days.map(function (d) { return d.getDate() + "/" + (d.getMonth() + 1); });
    var vals = keys.map(function (k) { return S.lessons.filter(function (l) { return l.held_on === k; }).length; });
    var max = Math.max(4, Math.max.apply(null, vals));
    var W = 420, H = 210, L = 28, T = 12, B = 28;
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "حصصي آخر 7 أيام" }, box);
    for (var g = 0; g <= 4; g++) {
      var y = T + (H - T - B) * (1 - g / 4);
      s("line", { x1: L, x2: W - 8, y1: y, y2: y, stroke: "#EFECE3" }, svg);
      var tx = s("text", { x: L - 6, y: y + 4, "text-anchor": "end", "font-size": "11", fill: "#8A968F" }, svg); tx.textContent = String(Math.round(max * g / 4));
    }
    var bw = (W - L - 8) / 7;
    vals.forEach(function (v, j) {
      var bh = (H - T - B) * v / max;
      var r = s("rect", { x: L + j * bw + bw * 0.22, y: H - B - bh, width: bw * 0.56, height: Math.max(bh, 0), rx: 3, fill: "#0F5A3C" }, svg);
      var tt = s("title", {}, r); tt.textContent = labels[j] + ": " + v;
      var lb = s("text", { x: L + j * bw + bw / 2, y: H - 8, "text-anchor": "middle", "font-size": "11", fill: "#8A968F" }, svg); lb.textContent = labels[j];
    });
  }

  function homework() {
    var box = el("tHw"); box.textContent = "";
    var em = {}; S.students.forEach(function (x) { em[x.id] = x; });
    var hw = S.lessons.filter(function (l) { return l.homework; }).sort(function (a, b) { return a.held_on < b.held_on ? 1 : -1; }).slice(0, 5);
    if (!hw.length) { box.appendChild(h("p", "meta", "لسه ما أعطيتيش واجبات.")); return; }
    hw.forEach(function (l) {
      var r = h("div", "lrow"); var li = h("span", "li e"); li.appendChild(icon("clip")); r.appendChild(li);
      var lt = h("div", "lt"); lt.appendChild(h("b", "", l.homework));
      lt.appendChild(h("small", "", (em[l.enrollment_id] ? em[l.enrollment_id].student_name + " — " : "") + l.held_on)); r.appendChild(lt); box.appendChild(r);
    });
  }

  function render() { cards(); today(); students(); attention(); chart(); homework(); }
  window.AF_tdash = {
    set: function (part) {
      Object.keys(part).forEach(function (k) { S[k] = part[k]; });
      if (part.teacher) {
        var nm = (part.teacher.display_name || "").trim();
        el("meName").textContent = nm || "المعلمة";
        el("meAv").textContent = (nm || "م").charAt(0);
        el("hello").textContent = "أهلًا بعودتك" + (nm ? "، " + nm.split(" ")[0] : "") + " 👋";
      }
      render();
    }
  };
})();
