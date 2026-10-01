/* COCODRONE 데모 C (DJI Store 이벤트 페이지 문법)
 * 모든 목록·대회 정보는 Coco 데이터에서 그리고, Coco.on 의 lang/content 이벤트에서 다시 그린다.
 * 디버그 진입점: ?goto=섹션id (competition, film, products, benefits, notice, apply)
 *               ?notice=first|공지id (해당 공지를 펼친 상태로 시작)
 */
(function () {
  'use strict';

  var C = window.Coco;
  if (!C) return;

  /* ---------- 이 데모 전용 문구 (4개 언어) ---------- */
  var L = function (ko, en, ja, es) { return { ko: ko, en: en, ja: ja, es: es }; };
  var DICT = {
    skip: L('본문 바로가기', 'Skip to content', '本文へ移動', 'Saltar al contenido'),
    tel: L('전화', 'Phone', '電話', 'Teléfono'),
    lang: L('언어', 'Language', '言語', 'Idioma'),
    b1t: L('접착제 없이 끼워 조립', 'Slots together without glue', '接着剤なしで組み立て', 'Se monta sin pegamento'),
    b1d: L('모듈화된 키트를 끼워 맞추며 드론의 구조와 비행 원리를 익힙니다.', 'Modular kits slot together, and you learn how a drone is built and why it flies.', 'モジュール化されたキットをはめ込みながら、ドローンの構造と飛ぶ仕組みを学べます。', 'Los kits modulares se encajan y aprendes cómo es un dron por dentro y por qué vuela.'),
    b2t: L('친환경 종이 소재', 'Eco-friendly paper', '環境にやさしい紙素材', 'Papel ecológico'),
    b2d: L('친환경 종이 소재로 가볍고 안전합니다.', 'Eco-friendly paper keeps it light and safe.', '環境にやさしい紙素材で、軽くて安全です。', 'El papel ecológico lo hace ligero y seguro.'),
    b3t: L('블록코딩 지원', 'Block coding', 'ブロックコーディング対応', 'Programación por bloques'),
    b3d: L('코딩드론은 블록코딩 앱으로 조종 경험이 없어도 원하는 대로 움직입니다.', 'With the block-coding app, the coding drone moves the way you want, even without piloting experience.', 'コーディングドローンは、ブロックコーディングアプリで操縦経験がなくても思いどおりに動かせます。', 'Con la app de programación por bloques, el dron programable se mueve como quieras aunque nunca hayas pilotado.')
  };
  function lt(k) { return C.tr(DICT[k]); }

  var esc = C.esc;
  var t = C.t;
  var tr = C.tr;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function site() { return C.get().site || {}; }
  function storeUrl() { return site().storeUrl || 'https://smartstore.naver.com/cocodroneshop'; }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canHover = window.matchMedia('(hover: hover)');
  var pageLoaded = document.readyState === 'complete';

  var ICON = {
    info: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.4"/></svg>',
    chevron: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15L19.5 12z"/></svg>'
  };

  /* ---------- 공통 문구 ---------- */
  function applyLocal() {
    $$('[data-l]').forEach(function (el) { el.textContent = lt(el.getAttribute('data-l')); });
    $$('[data-l-attr]').forEach(function (el) {
      el.getAttribute('data-l-attr').split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i > 0) el.setAttribute(pair.slice(0, i).trim(), lt(pair.slice(i + 1).trim()));
      });
    });
  }

  function renderStatic() {
    var s = site();
    $$('[data-store]').forEach(function (a) { a.href = storeUrl(); });

    var tel = $('#footTel');
    if (tel) { tel.textContent = s.tel || ''; tel.href = 'tel:' + String(s.tel || '').replace(/[^\d+]/g, ''); }
    var mail = $('#footMail');
    if (mail) { mail.textContent = s.email || ''; mail.href = 'mailto:' + (s.email || ''); }

    /* 배너 제목: 일본어 가운뎃점 뒤에서만 줄바꿈되도록 <wbr> */
    var title = $('#bannerTitle');
    if (title) title.innerHTML = esc(C.c('competition.name')).replace(/・/g, '・<wbr>');

    var banner = $('.banner');
    if (banner) banner.style.backgroundImage = 'url("' + C.asset('assets/img/c-banner.jpg') + '")';
    var bimg = $('#benefitImg');
    if (bimg && !bimg.getAttribute('src')) bimg.src = C.asset('assets/img/c-foot.jpg');

    document.title = C.c('competition.name') + ' | COCODRONE';
  }

  /* ---------- 대회 소개 ---------- */
  function renderCompetition() {
    var comp = C.get().competition || {};
    var info = (comp.info || []).map(function (r) {
      return '<div class="info-row"><dt>' + esc(tr(r.label)) + '</dt><dd>' + esc(tr(r.value)) + '</dd></div>';
    }).join('');
    var divs = (comp.divisions || []).map(function (d, i) {
      return '<li><span class="div-no">' + pad2(i + 1) + '</span>' +
        '<strong class="div-name">' + esc(tr(d.name)) + '</strong>' +
        '<p class="div-desc">' + esc(tr(d.desc)) + '</p></li>';
    }).join('');
    var sample = comp.sample ? '<p class="sample-note">' + ICON.info + '<span>' + esc(t('label.sample')) + '</span></p>' : '<span></span>';

    $('#compCards').innerHTML =
      '<article class="bcard ccard">' +
        '<div class="bcard-cover"><img class="img-main" src="' + esc(C.asset('assets/img/a-compete.jpg')) + '" alt="" decoding="async">' +
          '<h3 class="ribbon">' + esc(t('comp.infoTitle')) + '</h3></div>' +
        '<div class="ccard-body"><dl class="info-list">' + info + '</dl>' +
          '<div class="ccard-foot">' + sample + '<a class="btn" href="#apply" data-goto="apply">' + esc(t('cta.applyShort')) + '</a></div>' +
        '</div>' +
      '</article>' +
      '<article class="bcard ccard">' +
        '<div class="bcard-cover"><img class="img-main" src="' + esc(C.asset('assets/img/a-make.jpg')) + '" alt="" decoding="async">' +
          '<h3 class="ribbon">' + esc(t('comp.divisionTitle')) + '</h3></div>' +
        '<div class="ccard-body"><ul class="div-list">' + divs + '</ul></div>' +
      '</article>';

    var steps = (comp.schedule || []).map(function (s) {
      return '<li class="sched-item"><span class="sched-time">' + esc(s.time) + '</span><span class="sched-name">' + esc(tr(s.title)) + '</span></li>';
    }).join('');
    var sched = $('#compSchedule');
    sched.hidden = !steps;
    sched.innerHTML = '<h3 class="sched-title">' + esc(t('comp.scheduleTitle')) + '</h3><ol class="sched-list">' + steps + '</ol>';
  }

  /* ---------- 홍보 영상 ---------- */
  var filmKey = '';
  function renderFilm() {
    var v = (C.get().competition || {}).video || {};
    var key = JSON.stringify(v);
    var card = $('#filmCard');
    if (key !== filmKey) {
      filmKey = key;
      var poster = C.asset(v.poster || 'assets/img/a-compete.jpg');
      var media;
      if (v.youtubeId) {
        media = '<div class="film-media"><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.youtubeId) + '?rel=0" title="" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
      } else {
        media = '<div class="film-media' + (v.src ? '' : ' is-fallback') + '">' +
          '<img class="film-poster" src="' + esc(poster) + '" alt="" decoding="async">' +
          (v.src ? '<video muted playsinline preload="metadata" poster="' + esc(poster) + '" src="' + esc(C.asset(v.src)) + '"></video>' : '') +
          '<button class="film-play" type="button">' + ICON.play + '</button>' +
        '</div>';
      }
      card.innerHTML = media +
        '<div class="film-body">' +
          '<div class="bcard-text"><h3 class="bcard-title" data-c="competition.name"></h3><p class="bcard-desc" data-c="competition.tagline"></p></div>' +
          '<div class="bcard-side"><a class="btn" href="#apply" data-goto="apply" data-i18n="cta.applyShort"></a></div>' +
        '</div>';
      bindFilm(card);
    }
    C.applyI18n(card);
    var iframe = $('iframe', card);
    if (iframe) iframe.title = t('comp.videoTitle');
    var play = $('.film-play', card);
    if (play) play.setAttribute('aria-label', t('cta.watch'));
  }
  function bindFilm(card) {
    var media = $('.film-media', card);
    var video = $('video', card);
    var play = $('.film-play', card);
    if (!video || !play) return;
    var fail = function () { media.classList.add('is-fallback'); };
    video.addEventListener('error', fail);
    play.addEventListener('click', function () {
      video.controls = true;
      media.classList.add('is-playing');
      var p = video.play();
      if (p && p.catch) p.catch(fail);
      video.focus();
    });
  }

  /* ---------- 제품 ---------- */
  function categoryName(id) {
    var cats = C.get().categories || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return tr(cats[i].name);
    return '';
  }
  function linkOf(p) { return p.link || storeUrl(); }
  function hoverImg(src, cls) {
    if (!src) return '';
    return '<img class="img-hover' + (cls ? ' ' + cls : '') + '" data-src="' + esc(C.asset(src)) + '" alt="" decoding="async">';
  }

  function renderProducts() {
    var priceNote = esc(t('products.priceNote'));
    var buy = esc(t('cta.buy'));

    $('#featuredGrid').innerHTML = C.products({ featured: true }).map(function (p) {
      var name = esc(tr(p.name));
      var tag = tr(p.tag);
      var main = p.wideImage || p.image;
      var hover = main !== p.image ? p.image : p.hoverImage;
      var link = esc(linkOf(p));
      return '<article class="bcard pcard">' +
        '<a class="bcard-cover" href="' + link + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' +
          '<img class="img-main" src="' + esc(C.asset(main)) + '" data-fallback="' + esc(C.asset(p.image)) + '" alt="" loading="lazy" decoding="async">' +
          hoverImg(hover, hover === p.image ? 'is-studio' : '') +
          (tag ? '<span class="ribbon">' + esc(tag) + '</span>' : '') +
        '</a>' +
        '<div class="bcard-body">' +
          '<div class="bcard-text"><h3 class="bcard-title">' + name + '</h3><p class="bcard-desc">' + esc(tr(p.desc)) + '</p></div>' +
          '<div class="bcard-side"><p class="price-note">' + priceNote + '</p>' +
            '<a class="btn" href="' + link + '" target="_blank" rel="noopener">' + buy + '<span class="sr-only"> ' + name + '</span></a></div>' +
        '</div>' +
      '</article>';
    }).join('');

    $('#allGrid').innerHTML = C.products({ featured: false }).map(function (p) {
      return '<li><a class="scard" href="' + esc(linkOf(p)) + '" target="_blank" rel="noopener">' +
        '<span class="scard-cover"><img class="img-main" src="' + esc(C.asset(p.image)) + '" alt="" loading="lazy" decoding="async">' + hoverImg(p.hoverImage) + '</span>' +
        '<span class="scard-body"><span class="scard-name">' + esc(tr(p.name)) + '</span>' +
          '<span class="scard-cat">' + esc(categoryName(p.category)) + '</span>' +
          '<span class="price-note">' + priceNote + '</span></span>' +
      '</a></li>';
    }).join('');

    armHoverImages();
  }

  /* hover 용 이미지는 마우스 환경에서, 페이지 로드가 끝난 뒤에만 불러온다 (터치 기기 데이터 절약) */
  function armHoverImages() {
    if (!canHover.matches || !pageLoaded) return;
    $$('.img-hover[data-src]').forEach(function (img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }

  /* 이미지 로드 실패: 대체 이미지 → 그래도 실패하면 숨겨 배경색이 보이게. hover 이미지는 제거 */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    if (img.classList.contains('img-hover')) { img.parentNode && img.parentNode.removeChild(img); return; }
    var fb = img.getAttribute('data-fallback');
    if (fb && img.src !== fb) { img.removeAttribute('data-fallback'); img.src = fb; return; }
    img.classList.add('is-broken');
  }, true);

  /* ---------- 공지사항 ---------- */
  var openNotices = {};
  function renderNotices() {
    var box = $('#noticeList');
    var list = C.notices();
    if (!list.length) { box.innerHTML = '<p class="notice-empty">' + esc(t('notice.empty')) + '</p>'; return; }
    box.innerHTML = '<ul>' + list.map(function (n) {
      var id = esc(n.id);
      var open = !!openNotices[n.id];
      return '<li class="notice-item' + (open ? ' is-open' : '') + '" data-id="' + id + '">' +
        '<h3><button class="notice-btn" type="button" id="nh-' + id + '" aria-expanded="' + open + '" aria-controls="nb-' + id + '">' +
          (n.pinned ? '<span class="badge">' + esc(t('label.pinned')) + '</span>' : '') +
          '<span class="notice-title">' + esc(tr(n.title)) + '</span>' +
          '<time class="notice-date" datetime="' + esc(n.date) + '">' + esc(C.fmtDate(n.date)) + '</time>' +
          ICON.chevron +
        '</button></h3>' +
        '<div class="notice-panel" id="nb-' + id + '" role="region" aria-labelledby="nh-' + id + '">' +
          '<div class="notice-panel-in"><div class="notice-body">' + C.rich(tr(n.body)) + '</div></div>' +
        '</div>' +
      '</li>';
    }).join('') + '</ul>';
  }
  $('#noticeList').addEventListener('click', function (e) {
    var btn = e.target.closest('.notice-btn');
    if (!btn) return;
    var item = btn.closest('.notice-item');
    var id = item.getAttribute('data-id');
    var open = !item.classList.contains('is-open');
    openNotices[id] = open;
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  /* ---------- 참가 신청 ---------- */
  var form = $('#entryForm');
  var errBox = $('#formError');
  var done = $('#formDone');
  var errKey = '';

  function showError(key) {
    errKey = key || '';
    errBox.hidden = !errKey;
    errBox.textContent = errKey ? t(errKey) : '';
  }
  function markInvalid(key) {
    $$('.is-invalid', form).forEach(function (el) { el.classList.remove('is-invalid'); el.removeAttribute('aria-invalid'); });
    var f = form.elements;
    var bad = [];
    if (key === 'form.errRequired') {
      ['name', 'phone', 'email', 'division'].forEach(function (n) { if (!String(f[n].value).trim()) bad.push(f[n]); });
    } else if (key === 'form.errEmail') bad.push(f.email);
    bad.forEach(function (el) { el.classList.add('is-invalid'); el.setAttribute('aria-invalid', 'true'); });
    if (key === 'form.errAgree') $('.agree', form).classList.add('is-invalid');
    return bad[0] || (key === 'form.errAgree' ? f.agree : null);
  }

  C.bindEntryForm(form, {
    onSuccess: function (entry) {
      showError('');
      markInvalid('');
      $('#doneNo').textContent = entry.no;
      form.hidden = true;
      done.hidden = false;
      scrollToId('apply', true);
      $('#doneTitle').focus({ preventScroll: true });
    },
    onError: function (msg, key) {
      showError(key);
      var first = markInvalid(key);
      var top = errBox.getBoundingClientRect().top;
      if (top < tabHeight() || top > window.innerHeight - 80) scrollToY(scrollPos() + top - tabHeight() - 24, false);
      if (first) first.focus({ preventScroll: true });
    }
  });
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid')) { e.target.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid'); }
    if (e.target.name === 'agree') $('.agree', form).classList.remove('is-invalid');
  });
  $('#formAgain').addEventListener('click', function () {
    done.hidden = true;
    form.hidden = false;
    form.elements.members.value = '1';
    form.elements.name.focus();
  });

  /* ---------- 언어 전환 (새로고침 없이) ---------- */
  function mountLang() {
    C.mountLangSwitcher($('#langUtil'), { format: 'code', reload: false, activeClass: 'is-on', className: 'lang-btn' });
    C.mountLangSwitcher($('#langFoot'), { format: 'name', reload: false, activeClass: 'is-on', className: 'lang-btn' });
  }
  function syncLang() {
    $$('.lang-switch .lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === C.lang;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* ---------- 탭 고정 + 스크롤스파이 ---------- */
  var SECTIONS = ['competition', 'film', 'products', 'notice', 'apply'];
  var tabbar = $('#tabbar');
  var tabScroll = $('#tabScroll');
  var fabTop = $('#fabTop');
  var activeTab = '';
  var spyLockUntil = 0;

  /* ?goto 디버그 모드에서는 body 를 스크롤 컨테이너로 쓴다.
   * 헤드리스 크롬의 --screenshot 은 창(viewport) 스크롤을 반영하지 못해 빈 화면이 찍히기 때문.
   * 일반 접속은 기존대로 window 스크롤. */
  var params = new URLSearchParams(window.location.search);
  var scroller = params.get('goto') ? document.body : null;
  if (scroller) document.documentElement.classList.add('debug-scroller');
  var scrollTarget = scroller || window;
  function scrollPos() { return scroller ? scroller.scrollTop : window.pageYOffset; }

  function tabHeight() { return tabbar ? tabbar.offsetHeight : 0; }
  function headGap() { return window.innerWidth < 768 ? 20 : 32; }
  function targetY(id) {
    if (id === 'top') return 0;
    var el = document.getElementById(id);
    if (!el) return null;
    var pt = parseFloat(window.getComputedStyle(el).paddingTop) || 0;
    return Math.max(0, el.getBoundingClientRect().top + scrollPos() + pt - tabHeight() - headGap());
  }
  function scrollToY(y, smooth) {
    scrollTarget.scrollTo({ top: y, left: 0, behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto' });
  }
  function scrollToId(id, instant) {
    var y = targetY(id);
    if (y == null) return false;
    if (SECTIONS.indexOf(id) > -1) { setActive(id); spyLockUntil = Date.now() + (instant ? 0 : 900); }
    scrollToY(y, !instant);
    return true;
  }

  function setActive(id) {
    if (!id || id === activeTab) return;
    activeTab = id;
    $$('.tab', tabbar).forEach(function (a) {
      var on = a.getAttribute('data-tab') === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      if (on && tabScroll.scrollWidth > tabScroll.clientWidth + 1) {
        var left = a.offsetLeft - (tabScroll.clientWidth - a.offsetWidth) / 2;
        tabScroll.scrollTo({ left: Math.max(0, left), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    });
  }
  function spy() {
    if (Date.now() < spyLockUntil) return;
    var line = tabHeight() + headGap() + 8;
    var cur = SECTIONS[0];
    SECTIONS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var pt = parseFloat(window.getComputedStyle(el).paddingTop) || 0;
      if (el.getBoundingClientRect().top + pt <= line) cur = id;
    });
    var box = scroller || document.documentElement;
    var viewH = scroller ? scroller.clientHeight : window.innerHeight;
    if (viewH + scrollPos() >= box.scrollHeight - 2) cur = SECTIONS[SECTIONS.length - 1];
    setActive(cur);
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      spy();
      fabTop.classList.toggle('is-show', scrollPos() > 300);
    });
  }
  scrollTarget.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  scrollTarget.addEventListener('scrollend', function () { spyLockUntil = 0; spy(); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-goto]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var id = a.getAttribute('data-goto');
    if (!scrollToId(id, false)) return;
    e.preventDefault();
    var head = id === 'top' ? null : $('#' + id + ' .sec-head h2');
    if (head) head.focus({ preventScroll: true });
  });
  fabTop.addEventListener('click', function () { scrollToY(0, true); });

  /* ---------- 전체 렌더 ---------- */
  function renderAll() {
    renderStatic();
    applyLocal();
    renderCompetition();
    renderFilm();
    renderProducts();
    renderNotices();
    C.fillDivisionSelect(form.elements.division);
    if (errKey) showError(errKey);
    syncLang();
  }

  C.on(function (ev) {
    if (ev.type === 'content') C.applyI18n(document);
    if (ev.type === 'lang' || ev.type === 'content') { renderAll(); spy(); }
  });

  /* ---------- 시작 ---------- */
  mountLang();
  C.applyI18n(document);
  renderAll();

  var openId = params.get('notice');
  if (openId) {
    var first = C.notices()[0];
    var nid = openId === 'first' && first ? first.id : openId;
    openNotices[nid] = true;
    renderNotices();
  }
  var gotoId = params.get('goto') || (window.location.hash || '').slice(1);
  if (gotoId && document.getElementById(gotoId)) {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    scrollToId(gotoId, true);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scrollToId(gotoId, true); });
  }
  spy();
  onScroll();

  window.addEventListener('load', function () {
    pageLoaded = true;
    armHoverImages();
    if (gotoId && document.getElementById(gotoId)) scrollToId(gotoId, true);
    spy();
  });
})();
