/* Study sets for Verdict Debate: flashcards, learn, test, match, and scenario practice.
   Progress lives in this browser only (localStorage "verdictai_study"). Nothing here is sent anywhere,
   apart from anonymous "which feature was used" counts.
   Depends on globals from app.html: t, escapeHtml, slugify, FALLACIES, GLOSSARY, Stats,
   and on learn-data.js: MOCK_OBJECTIONS, MOCK_TERMS, OBJECTION_SCENARIOS, SPOT_SCENARIOS. */
(function () {
  "use strict";

  var STORE_KEY = "verdictai_study";
  var LEARN_TAB_KEY = "verdictai_learn_tab";

  /* ------------------------------------------------------------------ helpers */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return escapeHtml(String(s == null ? "" : s)); }
  function tf(key, vars) {
    var s = t(key);
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function pick(arr, n) { return shuffle(arr).slice(0, n); }
  function shortDef(s, n) { s = String(s || ""); var first = s.split(/(?<=[.!?])\s/)[0]; if (first.length > n) first = first.slice(0, n - 1).trim() + "…"; return first; }

  /* ------------------------------------------------------------------ progress store */
  var store = { cards: {}, match: {}, days: [] };
  try { var raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); if (raw && raw.cards) store = raw; } catch (e) {}
  if (!store.match) store.match = {};
  if (!store.days) store.days = [];
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {} }
  function today() { return new Date().toISOString().slice(0, 10); }
  function noteStudyDay() { var d = today(); if (store.days.indexOf(d) === -1) { store.days.push(d); store.days = store.days.slice(-60); save(); } }
  function streak() {
    var days = store.days.slice(), n = 0, d = new Date();
    for (;;) {
      var key = d.toISOString().slice(0, 10);
      if (days.indexOf(key) !== -1) { n++; d.setDate(d.getDate() - 1); }
      else if (n === 0 && key === today()) { d.setDate(d.getDate() - 1); } // not studied yet today: count back from yesterday
      else break;
    }
    return n;
  }
  function cs(deckId, cardId) {
    var k = deckId + ":" + cardId;
    if (!store.cards[k]) store.cards[k] = { box: 0, seen: 0, ok: 0, star: false };
    return store.cards[k];
  }
  function grade(deckId, cardId, correct) {
    var c = cs(deckId, cardId);
    c.seen++; if (correct) { c.ok++; c.box = Math.min(4, c.box + 1); } else { c.box = 0; }
    noteStudyDay(); save();
  }
  function mastery(deck) {
    var n = 0;
    deck.cards.forEach(function (c) { if (cs(deck.id, c.id).box >= 3) n++; });
    return n;
  }

  /* ------------------------------------------------------------------ decks (built on demand so they follow the data) */
  function termCards(list, prefix, extra) {
    return list.map(function (x) { return Object.assign({ id: prefix + slugify(x.term) }, x); });
  }
  function decks() {
    var out = [];
    out.push({ id: "fallacies", kind: "terms", cards: FALLACIES.map(function (f) { return { id: "f-" + slugify(f.name), term: f.name, def: f.desc, extra: f.counter, example: f.example }; }) });
    out.push({ id: "vocab", kind: "terms", cards: termCards(GLOSSARY["Competitive Debate"] || [], "v-") });
    out.push({ id: "trial", kind: "terms", cards: termCards(GLOSSARY["Mock Trial"] || [], "m-") });
    out.push({ id: "objections", kind: "terms", cards: MOCK_OBJECTIONS.map(function (o) { return { id: "ob-" + slugify(o.name), term: o.name, def: o.def, example: o.ex }; }) });
    out.push({ id: "spot", kind: "scenarios", cards: SPOT_SCENARIOS });
    out.push({ id: "objtrain", kind: "scenarios", cards: OBJECTION_SCENARIOS });
    return out;
  }
  function deckById(id) { return decks().filter(function (d) { return d.id === id; })[0]; }

  /* ------------------------------------------------------------------ Learn screen tabs */
  var TABS = ["study", "library", "vocab", "trial"];
  window.learnTab = function (name) {
    if (TABS.indexOf(name) === -1) name = "study";
    TABS.forEach(function (n) {
      var p = $("learn-panel-" + n), b = $("learn-tab-" + n);
      if (p) p.hidden = n !== name;
      if (b) { b.classList.toggle("on", n === name); b.setAttribute("aria-selected", n === name ? "true" : "false"); }
    });
    try { sessionStorage.setItem(LEARN_TAB_KEY, name); } catch (e) {}
    if (name === "study") renderDeckGrid();
    if (name === "trial" && typeof window.renderTrialTab === "function") window.renderTrialTab();
  };

  /* ------------------------------------------------------------------ deck grid */
  function renderDeckGrid() {
    var wrap = $("study-wrap");
    if (!wrap) return;
    stopKeys();
    var n = streak();
    var html = '<div class="study-top"><div class="study-streak">' + esc(n ? tf("study.streak", { n: n }) : t("study.streak0")) + "</div></div>";
    html += '<div class="deck-grid">';
    decks().forEach(function (d) {
      var total = d.cards.length, m = mastery(d), pct = total ? Math.round(m / total * 100) : 0;
      var count = d.kind === "terms" ? tf("study.cards", { n: total }) : tf("study.scenarios", { n: total });
      html += '<div class="deck-card" data-deck="' + d.id + '">' +
        '<h4>' + esc(t("study.deck." + d.id)) + "</h4>" +
        '<p class="deck-blurb">' + esc(t("study.deck." + d.id + ".blurb")) + "</p>" +
        '<div class="deck-meta">' + esc(count) + " · " + esc(tf("study.mastered", { a: m, b: total })) + "</div>" +
        '<div class="deck-bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>' +
        '<div class="deck-actions">' +
        (d.kind === "terms"
          ? ["flash", "learn", "test", "match"].map(function (m2) { return '<button type="button" class="btn btn-sm" data-act="' + m2 + '" data-deck="' + d.id + '">' + esc(t("study.mode." + m2)) + "</button>"; }).join("")
          : '<button type="button" class="btn btn-sm btn-primary" data-act="practice" data-deck="' + d.id + '">' + esc(t("study.mode.practice")) + "</button>") +
        "</div></div>";
    });
    html += "</div>";
    wrap.innerHTML = html;
    wrap.querySelectorAll("button[data-act]").forEach(function (b) {
      b.addEventListener("click", function () { launch(b.getAttribute("data-deck"), b.getAttribute("data-act")); });
    });
  }

  function launch(deckId, mode) {
    var d = deckById(deckId);
    if (!d) return;
    Stats.feature("study_" + mode + (d.kind === "scenarios" ? "_" + deckId : ""));
    noteStudyDay();
    if (mode === "flash") startFlash(d);
    else if (mode === "learn") startLearn(d);
    else if (mode === "test") startTest(d);
    else if (mode === "match") startMatch(d);
    else startPractice(d);
  }

  /* ------------------------------------------------------------------ stage plumbing */
  var keyHandler = null;
  function stopKeys() { if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; } }
  function onKeys(fn) { stopKeys(); keyHandler = function (e) { if (/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "")) return; fn(e); }; document.addEventListener("keydown", keyHandler); }
  function stage(deck, title, bodyHtml) {
    var wrap = $("study-wrap");
    wrap.innerHTML = '<div class="stage-bar"><button type="button" class="btn btn-sm" id="study-back">← ' + esc(t("study.back")) + "</button>" +
      '<div class="stage-title">' + esc(t("study.deck." + deck.id)) + " · " + esc(title) + "</div></div>" +
      '<div class="stage-body" id="stage-body" aria-live="polite">' + bodyHtml + "</div>";
    $("study-back").addEventListener("click", renderDeckGrid);
    wrap.scrollIntoView({ block: "start", behavior: "smooth" });
    return $("stage-body");
  }
  function progressBar(done, total) {
    var pct = total ? Math.round(done / total * 100) : 0;
    return '<div class="deck-bar"><i style="width:' + pct + '%"></i></div>';
  }

  /* ------------------------------------------------------------------ FLASHCARDS */
  function startFlash(deck, opts) {
    opts = opts || {};
    var cards = deck.cards.slice();
    if (opts.starredOnly) cards = cards.filter(function (c) { return cs(deck.id, c.id).star; });
    if (opts.only) cards = deck.cards.filter(function (c) { return opts.only.indexOf(c.id) !== -1; });
    if (!cards.length) { toast(t("study.noStar"), "warn"); return renderDeckGrid(); }
    if (opts.shuffle !== false && !opts.keepOrder) cards = shuffle(cards);
    var S = { i: 0, flipped: false, known: [], learning: [], defFirst: !!opts.defFirst, opts: opts };

    function render() {
      var c = cards[S.i];
      if (!c) return finish();
      var front = S.defFirst ? c.def : c.term, back = S.defFirst ? c.term : c.def;
      var star = cs(deck.id, c.id).star;
      var body = stage(deck, t("study.mode.flash"),
        progressBar(S.i, cards.length) +
        '<div class="flash-count">' + esc(tf("study.card.n", { i: S.i + 1, n: cards.length })) + "</div>" +
        '<button type="button" class="flashcard' + (S.flipped ? " flipped" : "") + '" id="flashcard" aria-label="' + esc(t("study.flip")) + '">' +
          '<span class="fc-face fc-front' + (S.defFirst ? " small" : "") + '">' + esc(front) + "</span>" +
          '<span class="fc-face fc-back' + (S.defFirst ? "" : " small") + '">' + esc(back) +
            (c.extra ? '<em class="fc-extra">' + esc(t("study.counter")) + ": " + esc(c.extra) + "</em>" : "") +
            (c.example ? '<em class="fc-extra">' + esc(t("study.example")) + ": " + esc(c.example) + "</em>" : "") + "</span>" +
        "</button>" +
        '<div class="flash-actions">' +
          '<button type="button" class="btn" id="fl-again">← ' + esc(t("study.again")) + "</button>" +
          '<button type="button" class="btn" id="fl-flip">' + esc(t("study.flip")) + "</button>" +
          '<button type="button" class="btn btn-primary" id="fl-known">' + esc(t("study.known")) + " →</button>" +
        "</div>" +
        '<div class="flash-tools">' +
          '<button type="button" class="btn btn-sm" id="fl-star" aria-pressed="' + star + '">' + (star ? "★ " : "☆ ") + esc(t("study.star")) + "</button>" +
          '<button type="button" class="btn btn-sm" id="fl-dir">' + esc(t(S.defFirst ? "study.termfirst" : "study.deffirst")) + "</button>" +
        "</div>");
      $("flashcard").addEventListener("click", flip);
      $("fl-flip").addEventListener("click", flip);
      $("fl-known").addEventListener("click", known);
      $("fl-again").addEventListener("click", again);
      $("fl-star").addEventListener("click", function () { var s = cs(deck.id, c.id); s.star = !s.star; save(); render(); });
      $("fl-dir").addEventListener("click", function () { S.defFirst = !S.defFirst; S.flipped = false; render(); });
    }
    function flip() { S.flipped = !S.flipped; var el = $("flashcard"); if (el) el.classList.toggle("flipped", S.flipped); }
    function known() { var c = cards[S.i]; S.known.push(c.id); grade(deck.id, c.id, true); S.i++; S.flipped = false; render(); }
    function again() { var c = cards[S.i]; S.learning.push(c.id); grade(deck.id, c.id, false); S.i++; S.flipped = false; render(); }
    function finish() {
      stopKeys();
      stage(deck, t("study.mode.flash"),
        '<div class="study-done"><h3>' + esc(t("study.done")) + "</h3>" +
        "<p>" + esc(tf("study.score", { a: S.known.length, b: cards.length })) + "</p>" +
        '<div class="flash-actions">' +
        (S.learning.length ? '<button type="button" class="btn btn-primary" id="fl-missed">' + esc(t("study.studymissed")) + " (" + S.learning.length + ")</button>" : "") +
        '<button type="button" class="btn" id="fl-restart">' + esc(t("study.restart")) + "</button></div></div>");
      var m = $("fl-missed"); if (m) m.addEventListener("click", function () { startFlash(deck, { only: S.learning, defFirst: S.defFirst }); });
      $("fl-restart").addEventListener("click", function () { startFlash(deck, { defFirst: S.defFirst }); });
    }
    render();
    onKeys(function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); if (cards[S.i]) known(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); if (cards[S.i]) again(); }
      else if (e.key === "s" || e.key === "S") { var c = cards[S.i]; if (c) { var st = cs(deck.id, c.id); st.star = !st.star; save(); render(); } }
    });
  }

  /* ------------------------------------------------------------------ option builders */
  function optionsFor(deck, card, field, n) {
    var others = deck.cards.filter(function (c) { return c.id !== card.id; });
    var wrong = pick(others, Math.min(n - 1, others.length)).map(function (c) { return c[field]; });
    return shuffle([card[field]].concat(wrong));
  }
  function choiceHtml(options, correct) {
    return '<div class="choices">' + options.map(function (o, i) {
      return '<button type="button" class="choice" data-i="' + i + '" data-ok="' + (o === correct ? "1" : "0") + '"><b>' + (i + 1) + "</b><span>" + esc(o) + "</span></button>";
    }).join("") + "</div>";
  }

  /* ------------------------------------------------------------------ LEARN (adaptive multiple choice) */
  function startLearn(deck) {
    var cards = deck.cards.slice().sort(function (a, b) { return cs(deck.id, a.id).box - cs(deck.id, b.id).box; });
    var session = cards.slice(0, 12);
    var need = {}; session.forEach(function (c) { need[c.id] = 2; });
    var left = session.length * 2, total = left, answered = 0, correctN = 0, last = null;

    function nextCard() {
      var pool = session.filter(function (c) { return need[c.id] > 0 && c.id !== last; });
      if (!pool.length) pool = session.filter(function (c) { return need[c.id] > 0; });
      return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    }
    function ask() {
      var c = nextCard();
      if (!c) return finish();
      last = c.id;
      var defToTerm = Math.random() < 0.5;
      var prompt = defToTerm ? c.def : c.term, field = defToTerm ? "term" : "def";
      var opts = optionsFor(deck, c, field, 4);
      stage(deck, t("study.mode.learn"),
        progressBar(total - left, total) +
        '<div class="q-card"><div class="q-label">' + esc(t(defToTerm ? "study.whichterm" : "study.whichdef")) + "</div>" +
        '<div class="q-prompt' + (defToTerm ? " small" : "") + '">' + esc(prompt) + "</div>" +
        choiceHtml(opts, c[field]) + '<div class="feedback" id="fb"></div></div>');
      bindChoices(function (ok) {
        grade(deck.id, c.id, ok);
        answered++;
        if (ok) { correctN++; need[c.id]--; left--; } else { need[c.id] = Math.max(need[c.id], 2); }
        var fb = $("fb");
        fb.className = "feedback " + (ok ? "ok" : "no");
        fb.innerHTML = "<b>" + esc(t(ok ? "study.correct" : "study.incorrect")) + "</b> " + (ok ? "" : esc(t("study.answer")) + " " + esc(c[field])) +
          '<div><button type="button" class="btn btn-primary btn-sm" id="q-next">' + esc(t("study.next")) + " ↵</button></div>";
        $("q-next").addEventListener("click", ask);
        onKeys(function (e) { if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); ask(); } });
      });
    }
    function finish() {
      stopKeys();
      stage(deck, t("study.mode.learn"),
        '<div class="study-done"><h3>' + esc(t("study.round.done")) + "</h3><p>" + esc(tf("study.score", { a: correctN, b: answered })) + "</p>" +
        '<div class="flash-actions"><button type="button" class="btn btn-primary" id="ln-more">' + esc(t("study.keepgoing")) + '</button><button type="button" class="btn" id="ln-back">' + esc(t("study.back")) + "</button></div></div>");
      $("ln-more").addEventListener("click", function () { startLearn(deck); });
      $("ln-back").addEventListener("click", renderDeckGrid);
    }
    ask();
  }

  function bindChoices(onAnswer) {
    var done = false;
    var btns = Array.prototype.slice.call(document.querySelectorAll("#stage-body .choice"));
    function choose(b) {
      if (done) return; done = true;
      var ok = b.getAttribute("data-ok") === "1";
      btns.forEach(function (x) { x.disabled = true; if (x.getAttribute("data-ok") === "1") x.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      onAnswer(ok);
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { choose(b); }); });
    onKeys(function (e) { var n = parseInt(e.key, 10); if (n >= 1 && n <= btns.length) choose(btns[n - 1]); });
  }

  /* ------------------------------------------------------------------ TEST */
  function startTest(deck) {
    var count = Math.min(10, deck.cards.length);
    var picked = pick(deck.cards, count);
    var qs = picked.map(function (c, i) {
      var type = ["mc", "tf", "mc2"][i % 3];
      if (type === "tf") {
        var truth = Math.random() < 0.5;
        var other = pick(deck.cards.filter(function (x) { return x.id !== c.id; }), 1)[0] || c;
        return { type: "tf", card: c, shown: truth ? c.def : other.def, answer: truth };
      }
      var field = type === "mc" ? "def" : "term";
      return { type: type, card: c, field: field, options: optionsFor(deck, c, field, 4) };
    });
    var S = { i: 0, right: 0, missed: [] };
    function render() {
      var q = qs[S.i];
      if (!q) return results();
      var body;
      if (q.type === "tf") {
        body = '<div class="q-label">' + esc(t("study.truefalse")) + "</div><div class=\"q-prompt\">" + esc(q.card.term) + "</div>" +
          '<div class="q-prompt small">' + esc(q.shown) + "</div>" +
          '<div class="choices"><button type="button" class="choice" data-ok="' + (q.answer ? "1" : "0") + '"><b>1</b><span>' + esc(t("study.true")) + "</span></button>" +
          '<button type="button" class="choice" data-ok="' + (q.answer ? "0" : "1") + '"><b>2</b><span>' + esc(t("study.false")) + "</span></button></div>";
      } else {
        var prompt = q.type === "mc" ? q.card.term : q.card.def;
        body = '<div class="q-label">' + esc(t(q.type === "mc" ? "study.whichdef" : "study.whichterm")) + "</div>" +
          '<div class="q-prompt' + (q.type === "mc2" ? " small" : "") + '">' + esc(prompt) + "</div>" + choiceHtml(q.options, q.card[q.field]);
      }
      stage(deck, t("study.mode.test"),
        progressBar(S.i, qs.length) + '<div class="flash-count">' + esc(tf("study.q", { i: S.i + 1, n: qs.length })) + "</div>" +
        '<div class="q-card">' + body + '<div class="feedback" id="fb"></div></div>');
      bindChoices(function (ok) {
        grade(deck.id, q.card.id, ok);
        if (ok) S.right++; else S.missed.push(q.card);
        var fb = $("fb");
        fb.className = "feedback " + (ok ? "ok" : "no");
        fb.innerHTML = "<b>" + esc(t(ok ? "study.correct" : "study.incorrect")) + "</b>" +
          '<div><button type="button" class="btn btn-primary btn-sm" id="q-next">' + esc(t(S.i + 1 < qs.length ? "study.next" : "study.finish")) + " ↵</button></div>";
        $("q-next").addEventListener("click", function () { S.i++; render(); });
        onKeys(function (e) { if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); S.i++; render(); } });
      });
    }
    function results() {
      stopKeys();
      var list = S.missed.length ? '<ul class="missed">' + S.missed.map(function (c) { return "<li><b>" + esc(c.term) + "</b>: " + esc(c.def) + "</li>"; }).join("") + "</ul>" : "<p>" + esc(t("study.nomissed")) + "</p>";
      stage(deck, t("study.mode.test"),
        '<div class="study-done"><h3>' + esc(tf("study.score", { a: S.right, b: qs.length })) + "</h3>" +
        (S.missed.length ? "<h4>" + esc(t("study.missed")) + "</h4>" : "") + list +
        '<div class="flash-actions"><button type="button" class="btn btn-primary" id="ts-again">' + esc(t("study.restart")) + "</button>" +
        (S.missed.length ? '<button type="button" class="btn" id="ts-missed">' + esc(t("study.studymissed")) + "</button>" : "") + "</div></div>");
      $("ts-again").addEventListener("click", function () { startTest(deck); });
      var m = $("ts-missed"); if (m) m.addEventListener("click", function () { startFlash(deck, { only: S.missed.map(function (c) { return c.id; }) }); });
    }
    render();
  }

  /* ------------------------------------------------------------------ MATCH */
  function startMatch(deck) {
    var n = Math.min(6, deck.cards.length);
    var chosen = pick(deck.cards, n);
    var tiles = shuffle(chosen.map(function (c) { return { id: c.id, kind: "t", text: c.term }; }).concat(chosen.map(function (c) { return { id: c.id, kind: "d", text: shortDef(c.def, 70) }; })));
    var S = { sel: null, matched: 0, t0: Date.now(), timer: null, lock: false };
    stage(deck, t("study.mode.match"),
      '<p class="match-hint">' + esc(t("study.matchhint")) + '</p><div class="match-time" id="mt">0.0s</div>' +
      '<div class="match-grid">' + tiles.map(function (x, i) { return '<button type="button" class="tile" data-i="' + i + '" data-id="' + x.id + '" data-kind="' + x.kind + '">' + esc(x.text) + "</button>"; }).join("") + "</div>");
    S.timer = setInterval(function () { var el = $("mt"); if (!el) { clearInterval(S.timer); return; } el.textContent = ((Date.now() - S.t0) / 1000).toFixed(1) + "s"; }, 100);
    var els = Array.prototype.slice.call(document.querySelectorAll("#stage-body .tile"));
    els.forEach(function (b) {
      b.addEventListener("click", function () {
        if (S.lock || b.classList.contains("gone")) return;
        if (!S.sel) { S.sel = b; b.classList.add("sel"); return; }
        if (S.sel === b) { b.classList.remove("sel"); S.sel = null; return; }
        var a = S.sel; S.sel = null;
        if (a.getAttribute("data-id") === b.getAttribute("data-id") && a.getAttribute("data-kind") !== b.getAttribute("data-kind")) {
          a.classList.remove("sel"); a.classList.add("gone"); b.classList.add("gone"); S.matched++;
          if (S.matched === n) finish();
        } else {
          S.lock = true; a.classList.add("bad"); b.classList.add("bad");
          setTimeout(function () { a.classList.remove("sel", "bad"); b.classList.remove("bad"); S.lock = false; }, 450);
          S.penalty = (S.penalty || 0) + 1;
        }
      });
    });
    function finish() {
      clearInterval(S.timer);
      var secs = ((Date.now() - S.t0) / 1000) + (S.penalty || 0);
      var best = store.match[deck.id], isBest = !best || secs < best;
      if (isBest) { store.match[deck.id] = secs; save(); }
      noteStudyDay();
      stage(deck, t("study.mode.match"),
        '<div class="study-done"><h3>' + esc(tf("study.matchtime", { s: secs.toFixed(1) })) + "</h3>" +
        (S.penalty ? "<p>+" + S.penalty + "s" + "</p>" : "") +
        "<p>" + esc(isBest ? t("study.newbest") : tf("study.best", { s: best.toFixed(1) })) + "</p>" +
        '<div class="flash-actions"><button type="button" class="btn btn-primary" id="mt-again">' + esc(t("study.restart")) + "</button></div></div>");
      $("mt-again").addEventListener("click", function () { startMatch(deck); });
    }
    onKeys(function () {});
  }

  /* ------------------------------------------------------------------ SCENARIO PRACTICE (spot the fallacy / objection trainer) */
  function startPractice(deck) {
    var isObj = deck.id === "objtrain";
    var order = deck.cards.slice().sort(function (a, b) { return cs(deck.id, a.id).box - cs(deck.id, b.id).box + (Math.random() - 0.5); });
    var queue = order.slice(0, 10);
    var S = { i: 0, right: 0, missed: [] };
    var fallacyNames = FALLACIES.map(function (f) { return f.name; });
    var objNames = MOCK_OBJECTIONS.map(function (o) { return o.name; });

    function optionsFor2(card) {
      var answer = isObj ? card.answer : card.fallacy;
      if (isObj) {
        var pool = objNames.filter(function (n) { return n !== answer; });
        var opts = answer === "No objection" ? pick(pool, 5) : pick(pool, 4).concat([answer, "No objection"]);
        return shuffle(opts);
      }
      return shuffle(pick(fallacyNames.filter(function (n) { return n !== answer; }), 3).concat([answer]));
    }
    function render() {
      var c = queue[S.i];
      if (!c) return finish();
      var answer = isObj ? c.answer : c.fallacy;
      var opts = optionsFor2(c);
      if (opts.indexOf(answer) === -1) opts[0] = answer; // safety: the answer must always be offered
      var head = isObj
        ? '<div class="q-setting">' + esc(c.setting) + '</div><div class="q-prompt scene">' + esc(c.line) + "</div>"
        : '<div class="q-prompt scene">' + esc(c.text) + "</div>";
      stage(deck, t("study.mode.practice"),
        progressBar(S.i, queue.length) + '<div class="flash-count">' + esc(tf("study.q", { i: S.i + 1, n: queue.length })) + "</div>" +
        '<div class="q-card"><div class="q-label">' + esc(t(isObj ? "study.whichobjection" : "study.whichfallacy")) + "</div>" + head +
        choiceHtml(opts, answer) + '<div class="feedback" id="fb"></div></div>');
      bindChoices(function (ok) {
        grade(deck.id, c.id, ok);
        if (ok) S.right++; else S.missed.push(c);
        var extra = "";
        if (isObj) extra = '<p class="why">' + esc(c.why) + "</p>";
        else {
          var f = FALLACIES.filter(function (x) { return x.name === answer; })[0];
          extra = f ? '<p class="why"><b>' + esc(f.name) + ":</b> " + esc(f.desc) + " " + esc(f.counter || "") + "</p>" : "";
        }
        var fb = $("fb");
        fb.className = "feedback " + (ok ? "ok" : "no");
        fb.innerHTML = "<b>" + esc(t(ok ? "study.correct" : "study.incorrect")) + "</b> " + (ok ? "" : esc(t("study.answer")) + " <b>" + esc(answer) + "</b>") + extra +
          '<div><button type="button" class="btn btn-primary btn-sm" id="q-next">' + esc(t(S.i + 1 < queue.length ? "study.next" : "study.finish")) + " ↵</button>" +
          (!isObj ? ' <button type="button" class="btn btn-sm" id="q-lib">' + esc(t("study.openlibrary")) + "</button>" : "") + "</div>";
        $("q-next").addEventListener("click", function () { S.i++; render(); });
        var lib = $("q-lib"); if (lib) lib.addEventListener("click", function () { openFallacyLibrary(answer); });
        onKeys(function (e) { if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); S.i++; render(); } });
      });
    }
    function finish() {
      stopKeys();
      var list = S.missed.length ? '<ul class="missed">' + S.missed.map(function (c) { return "<li><b>" + esc(isObj ? c.answer : c.fallacy) + "</b>: " + esc(isObj ? c.line : c.text) + "</li>"; }).join("") + "</ul>" : "<p>" + esc(t("study.nomissed")) + "</p>";
      stage(deck, t("study.mode.practice"),
        '<div class="study-done"><h3>' + esc(tf("study.score", { a: S.right, b: queue.length })) + "</h3>" + (S.missed.length ? "<h4>" + esc(t("study.missed")) + "</h4>" : "") + list +
        '<div class="flash-actions"><button type="button" class="btn btn-primary" id="pr-again">' + esc(t("study.keepgoing")) + "</button></div></div>");
      $("pr-again").addEventListener("click", function () { startPractice(deck); });
    }
    render();
  }

  /* ------------------------------------------------------------------ public bits */
  window.openStudy = function (deckId, mode) { navTo("screen-learn"); learnTab("study"); if (deckId) setTimeout(function () { launch(deckId, mode || "practice"); }, 40); };
  window.renderStudy = renderDeckGrid;
  window.studyInternals = { decks: decks, cs: cs, streak: streak, store: function () { return store; } };

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof renderGlossary === "function") renderGlossary(); // pick up the added Mock Trial vocabulary
    var tab = "study";
    try { tab = sessionStorage.getItem(LEARN_TAB_KEY) || "study"; } catch (e) {}
    if (window.learnTab) learnTab(tab);
  });
})();
