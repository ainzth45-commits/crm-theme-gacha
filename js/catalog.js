/* ============================================================
   📖 Catalog — กริดธีม + ราคา · กดการ์ด → เปิด Lightbox ดูรูป (ธีมละ 5 รูป)
   ============================================================ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var Snd = window.GachaSound;
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

  /* ---------- Lightbox ---------- */
  var lbTheme = 0, lbIdx = 0;
  function openLB(ti) {
    lbTheme = ti; lbIdx = 0;
    $('lightbox').hidden = false;
    document.addEventListener('keydown', onKey);
    renderSlide();
  }
  function closeLB() {
    $('lightbox').hidden = true;
    document.removeEventListener('keydown', onKey);
  }
  function move(d) {
    var n = themes[lbTheme].imgs.length;
    lbIdx = (lbIdx + d + n) % n;
    if (Snd) Snd.click();
    renderSlide();
  }
  function renderSlide() {
    var t = themes[lbTheme], src = t.imgs[lbIdx];
    var img = $('lb-img'), ph = $('lb-ph');
    ph.hidden = true; img.style.display = 'block';
    img.onerror = function () {
      img.style.display = 'none';
      ph.hidden = false;
      ph.setAttribute('style', phStyle(t));
      ph.innerHTML = t.name + '<br><small style="font-weight:300;opacity:.85">รูปที่ ' + (lbIdx + 1) + '/' + t.imgs.length + ' — ยังไม่มีรูป</small>';
    };
    img.src = src; img.alt = t.name + ' รูป ' + (lbIdx + 1);
    $('lb-title').textContent = t.name;
    $('lb-cur').textContent = lbIdx + 1;
    $('lb-total').textContent = t.imgs.length;
  }
  function onKey(e) {
    if (e.key === 'Escape') closeLB();
    else if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowLeft') move(-1);
  }

  function initLB() {
    $('lb-close').addEventListener('click', closeLB);
    $('lb-prev').addEventListener('click', function () { move(-1); });
    $('lb-next').addEventListener('click', function () { move(1); });
    // คลิกพื้นหลัง (นอกรูป) เพื่อปิด
    $('lightbox').addEventListener('click', function (e) { if (e.target === $('lightbox') || e.target === $('lb-stage')) closeLB(); });
    // ปัดซ้าย/ขวาบน touch
    var sx = 0, sy = 0, tracking = false;
    var st = $('lb-stage');
    st.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; tracking = true; });
    st.addEventListener('pointerup', function (e) {
      if (!tracking) return; tracking = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
    });
  }

  window.GachaCatalog = { render: render, initLB: initLB };
})();
