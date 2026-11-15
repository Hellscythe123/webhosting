// Overview page: one-time entrance + service filter with a sliding thumb.
(function () {
  const root = document.querySelector('.mc-overview');
  if (!root) return;

  // 1. First visit this session: cards arrive in reading order, meters fill
  if (!sessionStorage.getItem('mc-overview-seen')) {
    root.classList.add('mc-enter');
    sessionStorage.setItem('mc-overview-seen', '1');
  }

  // 2. Filter: the thumb slides from the old tab to the new one; rows fade out/in
  const seg = root.querySelector('.mc-seg');
  const thumb = seg.querySelector('.mc-seg-thumb');
  const tabs = [...seg.querySelectorAll('button[data-filter]')];
  const rows = [...root.querySelectorAll('.mc-services tbody tr[data-type]')];
  const empty = root.querySelector('.mc-empty-row');

  function placeThumb(btn, animate) {
    seg.classList.toggle('no-anim', !animate);
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.transform = `translateX(${btn.offsetLeft}px)`;
  }
  const matches = (tr, f) => f === 'all' || tr.dataset.type === f || tr.dataset.state === f;

  function apply(filter) {
    tabs.forEach(t => { const on = t.dataset.filter === filter; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
    placeThumb(tabs.find(t => t.dataset.filter === filter), true);
    const leaving = rows.filter(tr => !tr.hidden && !matches(tr, filter));
    leaving.forEach(tr => tr.classList.add('is-leaving'));
    setTimeout(() => {
      leaving.forEach(tr => { tr.hidden = true; tr.classList.remove('is-leaving'); });
      let shown = 0;
      rows.forEach(tr => {
        if (!matches(tr, filter)) return;
        shown++;
        if (tr.hidden) { tr.hidden = false; tr.classList.remove('is-entering'); void tr.offsetWidth; tr.classList.add('is-entering'); }
      });
      empty.hidden = shown > 0;
    }, leaving.length ? 120 : 0);
  }

  tabs.forEach(t => t.addEventListener('click', () => apply(t.dataset.filter)));
  // arrow keys move between tabs
  seg.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.findIndex(t => t.classList.contains('is-on'));
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus(); apply(next.dataset.filter);
  });
  // stat-card chips jump to the table already filtered
  root.querySelectorAll('[data-filter-jump]').forEach(a => a.addEventListener('click', () => apply(a.dataset.filterJump)));

  const place = () => placeThumb(tabs.find(t => t.classList.contains('is-on')), false);
  place();
  window.addEventListener('resize', place);
  document.fonts && document.fonts.ready.then(place);

  // 3. Per-service CPU load in the table (demo feed: wobbles every ~2s)
  const cpuCells = [...root.querySelectorAll('.mc-cpu-cell[data-cpu]')];
  cpuCells.forEach(cell => {
    const base = parseFloat(cell.dataset.cpu) || 10;
    let v = base;
    const fill = cell.querySelector('.mc-cpu-fill');
    const val = cell.querySelector('.mc-cpu-val');

    const paint = () => {
      const level = v >= 80 ? 'bad' : v >= 60 ? 'warn' : 'ok';
      fill.style.width = v.toFixed(0) + '%';
      fill.className = 'mc-cpu-fill is-' + level;
      cell.className = 'mc-cpu-cell is-' + level;
      val.textContent = Math.round(v) + '%';
    };

    paint();
    const tick = () => {
      v += (Math.random() - 0.5) * 14;
      if (Math.random() < 0.07) v += 12 + Math.random() * 18;  // short spike
      v += (base - v) * 0.35;                                 // ease back toward this service's baseline
      v = Math.min(96, Math.max(3, v));
      paint();
      setTimeout(tick, 1600 + Math.random() * 1200);
    };
    setTimeout(tick, 1600 + Math.random() * 1200);
  });

})();
