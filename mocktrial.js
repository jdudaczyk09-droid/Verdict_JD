/* Mock Trial tools for Verdict Debate: the case library, the in-round case file,
   the objection log, and coaching hints for each part of a trial.
   Depends on app.html globals (t, escapeHtml, state, DEBATE_MODES, Stats, toast, navTo)
   and on mocktrial-data.js / learn-data.js. */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }
  function esc(s) { return escapeHtml(String(s == null ? "" : s)); }
  function tf(key, vars) {
    var s = t(key);
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function labels(c) { return c.type === "civil" ? { a: "Plaintiff", b: "Defendant" } : { a: "Prosecution", b: "Defense" }; }
  function isTrial() { return typeof isTrialMode === "function" && isTrialMode(state.mode); }
  function caseModeKey(c) { return c.type === "civil" ? "mockTrialCivil" : "mockTrial"; }

  /* ------------------------------------------------------------------ the case file */
  function caseFileHtml(c) {
    var L = labels(c);
    function wit(side) {
      return c.witnesses.filter(function (w) { return w.side === side; }).map(function (w) {
        return '<div class="witness"><b>' + esc(w.name) + '</b> <span class="w-role">' + esc(w.role) + "</span><ul>" + w.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>";
      }).join("");
    }
    return '<article class="case-file">' +
      '<header><h3>' + esc(c.title) + '</h3><span class="case-pill ' + c.type + '">' + esc(t(c.type === "civil" ? "trial.civil" : "trial.criminal")) + "</span></header>" +
      '<p class="case-charge"><b>' + esc(t(c.type === "civil" ? "trial.claim" : "trial.charge")) + ":</b> " + esc(c.charge) + "</p>" +
      "<p>" + esc(c.summary) + "</p>" +
      "<h4>" + esc(t("trial.stipulations")) + "</h4><ul>" + c.stipulations.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
      "<h4>" + esc(t("trial.elements")) + "</h4><ul>" + c.elements.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>" +
      '<div class="case-cols"><div><h4>' + esc(tf("trial.witnessesfor", { side: L.a })) + "</h4>" + wit("a") + "</div>" +
      "<div><h4>" + esc(tf("trial.witnessesfor", { side: L.b })) + "</h4>" + wit("b") + "</div></div>" +
      "<h4>" + esc(t("trial.exhibits")) + "</h4><ul>" + c.exhibits.map(function (e) { return "<li><b>" + esc(e.name) + "</b>: " + esc(e.desc) + "</li>"; }).join("") + "</ul>" +
      '<details class="case-hints"><summary>' + esc(t("trial.hints")) + "</summary>" +
      "<p><b>" + esc(L.a) + ":</b> " + esc(c.hints.a) + "</p><p><b>" + esc(L.b) + ":</b> " + esc(c.hints.b) + "</p></details>" +
      '<p class="case-note">' + esc(t("trial.fiction")) + "</p></article>";
  }

  function showCase(id, where) {
    var c = mockCaseById(id), box = $(where);
    if (!c || !box) return;
    box.innerHTML = caseFileHtml(c) +
      '<div class="case-actions"><button type="button" class="btn btn-primary" data-use="' + c.id + '">' + esc(t("trial.use")) + '</button>' +
      '<button type="button" class="btn" data-print="' + c.id + '">' + esc(t("trial.print")) + "</button></div>";
    box.querySelector("[data-use]").addEventListener("click", function () { useCase(c.id, true); });
    box.querySelector("[data-print]").addEventListener("click", function () { printCase(c.id); });
    Stats.feature("case_library");
  }

  /* Pick a case: switch the format to match, fill in the topic, and (optionally) go to Setup. */
  function useCase(id, goSetup) {
    var c = mockCaseById(id);
    if (!c) return;
    state.mockCaseId = c.id;
    var cards = document.querySelectorAll("#mode-grid .mode-card, .mode-card");
    var wantKey = caseModeKey(c), wantName = DEBATE_MODES[wantKey].name;
    if (state.mode !== wantKey) {
      Array.prototype.forEach.call(cards, function (card) { if (card.querySelector("h4") && card.querySelector("h4").textContent === wantName) card.click(); });
      if (state.mode !== wantKey && typeof applyModeToUI === "function") applyModeToUI(wantKey);
    }
    var topic = $("custom-topic");
    if (topic) topic.value = c.topic;
    syncTrialSetup();
    toast(tf("trial.chosen", { title: c.title }), "success");
    if (goSetup) navTo("screen-setup");
  }

  window.useMockCase = useCase;

  function printCase(id) {
    var c = mockCaseById(id);
    if (!c) return;
    var w = window.open("", "_blank", "width=820,height=900");
    if (!w) { toast(t("trial.popup"), "warn"); return; }
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(c.title) + '</title><style>' +
      'body{font:14px/1.5 Georgia,serif;margin:28px;color:#111}h3{font-size:24px;margin:0 0 4px}h4{margin:16px 0 4px;font-size:15px;border-bottom:1px solid #999}' +
      'ul{margin:4px 0 8px 20px;padding:0}.case-cols{display:grid;grid-template-columns:1fr 1fr;gap:20px}.witness{margin-bottom:8px}.w-role{color:#555}' +
      '.case-pill{font:12px sans-serif;border:1px solid #333;padding:1px 8px;margin-left:8px}.case-note{font-size:12px;color:#555;margin-top:20px}details{display:block}details>summary{font-weight:bold}</style></head><body>' +
      caseFileHtml(c).replace("<details", "<details open") + "</body></html>");
    w.document.close();
    w.focus();
    setTimeout(function () { try { w.print(); } catch (e) {} }, 300);
  }

  /* ------------------------------------------------------------------ Learn > Mock Trial tab */
  window.renderTrialTab = function () {
    var wrap = $("trial-wrap");
    if (!wrap) return;
    var list = MOCK_CASES.map(function (c) {
      return '<button type="button" class="case-row" data-case="' + c.id + '"><span class="case-pill ' + c.type + '">' + esc(t(c.type === "civil" ? "trial.civil" : "trial.criminal")) + "</span>" +
        "<b>" + esc(c.title) + "</b><span>" + esc(c.charge) + "</span></button>";
    }).join("");
    wrap.innerHTML =
      '<p class="trial-lead">' + esc(t("trial.lead")) + "</p>" +
      '<div class="trial-quick"><button type="button" class="btn btn-primary" id="tr-obj">' + esc(t("trial.practiceobj")) + '</button>' +
      '<button type="button" class="btn" id="tr-terms">' + esc(t("trial.studyterms")) + '</button>' +
      '<button type="button" class="btn" id="tr-cards">' + esc(t("trial.studyobj")) + "</button></div>" +
      "<h4>" + esc(t("trial.cases")) + '</h4><div class="case-list">' + list + '</div><div id="case-view"></div>' +
      "<h4>" + esc(t("trial.cheatsheet")) + '</h4><div class="obj-sheet">' + MOCK_OBJECTIONS.map(function (o) {
        return '<div class="obj-item"><b>' + esc(o.name) + "</b><span>" + esc(o.def) + "</span></div>";
      }).join("") + "</div>";
    wrap.querySelectorAll("[data-case]").forEach(function (b) {
      b.addEventListener("click", function () {
        wrap.querySelectorAll(".case-row").forEach(function (x) { x.classList.toggle("on", x === b); });
        showCase(b.getAttribute("data-case"), "case-view");
        $("case-view").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    $("tr-obj").addEventListener("click", function () { openStudy("objtrain", "practice"); });
    $("tr-terms").addEventListener("click", function () { openStudy("trial", "flash"); });
    $("tr-cards").addEventListener("click", function () { openStudy("objections", "flash"); });
  };

  /* ------------------------------------------------------------------ Setup: case picker for Mock Trial formats */
  window.syncTrialSetup = function (modeKey) {
    var card = $("trial-setup-card");
    if (!card) return;
    var key = modeKey || state.mode;
    var trial = key === "mockTrial" || key === "mockTrialCivil";
    card.hidden = !trial;
    if (!trial) return;
    var civil = key === "mockTrialCivil";
    var sel = $("trial-case-select");
    var cases = MOCK_CASES.filter(function (c) { return (c.type === "civil") === civil; });
    var current = state.mockCaseId && cases.some(function (c) { return c.id === state.mockCaseId; }) ? state.mockCaseId : "";
    sel.innerHTML = '<option value="">' + esc(t("trial.picktext")) + "</option>" + cases.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === current ? " selected" : "") + ">" + esc(c.title) + "</option>";
    }).join("");
    if (!current) state.mockCaseId = null;
    renderSetupCase();
  };

  function renderSetupCase() {
    var box = $("trial-setup-case");
    if (!box) return;
    var c = mockCaseById(state.mockCaseId || "");
    box.innerHTML = c ? '<p class="case-charge"><b>' + esc(c.title) + "</b>: " + esc(c.charge) + '</p><button type="button" class="btn btn-sm" id="ts-view">' + esc(t("trial.view")) + "</button>" : "";
    var v = $("ts-view");
    if (v) v.addEventListener("click", function () { openCaseFile(c.id); });
  }

  window.trialPickCase = function (sel) {
    var id = sel.value;
    if (!id) { state.mockCaseId = null; renderSetupCase(); return; }
    useCase(id, false);
  };

  /* ------------------------------------------------------------------ in-round: case file window */
  window.openCaseFile = function (id) {
    var c = mockCaseById(id || state.mockCaseId || "");
    if (!c) { toast(t("trial.nocase"), "warn"); return; }
    var modal = $("case-modal"), body = $("case-modal-body");
    body.innerHTML = caseFileHtml(c) + '<div class="case-actions"><button type="button" class="btn" id="cm-print">' + esc(t("trial.print")) + "</button></div>";
    $("cm-print").addEventListener("click", function () { printCase(c.id); });
    modal.classList.add("visible");
  };
  window.closeCaseFile = function () { $("case-modal").classList.remove("visible"); };

  /* ------------------------------------------------------------------ in-round: objection log */
  window.renderTrialTools = function () {
    var box = $("trial-tools");
    if (!box) return;
    box.hidden = !isTrial();
    if (!isTrial()) return;
    var sel = $("obj-type");
    if (sel && !sel.options.length) sel.innerHTML = MOCK_OBJECTIONS.map(function (o) { return "<option>" + esc(o.name) + "</option>"; }).join("");
    $("trial-case-btn").hidden = !state.mockCaseId;
    updateObjectionCount();
  };

  window.logObjection = function (ruling) {
    if (!state.liveTurn) { toast(t("trial.startfirst"), "warn"); return; }
    var type = $("obj-type").value;
    var side = state.liveTurn.side;
    var by = side === "a" ? "b" : side === "b" ? "a" : null; // the other side objects
    var mode = DEBATE_MODES[state.mode] || { sideLabels: { a: "A", b: "B" } };
    var byName = by ? mode.sideLabels[by] : "";
    var label = t("trial.objection") + (byName ? " (" + byName + ")" : "") + ": " + type + " — " + t("trial.ruling." + ruling);
    state.liveTurn.events.push({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 6), type: "objection", label: label, objection: type, ruling: ruling, by: by });
    Stats.feature("trial_objection");
    toast(label, ruling === "sustained" ? "success" : "warn");
    updateObjectionCount();
  };

  function allObjections() {
    var out = [];
    (state.transcript || []).concat(state.liveTurn ? [state.liveTurn] : []).forEach(function (turn) {
      (turn.events || []).forEach(function (e) { if (e.type === "objection") out.push(e); });
    });
    return out;
  }
  function updateObjectionCount() {
    var el = $("obj-count");
    if (!el) return;
    var list = allObjections(), s = list.filter(function (e) { return e.ruling === "sustained"; }).length;
    el.textContent = list.length ? tf("trial.objcount", { n: list.length, s: s, o: list.length - s }) : "";
  }

  /* Results page: who objected, and how often the judge agreed. */
  window.renderObjectionSummary = function () {
    var el = $("objection-summary");
    if (!el) return;
    var list = allObjections();
    if (!isTrial() || !list.length) { el.innerHTML = ""; return; }
    var mode = DEBATE_MODES[state.mode];
    var rows = ["a", "b"].map(function (s) {
      var mine = list.filter(function (e) { return e.by === s; });
      var sus = mine.filter(function (e) { return e.ruling === "sustained"; }).length;
      return '<div class="ph-row"><span class="ph-n">' + esc(mode.sideLabels[s]) + '</span><span class="ph-score">' + esc(tf("trial.raised", { n: mine.length })) +
        '</span><span class="ph-stats">' + esc(tf("trial.sustainedof", { s: sus, n: mine.length })) + "</span></div>";
    }).join("");
    var byType = {};
    list.forEach(function (e) { byType[e.objection] = (byType[e.objection] || 0) + 1; });
    var chips = Object.keys(byType).sort(function (a, b) { return byType[b] - byType[a]; }).map(function (k) { return '<span class="rep-chip">' + esc(k) + " <b>" + byType[k] + "</b></span>"; }).join("");
    el.innerHTML = '<div class="verdict-card"><div class="verdict-head"><div class="verdict-badge">' + esc(t("trial.badge")) + "</div><h3>" + esc(t("trial.objsummary")) + "</h3></div>" +
      '<div class="ph-list">' + rows + '</div><div class="rep-chips" style="margin-top:8px">' + chips + "</div></div>";
  };

  /* ------------------------------------------------------------------ coaching hints used by turn reviews */
  window.trialPhaseGuidance = function (phaseName) {
    var p = String(phaseName || "").toLowerCase();
    if (/opening/.test(p)) return "This is an opening statement: it should tell the jury a clear story, preview the evidence, state the side's theory of the case, and avoid argument.";
    if (/closing|rebuttal/.test(p)) return "This is a closing: it should connect the evidence to each legal element, answer the other side's strongest point, and ask for a verdict.";
    if (/direct/.test(p)) return "This is a direct examination: questions should be open-ended and non-leading, lay foundation, and let the witness tell the story, not the lawyer.";
    if (/cross/.test(p)) return "This is a cross-examination: questions should be short, leading, one fact at a time, and control the witness; open 'why' questions are a mistake.";
    return "";
  };
  window.trialCaseContext = function () {
    var c = mockCaseById(state.mockCaseId || "");
    return c ? "Case: " + c.title + ". " + c.charge : "";
  };

  document.addEventListener("DOMContentLoaded", function () {
    var sel = $("trial-case-select");
    if (sel) sel.addEventListener("change", function () { trialPickCase(sel); });
    syncTrialSetup();
  });
})();
