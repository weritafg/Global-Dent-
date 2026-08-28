(function () {
  "use strict";
  var form = document.querySelector("[data-booking]");
  if (!form) return;

  var WHATSAPP_NUMBER = "525586620619";
  var CONTACT_EMAIL = "contacto@globaldent.mx";

  var panels = Array.prototype.slice.call(form.querySelectorAll(".booking-panel"));
  var indicators = Array.prototype.slice.call(form.querySelectorAll(".booking-step-ind"));
  var state = { service: "", serviceLabel: "", date: "", time: "", timeLabel: "", name: "", phone: "", email: "", notes: "" };
  var current = 0;

  function lang() {
    return document.documentElement.getAttribute("lang") || "es";
  }

  function resolveLabel(raw) {
    var dict = (window.GD_I18N && window.GD_I18N[lang()]) || {};
    return dict[raw] != null ? dict[raw] : raw;
  }

  function showPanel(index, scroll) {
    panels.forEach(function (p, i) { p.classList.toggle("is-active", i === index); });
    indicators.forEach(function (ind, i) {
      ind.classList.toggle("is-active", i === index);
      ind.classList.toggle("is-done", i < index);
    });
    current = index;
    if (scroll !== false) {
      var main = form.querySelector(".booking-main");
      if (main) main.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function selectCard(card, opts) {
    var group = card.closest("[data-option-group]");
    group.querySelectorAll("[data-option]").forEach(function (c) { c.classList.remove("is-selected"); });
    card.classList.add("is-selected");
    var key = group.getAttribute("data-option-group");
    state[key] = card.getAttribute("data-value");
    state[key + "Label"] = card.getAttribute("data-label");
    if (!opts || !opts.silent) {
      var nextBtn = group.closest(".booking-panel").querySelector("[data-next]");
      if (nextBtn) nextBtn.removeAttribute("disabled");
    }
  }

  form.querySelectorAll("[data-option]").forEach(function (card) {
    card.addEventListener("click", function () { selectCard(card); });
  });

  // Capture any options pre-selected in markup (e.g. "No preference", "Morning")
  form.querySelectorAll("[data-option].is-selected").forEach(function (card) {
    selectCard(card, { silent: true });
  });

  form.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = btn.closest(".booking-panel");
      if (panel.hasAttribute("data-validate")) {
        var required = panel.querySelectorAll("[required]");
        var ok = true;
        required.forEach(function (input) {
          var field = input.closest(".field");
          if (!input.value.trim()) {
            ok = false;
            if (field) field.classList.add("has-error");
          } else if (field) {
            field.classList.remove("has-error");
          }
        });
        if (!ok) return;
        state.name = form.querySelector("#bk-name").value.trim();
        state.phone = form.querySelector("#bk-phone").value.trim();
        state.email = form.querySelector("#bk-email").value.trim();
        state.date = form.querySelector("#bk-date").value;
        state.notes = form.querySelector("#bk-notes").value.trim();
      }
      var target = Math.min(current + 1, panels.length - 1);
      if (panels[target].querySelector("[data-summary]")) buildSummary();
      showPanel(target);
    });
  });

  form.querySelectorAll("[data-prev]").forEach(function (btn) {
    btn.addEventListener("click", function () { showPanel(Math.max(current - 1, 0)); });
  });

  function buildSummary() {
    var box = form.querySelector("[data-summary]");
    if (!box) return;
    var isEs = lang() === "es";
    var rows = [
      [isEs ? "Servicio" : "Service", resolveLabel(state.serviceLabel) || "—"],
      [isEs ? "Fecha deseada" : "Preferred date", state.date || "—"],
      [isEs ? "Horario" : "Time", resolveLabel(state.timeLabel) || "—"],
      [isEs ? "Nombre" : "Name", state.name],
      [isEs ? "Teléfono" : "Phone", state.phone],
    ];
    box.innerHTML =
      "<dl>" +
      rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + escapeHtml(r[1]) + "</dd>"; }).join("") +
      "</dl>";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function buildMessage() {
    var isEs = lang() === "es";
    var service = resolveLabel(state.serviceLabel) || "-";
    var time = resolveLabel(state.timeLabel) || "-";
    var lines = isEs
      ? [
          "Hola GlobalDent, quiero agendar una cita:",
          "• Servicio: " + service,
          "• Fecha deseada: " + (state.date || "-"),
          "• Horario: " + time,
          "• Nombre: " + state.name,
          "• Teléfono: " + state.phone,
          state.notes ? "• Notas: " + state.notes : "",
        ]
      : [
          "Hi GlobalDent, I'd like to book an appointment:",
          "• Service: " + service,
          "• Preferred date: " + (state.date || "-"),
          "• Time: " + time,
          "• Name: " + state.name,
          "• Phone: " + state.phone,
          state.notes ? "• Notes: " + state.notes : "",
        ];
    return lines.filter(Boolean).join("\n");
  }

  var confirmBtn = form.querySelector("[data-confirm]");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      var msg = buildMessage();
      var waUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
      window.open(waUrl, "_blank", "noopener");
      showPanel(panels.length - 1);
    });
  }

  var emailBtn = form.querySelector("[data-email-fallback]");
  if (emailBtn) {
    emailBtn.addEventListener("click", function () {
      var msg = buildMessage();
      var subject = lang() === "es" ? "Solicitud de cita — GlobalDent" : "Appointment request — GlobalDent";
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg);
    });
  }

  showPanel(0, false);
})();
