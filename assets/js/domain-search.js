// Domain search (static demo): answers in the browser, no Livewire, no network.
(function () {
  const form = document.getElementById('dsForm');
  if (!form) return;

  const input = document.getElementById('dsInput');
  const btn = document.getElementById('dsSubmit');
  const idle = document.getElementById('dsBtnIdle');
  const busy = document.getElementById('dsBtnBusy');
  const out = document.getElementById('dsResults');

  // Mirrors the TLD pills shown on the page.
  const TLDS = [
    { tld: '.com', price: 420, taken: true },
    { tld: '.net', price: 510, taken: false },
    { tld: '.co.th', price: 890, taken: false },
    { tld: '.online', price: 110, taken: false },
    { tld: '.io', price: 1_490, taken: true }
  ];

  const clean = v =>
    v.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/\s+/g, '-');

  const price = n => '฿' + n.toLocaleString('th-TH');

  function showError(message) {
    out.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'ds-error';
    p.textContent = message;
    out.appendChild(p);
  }

  function render(name) {
    out.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'ds-results';

    const head = document.createElement('p');
    head.className = 'ds-head';
    head.textContent = 'ผลการตรวจสอบ “' + name + '”';
    head.insertAdjacentHTML('beforeend', ' <small>· ข้อมูลตัวอย่าง</small>');
    wrap.appendChild(head);

    TLDS.forEach(t => {
      const row = document.createElement('div');
      row.className = 'ds-row';

      const left = document.createElement('div');
      left.className = 'ds-left';
      const nm = document.createElement('span');
      nm.className = 'ds-name';
      nm.textContent = name + t.tld;
      const st = document.createElement('span');
      st.className = 'mc-status ' + (t.taken ? 'is-stopped' : 'is-active');
      st.textContent = t.taken ? 'ถูกจองแล้ว' : 'ว่าง';
      left.append(nm, st);

      const pr = document.createElement('span');
      pr.className = 'ds-price';
      pr.textContent = t.taken ? '—' : price(t.price) + '/ปี';

      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'btn btn-sm ' + (t.taken ? 'btn-outline-secondary' : 'btn-primary');
      action.textContent = t.taken ? 'ดู WHOIS' : 'เลือกโดเมน';
      action.addEventListener('click', () => {
        if (!window.Swal) return;
        window.Swal.fire({
          icon: 'info',
          title: t.taken ? 'WHOIS (ตัวอย่าง)' : 'เลือก ' + name + t.tld,
          text: t.taken
            ? 'ข้อมูลผู้ถือครองเป็นข้อมูลจำลอง ไม่ได้ดึงจาก registrar จริง'
            : 'โหมดตัวอย่าง — ไม่มีการจดทะเบียนหรือชำระเงินจริง',
          confirmButtonText: 'รับทราบ',
          confirmButtonColor: '#275dff'
        });
      });

      row.append(left, pr, action);
      wrap.appendChild(row);
    });

    out.appendChild(wrap);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = clean(input.value);

    if (!name) {
      showError('พิมพ์ชื่อโดเมนก่อนค้นหา เช่น myawesomebrand');
      input.focus();
      return;
    }

    btn.disabled = true;
    if (idle) idle.hidden = true;
    if (busy) busy.hidden = false;
    out.innerHTML = '';

    // Simulated lookup so the button has a real loading state to show.
    setTimeout(() => {
      btn.disabled = false;
      if (idle) idle.hidden = false;
      if (busy) busy.hidden = true;
      render(name);
    }, 700);
  });

  // The price pills at the bottom double as quick searches.
  document.querySelectorAll('.badge.font-monospace').forEach(pill => {
    const match = /^\.[\w.]+/.exec(pill.textContent.trim());
    if (!match) return;
    pill.style.cursor = 'pointer';
    pill.title = 'ค้นหา myawesomebrand' + match[0];
    pill.addEventListener('click', () => {
      input.value = 'myawesomebrand' + match[0];
      form.requestSubmit();
    });
  });
})();
