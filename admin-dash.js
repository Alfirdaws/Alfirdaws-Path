(function () {
  var NS = "http://www.w3.org/2000/svg";
  var COLORS = ["#0F5A3C", "#C8A24A", "#5B8DEF", "#E0705A", "#8E7CC3", "#2F8F83"];
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
  function icon(id) {
    var svg = s("svg", { "class": "ic" });
    var u = s("use", { href: "#a-" + id }); svg.appendChild(u);
    return svg;
  }
  function el(id) { return document.getElementById(id); }
  function dayKey(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function lastDays(n) {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = n - 1; i >= 0; i--) { var x = new Date(d); x.setDate(d.getDate() - i); out.push(x); }
    return out;
  }
  function count(items, getKey, keys) {
    var m = {}; keys.forEach(function (k) { m[k] = 0; });
    items.forEach(function (it) { var k = getKey(it); if (k in m) m[k]++; });
    return keys.map(function (k) { return m[k]; });
  }
  function ago(iso) {
    var sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 60) return "الآن";
    if (sec < 3600) return "منذ " + Math.floor(sec / 60) + " دقيقة";
    if (sec < 86400) return "منذ " + Math.floor(sec / 3600) + " ساعة";
    return "منذ " + Math.floor(sec / 86400) + " يوم";
  }
  function isLearner(u) { return u.role === "student" || u.role === "parent"; }

  function statCards(S) {
    var st = S.stats || {};
    var weekAgo = Date.now() - 7 * 86400000;
    var newLearners = S.users.filter(function (u) { return isLearner(u) && new Date(u.created_at).getTime() >= weekAgo; }).length;
    var cards = [
      { label: "الطلاب", value: st.students || 0, sub: "حسابات جديدة هذا الأسبوع: " + newLearners, icon: "users", tone: "" },
      { label: "المعلمون", value: st.teachers || 0, sub: "ظاهرون في الموقع: " + (st.published_teachers || 0), icon: "cap", tone: "amber" },
      { label: "البرامج النشطة", value: st.programs || 0, sub: "الإجمالي: " + S.programs.length, icon: "book", tone: "" },
      { label: "طلبات قيد المراجعة", value: st.pending || 0, sub: "تسجيلات مقبولة: " + (st.approved || 0), icon: "clip", tone: "blue" },
      { label: "الحصص (آخر 30 يوم)", value: st.lessons_30d || 0, sub: "الإجمالي: " + (st.lessons_total || 0), icon: "file", tone: "amber" }
    ];
    var box = el("statCards"); box.textContent = "";
    cards.forEach(function (c) {
      var d = h("div", "sc " + c.tone);
      var ic = h("span", "ico-c"); ic.appendChild(icon(c.icon)); d.appendChild(ic);
      var t = h("div");
      t.appendChild(h("small", "", c.label));
      t.appendChild(h("b", "", String(c.value)));
      t.appendChild(h("span", "sub", c.sub));
      d.appendChild(t);
      box.appendChild(d);
    });
  }

  function lineChart(S) {
    var days = lastDays(7), keys = days.map(dayKey);
    var labels = days.map(function (d) { return d.getDate() + "/" + (d.getMonth() + 1); });
    var a = count(S.users.filter(isLearner), function (u) { return dayKey(new Date(u.created_at)); }, keys);
    var b = count(S.enr, function (e) { return dayKey(new Date(e.created_at)); }, keys);
    var max = Math.max(4, Math.max.apply(null, a.concat(b)));
    var W = 560, H = 230, L = 34, R = 14, T = 12, B = 28;
    var box = el("enrChart"); box.textContent = ""; box.className = "chart";
    var lg = el("enrLegend"); lg.textContent = "";
    [["حسابات جديدة", COLORS[0]], ["طلبات تسجيل", COLORS[1]]].forEach(function (p) {
      var sp = h("span"); var i = h("i"); i.style.background = p[1]; sp.appendChild(i); sp.appendChild(document.createTextNode(p[0])); lg.appendChild(sp);
    });
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "نظرة على التسجيل" }, box);
    function X(i) { return L + i * (W - L - R) / 6; }
    function Y(v) { return T + (H - T - B) * (1 - v / max); }
    for (var g = 0; g <= 4; g++) {
      var v = Math.round(max * g / 4), y = Y(max * g / 4);
      s("line", { x1: L, x2: W - R, y1: y, y2: y, stroke: "#EFECE3" }, svg);
      var tx = s("text", { x: L - 6, y: y + 4, "text-anchor": "end", "font-size": "11", fill: "#8A968F" }, svg); tx.textContent = String(v);
    }
    labels.forEach(function (lb, i) {
      var t = s("text", { x: X(i), y: H - 8, "text-anchor": "middle", "font-size": "11", fill: "#8A968F" }, svg); t.textContent = lb;
    });
    [[a, COLORS[0]], [b, COLORS[1]]].forEach(function (p, idx) {
      var pts = p[0].map(function (v, i) { return X(i) + "," + Y(v); });
      if (idx === 0) s("polygon", { points: X(0) + "," + Y(0) + " " + pts.join(" ") + " " + X(6) + "," + Y(0), fill: p[1], opacity: ".08" }, svg);
      s("polyline", { points: pts.join(" "), fill: "none", stroke: p[1], "stroke-width": "2.5", "stroke-linejoin": "round" }, svg);
      p[0].forEach(function (v, i) {
        var c = s("circle", { cx: X(i), cy: Y(v), r: "3.5", fill: "#fff", stroke: p[1], "stroke-width": "2" }, svg);
        var tt = s("title", {}, c); tt.textContent = labels[i] + ": " + v;
      });
    });
  }

  function donut(S) {
    var box = el("donut"); box.textContent = "";
    var rows = S.programs.map(function (p) {
      var n = S.enr.filter(function (e) { return e.program_id === p.id && (e.status === "approved" || e.status === "pending"); }).length;
      return { name: p.title_ar, n: n };
    }).filter(function (r) { return r.n > 0; }).sort(function (x, y) { return y.n - x.n; });
    var total = rows.reduce(function (t, r) { return t + r.n; }, 0);
    var wrap = h("div", "donut-wrap"); wrap.style.cssText = "display:flex;gap:16px;align-items:center;flex-wrap:wrap";
    var svg = s("svg", { viewBox: "0 0 140 140", width: "150", height: "150", role: "img", "aria-label": "التسجيلات حسب البرنامج" });
    var r = 54, C = 2 * Math.PI * r;
    s("circle", { cx: 70, cy: 70, r: r, fill: "none", stroke: "#EFECE3", "stroke-width": 18 }, svg);
    var off = 0;
    rows.forEach(function (row, i) {
      var len = C * row.n / total;
      s("circle", { cx: 70, cy: 70, r: r, fill: "none", stroke: COLORS[i % COLORS.length], "stroke-width": 18, "stroke-dasharray": len + " " + (C - len), "stroke-dashoffset": -off, transform: "rotate(-90 70 70)" }, svg);
      off += len;
    });
    var t1 = s("text", { x: 70, y: 72, "text-anchor": "middle", "font-size": "22", "font-weight": "700", fill: "#0B3B2B" }, svg); t1.textContent = String(total);
    var t2 = s("text", { x: 70, y: 90, "text-anchor": "middle", "font-size": "10", fill: "#6B7B73" }, svg); t2.textContent = "تسجيل";
    wrap.appendChild(svg);
    var lg = h("div"); lg.style.cssText = "flex:1;min-width:140px;display:flex;flex-direction:column;gap:8px;font-size:.84rem";
    if (!rows.length) lg.appendChild(h("span", "empty", "مفيش تسجيلات لسه."));
    rows.forEach(function (row, i) {
      var l = h("div"); l.style.cssText = "display:flex;justify-content:space-between;gap:8px;align-items:center";
      var left = h("span"); var dot = h("i"); dot.style.cssText = "display:inline-block;width:9px;height:9px;border-radius:50%;margin-inline-end:8px;background:" + COLORS[i % COLORS.length];
      left.appendChild(dot); left.appendChild(document.createTextNode(row.name));
      l.appendChild(left); l.appendChild(h("b", "", row.n + " (" + Math.round(100 * row.n / total) + "%)"));
      lg.appendChild(l);
    });
    wrap.appendChild(lg);
    box.appendChild(wrap);
    box.appendChild(h("p", "meta", "المقبولة وقيد المراجعة."));
  }

  function activity(S) {
    var um = {}, pm = {}, em = {};
    S.users.forEach(function (u) { um[u.id] = u; });
    S.programs.forEach(function (p) { pm[p.id] = p; });
    S.enr.forEach(function (e) { em[e.id] = e; });
    var ev = [];
    S.users.forEach(function (u) {
      if (u.role === "admin") return;
      ev.push({ t: u.created_at, icon: "user", title: u.role === "teacher" ? "معلم جديد انضم" : "حساب جديد", sub: u.full_name || u.email || "" });
    });
    S.enr.forEach(function (e) {
      ev.push({ t: e.created_at, icon: "clip", title: "طلب تسجيل جديد", sub: e.student_name + " — " + (pm[e.program_id] ? pm[e.program_id].title_ar : "") });
    });
    (S.lessons || []).forEach(function (l) {
      var e = em[l.enrollment_id];
      ev.push({ t: l.created_at, icon: "file", title: "حصة اتسجّلت", sub: l.topic + (e ? " — " + e.student_name : "") });
    });
    S.invites.forEach(function (i) { ev.push({ t: i.created_at, icon: "mega", title: "دعوة جديدة", sub: i.full_name }); });
    ev.sort(function (a, b) { return a.t < b.t ? 1 : -1; });
    var box = el("activity"); box.textContent = "";
    if (!ev.length) { box.appendChild(h("p", "empty", "مفيش نشاط لسه.")); return; }
    ev.slice(0, 6).forEach(function (x) {
      var d = h("div", "act");
      var ai = h("span", "ai"); ai.appendChild(icon(x.icon)); d.appendChild(ai);
      var m = h("div"); m.appendChild(h("b", "", x.title)); m.appendChild(h("small", "", x.sub)); d.appendChild(m);
      d.appendChild(h("time", "", ago(x.t)));
      box.appendChild(d);
    });
  }

  function topCourses(S, imgUrl) {
    var box = el("topCourses"); box.textContent = "";
    var rows = S.programs.map(function (p) {
      var all = S.enr.filter(function (e) { return e.program_id === p.id; });
      var ap = all.filter(function (e) { return e.status === "approved"; }).length;
      var pe = all.filter(function (e) { return e.status === "pending"; }).length;
      return { p: p, ap: ap, pe: pe, total: all.length };
    }).sort(function (a, b) { return (b.ap + b.pe) - (a.ap + a.pe); }).slice(0, 5);
    if (!rows.length) { box.appendChild(h("p", "empty", "مفيش برامج لسه.")); return; }
    var t = h("table", "tbl");
    var hd = h("tr"); ["البرنامج", "مقبول", "قيد المراجعة", "الإجمالي"].forEach(function (c) { hd.appendChild(h("th", "", c)); });
    var th = h("thead"); th.appendChild(hd); t.appendChild(th);
    var tb = h("tbody");
    rows.forEach(function (r) {
      var tr = h("tr");
      var td = h("td"); var cn = h("div", "cn");
      if (r.p.image_path) { var im = h("img"); im.src = imgUrl(r.p.image_path); im.alt = ""; im.loading = "lazy"; cn.appendChild(im); } else cn.appendChild(h("span", "ph0"));
      cn.appendChild(h("span", "", r.p.title_ar)); td.appendChild(cn); tr.appendChild(td);
      [r.ap, r.pe, r.total].forEach(function (v) { tr.appendChild(h("td", "", String(v))); });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    box.appendChild(t);
  }

  function lessonsBars(S) {
    var days = lastDays(7), keys = days.map(dayKey);
    var labels = days.map(function (d) { return d.getDate() + "/" + (d.getMonth() + 1); });
    var vals = count(S.lessons || [], function (l) { return l.held_on; }, keys);
    var max = Math.max(4, Math.max.apply(null, vals));
    var W = 420, H = 210, L = 28, T = 12, B = 28;
    var box = el("lessonsChart"); box.textContent = ""; box.className = "chart";
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "الحصص آخر 7 أيام" }, box);
    for (var g = 0; g <= 4; g++) {
      var y = T + (H - T - B) * (1 - g / 4);
      s("line", { x1: L, x2: W - 8, y1: y, y2: y, stroke: "#EFECE3" }, svg);
      var tx = s("text", { x: L - 6, y: y + 4, "text-anchor": "end", "font-size": "11", fill: "#8A968F" }, svg); tx.textContent = String(Math.round(max * g / 4));
    }
    var bw = (W - L - 8) / 7;
    vals.forEach(function (v, i) {
      var bh = (H - T - B) * v / max, x = L + i * bw + bw * 0.22;
      var r = s("rect", { x: x, y: H - B - bh, width: bw * 0.56, height: Math.max(bh, 0), rx: 3, fill: COLORS[0] }, svg);
      var tt = s("title", {}, r); tt.textContent = labels[i] + ": " + v;
      var lb = s("text", { x: L + i * bw + bw / 2, y: H - 8, "text-anchor": "middle", "font-size": "11", fill: "#8A968F" }, svg); lb.textContent = labels[i];
    });
  }

  function system(S, go) {
    var box = el("sysOverview"); box.textContent = "";
    var st = S.stats || {};
    var temp = S.users.filter(function (u) { return u.password_set === false; }).length;
    var rows = [
      ["البرامج النشطة", (st.programs || 0) + " / " + S.programs.length, ""],
      ["المعلمون الظاهرون في الموقع", (st.published_teachers || 0) + " / " + (st.teachers || 0), ""],
      ["دعوات بانتظار التسجيل", String(S.invites.length), ""],
      ["حسابات بكلمة مرور مؤقتة", String(temp), temp ? "warn" : ""],
      ["حالة النظام", "يعمل ●", "ok"],
      ["النسخ الاحتياطي", "غير متاح في الخطة المجانية", "warn"]
    ];
    var wrap = h("div", "sys");
    rows.forEach(function (r) {
      var d = h("div", "r"); d.appendChild(h("span", "", r[0])); d.appendChild(h("span", r[2], r[1])); wrap.appendChild(d);
    });
    var b = h("button", "btn ghost small", "إعدادات الموقع"); b.type = "button";
    b.addEventListener("click", function () { go("content"); });
    wrap.appendChild(b);
    box.appendChild(wrap);
  }

  window.AF_dash = {
    render: function (S, ctx) {
      statCards(S); lineChart(S); donut(S); activity(S); topCourses(S, ctx.imgUrl); lessonsBars(S); system(S, ctx.go);
    }
  };
})();
