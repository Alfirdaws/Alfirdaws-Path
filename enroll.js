(function () {
  var sb = window.AF_sb;
  var msg = document.getElementById("msg");
  var M = {
    ar: {
      lib: "تعذر تحميل الخدمة. اتأكد من الإنترنت وجرّب تاني.",
      nameStudent: "اسم الطالب", nameParent: "اسم الطالب أو الطالبة (ابنك أو بنتك)",
      needName: "اكتب اسم الطالب.", sent: "تم إرسال طلبك. هنراجعه ونتواصل معاك.",
      dup: "الطلب ده موجود بالفعل لنفس الاسم ونفس البرنامج.", generic: "حصلت مشكلة. جرّب تاني بعد شوية.",
      empty: "لسه ما بعتش أي طلب.", cancel: "إلغاء الطلب", cancelled: "تم إلغاء الطلب.",
      teacher: "المعلم", noProgram: "مفيش برامج متاحة دلوقتي.",
      pending: "قيد المراجعة", approved: "تم القبول", rejected: "لم يتم القبول", cancelledS: "ملغي"
    },
    en: {
      lib: "Could not load the service. Check your internet and try again.",
      nameStudent: "Student name", nameParent: "Student name (your son or daughter)",
      needName: "Please enter the student's name.", sent: "Your request was sent. We will review it and contact you.",
      dup: "This request already exists for the same name and program.", generic: "Something went wrong. Please try again shortly.",
      empty: "You have not sent any requests yet.", cancel: "Cancel request", cancelled: "Request cancelled.",
      teacher: "Teacher", noProgram: "No programs are available right now.",
      pending: "Under review", approved: "Approved", rejected: "Not accepted", cancelledS: "Cancelled"
    }
  };
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function t(k) { return M[lang()][k]; }
  function say(kind, key, extra) {
    msg.className = "msg " + kind;
    msg.dataset.key = extra ? "" : key;
    msg.textContent = t(key) + (extra ? " [" + extra + "]" : "");
  }
  if (!sb) { say("err", "lib"); return; }

  var uid = null, role = null, fullName = "", programs = [], reqs = [];
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function renderForm() {
    var sel = document.getElementById("program"), keep = sel.value;
    sel.textContent = "";
    programs.forEach(function (p) {
      var o = h("option", "", p["title_" + lang()]); o.value = p.id; sel.appendChild(o);
    });
    if (keep) sel.value = keep;
    document.getElementById("studentLabel").textContent = role === "parent" ? t("nameParent") : t("nameStudent");
  }
  function renderList() {
    var box = document.getElementById("myList");
    box.textContent = "";
    if (!reqs.length) { box.appendChild(h("p", "meta", t("empty"))); return; }
    var l = lang();
    reqs.forEach(function (r) {
      var row = h("div", "row");
      var info = h("div", "info");
      var title = r.programs ? r.programs["title_" + l] : "—";
      info.appendChild(h("strong", "", title + " — " + r.student_name));
      var statusKey = r.status === "cancelled" ? "cancelledS" : r.status;
      var sub = t(statusKey) + "  |  " + new Date(r.created_at).toLocaleDateString(l === "ar" ? "ar-EG" : "en-GB");
      if (r.teachers && r.teachers.display_name) sub += "  |  " + t("teacher") + ": " + r.teachers.display_name;
      info.appendChild(h("small", "", sub));
      row.appendChild(info);
      if (r.status === "pending") {
        var b = h("button", "btn ghost small", t("cancel"));
        b.type = "button";
        b.addEventListener("click", function () {
          sb.from("enrollments").update({ status: "cancelled" }).eq("id", r.id).then(function (x) {
            if (x.error) return say("err", "generic", x.error.message);
            say("ok", "cancelled");
            loadReqs();
          });
        });
        row.appendChild(b);
      }
      box.appendChild(row);
    });
  }
  function loadReqs() {
    return sb.from("enrollments").select("id,student_name,status,created_at,programs(title_ar,title_en),teachers(display_name)")
      .order("created_at", { ascending: false }).then(function (r) {
        if (r.error) return say("err", "generic", r.error.message);
        reqs = r.data || [];
        renderList();
      });
  }
  document.addEventListener("af-lang", function () {
    renderForm(); renderList();
    if (msg.dataset.key) msg.textContent = t(msg.dataset.key);
  });

  document.getElementById("form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = document.getElementById("student_name").value.trim();
    var pid = document.getElementById("program").value;
    if (!pid) return say("err", "noProgram");
    if (!name) return say("err", "needName");
    var b = document.getElementById("submit");
    b.disabled = true;
    sb.from("enrollments").insert({ account_id: uid, program_id: pid, student_name: name, notes: document.getElementById("notes").value.trim() })
      .then(function (r) {
        b.disabled = false;
        if (r.error) return say("err", r.error.code === "23505" ? "dup" : "generic", r.error.code === "23505" ? "" : r.error.message);
        document.getElementById("notes").value = "";
        say("ok", "sent");
        loadReqs();
      });
  });

  sb.auth.getSession().then(function (r) {
    var s = r.data && r.data.session;
    if (!s) { window.location.href = "login.html"; return; }
    uid = s.user.id;
    return sb.from("profiles").select("role,full_name").eq("id", uid).single().then(function (p) {
      if (p.error || !p.data || (p.data.role !== "student" && p.data.role !== "parent")) { window.location.href = "account.html"; return; }
      role = p.data.role; fullName = p.data.full_name || "";
      if (role === "student") document.getElementById("student_name").value = fullName;
      return sb.from("programs").select("id,title_ar,title_en,sort_order").order("sort_order").then(function (pr) {
        programs = pr.data || [];
        renderForm();
        if (!programs.length) say("err", "noProgram");
        return loadReqs();
      });
    });
  }).catch(function () { say("err", "generic"); });
})();
