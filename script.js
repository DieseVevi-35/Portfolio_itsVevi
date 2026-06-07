/* =============================================
   PORTFOLIO VEVI — script.js
============================================= */

/* ---- NAV: scroll state + active links ---- */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const links = document.querySelectorAll('.nav__links a');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Sticky nav style
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active nav link based on scroll position
    let current = '';
    sections.forEach((s) => {
      const top = s.offsetTop - 120;
      if (window.scrollY >= top) current = s.id;
    });
    links.forEach((a) => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) a.classList.add('active');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- MOBILE MENU ---- */
(function () {
  const burger = document.getElementById('burgerBtn');
  const menu   = document.getElementById('mobileMenu');
  const close  = document.getElementById('mobileClose');
  if (!burger || !menu || !close) return;
  const mLinks = document.querySelectorAll('.mobile-link:not(.mobile-dropdown__toggle)');

  function openMenu() {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Animate burger into X
    const spans = burger.querySelectorAll('span');
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }

  function closeMenu() {
    menu.classList.remove('open');
    document.body.style.overflow = '';
    const spans = burger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }

  burger.addEventListener('click', openMenu);
  close.addEventListener('click', closeMenu);
  mLinks.forEach((l) => l.addEventListener('click', closeMenu));

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ---- MOBILE DROPDOWN (Studentische Projekte) ---- */
(function () {
  const toggle = document.querySelector('.mobile-dropdown__toggle');
  const items  = document.getElementById('mobileSubLinks');
  if (!toggle || !items) return;
  toggle.addEventListener('click', () => {
    const open = items.classList.toggle('open');
    toggle.classList.toggle('active', open);
  });
})();

/* ---- SCROLL REVEAL (Intersection Observer) ---- */
(function () {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-right');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stop observing once revealed
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
})();

/* ---- GALLERY TAB FILTER (je Galerie unabhängig) ---- */
(function () {
  document.querySelectorAll('.foto__tabs').forEach((tabGroup) => {
    const key     = tabGroup.dataset.gallery;
    const gallery = document.querySelector(`.foto__gallery[data-gallery="${key}"]`);
    if (!gallery) return;

    const tabs  = tabGroup.querySelectorAll('.tab-btn');
    const items = gallery.querySelectorAll('.foto__item');
    const descs = document.querySelectorAll(`.foto__tab-desc[data-gallery="${key}"]`);

    // Alle Bilder und Beschreibungen beim Start verstecken
    items.forEach((item) => item.classList.add('hidden'));
    descs.forEach((d) => { d.style.display = 'none'; });

    // Hinweistext einfügen
    const hint = document.createElement('p');
    hint.className = 'foto__select-hint';
    hint.textContent = 'Wähle eine Kategorie aus, um die Fotos zu sehen.';
    gallery.before(hint);

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('tab-btn--active'));
        btn.classList.add('tab-btn--active');

        const filter = btn.dataset.tab;

        // Hinweis ausblenden sobald eine Kategorie gewählt wurde
        hint.style.display = 'none';

        // Fotos filtern
        items.forEach((item) => {
          if (item.dataset.category === filter) {
            item.classList.remove('hidden');
            item.style.animation = 'fadeIn 0.4s ease forwards';
          } else {
            item.classList.add('hidden');
          }
        });

        // Beschreibungen umschalten
        descs.forEach((d) => {
          d.style.display = d.dataset.tab === filter ? '' : 'none';
        });
      });
    });
  });
})();

/* ---- LIGHTBOX ---- */
(function () {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbClose  = document.getElementById('lightboxClose');
  const lbPrev   = document.getElementById('lightboxPrev');
  const lbNext   = document.getElementById('lightboxNext');

  if (!lightbox) return;

  // Selector for all zoomable images — extend here as needed
  const ZOOM_SEL = [
    '.project__img',
    '.style-card img',
    '.phase-card img',
    '.phase-imgs img',
    '.foto__item img',
    '.storyboard-img',
    '.print-img',
    '.logo-img',
    '.proj-img',
    '.proj-style-card img'
  ].join(', ');

  let imgs = [];
  let cur  = 0;

  // Rebuild each time — catches hidden/dynamic images correctly
  function buildList() {
    imgs = Array.from(document.querySelectorAll(ZOOM_SEL))
               .filter(img => img.offsetParent !== null && img.src && !img.src.endsWith('#'));
  }

  function open(index) {
    cur = index;
    lbImg.src = imgs[cur].src;
    lbImg.alt = imgs[cur].alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    syncNav();
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function prev() {
    cur = (cur - 1 + imgs.length) % imgs.length;
    fade(() => { lbImg.src = imgs[cur].src; lbImg.alt = imgs[cur].alt || ''; });
    syncNav();
  }

  function next() {
    cur = (cur + 1) % imgs.length;
    fade(() => { lbImg.src = imgs[cur].src; lbImg.alt = imgs[cur].alt || ''; });
    syncNav();
  }

  function fade(cb) {
    lbImg.style.opacity = '0';
    setTimeout(() => { cb(); lbImg.style.opacity = '1'; }, 150);
  }

  function syncNav() {
    const show = imgs.length > 1 ? '' : 'none';
    lbPrev.style.display = show;
    lbNext.style.display = show;
  }

  lbImg.style.transition = 'opacity 0.15s ease';

  // Event delegation — works for all images regardless of when they were rendered
  document.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img || !img.matches(ZOOM_SEL)) return;
    buildList();
    const idx = imgs.indexOf(img);
    if (idx !== -1) open(idx);
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);

  // Click backdrop to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lbImg.parentElement) close();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  // Touch swipe
  let tx = 0;
  lightbox.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  }, { passive: true });
})();

/* ---- SMOOTH SCROLL for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- Inject fadeIn keyframe animation ---- */
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
`;
document.head.appendChild(style);


/* ---- ladeSeite Funktion für Drucker-Seite ---- */
// Funktion zum dynamischen Laden der Unterseiten
function ladeSeite(seite) {
    fetch(seite)
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden der Seite');
            }
            return response.text();
        })
        .then(daten => {
            document.getElementById('hauptinhalt').innerHTML = daten;
        })
        .catch(fehler => {
            console.error('Fehler:', fehler);
            document.getElementById('hauptinhalt').innerHTML = '<h2>Seite nicht gefunden</h2>';
        });
}

// Lade die Startseite standardmäßig beim ersten Aufruf (nur wenn Container vorhanden)
if (document.getElementById('hauptinhalt')) ladeSeite('startseite.html');
