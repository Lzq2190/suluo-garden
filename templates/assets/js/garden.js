(() => {
  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.querySelector('[data-theme-toggle]');
  const sceneButton = document.querySelector('[data-weather]');
  const plate = document.querySelector('.plate');
  const weather = document.querySelector('.weather');
  const modes = {spider: ['花','落花'], rain: ['雨','细雨'], osmanthus: ['桂','桂雨'], still: ['静','静景']};
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }
  let scene = body.dataset.scene || 'spider';
  try { scene = localStorage.getItem('jn-weather') || scene; } catch (_) {}
  if (!Object.hasOwn(modes, scene)) scene = 'spider';

  function renderScene() {
    if (sceneButton) {
      const [glyph, label] = modes[scene];
      sceneButton.textContent = glyph;
      sceneButton.title = '首页花事 · ' + label + '（点击切换）';
      sceneButton.setAttribute('aria-label', sceneButton.title);
    }
    if (!weather) return;
    weather.replaceChildren();
    weather.dataset.mode = scene;
    if (scene === 'still' || reducedMotion.matches) return;
    const count = Math.round(Math.min(180, Math.max(0, Number(body.dataset.count))) * (innerWidth < 740 ? 0.5 : 1));
    const particles = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('i');
      if (scene === 'spider' && i % 4 === 0) petal.className = 'light';
      petal.style.left = Math.random() * 100 + '%';
      petal.style.setProperty('--delay', -Math.random() * 12 + 's');
      petal.style.setProperty('--duration', (scene === 'rain' ? 1 : 8) + Math.random() * 3 + 's');
      particles.append(petal);
    }
    weather.append(particles);
  }
  sceneButton?.addEventListener('click', () => {
    const order = Object.keys(modes);
    scene = order[(order.indexOf(scene) + 1) % order.length];
    save('jn-weather', scene);
    renderScene();
  });
  reducedMotion.addEventListener('change', renderScene);
  renderScene();

  themeButton.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    themeButton.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
    save('jn-theme', root.dataset.theme);
  });
  const path = location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.menu a').forEach(link => {
    const dest = link.pathname.replace(/\/$/, '');
    if (path === dest) link.setAttribute('aria-current', 'page');
    else if (dest && path.startsWith(dest + '/')) link.setAttribute('aria-current', 'location');
  });

  if (plate?.dataset.parallax === 'true' && matchMedia('(pointer: fine)').matches) {
    plate.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      const box = plate.getBoundingClientRect();
      plate.style.setProperty('--dx', ((event.clientX - box.left) / box.width - .5) * 5 + 'px');
      plate.style.setProperty('--dy', ((event.clientY - box.top) / box.height - .5) * 5 + 'px');
    });
    plate.addEventListener('pointerleave', () => {
      plate.style.removeProperty('--dx');
      plate.style.removeProperty('--dy');
    });
  }
  if (body.dataset.ripple === 'true') {
    document.addEventListener('pointerdown', event => {
      if (reducedMotion.matches || event.target.closest('a,button,input,select,textarea,.prose')) return;
      const ring = document.createElement('i');
      ring.className = 'ripple';
      ring.setAttribute('aria-hidden', 'true');
      ring.style.left = event.clientX + 'px';
      ring.style.top = event.clientY + 'px';
      body.append(ring);
      setTimeout(() => ring.remove(), 650);
    });
  }
})();
