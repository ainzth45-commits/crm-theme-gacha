/* ============================================================
   🎲 Gacha core — ตาราง rate + สุ่ม + ระดับความหายาก
   ธีมราคา 10 เหรียญ · ส่วนลด 10-80% · พีคที่ 40/50/60
   ============================================================ */
(function () {
  'use strict';
  var THEME_PRICE = 10;

  // [ส่วนลด %, น้ำหนักโอกาส %] — รวม = 100 · 80% = แจ็คพอตหายากสุด (3%)
  var RATE = [
    [10, 7], [20, 9], [30, 13], [40, 18], [50, 20], [60, 18], [70, 12], [80, 3]
  ];

  // 🤫 rate ลับเฉพาะ S000 (เอาไว้โชว์) — 70 ออกบ่อยสุด · 60 รองลงมา · ที่เหลือนานๆ ที (ให้เนียน)
  var RATE_ADMIN = [
    [10, 1], [20, 1], [30, 2], [40, 4], [50, 8], [60, 32], [70, 52]
  ];

  function rollDiscount(admin) {
    var table = admin ? RATE_ADMIN : RATE;
    var total = table.reduce(function (s, r) { return s + r[1]; }, 0);
    var x = Math.random() * total, acc = 0;
    for (var i = 0; i < table.length; i++) {
      acc += table[i][1];
      if (x < acc) return table[i][0];
    }
    return table[table.length - 1][0];
  }

  // ระดับความปัง (ตามค่าส่วนลด) → ใช้กับเสียง/เอฟเฟกต์/ข้อความ
  function tier(d) {
    if (d >= 70) return 4;   // แจ็คพอต
    if (d >= 50) return 3;   // หายาก
    if (d >= 30) return 2;   // ดี
    return 1;                // ธรรมดา
  }
  var TIER_LABEL = {
    1: '🙂 พอได้!',
    2: '😀 ดีเลย!',
    3: '🎉 เยี่ยมมาก!',
    4: '✨ แจ็คพอต!! ✨'
  };

  function finalPrice(d) { return Math.round(THEME_PRICE * (1 - d / 100)); }

  window.Gacha = {
    THEME_PRICE: THEME_PRICE,
    RATE: RATE,
    rollDiscount: rollDiscount,
    tier: tier,
    tierLabel: function (d) { return TIER_LABEL[tier(d)]; },
    finalPrice: finalPrice
  };
})();
