/*
 * COMMITTED CONFIG — safe to push to GitHub.
 * NO API keys live here. Toggles only.
 *
 * For local development, copy `config.local.example.js` to `config.local.js`
 * and add your own GROQ_API_KEY there. `config.local.js` is gitignored and
 * overrides anything set here.
 *
 * For deployment (Vercel), set GROQ_API_KEY as an environment variable in
 * the Vercel dashboard. The /api/* serverless proxies inject it server-side
 * and the browser never sees it.
 */
(function () {
  window.APP_CONFIG = {
    // PROXY_MODE: when true, the client routes API calls through /api/* on the
    // same origin instead of calling api.groq.com directly. Vercel deploys
    // auto-route /api/<file>.js to your serverless functions.
    // Leave true here — a local config.local.js can flip it off for direct mode.
    PROXY_MODE: true,

    // Model defaults (no keys — keys live in env vars / config.local.js)
    GROQ_MODEL: "openai/gpt-oss-120b",
    // Coaching and feedback (turn reviews, judge, case tools, lessons) run on a second model with its
    // own free allowance, so they can't use up the live fact-check allowance.
    GROQ_COACH_MODEL: "openai/gpt-oss-20b",
    // Most AI calls per lane per browser session (the live fact-check lane has PER_DEBATE_BUDGET below).
    LANE_BUDGETS: { feedback: 30, coach: 40 },
    GROQ_WHISPER_MODEL: "whisper-large-v3-turbo",

    // --- Auto fact-check tuning ---
    AUTO_FACTCHECK_DEFAULT: true,
    // Free-tier Groq is capped at ~8K tokens/min and ~200K tokens/day per model
    // per account, so live checking is deliberately frugal: sentences are batched
    // into ONE combined call per interval (not one call per sentence), filler
    // under MIN_WORDS is skipped, and each debate has a hard call budget below.
    AUTO_FACTCHECK_MIN_CHARS: 15,
    AUTO_FACTCHECK_MIN_WORDS: 4,
    AUTO_FACTCHECK_COOLDOWN_MS: 1000,   // legacy; superseded by INTERVAL_MS below
    AUTO_FACTCHECK_INTERVAL_MS: 6000,   // at most one live check per this long (stretches automatically when Groq is busy)
    AUTO_FACTCHECK_MAX_BATCH: 4,        // most recent N sentences per check (~35 tokens each vs ~600 fixed per call)
    AUTO_FACTCHECK_CONFIDENCE: 0.7,

    // --- Accuracy boosters ---
    // Wikipedia snippets add ~250 prompt tokens to every check; off to save budget.
    USE_WIKIPEDIA_GROUNDING: false,
    USE_CONTEXT_WINDOW: true,
    CONTEXT_SENTENCES: 2,
    REQUIRE_CITATIONS: true,
    MULTI_CLAIM_EXTRACTION: true,
    CONSENSUS_BORDERLINE_LOW: 0.6,
    CONSENSUS_BORDERLINE_HIGH: 0.85,
    USE_CONSENSUS: false,
    CONFIDENCE_WEIGHTED_SCORING: true,

    // --- Reliability ---
    // Retries on a 429 just burn more of the same quota; one is plenty.
    MAX_RETRIES: 1,
    // Hard cap on Groq calls per debate (~700 tokens each => ~70K tokens max).
    // At 6s/check that is ~10 minutes of continuous checking per debate.
    PER_DEBATE_BUDGET: 100,
    // Upload/batch scoring fires one claim-check + one fallacy-check per
    // transcript segment. Firing those back-to-back for every segment blows
    // through Groq's free-tier 8000 TPM cap on anything longer than a couple
    // minutes, silently dropping most checks. Serializing the two calls per
    // segment (see scoreLabeledSegments) and waiting this long between
    // segments keeps sustained throughput under that budget. Measured
    // against production: these two calls average ~1200 tokens requested
    // each (~2400/segment), so 8000 TPM sustains roughly one segment per
    // 18s at the ceiling — 20s leaves ~10% headroom.
    UPLOAD_SEGMENT_PACING_MS: 20000,

    // --- UX ---
    TTS_VERDICTS: true,
    TTS_VOLUME: 0.7,
    TTS_RATE: 1.05,
    AUTO_FALLACY_DETECTION: true,
    AUTO_FALLACY_MIN_CONF: 0.6,        // lowered from 0.65: tested at 17/18 recall with no false alarms
    AUTO_FALLACY_TTL_MS: 25000,        // suggestions stay on screen long enough to read and click
    SHOW_CLAIM_LOG: true,

    // --- Whisper (live mode) ---
    USE_WHISPER: false,
    WHISPER_CHUNK_MS: 3500,

    // --- Upload mode ---
    // 2-minute chunks fit Vercel Hobby's 4.5 MB body cap (~3.8 MB at 16 kHz mono).
    // Local dev with PROXY_MODE: false can crank this up to 10 for fewer API calls.
    UPLOAD_CHUNK_MINUTES: 2,
    UPLOAD_AUDIO_RATE: 16000,
  };
})();
