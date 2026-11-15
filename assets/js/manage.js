// Service console (static demo): local tab switching, table filter, copy buttons.
// No network calls — every action here is a demo.
(function () {
  const root = document.querySelector('.mc-mg');
  if (!root) return;

  // 1. Tabs
  const tabs = [...root.querySelectorAll('[data-mg-tab]')];
  const panels = [...root.querySelectorAll('[data-mg-panel]')];

  function show(name, focus) {
    tabs.forEach(t => {
      const on = t.dataset.mgTab === name;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach(p => p.classList.toggle('is-on', p.dataset.mgPanel === name));
  }

  // Wire the tablist to its panels so screen readers announce the relationship.
  tabs.forEach(tab => {
    const name = tab.dataset.mgTab;
    const panel = panels.find(p => p.dataset.mgPanel === name);
    tab.id = 'mg-tab-' + name;
    if (panel) {
      if (!panel.id) panel.id = 'mg-panel-' + name;
      panel.setAttribute('aria-labelledby', tab.id);
      tab.setAttribute('aria-controls', panel.id);
    }
  });

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(tab.dataset.mgTab));
    tab.addEventListener('keydown', e => {
      const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      let next;
      if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else {
        const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
        next = (i + dir + tabs.length) % tabs.length;
      }
      show(tabs[next].dataset.mgTab, true);
    });
  });

  // 2. File search
  const search = root.querySelector('#mgFileSearch');
  const fileRows = [...root.querySelectorAll('#mgFileTable tbody tr')];
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      fileRows.forEach(tr => { tr.hidden = q !== '' && !tr.innerText.toLowerCase().includes(q); });
    });
  }

  // 3. Copy buttons
  const toast = text => {
    if (window.Swal) {
      window.Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: text, showConfirmButton: false, timer: 1600, timerProgressBar: true });
    }
  };
  root.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        toast('คัดลอกแล้ว');
      } catch (e) {
        toast('คัดลอกไม่สำเร็จ (โหมดตัวอย่าง)');
      }
    });
  });

  // 4. Demo-only actions
  root.querySelectorAll('[data-mg-demo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.mgDemo;
      if (window.Swal) {
        window.Swal.fire({
          icon: 'info',
          title: label,
          text: 'โหมดตัวอย่าง — ฟังก์ชันนี้ไม่เชื่อมต่อเซิร์ฟเวอร์จริง',
          confirmButtonText: 'รับทราบ',
          confirmButtonColor: '#275dff'
        });
      }
    });
  });

  show(tabs[0] ? tabs[0].dataset.mgTab : 'files');
})();
