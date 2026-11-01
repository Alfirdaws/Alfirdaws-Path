// Shared rules for Adventure activities (used by the admin builder and the student player)
(function () {
  var TYPES = {
    flashcard: "بطاقة تعلّم", choice: "اختيار من متعدد", listen: "استمع واختر", true_false: "صح أو غلط",
    match: "وصّل", order: "رتّب الكلمات", fill: "أكمل الفراغ", translate: "ترجمة / كتابة"
  };
  function str(v, max) { return typeof v === "string" && v.trim().length > 0 && v.length <= (max || 500); }
  function opts(d) { return Array.isArray(d.options) && d.options.length >= 2 && d.options.length <= 6 && d.options.every(function (o) { return str(o, 200); }); }
  function idx(d) { return Number.isInteger(d.answer) && d.options && d.answer >= 0 && d.answer < d.options.length; }
  function validate(type, d) {
    if (!TYPES[type]) return "نوع نشاط غير معروف: " + type;
    if (!d || typeof d !== "object") return "بيانات النشاط ناقصة.";
    switch (type) {
      case "flashcard": return str(d.word, 200) ? null : "اكتبي الكلمة.";
      case "choice": return !str(d.prompt) ? "اكتبي السؤال." : !opts(d) ? "اكتبي من 2 إلى 6 اختيارات." : !idx(d) ? "رقم الإجابة الصحيحة غير صحيح." : null;
      case "listen": return !(str(d.speak, 200) || str(d.audio_url, 500)) ? "اكتبي النص اللي هيتقرأ أو ارفعي صوت." : !opts(d) ? "اكتبي من 2 إلى 6 اختيارات." : !idx(d) ? "رقم الإجابة الصحيحة غير صحيح." : null;
      case "true_false": return !str(d.prompt) ? "اكتبي العبارة." : typeof d.answer !== "boolean" ? "حددي هل العبارة صح أم غلط." : null;
      case "match": return Array.isArray(d.pairs) && d.pairs.length >= 2 && d.pairs.length <= 6 && d.pairs.every(function (p) { return p && str(p.l, 100) && str(p.r, 100); }) ? null : "اكتبي من 2 إلى 6 أزواج.";
      case "order": return Array.isArray(d.words) && d.words.length >= 2 && d.words.length <= 10 && d.words.every(function (w) { return str(w, 60); }) ? null : "اكتبي جملة من كلمتين على الأقل.";
      case "fill": return !str(d.prompt) || String(d.prompt).indexOf("___") === -1 ? "اكتبي الجملة وحطي ___ مكان الفراغ." : !opts(d) ? "اكتبي من 2 إلى 6 اختيارات." : !idx(d) ? "رقم الإجابة الصحيحة غير صحيح." : null;
      case "translate": return !str(d.prompt) ? "اكتبي السؤال." : !str(d.answer, 200) ? "اكتبي الإجابة الصحيحة." : null;
    }
    return null;
  }
  window.AF_ADV = { TYPES: TYPES, validate: validate };
})();
