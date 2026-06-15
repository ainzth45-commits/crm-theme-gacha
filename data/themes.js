/* ============================================================
   รายการธีมใน Catalog
   - แต่ละธีมมีรูป 5 รูป: assets/themes/<id ตัวเล็ก>-1.png ... -5.png
     เช่น SP1 → assets/themes/sp1-1.png ... sp1-5.png
   - ถ้ายังไม่มีไฟล์รูป จะโชว์ป้ายสี (ph) แทนอัตโนมัติ
   - ราคา 10 เหรียญทุกธีม (กำหนดใน gacha.js)
   ============================================================ */
(function () {
  var IMG_PER_THEME = 5;
  var defs = [
    { id:'SP1', ph:['#EB9AB4','#F1DA8E'] },
    { id:'SP2', ph:['#2A1838','#EA3FB4'] },
    { id:'SP3', ph:['#8FCDEE','#E8758C'] },
    { id:'SP4', ph:['#4D6145','#CC4A30'] },
    { id:'SP5', ph:['#0B0B0D','#FF5FA6'] },
    { id:'SP6', ph:['#17717F','#E0C838'] },
    { id:'SP7', ph:['#2C4A6B','#C96B45'] },
    { id:'SP8', ph:['#0B1020','#5B8DEF'] },
    { id:'SP9', ph:['#872A20','#C9A227'] }
  ];
  window.GACHA_THEMES = defs.map(function (d) {
    var lc = d.id.toLowerCase();
    var imgs = [];
    for (var i = 1; i <= IMG_PER_THEME; i++) imgs.push('assets/themes/' + lc + '-' + i + '.png');
    return { id: d.id, name: d.id, ph: d.ph, imgs: imgs };
  });
})();
