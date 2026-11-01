(function () {
  var sb = window.AF_sb;
  var list = document.getElementById("matList");
  if (!sb || !list) return;
  var msg = document.getElementById("msg");
  var ST = { draft: "مسودة", pending: "قيد المراجعة", published: "منشورة", rejected: "مرجّعة للمعلم" };
  var items = [];
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function say(kind, text) { msg.className = "msg " + kind; msg.textContent = text; }
  function fail(e) { say("err", "حصلت مشكلة: " + ((e && e.message) || "")); }
  function btn(text, cls, fn) { var b = h("button", "btn small " + (cls || ""), text); b.type = "button"; b.addEventListener("click", fn); return b; }

  function render() {
    list.textContent = "";
    var f = document.getElementById("matFilter").value;
    var pend = items.filter(function (m) { return m.status === "pending"; }).length;
    var nb = document.getElementById("navMatBadge");
    if (nb) { nb.textContent = String(pend); nb.hidden = !pend; }
    var shown = items.filter(function (m) { return f === "all" || m.status === f; });
    if (!shown.length) { list.appendChild(h("p", "meta", "مفيش مواد في القسم ده.")); return; }
    shown.forEach(function (m) {
      var row = h("div", "row");
      var info = h("div", "info"); info.appendChild(h("strong", "", m.title));
      var lessons = (m.material_lessons || []).slice().sort(function (a, b) { return (a.position || 0) - (b.position || 0); });
      info.appendChild(h("small", "", (m.programs ? m.programs.title_ar : "") + "  |  المعلم: " + (m.teachers ? m.teachers.display_name : "") + "  |  الحصص: " + lessons.length + "  |  " + ST[m.status]));
      if (m.status === "rejected" && m.reject_reason) info.appendChild(h("small", "", "سبب الرجوع: " + m.reject_reason));
      row.appendChild(info);
      if (m.status === "pending") {
        row.appendChild(btn("نشر", "", function () {
          if (!window.confirm("نشر المادة \"" + m.title + "\"؟ المعلم هيقدر يبعت حصصها للطلاب.")) return;
          sb.rpc("admin_review_material", { mid: m.id, decision: "published", reason: null }).then(function (r) { if (r.error) return fail(r.error); say("ok", "تم نشر المادة."); load(); });
        }));
      }
      if (m.status === "pending" || m.status === "published") {
        row.appendChild(btn(m.status === "pending" ? "رجوع للمعلم" : "سحب النشر", "ghost", function () {
          var why = window.prompt("اكتبي سبب الرجوع (هيظهر للمعلم):");
          if (!why || !why.trim()) return say("err", "لازم تكتبي سبب.");
          sb.rpc("admin_review_material", { mid: m.id, decision: "rejected", reason: why.trim() }).then(function (r) { if (r.error) return fail(r.error); say("ok", "تم إرجاع المادة للمعلم."); load(); });
        }));
      }
      var det = h("details", "full");
      det.appendChild(h("summary", "", "عرض الحصص (" + lessons.length + ")"));
      if (m.description) det.appendChild(h("p", "meta", m.description));
      lessons.forEach(function (l, i) {
        var b = h("div", "lessonbox");
        b.appendChild(h("strong", "", (i + 1) + ". " + l.title));
        if (l.content) b.appendChild(h("div", "pre", l.content));
        if (l.link_url) { var a = h("a", "btn ghost small", "فتح الرابط"); a.href = l.link_url; a.target = "_blank"; a.rel = "noopener noreferrer"; b.appendChild(a); }
        det.appendChild(b);
      });
      row.appendChild(det);
      list.appendChild(row);
    });
  }
  function load() {
    return sb.from("materials").select("id,title,description,status,reject_reason,created_at,programs(title_ar),teachers(display_name),material_lessons(id,position,title,content,link_url)").order("created_at", { ascending: false }).then(function (r) {
      if (r.error) return fail(r.error);
      items = r.data || [];
      render();
    });
  }
  document.getElementById("matFilter").addEventListener("change", render);
  sb.auth.getSession().then(function (r) {
    var s = r.data && r.data.session;
    if (!s) return;
    return sb.from("profiles").select("role").eq("id", s.user.id).single().then(function (p) {
      if (p.data && p.data.role === "admin") return load();
    });
  });
})();
