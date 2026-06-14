/* ============================================================
   📖 Catalog — แสดงกริดธีม + ราคา (โชว์ราคาหลังลดถ้ามีส่วนลด)
   ============================================================ */
(function () {
  'use strict';
  function render(discount) {
    var grid = document.getElementById('cat-grid');
    var themes = window.GACHA_THEMES || [];
    var price = window.Gacha.THEME_PRICE;
    var hasDisc = discount && discount > 0;
    var finalP = hasDisc ? window.Gacha.finalPrice(discount) : price;

    grid.innerHTML = themes.map(function (t, i) {
      var priceHtml = hasDisc
        ? '<span class="tc-old"><i class="fa-solid fa-coins"></i> ' + price + '</span><span class="tc-new">' + finalP + ' เหรียญ</span>'
        : '<span class="tc-coin"><i class="fa-solid fa-coins"></i> ' + price + ' เหรียญ</span>';
      // ป้ายสีสำรอง (ถ้ารูปโหลดไม่ได้)
      var ph = (t.ph && t.ph.length === 2) ? t.ph : ['#3b6fe0', '#9b6fff'];
      var phStyle = '--ph-a:' + ph[0] + ';--ph-b:' + ph[1] + ';';
      var imgEl = t.img
        ? '<img src="' + t.img + '" alt="' + t.name + '" loading="lazy" ' +
          'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'">' +
          '<div class="tc-ph" style="' + phStyle + 'display:none">' + t.name + '</div>'
        : '<div class="tc-ph" style="' + phStyle + '">' + t.name + '</div>';
      return '<div class="theme-card" style="animation-delay:' + (i * 45) + 'ms">' +
        '<div class="tc-img">' + imgEl + '</div>' +
        '<div class="tc-body"><div class="tc-name">' + t.name + '</div>' +
        '<div class="tc-price">' + priceHtml + '</div></div></div>';
    }).join('');

    var chip = document.getElementById('cat-discount-chip');
    if (hasDisc) { chip.hidden = false; chip.textContent = 'ใช้ส่วนลด ' + discount + '% อยู่'; }
    else chip.hidden = true;
  }
  window.GachaCatalog = { render: render };
})();
