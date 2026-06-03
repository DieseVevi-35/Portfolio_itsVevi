/* =============================================
   FLIPBOOK — flipbook.js  (v2 — UMD, kein ESM)
   Lädt PDF.js 3.x als normales Script
============================================= */

(function () {

  var PDFJS_URL    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  var PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  /* ---- PDF.js einmalig als Script-Tag laden ---- */
  function loadPdfJs() {
    return new Promise(function (resolve, reject) {
      if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
      var s = document.createElement('script');
      s.src = PDFJS_URL;
      s.onload = function () {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        resolve(window.pdfjsLib);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ================================================
     FlipBook Klasse

     Verwendung im HTML:
     <div id="book1"
          data-flipbook="https://ik.imagekit.io/DEIN_ID/datei.pdf"
          data-title="Titel"
          data-tag="Kategorie"
          data-desc="Kurzbeschreibung">
     </div>
  ================================================ */
  function FlipBook(opts) {
    this.pdfUrl = opts.pdfUrl;
    this.title  = opts.title  || 'Dokument';
    this.tag    = opts.tag    || '';
    this.desc   = opts.desc   || '';
    this.container = opts.containerId
      ? document.getElementById(opts.containerId)
      : (opts.container || null);

    this.pdf         = null;
    this.totalPages  = 0;
    this.spread      = 0;
    this.isAnimating = false;
    this.modal       = null;
    this._uid        = Math.random().toString(36).slice(2, 7);

    this._buildCard();
  }

  /* ---- Vorschau-Karte ---- */
  FlipBook.prototype._buildCard = function () {
    var self = this;
    var card = document.createElement('div');
    card.className = 'book-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', this.title + ' öffnen');

    card.innerHTML =
      '<div class="book-card__cover">' +
        '<div class="book-card__cover-placeholder" id="ph-' + this._uid + '">' +
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">' +
            '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>' +
            '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>' +
          '</svg>' +
          '<span>Vorschau laden…</span>' +
        '</div>' +
        '<canvas id="cv-' + this._uid + '" style="display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:contain"></canvas>' +
      '</div>' +
      '<div class="book-card__meta">' +
        (this.tag  ? '<div class="book-card__tag">'  + this.tag  + '</div>' : '') +
        '<div class="book-card__title">' + this.title + '</div>' +
        (this.desc ? '<div class="book-card__desc">' + this.desc + '</div>' : '') +
        '<div class="book-card__open">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
            '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>' +
            '<path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>' +
          '</svg>' +
          'Flipbook öffnen' +
        '</div>' +
      '</div>';

    card.addEventListener('click', function () { self.open(); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') self.open();
    });

    if (this.container) this.container.appendChild(card);

    setTimeout(function () { self._renderCover(); }, 200);
  };

  /* ---- Deckblatt als Vorschau rendern ---- */
  FlipBook.prototype._renderCover = function () {
    var self = this;
    var canvas = document.getElementById('cv-' + this._uid);
    var placeholder = document.getElementById('ph-' + this._uid);
    if (!canvas) return;

    loadPdfJs()
      .then(function (lib) {
        return lib.getDocument({ url: self.pdfUrl, withCredentials: false }).promise;
      })
      .then(function (doc) {
        self.pdf = doc;
        self.totalPages = doc.numPages;
        return doc.getPage(1);
      })
      .then(function (page) {
        var parent = canvas.parentElement;
        var w = parent.clientWidth  || 280;
        var h = parent.clientHeight || 373;
        var vp0   = page.getViewport({ scale: 1 });
        var scale = Math.min(w / vp0.width, h / vp0.height);
        var vp    = page.getViewport({ scale: scale });
        canvas.width  = vp.width;
        canvas.height = vp.height;
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      })
      .then(function () {
        if (placeholder) placeholder.style.display = 'none';
        canvas.style.display = 'block';
      })
      .catch(function (err) {
        console.error('FlipBook Cover-Fehler:', err);
        if (placeholder) {
          var sp = placeholder.querySelector('span');
          if (sp) sp.textContent = 'PDF nicht erreichbar';
        }
      });
  };

  /* ---- Modal aufbauen ---- */
  FlipBook.prototype._buildModal = function () {
    var self = this;
    var m = document.createElement('div');
    m.className = 'flipbook-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', this.title);

    m.innerHTML =
      '<button class="fb-close" aria-label="Schließen">✕</button>' +
      '<div class="fb-book-wrap">' +
        '<div class="fb-book">' +
          '<div class="fb-page fb-page--left">' +
            '<div class="fb-page__loading"><div class="fb-spinner"></div></div>' +
            '<canvas></canvas>' +
            '<div class="fb-page__num" id="fb-nl-' + this._uid + '"></div>' +
          '</div>' +
          '<div class="fb-page fb-page--right">' +
            '<div class="fb-page__loading"><div class="fb-spinner"></div></div>' +
            '<canvas></canvas>' +
            '<div class="fb-page__num" id="fb-nr-' + this._uid + '"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="fb-controls">' +
        '<button class="fb-btn" id="fb-prev-' + this._uid + '">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>' +
          ' Zurück' +
        '</button>' +
        '<div class="fb-counter" id="fb-ctr-' + this._uid + '"></div>' +
        '<button class="fb-btn" id="fb-next-' + this._uid + '">' +
          'Weiter ' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>' +
        '</button>' +
      '</div>';

    var pages = m.querySelectorAll('.fb-page');
    this._leftPage  = pages[0];
    this._rightPage = pages[1];

    m.querySelector('.fb-close').addEventListener('click', function () { self.close(); });
    m.querySelector('#fb-prev-' + this._uid).addEventListener('click', function () { self._prevSpread(); });
    m.querySelector('#fb-next-' + this._uid).addEventListener('click', function () { self._nextSpread(); });
    m.addEventListener('click', function (e) { if (e.target === m) self.close(); });

    this._onKeyBound = function (e) { self._onKey(e); };
    document.addEventListener('keydown', this._onKeyBound);

    document.body.appendChild(m);
    this.modal = m;
  };

  FlipBook.prototype._onKey = function (e) {
    if (!this.modal || !this.modal.classList.contains('open')) return;
    if (e.key === 'Escape')     this.close();
    if (e.key === 'ArrowRight') this._nextSpread();
    if (e.key === 'ArrowLeft')  this._prevSpread();
  };

  /* ---- Öffnen / Schließen ---- */
  FlipBook.prototype.open = function () {
    var self = this;
    if (!this.modal) this._buildModal();
    this.spread = 0;
    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (!this.pdf) {
      loadPdfJs()
        .then(function (lib) {
          return lib.getDocument({ url: self.pdfUrl, withCredentials: false }).promise;
        })
        .then(function (doc) {
          self.pdf = doc;
          self.totalPages = doc.numPages;
          self._renderSpread(false);
        })
        .catch(function (err) {
          console.error('FlipBook PDF-Ladefehler:', err);
        });
    } else {
      this._renderSpread(false);
    }
  };

  FlipBook.prototype.close = function () {
    if (this.modal) this.modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ---- Seitenpaar rendern ---- */
  FlipBook.prototype._renderSpread = function (animate, direction) {
    var self    = this;
    var leftNum  = this.spread * 2 + 1;
    var rightNum = this.spread * 2 + 2;

    var ctr = document.getElementById('fb-ctr-' + this._uid);
    if (ctr) ctr.textContent = leftNum + '–' + Math.min(rightNum, this.totalPages) + ' / ' + this.totalPages;

    var btnPrev = document.getElementById('fb-prev-' + this._uid);
    var btnNext = document.getElementById('fb-next-' + this._uid);
    if (btnPrev) btnPrev.disabled = this.spread === 0;
    if (btnNext) btnNext.disabled = rightNum >= this.totalPages;

    var nlEl = document.getElementById('fb-nl-' + this._uid);
    var nrEl = document.getElementById('fb-nr-' + this._uid);
    if (nlEl) nlEl.textContent = leftNum  <= this.totalPages ? leftNum  : '';
    if (nrEl) nrEl.textContent = rightNum <= this.totalPages ? rightNum : '';

    var lc = this._leftPage.querySelector('canvas');
    var rc = this._rightPage.querySelector('canvas');

    Promise.all([
      this._renderPage(leftNum,  lc, this._leftPage),
      this._renderPage(rightNum, rc, this._rightPage),
    ]).then(function () {
      if (animate) {
        var cls = direction === 'right' ? 'fb-page--flipping-right' : 'fb-page--flipping-left';
        var el  = direction === 'right' ? self._rightPage : self._leftPage;
        el.classList.add(cls);
        setTimeout(function () {
          el.classList.remove(cls);
          self.isAnimating = false;
        }, 520);
      } else {
        self.isAnimating = false;
      }
    });
  };

  FlipBook.prototype._renderPage = function (pageNum, canvas, pageEl) {
    var loading = pageEl.querySelector('.fb-page__loading');

    if (pageNum > this.totalPages) {
      canvas.style.visibility = 'hidden';
      if (loading) loading.style.display = 'none';
      return Promise.resolve();
    }

    canvas.style.visibility = 'visible';
    if (loading) loading.style.display = 'flex';

    return this.pdf.getPage(pageNum)
      .then(function (page) {
        var w  = canvas.parentElement.clientWidth  || 380;
        var h  = canvas.parentElement.clientHeight || 520;
        var vp0   = page.getViewport({ scale: 1 });
        var scale = Math.min(w / vp0.width, h / vp0.height) * 0.95;
        var vp    = page.getViewport({ scale: scale });
        canvas.width  = vp.width;
        canvas.height = vp.height;
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      })
      .then(function () {
        if (loading) loading.style.display = 'none';
      })
      .catch(function (err) {
        console.warn('Seite', pageNum, 'Fehler:', err);
        if (loading) loading.style.display = 'none';
      });
  };

  /* ---- Navigation ---- */
  FlipBook.prototype._nextSpread = function () {
    if (this.isAnimating) return;
    if ((this.spread * 2 + 2) >= this.totalPages) return;
    this.isAnimating = true;
    this.spread++;
    this._renderSpread(true, 'right');
  };

  FlipBook.prototype._prevSpread = function () {
    if (this.isAnimating || this.spread === 0) return;
    this.isAnimating = true;
    this.spread--;
    this._renderSpread(true, 'left');
  };

  /* ---- Global + Auto-Init aus data-Attributen ---- */
  window.FlipBook = FlipBook;

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-flipbook]').forEach(function (el) {
      new FlipBook({
        pdfUrl:      el.dataset.flipbook,
        title:       el.dataset.title || 'Dokument',
        tag:         el.dataset.tag   || '',
        desc:        el.dataset.desc  || '',
        containerId: el.id,
      });
    });
  });

})();