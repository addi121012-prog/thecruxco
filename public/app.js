(function () {
  const Crux = {
    async api(method, url, body) {
      const opt = { method, headers: {} };
      if (body !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(body); }
      const r = await fetch(url, opt);
      let d = {};
      try { d = await r.json(); } catch (e) {}
      if (!r.ok || d.ok === false) {
        const err = new Error(d.error || ('Request failed (' + r.status + ')'));
        err.data = d; err.status = r.status; throw err;
      }
      return d;
    },
    money(n, cur) {
      try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur || 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0); }
      catch (e) { return '₹' + (Number(n) || 0).toLocaleString('en-IN'); }
    },
    num(n) { return (Number(n) || 0).toLocaleString('en-IN'); },
    fmtDate(ms) { if (!ms) return '—'; try { return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(Number(ms))); } catch (e) { return '—'; } },
    dateInput(ms) { if (!ms) return ''; const d = new Date(Number(ms)); const p = (x) => String(x).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); },
    esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    toast(msg, type) {
      let wrap = document.querySelector('.toasts');
      if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toasts'; document.body.appendChild(wrap); }
      const t = document.createElement('div');
      t.className = 'toast' + (type === 'ok' ? ' toast--ok' : type === 'err' ? ' toast--err' : '');
      t.textContent = msg; wrap.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 250); }, 3200);
    },
    openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('open'); },
    closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); },
    daysDiff(ms) { return Math.round((Number(ms) - Date.now()) / 86400000); },
  };
  window.Crux = Crux;
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('[data-close-modal]')) { const b = t.closest('.modal-backdrop'); if (b) b.classList.remove('open'); }
    if (t.classList && t.classList.contains('modal-backdrop')) t.classList.remove('open');
    if (t.matches('[data-hamburger]')) { const s = document.querySelector('.sidebar'); if (s) s.classList.toggle('open'); }
  });
})();
