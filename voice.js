/* Online Debate voice: a direct, browser-to-browser audio link between the two debaters,
   with the microphone force-muted except on your own turn (and during crossfire),
   plus a live transcript of whoever is speaking.

   - Audio travels peer-to-peer (WebRTC). Our server only relays the small "how do we reach
     each other" messages (offer / answer) and, as a backup, the speaker's live text.
   - Google's public STUN servers help the two browsers find a route. Some strict networks
     (certain school or office firewalls) block direct connections; then the app says so and
     the live transcript keeps working through the server.
   Depends on app.html globals: state, t, toast, friendlyError, DEBATE_MODES. */
(function () {
  "use strict";

  var ICE = { iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }] };
  var CONNECT_TIMEOUT_MS = 25000;

  var V = {
    code: null, side: null, pc: null, stream: null, track: null, dc: null, epoch: null,
    lastSig: null, status: "idle", userMuted: false, hear: true, starting: false,
    startedAt: 0, connectedAt: 0, needsTap: false, denied: false,
    sendSeq: 0, lastSent: "", lastSentAt: 0, sendTimer: null,
    oppText: "", oppSide: null, dcAt: 0, oppSeq: -1, room: null
  };

  function $(id) { return document.getElementById(id); }
  function tf(key, vars) {
    var s = t(key);
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function rid() { return Math.random().toString(36).slice(2, 10); }

  function post(body) {
    if (!V.code || !state.authToken) return Promise.resolve(null);
    return fetch("/api/room-action", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + state.authToken },
      body: JSON.stringify(Object.assign({ roomCode: V.code }, body))
    }).catch(function () { return null; });
  }
  function signal(kind, payload) { return post({ action: "signal", kind: kind, payload: typeof payload === "string" ? payload : JSON.stringify(payload || {}) }); }

  /* ---------------------------------------------------------------- connection */
  function iceDone(pc, ms) {
    return new Promise(function (resolve) {
      if (pc.iceGatheringState === "complete") return resolve();
      var done = false;
      function finish() { if (!done) { done = true; resolve(); } }
      pc.addEventListener("icegatheringstatechange", function () { if (pc.iceGatheringState === "complete") finish(); });
      setTimeout(finish, ms || 3000);
    });
  }

  function closePc() {
    if (V.dc) { try { V.dc.close(); } catch (e) {} V.dc = null; }
    if (V.pc) { try { V.pc.close(); } catch (e) {} V.pc = null; }
  }

  function newPc() {
    closePc();
    var pc = new RTCPeerConnection(ICE);
    V.pc = pc;
    if (V.track) pc.addTrack(V.track, V.stream);
    pc.ontrack = function (ev) {
      var el = $("online-remote-audio");
      if (!el) return;
      el.srcObject = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream([ev.track]);
      el.muted = !V.hear;
      var p = el.play();
      if (p && p.catch) p.catch(function () { V.needsTap = true; renderPill(); });
    };
    pc.ondatachannel = function (ev) { setupDc(ev.channel); };
    pc.onconnectionstatechange = function () {
      var s = pc.connectionState;
      if (s === "connected") { V.status = "connected"; V.connectedAt = Date.now(); }
      else if (s === "failed") { V.status = "unavailable"; }
      else if (s === "disconnected") { setTimeout(function () { if (V.pc === pc && pc.connectionState === "disconnected") { V.status = "unavailable"; renderPill(); } }, 4000); }
      else if (s === "connecting" && V.status !== "connected") { V.status = "connecting"; }
      renderPill();
    };
    return pc;
  }

  function setupDc(dc) {
    V.dc = dc;
    dc.onmessage = function (ev) {
      try {
        var m = JSON.parse(ev.data);
        if (typeof m.t === "string") { V.dcAt = Date.now(); V.oppText = m.t; V.oppSide = V.side === "a" ? "b" : "a"; renderLive(); }
      } catch (e) {}
    };
    dc.onclose = function () { if (V.dc === dc) V.dc = null; };
  }

  function offer() {
    return (async function () {
      var pc = newPc();
      V.epoch = rid();
      setupDc(pc.createDataChannel("live"));
      await pc.setLocalDescription(await pc.createOffer());
      await iceDone(pc);
      if (V.pc !== pc) return;
      await signal("offer", { epoch: V.epoch, sdp: pc.localDescription.sdp });
    })();
  }

  function answerTo(p) {
    return (async function () {
      if (V.epoch === p.epoch && V.pc) return;
      var pc = newPc();
      V.epoch = p.epoch;
      await pc.setRemoteDescription({ type: "offer", sdp: p.sdp });
      await pc.setLocalDescription(await pc.createAnswer());
      await iceDone(pc);
      if (V.pc !== pc) return;
      await signal("answer", { epoch: p.epoch, sdp: pc.localDescription.sdp });
    })();
  }

  async function start() {
    if (V.started || V.starting) return;
    V.starting = true; V.status = "connecting"; V.startedAt = Date.now(); V.denied = false;
    renderPill();
    try {
      if (!navigator.mediaDevices || !window.RTCPeerConnection) throw new Error("unsupported");
      V.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
      V.track = V.stream.getAudioTracks()[0];
      V.track.enabled = false; // muted until it's your turn
    } catch (e) {
      V.starting = false; V.status = "nomic"; V.denied = true; renderPill();
      return;
    }
    V.started = true; V.starting = false;
    applyMute();
    if (V.side === "a") offer().catch(fail); else signal("hello", {});
    renderPill();
  }
  function fail() { V.status = "unavailable"; renderPill(); }

  function stop() {
    if (V.sendTimer) { clearTimeout(V.sendTimer); V.sendTimer = null; }
    if (V.code && V.started) signal("bye", {});
    closePc();
    if (V.stream) { V.stream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} }); }
    var el = $("online-remote-audio"); if (el) el.srcObject = null;
    V.stream = null; V.track = null; V.started = false; V.starting = false; V.status = "idle"; V.epoch = null; V.lastSig = null;
    V.oppText = ""; V.dcAt = 0; V.code = null; V.room = null; V.lastSent = "";
    renderPill(); renderLive();
  }

  /* ---------------------------------------------------------------- the mute rule */
  function myTurn(room) { return !!room && (room.currentSide === V.side || room.currentSide === "both"); }
  function applyMute() {
    if (!V.track) return;
    V.track.enabled = myTurn(V.room) && !V.userMuted;
  }

  /* ---------------------------------------------------------------- signals + live text from the poll */
  function onPoll(data) {
    if (!V.started && !V.starting && V.status === "idle") return;
    if (V.lastSig === null) V.lastSig = 0;
    (data.signals || []).forEach(function (s) {
      if (s.id > V.lastSig) V.lastSig = s.id;
      if (s.age > 40) return; // an old attempt, not worth acting on
      var p = {}; try { p = JSON.parse(s.payload || "{}"); } catch (e) {}
      if (!V.started) return;
      if (s.kind === "hello" && V.side === "a") { offer().catch(fail); }
      else if (s.kind === "offer" && V.side === "b") { answerTo(p).catch(fail); }
      else if (s.kind === "answer" && V.side === "a" && p.epoch === V.epoch && V.pc && V.pc.signalingState === "have-local-offer") {
        V.pc.setRemoteDescription({ type: "answer", sdp: p.sdp }).catch(fail);
      }
      else if (s.kind === "bye") { if (V.status !== "connected") V.status = "connecting"; }
    });
    // backup path: the speaker's text through the server, used when the direct link isn't open
    var live = data.live;
    if (live && live.side && live.side !== V.side && Date.now() - V.dcAt > 3000 && live.seq !== V.oppSeq) {
      V.oppSeq = live.seq; V.oppText = live.text || ""; V.oppSide = live.side; renderLive();
    }
    if (V.status === "connecting" && V.startedAt && Date.now() - V.startedAt > CONNECT_TIMEOUT_MS) { V.status = "unavailable"; renderPill(); }
  }

  function sendLive(text) {
    text = String(text || "");
    if (!V.code || text === V.lastSent) return;
    var now = Date.now();
    function flush() {
      V.sendTimer = null;
      V.lastSent = text; V.lastSentAt = Date.now(); V.sendSeq++;
      if (V.dc && V.dc.readyState === "open") { try { V.dc.send(JSON.stringify({ t: text, s: V.sendSeq })); return; } catch (e) {} }
      post({ action: "live", text: text, seq: V.sendSeq });
    }
    if (V.sendTimer) clearTimeout(V.sendTimer);
    var wait = V.dc && V.dc.readyState === "open" ? 150 : 1200;
    var since = now - V.lastSentAt;
    if (text === "" || since >= wait) flush(); else V.sendTimer = setTimeout(flush, wait - since);
  }

  /* ---------------------------------------------------------------- UI */
  function renderPill() {
    var pill = $("online-voice-pill");
    if (!pill) return;
    var room = V.room, msg, cls = "";
    if (!room || room.status !== "active") { pill.hidden = true; return; }
    pill.hidden = false;
    if (V.status === "nomic") { msg = t("voice.permission"); cls = "warn"; }
    else if (V.status === "unavailable") { msg = t("voice.unavailable"); cls = "warn"; }
    else if (V.status === "connecting" || V.status === "idle") { msg = t("voice.connecting"); }
    else if (myTurn(room)) { msg = V.userMuted ? t("voice.mutedbyyou") : t("voice.live"); cls = V.userMuted ? "" : "live"; }
    else { msg = t("voice.muted"); }
    pill.className = "voice-pill " + cls;
    $("online-voice-text").textContent = msg;
    var muteBtn = $("online-voice-mute"); if (muteBtn) { muteBtn.hidden = !(V.status === "connected" && myTurn(room)); muteBtn.textContent = t(V.userMuted ? "voice.unmute" : "voice.mute"); }
    var retry = $("online-voice-retry"); if (retry) retry.hidden = !(V.status === "unavailable" || V.status === "nomic");
    var tap = $("online-voice-tap"); if (tap) tap.hidden = !V.needsTap;
    var hear = $("online-voice-hear"); if (hear) hear.checked = V.hear;
  }

  function renderLive() {
    var box = $("online-live-subtitles"), who = $("online-live-who");
    if (!box || !V.room || V.room.status !== "active") return;
    var theirTurn = V.room.currentSide !== V.side && V.room.currentSide !== "both";
    if (who) {
      var oppName = V.side === "a" ? (V.room.guestName || "") : V.room.hostName;
      who.textContent = theirTurn ? tf("voice.oppsays", { name: oppName }) : "";
    }
    if (theirTurn) {
      box.textContent = V.oppText || tf("voice.waiting", { name: V.side === "a" ? (V.room.guestName || "") : V.room.hostName });
      box.classList.toggle("empty", !V.oppText);
    }
  }

  /* ---------------------------------------------------------------- public API */
  window.OnlineVoice = {
    sync: function (room) {
      if (!room || room.status !== "active" || !room.yourSide || !room.guestName) { if (V.code) stop(); return; }
      if (V.code && V.code !== room.roomCode) stop();
      var turnChanged = V.room && V.room.currentSide !== room.currentSide;
      V.code = room.roomCode; V.side = room.yourSide; V.room = room;
      if (turnChanged) { V.oppText = ""; V.lastSent = ""; V.oppSeq = -1; }
      if (!V.started && !V.starting && V.status !== "nomic") start();
      applyMute(); renderPill(); renderLive();
    },
    onPoll: onPoll,
    sendLive: sendLive,
    stop: stop,
    retry: function () { V.denied = false; var room = V.room; stop(); if (room) { V.room = room; V.code = room.roomCode; V.side = room.yourSide; start(); } },
    toggleMute: function () { V.userMuted = !V.userMuted; applyMute(); renderPill(); },
    setHear: function (on) { V.hear = !!on; var el = $("online-remote-audio"); if (el) el.muted = !V.hear; },
    enableSound: function () { var el = $("online-remote-audio"); if (el) el.play().then(function () { V.needsTap = false; renderPill(); }).catch(function () {}); },
    pollMs: function () { return (V.started && V.status !== "connected" && V.room && V.room.status === "active") || (V.room && V.room.status === "active" && V.room.currentSide !== V.side && !(V.dc && V.dc.readyState === "open")) ? 900 : 2000; },
    state: function () { return V; }
  };
})();
