(function () {
  var sb = window.AF_sb;
  var msg = document.getElementById("msg");
  var M = {
    ar: {
      lib: "تعذر تحميل الخدمة. اتأكد من الإنترنت وجرّب تاني.", generic: "حصلت مشكلة. جرّب تاني بعد شوية.",
      name: "الاسم", email: "البريد الإلكتروني", phone: "الموبايل", type: "نوع الحساب",
      student: "طالب", parent: "ولي أمر",
      none: "لسه ما عندكش أي برنامج مقبول. ابعت طلب تسجيل وهنتواصل معاك.",
      pending: "عندك طلبات قيد المراجعة:", teacher: "المعلم", progress: "التقدم", lessons: "آخر الحصص",
      total: "عدد الحصص", attended: "حضر", absent: "غاب", excused: "اعتذر", last: "آخر حصة",
      homework: "الواجب", notes: "ملاحظات المعلم", noLessons: "لسه مفيش حصص مسجلة.", noNote: "لسه مفيش ملاحظة عن التقدم."
    },
    en: {
      lib: "Could not load the service. Check your internet and try again.", generic: "Something went wrong. Please try again shortly.",
      name: "Name", email: "Email", phone: "Mobile", type: "Account type",
      student: "Student", parent: "Parent",
      none: "You have no approved programs yet. Send an enrollment request and we will contact you.",
      pending: "You have requests under review:", teacher: "Teacher", progress: "Progress", lessons: "Recent lessons",
      total: "Lessons", attended: "Attended", absent: "Absent", excused: "Excused", last: "Last lesson",
      homework: "Homework", notes: "Teacher notes", noLessons: "No lessons recorded yet.", noNote: "No progress note yet."
    }
  };
  function lang() { return document.documentElement.lang === "en" ? "en" : "ar"; }
  function t(k) { return M[lang()][k]; }
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function fail(extra) { msg.className = "msg err"; msg.textContent = t("generic") + (extra ? " [" + extra + "]" : ""); }
  if (!sb) { msg.className = "msg err"; msg.textContent = t("lib"); return; }

  var st = { profile: null, email: "", enr: [], pending: 0 };
  function fmt(d) { return new Date(d + "T00:00:00").toLocaleDateString(lang() === "ar" ? "ar-EG" : "en-GB"); }
  function line(box, label, value) {
    var p = h("p", "meta");
    p.appendChild(h("span", "", label + ": "));
    p.appendChild(h("strong", "", value || "—"));
    box.appendChild(p);
  }
  function render() {
    var l = lang();
    if (!st.profile) return;
    var pb = document.getElementById("profile");
    pb.textContent = "";
    line(pb, t("name"), st.profile.full_name);
    line(pb, t("email"), st.email);
    line(pb, t("phone"), st.profile.phone);
    line(pb, t("type"), t(st.profile.role));
    document.getElementById("pendingNote").textContent = st.pending ? t("pending") + " " + st.pending : "";

    var box = document.getElementById("courses");
    box.textContent = "";
    if (!st.enr.length) {
      var c0 = h("section", "auth-card wide");
      c0.appendChild(h("p", "meta", t("none")));
      box.appendChild(c0);
      return;
    }
    st.enr.forEach(function (e) {
      var card = h("section", "auth-card wide");
      var title = e.programs ? e.programs["title_" + l] : "";
      card.appendChild(h("h2", "", title + " — " + e.student_name));
      if (e.programs && e.programs.image_path) {
        var im = h("img");
        im.src = sb.storage.from("program-images").getPublicUrl(e.programs.image_path).data.publicUrl;
        im.alt = title;
        im.loading = "lazy";
        card.appendChild(im);
      }
      if (e.teachers && e.teachers.display_name) line(card, t("teacher"), e.teachers.display_name);

      var pr = h("p", "meta");
      pr.appendChild(h("span", "", t("progress") + ": "));
      pr.appendChild(h("strong", "", e.progress_percent + "%"));
      card.appendChild(pr);
      var bar = h("div", "bar"), fillBar = h("span");
      fillBar.style.width = e.progress_percent + "%";
      bar.appendChild(fillBar);
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-valuenow", e.progress_percent);
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
      card.appendChild(bar);
      card.appendChild(h("p", "meta", e.progress_note || t("noNote")));

      var ls = (e.lessons || []).slice().sort(function (a, b) { return a.held_on < b.held_on ? 1 : -1; });
      var att = ls.filter(function (x) { return x.attendance === "attended"; }).length;
      var abs = ls.filter(function (x) { return x.attendance === "absent"; }).length;
      var exc = ls.filter(function (x) { return x.attendance === "excused"; }).length;
      var sum = t("total") + ": " + ls.length + "  |  " + t("attended") + ": " + att + "  |  " + t("absent") + ": " + abs + "  |  " + t("excused") + ": " + exc;
      if (ls.length) sum += "  |  " + t("last") + ": " + fmt(ls[0].held_on);
      card.appendChild(h("p", "meta", sum));

      card.appendChild(h("h3", "", t("lessons")));
      if (!ls.length) card.appendChild(h("p", "meta", t("noLessons")));
      ls.slice(0, 10).forEach(function (x) {
        var d = h("div", "lesson");
        d.appendChild(h("strong", "", fmt(x.held_on) + " — " + x.topic + " (" + t(x.attendance) + ")"));
        if (x.notes) d.appendChild(h("small", "", t("notes") + ": " + x.notes));
        if (x.homework) d.appendChild(h("small", "", t("homework") + ": " + x.homework));
        card.appendChild(d);
      });
      box.appendChild(card);
    });
  }
  document.addEventListener("af-lang", render);

  sb.auth.getSession().then(function (r) {
    var s = r.data && r.data.session;
    if (!s) { window.location.href = "login.html"; return; }
    st.email = s.user.email;
    return sb.from("profiles").select("role,full_name,phone").eq("id", s.user.id).single().then(function (p) {
      if (p.error || !p.data || (p.data.role !== "student" && p.data.role !== "parent")) { window.location.href = "account.html"; return; }
      st.profile = p.data;
      return sb.from("enrollments")
        .select("id,student_name,status,progress_percent,progress_note,programs(title_ar,title_en,image_path),teachers(display_name),lessons(id,held_on,topic,notes,homework,attendance)")
        .in("status", ["approved", "pending"]).then(function (e) {
          if (e.error) return fail(e.error.message);
          st.enr = (e.data || []).filter(function (x) { return x.status === "approved"; });
          st.pending = (e.data || []).length - st.enr.length;
          render();
        });
    });
  }).catch(function () { fail(); });
})();
