// Landing pricing: monthly / yearly display with a sliding thumb.
(function () {
  const root = document.querySelector('.lp-pricing');
  if (!root) return;
  const seg = root.querySelector('.lp-period');
  const thumb = seg.querySelector('.lp-period-thumb');
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
      const box = el.closest('.lp-plan-amt, .lp-plan-unit') || el;
      box.classList.remove('is-swapping'); void box.offsetWidth; box.classList.add('is-swapping');
    });
  }
  tabs.forEach(t => t.addEventListener('click', () => setPeriod(t.dataset.period)));
  seg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = period === 'm' ? 'y' : 'm'; tabs.find(t => t.dataset.period === n).focus(); setPeriod(n); }
  });
  const init = () => place(tabs.find(t => t.classList.contains('is-on')), false);
  init(); window.addEventListener('resize', init); document.fonts && document.fonts.ready.then(init);
})();
