/* ============================================================
   🔊 GachaSound — เสียงสังเคราะห์ด้วย Web Audio (ไม่โหลดไฟล์)
   click · roll tick (ไล่พิตช์) · win ตามระดับ · redeem · whoosh · error
   ============================================================ */
(function () {
  'use strict';
  var ctx = null, master = null, muted = false;
  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
      master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // โน้ตเดียว
  function tone(freq, t0, dur, peak, type) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime + t0);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(peak, c.currentTime + t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g); g.connect(master);
    o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.02);
  }
  function chord(freqs, t0, dur, peak, type) { freqs.forEach(function (f) { tone(f, t0, dur, peak, type); }); }
  // เสียงตึ้บ/ฟู่ (noise) สำหรับ whoosh
  function noise(t0, dur, peak) {
    var c = ac(); if (!c) return;
    var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.7;
    var g = c.createGain(); g.gain.value = peak;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(c.currentTime + t0);
  }

  var S = {
    unlock: function () { ac(); },           // ปลดล็อก AudioContext (เรียกตอน user gesture แรก)
    setMuted: function (m) { muted = m; },
    click: function () { if (muted) return; tone(660, 0, 0.08, 0.25, 'triangle'); },
    soft: function () { if (muted) return; tone(523.25, 0, 0.14, 0.18, 'sine'); tone(659.25, 0.05, 0.2, 0.14); },
    whoosh: function () { if (muted) return; noise(0, 0.35, 0.25); },
    error: function () { if (muted) return; tone(220, 0, 0.18, 0.25, 'sawtooth'); tone(180, 0.12, 0.22, 0.2, 'sawtooth'); },
    // เสียงเลขวิ่ง — พิตช์ขึ้นตาม progress 0..1
    tick: function (p) { if (muted) return; tone(420 + p * 760, 0, 0.05, 0.16, 'square'); },
    redeem: function () { if (muted) return; chord([523.25, 659.25, 783.99], 0, 0.5, 0.2); tone(1046.5, 0.12, 0.4, 0.16); },
    // เสียงชนะตามระดับ: 1 ธรรมดา · 2 ดี · 3 หายาก · 4 แจ็คพอต
    win: function (tier) {
      if (muted) return;
      if (tier >= 4) {            // แจ็คพอต — แฟนแฟร์ขึ้นบันได + ค้าง
        var seq = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        seq.forEach(function (f, i) { tone(f, i * 0.1, 0.5, 0.22, 'sawtooth'); });
        chord([523.25, 783.99, 1046.5, 1318.5], 0.55, 1.1, 0.18);
        chord([659.25, 987.77], 0.7, 1.0, 0.12, 'triangle');
      } else if (tier === 3) {    // หายาก — คอร์ดสดใส
        chord([523.25, 659.25, 783.99], 0, 0.6, 0.22);
        tone(1046.5, 0.16, 0.5, 0.18);
      } else if (tier === 2) {    // ดี — สองโทนขึ้น
        tone(659.25, 0, 0.18, 0.22); tone(987.77, 0.13, 0.4, 0.2);
      } else {                    // ธรรมดา — ติ๊งเดียว
        tone(783.99, 0, 0.16, 0.2); tone(1046.5, 0.1, 0.3, 0.14);
      }
    }
  };
  window.GachaSound = S;
})();
