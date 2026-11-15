// Order page: monthly / yearly price display + mock order summary in #buyPlanModal (demo only).
(function () {
  const root = document.querySelector('.mc-pricing');
  if (!root) return;
  const seg = root.querySelector('.mc-seg');
  const thumb = seg.querySelector('.mc-seg-thumb');
  const tabs = [...seg.querySelectorAll('[data-period]')];
  let period = 'm';

  const place = (btn, animate) => {
    seg.classList.toggle('no-anim', !animate);
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.transform = `translateX(${btn.offsetLeft}px)`;
  };

  function setPeriod(p) {
    if (p === period) return;
    period = p;
    tabs.forEach(t => { const on = t.dataset.period === p; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
    place(tabs.find(t => t.dataset.period === p), true);
    root.querySelectorAll('[data-m][data-y]').forEach(el => {
      el.textContent = el.dataset[p];
      const box = el.closest('.mc-plan-amt, .mc-plan-unit') || el;
      box.classList.remove('is-swapping'); void box.offsetWidth; box.classList.add('is-swapping');
    });
  }
  tabs.forEach(t => t.addEventListener('click', () => setPeriod(t.dataset.period)));
  seg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const next = period === 'm' ? 'y' : 'm'; tabs.find(t => t.dataset.period === next).focus(); setPeriod(next); }
  });
  const init = () => place(tabs.find(t => t.classList.contains('is-on')), false);
  init(); window.addEventListener('resize', init); document.fonts && document.fonts.ready.then(init);

  // mock order summary (the real one comes from Livewire)
  const modal = document.getElementById('buyPlanModal');
  if (!modal) return;
  const BALANCE = 0; // DEMO: matches the ฿0.00 shown in the top bar
  modal.addEventListener('show.bs.modal', e => {
    const b = e.relatedTarget; if (!b || !b.dataset.plan) return;
    const price = Number(period === 'y' ? b.dataset.priceY : b.dataset.priceM);
    const short = BALANCE < price;
    const fmt = n => '฿' + n.toLocaleString('th-TH', { minimumFractionDigits: 2 });
    modal.querySelector('.modal-body').innerHTML = `
      <div class="mc-order-sum">
        <div class="row-line"><span>แพ็กเกจ</span><b>${b.dataset.plan}</b></div>
        <div class="row-line"><span>รอบบิล</span><b>${period === 'y' ? 'รายปี' : 'รายเดือน'}</b></div>
        <div class="row-line"><span>เครดิตคงเหลือ</span><b>${fmt(BALANCE)}</b></div>
        <div class="row-line is-total"><span>ยอดชำระ</span><b>${fmt(price)}</b></div>
        ${short ? `<div class="row-line is-short"><span>เครดิตไม่พอ</span><b>ขาดอีก ${fmt(price - BALANCE)}</b></div>` : ''}
        <div class="d-flex gap-2 justify-content-end mt-2">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">ยกเลิก</button>
          ${short ? '<a href="/client/credit" class="btn btn-primary">เติมเครดิต</a>' : '<button type="button" class="btn btn-primary" disabled>ยืนยันการสั่งซื้อ</button>'}
        </div>
      </div>`;
  });
})();
