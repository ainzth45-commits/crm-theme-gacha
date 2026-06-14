/* ============================================================
   🎮 App — orchestrator: login · สุ่ม (วันละครั้ง ทับของเก่า) · ใช้ส่วนลด · catalog
   จำต่อรหัสพนักงานใน localStorage
   ============================================================ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var Snd = window.GachaSound, G = window.Gacha;

  /* ---------- storage (กัน private mode พัง) ---------- */
  var mem = {};
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] || null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } }

  function todayStr() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  var emp = null;
  function userKey(c) { return 'gacha_u_' + c; }
  function loadUser() {
    try { return JSON.parse(lsGet(userKey(emp))) || {}; } catch (e) { return {}; }
  }
  function saveUser(u) { lsSet(userKey(emp), JSON.stringify(u)); }

  /* ---------- view switching ---------- */
  function showLogin() {
    $('view-app').hidden = true;
    var lv = $('view-login'); lv.hidden = false; lv.classList.add('is-active');
    $('emp-code').value = ''; $('login-err').hidden = true;
    setTimeout(function () { $('emp-code').focus(); }, 60);
  }
  function showApp() {
    var lv = $('view-login'); lv.classList.remove('is-active'); lv.hidden = true;
    $('view-app').hidden = false;
    $('hdr-emp').textContent = emp;
    gotoHome();
  }
  function gotoHome() {
    $('page-catalog').classList.remove('is-active');
    $('page-home').classList.add('is-active');
    renderHome();
  }
  function gotoCatalog() {
    var u = loadUser();
    window.GachaCatalog.render(u.discount || 0);
    $('page-home').classList.remove('is-active');
    $('page-catalog').classList.add('is-active');
  }

  /* ---------- home render ---------- */
  function renderHome() {
    var u = loadUser();
    var rolledToday = u.lastRollDate === todayStr();
    var rollBtn = $('btn-roll'), note = $('roll-note');
    rollBtn.disabled = rolledToday;
    note.textContent = rolledToday ? '🌙 วันนี้สุ่มไปแล้ว — กลับมาใหม่พรุ่งนี้นะ' : 'สุ่มได้วันละ 1 ครั้ง · ลุ้นสูงสุด 80%!';

    var have = u.discount && u.discount > 0;
    $('discount-card').querySelector('.dc-empty').hidden = have;
    $('discount-card').querySelector('.dc-have').hidden = !have;
    if (have) {
      $('dc-pct').textContent = u.discount;
      $('dc-final').textContent = G.finalPrice(u.discount);
      resetUseBtn();
    }
  }

  /* ---------- ปุ่มใช้ส่วนลด (กด 2 ครั้งกันพลาด) ---------- */
  var useArmed = false;
  function resetUseBtn() {
    useArmed = false;
    var b = $('btn-use');
    b.innerHTML = '<i class="fa-solid fa-circle-check"></i> ใช้ส่วนลดนี้';
    b.classList.remove('btn-warn');
  }
  function onUse() {
    if (!useArmed) {
      useArmed = true; Snd.click();
      var bu = $('btn-use'); bu.classList.add('btn-warn');
      bu.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> แน่ใจ? กดอีกครั้งเพื่อใช้';
      setTimeout(function () { if (useArmed) resetUseBtn(); }, 3000);
      return;
    }
    var u = loadUser(); u.discount = null; saveUser(u);
    Snd.redeem();
    var card = $('discount-card');
    card.querySelector('.dc-have').hidden = true;
    var empty = card.querySelector('.dc-empty'); empty.hidden = false;
    empty.innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--c-success)"></i><p>ใช้ส่วนลดเรียบร้อย! ลุ้นใหม่ได้พรุ่งนี้นะ 🎉</p>';
    fireConfetti(40, 0.7);
    resetUseBtn();
  }

  /* ---------- การสุ่ม ---------- */
  var rolling = false;
  function doRoll() {
    if (rolling) return;
    var u = loadUser();
    if (u.lastRollDate === todayStr()) { Snd.error(); return; }
    rolling = true;
    Snd.click();
    var result = G.rollDiscount();

    var ov = $('roll-overlay'); ov.hidden = false;
    $('roll-result').hidden = true;
    $('roll-stage-kicker').textContent = 'กำลังสุ่ม...';
    var numEl = $('roll-num');

    // ตารางเวลาแบบหน่วงลง (ease-out) — ช่องสุดท้าย = ผลจริง
    var ticks = 26, schedule = [];
    for (var i = 0; i < ticks; i++) { var p = i / (ticks - 1); schedule.push(55 + Math.pow(p, 2.3) * 240); }
    var idx = 0;
    function spin() {
      var last = idx === ticks - 1;
      var val = last ? result : (Math.floor(Math.random() * 8) + 1) * 10;
      numEl.textContent = val;
      numEl.classList.add('tick'); setTimeout(function () { numEl.classList.remove('tick'); }, 70);
      Snd.tick(idx / (ticks - 1));
      idx++;
      if (last) { setTimeout(function () { landResult(result, u); }, 320); return; }
      setTimeout(spin, schedule[idx]);
    }
    spin();
  }

  function landResult(result, u) {
    u.discount = result;            // ทับของเก่า
    u.lastRollDate = todayStr();
    saveUser(u);

    var tier = G.tier(result);
    $('roll-stage-kicker').textContent = 'คุณได้รับ';
    $('rr-tier').textContent = G.tierLabel(result);
    $('rr-pct').textContent = result;
    $('rr-final').textContent = G.finalPrice(result);
    $('roll-result').hidden = false;

    Snd.win(tier);
    fireConfetti(tier >= 4 ? 220 : tier === 3 ? 140 : tier === 2 ? 80 : 45, tier >= 3 ? 1 : 0.7);
    if (tier >= 4) { var st = $('roll-overlay'); st.classList.add('shake'); setTimeout(function () { st.classList.remove('shake'); }, 520); }
  }

  function closeRoll() {
    Snd.soft();
    $('roll-overlay').hidden = true;
    rolling = false;
    renderHome();
  }

  /* ---------- login ---------- */
  function doLogin() {
    Snd.unlock(); Snd.click();
    var raw = ($('emp-code').value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!raw) {
      var e = $('login-err'); e.hidden = false; e.textContent = 'กรุณากรอกรหัสพนักงานก่อนนะคะ';
      Snd.error(); $('emp-code').focus(); return;
    }
    emp = raw;
    lsSet('gacha_current', emp);
    Snd.whoosh();
    showApp();
  }
  function changeEmp() {
    Snd.click();
    emp = null; lsDel('gacha_current');
    showLogin();
  }

  /* ---------- confetti (canvas เอง ไม่พึ่ง lib) ---------- */
  var cv = $('confetti'), cx = cv.getContext('2d'), parts = [], rafOn = false;
  var COLORS = ['#F5B301', '#FF7A59', '#FF4D8D', '#9B6FFF', '#2B5FD0', '#19C39A', '#FFFFFF'];
  function sizeCanvas() { cv.width = innerWidth; cv.height = innerHeight; }
  function fireConfetti(n, power) {
    sizeCanvas();
    var cxp = innerWidth / 2, cyp = innerHeight * 0.42;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = (2 + Math.random() * 8) * (power || 1);
      parts.push({ x: cxp, y: cyp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4,
        g: 0.18 + Math.random() * 0.12, s: 5 + Math.random() * 7, rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.4, life: 1, col: COLORS[(Math.random() * COLORS.length) | 0] });
    }
    if (!rafOn) { rafOn = true; requestAnimationFrame(loop); }
  }
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
      if (p.life <= 0 || p.y > cv.height + 30) { parts.splice(i, 1); continue; }
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = Math.max(0, p.life);
      cx.fillStyle = p.col; cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); cx.restore();
    }
    if (parts.length) requestAnimationFrame(loop); else rafOn = false;
  }
  addEventListener('resize', sizeCanvas);

  /* ---------- พื้นหลัง orbs ---------- */
  function buildBg() {
    var fx = $('bg-fx'), html = '';
    for (var i = 0; i < 14; i++) {
      var sz = 8 + Math.random() * 34, left = Math.random() * 100, dur = 14 + Math.random() * 16, delay = -Math.random() * 26;
      var gold = Math.random() > 0.5;
      var col = gold ? 'radial-gradient(circle at 35% 30%,#ffe08a,#f5b301)' : 'radial-gradient(circle at 35% 30%,#7fb0ff,#2b5fd0)';
      html += '<span class="orb" style="width:' + sz + 'px;height:' + sz + 'px;left:' + left + 'vw;bottom:-40px;' +
        'background:' + col + ';animation-duration:' + dur + 's;animation-delay:' + delay + 's"></span>';
    }
    fx.innerHTML = html;
  }

  /* ---------- wire ---------- */
  function init() {
    buildBg();
    $('btn-login').addEventListener('click', doLogin);
    $('emp-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
    $('btn-change-emp').addEventListener('click', changeEmp);
    $('btn-roll').addEventListener('click', doRoll);
    $('btn-roll-ok').addEventListener('click', closeRoll);
    $('btn-use').addEventListener('click', onUse);
    $('btn-catalog').addEventListener('click', function () { gotoCatalog(); });
    $('btn-cat-back').addEventListener('click', function () { Snd.soft(); gotoHome(); });
    // เปิดเสียงเมื่อแตะครั้งแรก (นโยบาย autoplay)
    document.addEventListener('pointerdown', function once() { Snd.unlock(); document.removeEventListener('pointerdown', once); });

    var saved = lsGet('gacha_current');
    if (saved) { emp = saved; showApp(); } else { showLogin(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
