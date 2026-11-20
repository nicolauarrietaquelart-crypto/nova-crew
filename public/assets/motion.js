/* NOVA Crew · movimiento: entrada escalonada al cambiar de pantalla y contadores animados.
   Solo se anima cuando cambia la pantalla (no en los refrescos automáticos) y nunca si el
   sistema pide reducir movimiento. */
(() => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const ids = ['content', 'employee-content'];
  let lastKey = '';

  const screenKey = () => {
    const title = document.getElementById('page-title');
    return location.hash + '|' + (title ? title.textContent : '');
  };

  function countUp(el) {
    const raw = el.textContent.trim();
    const m = raw.match(/^(\d{1,4})$/); // solo enteros simples (no importes ni horas)
    if (!m) return;
    const target = Number(m[1]);
    if (target < 2) return;
    const t0 = performance.now(), dur = Math.min(900, 300 + target * 20);
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(target * e));
      if (k < 1) requestAnimationFrame(tick); else el.textContent = raw;
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  }

  function animate(root) {
    root.classList.remove('nv-enter');
    void root.offsetWidth; // reinicia la animación
    root.classList.add('nv-enter');
    const blocks = root.querySelectorAll(':scope > *, :scope > .dashboard-grid > div > .panel, .stats > .stat, .pipeline > .pipe-stage, .next-step, .emp-todo > *');
    let i = 0;
    blocks.forEach((b) => { if (i < 24) b.style.setProperty('--nv-d', (i++ * 45) + 'ms'); });
    root.querySelectorAll('.stat strong, .pipe-stage strong, .metric strong, .service-metrics strong, .emp-stat strong').forEach(countUp);
    clearTimeout(root._nvT);
    root._nvT = setTimeout(() => root.classList.remove('nv-enter'), 1400);
  }

  function watch(root) {
    new MutationObserver(() => {
      const key = screenKey();
      if (key === lastKey) return;
      lastKey = key;
      animate(root);
    }).observe(root, { childList: true });
  }

  const start = () => ids.forEach((id) => { const el = document.getElementById(id); if (el) watch(el); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
