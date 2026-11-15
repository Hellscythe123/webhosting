// DEMO ONLY: fake sign-in for the static demo (no backend). Remove when wiring to Laravel auth.
(function () {
  const DEMO = { email: 'demo@minimalcloud.test', password: 'demo1234' };
  const form = document.getElementById('formAuthentication');
  if (!form) return;
  const page = location.pathname.replace(/\/+$/, '');
  const params = new URLSearchParams(location.search);

  function notice(text, type) {
    form.querySelector('.demo-notice')?.remove();
    const el = document.createElement('div');
    el.className = `alert alert-${type} demo-notice py-2 small`;
    el.setAttribute('role', type === 'danger' ? 'alert' : 'status');
    el.textContent = text;
    form.prepend(el);
  }

  if (page === '/login') {
    const email = form.querySelector('#email');
    const password = form.querySelector('#password');

    const messages = {
      logged_out: ['ออกจากระบบเรียบร้อยแล้ว', 'success'],
      registered: ['สมัครสมาชิกสำเร็จ เข้าสู่ระบบได้เลย', 'success'],
      reset: ['ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว (จำลอง)', 'info'],
    };
    for (const [key, [text, type]] of Object.entries(messages)) if (params.has(key)) notice(text, type);

    // Demo credentials are filled in automatically (the demo hint is not shown)
    email.value = DEMO.email;
    password.value = DEMO.password;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!email.value.trim() || !password.value) return notice('กรุณากรอกอีเมลและรหัสผ่าน', 'danger');
      if (email.value.trim().toLowerCase() !== DEMO.email || password.value !== DEMO.password)
        return notice('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'danger');
      location.href = '/client/';
    });
  }

  if (page === '/register') {
    form.addEventListener('submit', e => { e.preventDefault(); location.href = '/login/?registered=1'; });
  }

  if (page === '/forgot-password') {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.querySelector('input[type=email], input[name=email]')?.value.trim()) return notice('กรุณากรอกอีเมล', 'danger');
      location.href = '/login/?reset=1';
    });
  }
})();
