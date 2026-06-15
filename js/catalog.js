/* ============================================================
   📖 Catalog — กริดธีม + ราคา · กดการ์ด → Lightbox เลื่อนดูรูป (ปัดนิ้ว scroll-snap)
   ============================================================ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var themes = [];

  function phStyle(t) {
    var ph = (t.ph && t.ph.length === 2) ? t.ph : ['#3b6fe0', '#9b6fff'];
    return '--ph-a:' + ph[0] + ';--ph-b:' + ph[1] + ';';
  }

  function render(discount) {
    themes = window.GACHA_THEMES || [];
    var grid = $('cat-grid');
    var price = window.Gacha.THEME_PRICE;
    var hasDisc = discount && discount > 0;
    var finalP = hasDisc ? window.Gacha.finalPrice(discount) : price;

    grid.innerHTML = themes.map(function (t, i) {
      var priceHtml = hasDisc
        ? '<span class="tc-old"><i class="fa-solid fa-coins"></i> ' + price + '</span><span class="tc-new">' + finalP + ' เหรียญ</span>'
        : '<span class="tc-coin"><i class="fa-solid fa-coins"></i> ' + price + ' เหรียญ</span>';
      var first = (t.imgs && t.imgs[0]) || '';
      var imgEl = '<img src="' + first + '" alt="' + t.name + '" loading="lazy" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'">' +
        '<div class="tc-ph" style="' + phStyle(t) + 'display:none">' + t.name + '</div>' +
        '<span class="tc-zoom"><i class="fa-solid fa-magnifying-glass-plus"></i></span>';
      return '<button type="button" class="theme-card" data-idx="' + i + '" style="animation-delay:' + (i * 45) + 'ms">' +
        '<div class="tc-img">' + imgEl + '</div>' +
        '<div class="tc-body"><div class="tc-name">' + t.name + '</div>' +
        '<div class="tc-price">' + priceHtml + '</div></div></button>';
    }).join('');

    grid.querySelectorAll('.theme-card').forEach(function (c) {
      c.addEventListener('click', function () { openLB(+c.getAttribute('data-idx')); });
    });

    var chip = $('cat-discount-chip');
    if (hasDisc) { chip.hidden = false; chip.textContent = 'ใช้ส่วนลด ' + discount + '% อยู่'; }
    else chip.hidden = true;
  }

  /* ---------- Lightbox = swipe carousel คุมด้วย JS transform ---------- */
  var curTheme = 0, idx = 0, n = 0;
  var TRANS = 'transform .35s var(--ease)';

  function openLB(ti) {
    curTheme = ti; idx = 0;
    var t = themes[ti]; n = t.imgs.length;
    var track = $('lb-track');
    track.innerHTML = t.imgs.map(function (src, i) {
      return '<div class="lb-slide">' +
        '<img src="' + src + '" alt="' + t.name + ' รูป ' + (i + 1) + '" draggable="false" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'">' +
        '<div class="lb-ph" style="' + phStyle(t) + 'display:none">' + t.name +
        '<br><small style="font-weight:300;opacity:.85">รูปที่ ' + (i + 1) + '/' + n + ' — ยังไม่มีรูป</small></div>' +
        '</div>';
    }).join('');
    var dh = '';
    for (var i = 0; i < n; i++) dh += '<button type="button" class="lb-dot' + (i === 0 ? ' on' : '') + '" data-i="' + i + '" aria-label="รูป ' + (i + 1) + '"></button>';
    $('lb-dots').innerHTML = dh;
    $('lb-title').textContent = t.name;
    $('lb-total').textContent = n;
    $('lightbox').hidden = false;
    apply(false);
    document.addEventListener('keydown', onKey);
  }
  function closeLB() { $('lightbox').hidden = true; document.removeEventListener('keydown', onKey); }

  // วางรูปที่ idx ให้อยู่กึ่งกลางเป๊ะ (translateX = -idx*100%)
  function apply(animate) {
    var track = $('lb-track');
    track.style.transition = animate ? TRANS : 'none';
    track.style.transform = 'translateX(' + (-idx * 100) + '%)';
    $('lb-cur').textContent = idx + 1;
    var dots = $('lb-dots').children;
    for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('on', d === idx);
  }
  function go(i) { idx = Math.max(0, Math.min(n - 1, i)); apply(true); }
  function onKey(e) {
    if (e.key === 'Escape') closeLB();
    else if (e.key === 'ArrowRight') go(idx + 1);
    else if (e.key === 'ArrowLeft') go(idx - 1);
  }

  function initLB() {
    var track = $('lb-track');
    $('lb-close').addEventListener('click', closeLB);
    $('lightbox').addEventListener('click', function (e) { if (e.target === $('lightbox')) closeLB(); });
    $('lb-dots').addEventListener('click', function (e) {
      var b = e.target.closest('.lb-dot'); if (b) go(+b.getAttribute('data-i'));
    });

    // ปัดนิ้ว (pointer drag) → ลากตามนิ้ว ปล่อยแล้วเด้งเข้ารูปถัดไป/เดิม
    var dragging = false, moved = false, sx = 0, sy = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      dragging = true; moved = false; sx = e.clientX; sy = e.clientY;
      track.style.transition = 'none';
      try { track.setPointerCapture(e.pointerId); } catch (x) {}
    });
    track.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) < 6 && Math.abs(dx) <= Math.abs(dy)) return; // ยังไม่ใช่ปัดแนวนอน
      moved = true;
      var w = track.clientWidth || 1;
      var pct = -idx * 100 + (dx / w) * 100;
      if ((idx === 0 && dx > 0) || (idx === n - 1 && dx < 0)) pct = -idx * 100 + (dx / w) * 100 / 3; // หน่วงที่ขอบ
      track.style.transform = 'translateX(' + pct + '%)';
    });
    function end(e) {
      if (!dragging) return; dragging = false;
      var dx = (e.clientX || sx) - sx;
      var th = Math.max(45, track.clientWidth * 0.12);
      if (dx <= -th && idx < n - 1) idx++;
      else if (dx >= th && idx > 0) idx--;
      apply(true);
    }
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  window.GachaCatalog = { render: render, initLB: initLB };
})();
