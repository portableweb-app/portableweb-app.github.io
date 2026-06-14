/* ============================================================
   PortableWeb — hero flow animation driver
   Orchestrates the live pipeline inside #flow:
     Ask AI (typing) → AI builds (artifact swap) → Pack (.pweb) → Runs everywhere
   Synced to an 8s cycle that matches the CSS pulse + device light-up.
   ============================================================ */
(function () {
  "use strict";

  var stage = document.getElementById("flow");
  if (!stage) return;

  var promptEl  = stage.querySelector("#promptText");
  var caretEl   = stage.querySelector(".caret");
  var nodes     = Array.prototype.slice.call(stage.querySelectorAll(".flow-node"));
  var artifacts = Array.prototype.slice.call(stage.querySelectorAll(".artifact"));
  var packName  = stage.querySelector("#packName");
  var shareEl   = stage.querySelector("#flowShare");
  var caption   = stage.querySelector("#flowCaption");
  var toggle    = stage.querySelector(".flow-toggle");
  var togWord   = stage.querySelector(".tog-word");

  var EXAMPLES = [
    { prompt: "Build me an interactive 3D periodic table.", file: "periodic-table.pweb", ex: 0, to: "Friend" },
    { prompt: "Make a 3D photo album of our trip.",         file: "italy-2026.pweb",     ex: 1, to: "Friend" },
    { prompt: "Code a little arcade game I can play.",       file: "starhopper.pweb",     ex: 2, to: "Friend" },
    { prompt: "An interactive report for my boss.",          file: "q3-review.pweb",      ex: 3, to: "Boss" }
  ];

  var CAP_DEFAULT =
    '<span class="lead">A web app, treated like a document.</span> ' +
    "Saved, copied, shared, and run on any platform &mdash; fully offline. And as AI models mature, they\u2019ll generate <code>.pweb</code> directly.";
  var CAP_FUTURE =
    '<span class="tag">What\u2019s next</span>' +
    '<span class="lead">As models mature, they\u2019ll emit <code>.pweb</code> directly</span> ' +
    "&mdash; the finished, portable file, instantly usable everywhere. No packing step at all.";

  var CYCLE   = 8000;   // ms, matches CSS pulse period
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var exIndex   = 0;
  var cycleCount = 0;
  var timers    = [];
  var typeTimer = null;
  var paused    = false;

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
  }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  function setActive(stageNo) {
    nodes.forEach(function (n) {
      n.classList.toggle("is-active", n.getAttribute("data-stage") === String(stageNo));
    });
  }
  function clearActive() { nodes.forEach(function (n) { n.classList.remove("is-active"); }); }

  function showArtifact(exNo) {
    artifacts.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-ex") === String(exNo));
    });
  }

  function typePrompt(text, done) {
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    promptEl.textContent = "";
    if (caretEl) caretEl.style.opacity = "";
    var i = 0;
    (function step() {
      promptEl.textContent = text.slice(0, i);
      if (i < text.length) {
        i++;
        var ch = text.charAt(i - 1);
        var d = ch === " " ? 18 : (",.".indexOf(ch) >= 0 ? 220 : 26 + Math.random() * 34);
        typeTimer = setTimeout(step, d);
      } else if (done) { done(); }
    })();
  }

  function applyCaption() {
    var future = (cycleCount % 4 === 3); // every 4th loop, after a full set
    caption.classList.toggle("is-future", future);
    caption.innerHTML = future ? CAP_FUTURE : CAP_DEFAULT;
  }

  // One full 8s cycle, choreographed to land with the CSS pulse.
  function runCycle() {
    if (paused) return;
    var ex = EXAMPLES[exIndex];

    // t=0 — Ask: prompt types in
    setActive(1);
    showArtifact(ex.ex);
    if (packName) packName.textContent = ex.file;
    if (shareEl) shareEl.textContent = ex.to;
    applyCaption();
    typePrompt(ex.prompt);

    // t≈1.9s — AI builds
    later(function () { setActive(2); }, 1900);
    // t≈4.0s — Pack as .pweb
    later(function () { setActive(3); }, 4000);
    // t≈5.9s — Runs everywhere
    later(function () { setActive(4); }, 5900);
    // t≈7.9s — settle, then advance + loop
    later(function () {
      clearActive();
      exIndex = (exIndex + 1) % EXAMPLES.length;
      cycleCount++;
      runCycle();
    }, CYCLE);
  }

  function play() {
    paused = false;
    stage.classList.remove("is-paused");
    if (togWord) togWord.textContent = "Pause";
    runCycle();
  }
  function pause() {
    paused = true;
    stage.classList.add("is-paused");
    if (togWord) togWord.textContent = "Play";
    clearTimers();
  }

  if (toggle) {
    toggle.addEventListener("click", function () { paused ? play() : pause(); });
  }

  if (prefersReduced) {
    // No autoplay: present a complete, readable resting state.
    var ex0 = EXAMPLES[0];
    promptEl.textContent = ex0.prompt;
    if (caretEl) caretEl.style.display = "none";
    showArtifact(ex0.ex);
    if (packName) packName.textContent = ex0.file;
    if (shareEl) shareEl.textContent = ex0.to;
    nodes.forEach(function (n) { n.classList.add("is-active"); });
    caption.innerHTML = CAP_DEFAULT;
    stage.classList.add("is-paused");
    if (toggle) toggle.style.display = "none";
  } else {
    // Pause when scrolled fully out of view to save cycles.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (paused && !toggle.dataset.userPaused) play(); }
          else if (!paused) { stage.classList.add("is-paused"); paused = true; clearTimers(); }
        });
      }, { threshold: 0.12 });
      io.observe(stage);
    }
    // Track explicit user intent so auto-resume doesn't override a manual pause.
    if (toggle) {
      toggle.addEventListener("click", function () {
        toggle.dataset.userPaused = paused ? "1" : "";
      });
    }
    play();
  }
})();
