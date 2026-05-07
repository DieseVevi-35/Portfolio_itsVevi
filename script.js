/* =============================================
   PORTFOLIO VEVI — script.js
============================================= */

/* ---- NAV: scroll state + active links ---- */
(function () {
  const nav = document.getElementById('nav');
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
  const mLinks = document.querySelectorAll('.mobile-link');

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

/* ---- GALLERY TAB FILTER ---- */
(function () {
  const tabs = document.querySelectorAll('.tab-btn');
  const items = document.querySelectorAll('.foto__item');

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active tab
      tabs.forEach((t) => t.classList.remove('tab-btn--active'));
      btn.classList.add('tab-btn--active');

      const filter = btn.dataset.tab;
      items.forEach((item) => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();

/* ---- LIGHTBOX ---- */
(function () {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightboxImg');
  const lbClose   = document.getElementById('lightboxClose');
  const lbPrev    = document.getElementById('lightboxPrev');
  const lbNext    = document.getElementById('lightboxNext');

  let zoomableImgs = [];
  let currentIndex = 0;

  function buildImageList() {
    zoomableImgs = Array.from(
      document.querySelectorAll(
        '.project__img, .style-card img, .phase-card img, .foto__item img, .storyboard-img'
      )
    );
  }

  function openLightbox(index) {
    currentIndex = index;
    lbImg.src = zoomableImgs[currentIndex].src;
    lbImg.alt = zoomableImgs[currentIndex].alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNav();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + zoomableImgs.length) % zoomableImgs.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = zoomableImgs[currentIndex].src;
      lbImg.alt = zoomableImgs[currentIndex].alt || '';
      lbImg.style.opacity = '1';
    }, 150);
    updateNav();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % zoomableImgs.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = zoomableImgs[currentIndex].src;
      lbImg.alt = zoomableImgs[currentIndex].alt || '';
      lbImg.style.opacity = '1';
    }, 150);
    updateNav();
  }

  function updateNav() {
    lbPrev.style.display = zoomableImgs.length > 1 ? '' : 'none';
    lbNext.style.display = zoomableImgs.length > 1 ? '' : 'none';
  }

  // Add smooth transition to lightbox img
  lbImg.style.transition = 'opacity 0.15s ease';

  buildImageList();

  // Attach click handlers to all zoomable images
  zoomableImgs.forEach((img, idx) => {
    img.addEventListener('click', () => openLightbox(idx));
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  // Click outside image to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) showNext();
      else showPrev();
    }
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
