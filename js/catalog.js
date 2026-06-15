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

  /* ---------- Lightbox = ปัดนิ้ว (native scroll-snap) + ปุ่ม ‹ › สำรอง ---------- */
  var n = 0;
  function openLB(ti) {
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
    document.body.classList.add('lb-noscroll');
    track.scrollLeft = 0;
    syncActive();
    document.addEventListener('keydown', onKey);
  }
  function closeLB() {
    $('lightbox').hidden = true;
    document.body.classList.remove('lb-noscroll');
    document.removeEventListener('keydown', onKey);
  }

  function curIdx() { var tr = $('lb-track'); return Math.round(tr.scrollLeft / (tr.clientWidth || 1)) || 0; }
  function syncActive() {
    var i = curIdx();
    $('lb-cur').textContent = i + 1;
    var dots = $('lb-dots').children;
    for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('on', d === i);
    $('lb-prev').disabled = (i <= 0);
    $('lb-next').disabled = (i >= n - 1);
  }
  function scrollToIdx(i) {
    var tr = $('lb-track');
    i = Math.max(0, Math.min(n - 1, i));
    tr.scrollTo({ left: i * tr.clientWidth, behavior: 'smooth' });
  }
  function onKey(e) {
    if (e.key === 'Escape') closeLB();
    else if (e.key === 'ArrowRight') scrollToIdx(curIdx() + 1);
    else if (e.key === 'ArrowLeft') scrollToIdx(curIdx() - 1);
  }

  function initLB() {
    $('lb-close').addEventListener('click', closeLB);
    $('lightbox').addEventListener('click', function (e) { if (e.target === $('lightbox')) closeLB(); });
    $('lb-prev').addEventListener('click', function () { scrollToIdx(curIdx() - 1); });
    $('lb-next').addEventListener('click', function () { scrollToIdx(curIdx() + 1); });
    $('lb-dots').addEventListener('click', function (e) {
      var b = e.target.closest('.lb-dot'); if (b) scrollToIdx(+b.getAttribute('data-i'));
    });
    var ticking = false;
    $('lb-track').addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { syncActive(); ticking = false; });
    });
  }

  window.GachaCatalog = { render: render, initLB: initLB };
})();
