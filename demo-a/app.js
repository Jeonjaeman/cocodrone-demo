/* COCODRONE 데모 A
 * 레퍼런스: Trinity Airways 브랜드 사이트. 네이티브 스크롤 없이 입력 한 번에 장면 하나를 넘긴다.
 *
 * 장면 상태 설계
 *  - 장면은 S[] 배열의 객체이고 각 장면은 다음을 가진다.
 *      set(step)        그 단계의 완성 상태를 애니메이션 없이 즉시 만든다 (정지 상태의 유일한 정의)
 *      reset()          앞 장면에서 넘어오기 직전의 초기 상태
 *      intro()          reset 상태에서 set(0) 상태로 가는 등장 타임라인
 *      stepTl(k)        set(k-1) 에서 set(k) 로 가는 fromTo 타임라인. 역방향은 같은 타임라인을 거꾸로 재생한다
 *      enter(step,dir)  현재 장면이 될 때의 부수 효과 (영상 재생 등)
 *      leave(dir)       현재 장면에서 벗어날 때의 부수 효과 (영상 정지 등)
 *  - 전환 타임라인이 끝나면 항상 set() 으로 정규화한다. 진행 중에 새 입력이나 메뉴 점프가 오면
 *    현재 타임라인을 끝까지 감은 뒤(progress(1)) 새 전환을 시작하므로 상태가 어긋나지 않는다.
 *
 * 디버그 진입: ?scene=N (N번 장면 완성 상태) / &step=2 (2단계 장면의 두 번째 상태)
 */
(function () {
  'use strict';

  var C = window.Coco;
  if (!C) return;

  var html = document.documentElement;
  var G = window.gsap;
  var HAS_GSAP = !!(window.gsap && window.Observer);
  var mm = function (q) {
    return window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener: null, addListener: function () {} };
  };
  var MQ_FLOW = mm('(max-width: 900px), (prefers-reduced-motion: reduce)');
  var MQ_RM = mm('(prefers-reduced-motion: reduce)');
  if (HAS_GSAP) {
    G.registerPlugin(window.Observer);
    G.config({ nullTargetWarn: false });
  }

  /* ---------- 유틸 ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function L(ko, en, ja, es) { return { ko: ko, en: en, ja: ja, es: es }; }
  function noop() {}
  function esc(s) { return C.esc(s); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function assign(t) {
    for (var i = 1; i < arguments.length; i++) { var s = arguments[i]; for (var k in s) t[k] = s[k]; }
    return t;
  }
  /* 'experiences.0.image' 같은 경로의 원본 값 (번역 전) */
  function val(path) {
    var cur = C.get(), ps = String(path).split('.');
    for (var i = 0; i < ps.length; i++) { if (cur == null) return ''; cur = cur[ps[i]]; }
    return cur == null ? '' : cur;
  }
  function blurInside(el) {
    var a = document.activeElement;
    if (a && a !== document.body && el.contains(a) && a.blur) a.blur();
  }

  /* ---------- 데모 A 전용 문구 (4개 언어) ---------- */
  var DICT = {
    mainNav: L('주 메뉴', 'Main menu', 'メインメニュー', 'Menú principal'),
    lang: L('언어 선택', 'Choose language', '言語を選択', 'Elegir idioma'),
    sceneNav: L('장면 이동', 'Scene navigation', 'シーンの移動', 'Navegación por escenas'),
    newTab: L('(새 탭에서 열림)', '(opens in a new tab)', '（新しいタブで開きます）', '(se abre en una pestaña nueva)'),
    pause: L('배경 영상 일시정지', 'Pause background video', '背景映像を一時停止', 'Pausar el vídeo de fondo'),
    play: L('배경 영상 재생', 'Play background video', '背景映像を再生', 'Reproducir el vídeo de fondo'),
    toStart: L('맨 처음으로', 'Back to the start', '最初に戻る', 'Volver al inicio'),
    g0: L('오프닝', 'Opening', 'オープニング', 'Apertura'),
    g1: L('스토리', 'Story', 'ストーリー', 'Historia'),
    g2: L('대회', 'Challenge', '大会', 'Competición'),
    g3: L('경험', 'Experience', '体験', 'Experiencia'),
    g4: L('제품', 'Products', '製品', 'Productos'),
    g5: L('참가', 'Join', '参加', 'Participa')
  };
  function T(k) { return DICT[k] ? C.tr(DICT[k]) : k; }
  function applyDict(root) {
    $$('[data-t]', root).forEach(function (el) { el.textContent = T(el.getAttribute('data-t')); });
    $$('[data-t-attr]', root).forEach(function (el) {
      el.getAttribute('data-t-attr').split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i > 0) el.setAttribute(pair.slice(0, i).trim(), T(pair.slice(i + 1).trim()));
      });
    });
  }

  /* ---------- 장면 배치 설정 (이미지 피사체 위치에 맞춘 텍스트 배치) ---------- */
  /* 스토리: tone 은 글자색(dark=다크 브라운), v 는 세로 위치. 3번째 이미지는 하단 좌측에 피사체가 있어 위쪽에 둔다 */
  var STORY_CFG = [{ tone: 'dark', v: 'center' }, { tone: 'dark', v: 'center' }, { tone: 'dark', v: 'top' }];
  /* 경험 2단계: 상세 텍스트를 둘 쪽. 조립(손이 우측) 좌측, 코딩(드론이 우상단) 우하단.
   * pos 는 세로로 긴 창문 썸네일에서 보여 줄 초점 (풀스크린으로 커지면 거의 영향 없음) */
  var EXP_CFG = [
    { side: 'left', v: 'center', pos: '58% 50%' },
    { side: 'right', v: 'center', pos: '50% 50%' },
    { side: 'right', v: 'bottom', pos: '68% 50%' },
    { side: 'right', v: 'center', pos: '44% 50%' }
  ];
  var GROUPS = [
    { k: 'OPENING', d: 'g0', test: /^(intro|decl|why)$/ },
    { k: 'STORY', d: 'g1', test: /^story-/ },
    { k: 'CHALLENGE', d: 'g2', test: /^(comp|film)$/ },
    { k: 'EXPERIENCE', d: 'g3', test: /^exp-/ },
    { k: 'PRODUCTS', d: 'g4', test: /^products$/ },
    { k: 'JOIN', d: 'g5', test: /^(promise|last)$/ }
  ];

  /* ---------- 동적 장면 마크업 (stories / experiences / statements) ---------- */
  function rr(x, y, w, h, r) {
    return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) +
      'V' + (y + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) +
      'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) +
      'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z';
  }
  /* 창문(230×347, r100) 바깥 16px / 34px 에 그려지는 두 줄의 윤곽선 */
  var RING1 = rr(20, 20, 262, 379, 116);
  var RING2 = rr(2, 2, 298, 415, 134);

  function storyHTML(i) {
    var p = 'stories.' + i + '.';
    return '<section class="scene sc-story" data-sid="story-' + i + '" aria-labelledby="stT' + i + '">' +
      '<div class="st-win" data-rv><img alt="" data-src-path="' + p + 'image"></div>' +
      '<div class="st-ring" aria-hidden="true"><svg viewBox="0 0 302 419" focusable="false">' +
        '<path class="o1" pathLength="1" stroke-dasharray="1" d="' + RING1 + '"/>' +
        '<path class="o2" pathLength="1" stroke-dasharray="1" transform="rotate(180 151 209.5)" d="' + RING2 + '"/>' +
      '</svg></div>' +
      '<div class="st-scrim l" aria-hidden="true"></div><div class="st-scrim r" aria-hidden="true"></div>' +
      '<div class="st-l" data-rv><p class="st-eyebrow en" data-c="' + p + 'eyebrow"></p>' +
        '<h2 class="st-title" id="stT' + i + '" data-c-html="' + p + 'title"></h2></div>' +
      '<div class="st-r" data-rv><p class="st-body" data-c-html="' + p + 'body"></p></div>' +
      '</section>';
  }
  function expHTML(i) {
    var p = 'experiences.' + i + '.';
    return '<section class="scene sc-x sc-exp" id="exp' + (i + 1) + '" data-sid="exp-' + i + '" aria-labelledby="xT' + i + '">' +
      '<div class="x-bg" aria-hidden="true"><img alt="" data-src-path="' + p + 'image"></div>' +
      '<div class="x-frame" aria-hidden="true"></div>' +
      '<div class="x-media media" data-rv><img alt="" data-src-path="' + p + 'image">' +
        '<video muted loop playsinline preload="none" data-vid-path="' + p + 'video" data-poster-path="' + p + 'image"></video>' +
        '<button class="x-hit" type="button" data-i18n-attr="aria-label:cta.more"><span class="x-play is-plus" aria-hidden="true"></span></button>' +
      '</div>' +
      '<div class="x-scrim" aria-hidden="true"></div>' +
      '<div class="x-s0" data-rv><p class="x-lbl en ai">EXPERIENCE ' + pad2(i + 1) + '</p>' +
        '<p class="x-key en ai" data-c="' + p + 'key"></p>' +
        '<h2 class="x-title ai" id="xT' + i + '" data-c-html="' + p + 'title"></h2></div>' +
      '<div class="x-s1" data-rv><p class="x-key en ai" aria-hidden="true" data-c="' + p + 'key"></p>' +
        '<div class="x-detail ai" data-c-html="' + p + 'detail"></div></div>' +
      '</section>';
  }

  var shape = {};
  function buildDynamic() {
    var d = C.get();
    shape = { st: d.statements.length, stories: d.stories.length, exp: d.experiences.length };
    $('#dcStack').innerHTML = d.statements.map(function (s, i) {
      return '<p class="dc-st" data-c-html="statements.' + i + '.text"></p>';
    }).join('') + '<p class="dc-tag en" id="dcTag"></p>';
    $('#comp').insertAdjacentHTML('beforebegin', d.stories.map(function (s, i) { return storyHTML(i); }).join(''));
    $('#products').insertAdjacentHTML('beforebegin', d.experiences.map(function (x, i) { return expHTML(i); }).join(''));
    $$('.sc-story').forEach(function (el, i) {
      var c = STORY_CFG[i % STORY_CFG.length];
      el.setAttribute('data-tone', c.tone);
      el.setAttribute('data-v', c.v);
    });
    var posCss = '';
    $$('.sc-exp').forEach(function (el, i) {
      var c = EXP_CFG[i % EXP_CFG.length];
      el.setAttribute('data-side', c.side);
      el.setAttribute('data-v', c.v);
      posCss += '#' + el.id + ' .x-media > img, #' + el.id + ' .x-media > video { object-position: ' + c.pos + '; }\n';
    });
    /* 장면 엘리먼트의 인라인 스타일은 모드 전환 때 지워지므로 초점은 별도 스타일 규칙으로 둔다 */
    var styleEl = document.createElement('style');
    styleEl.textContent = posCss;
    document.head.appendChild(styleEl);
    $('#film').setAttribute('data-side', 'right');
    $$('.stage video').forEach(function (v) { v.addEventListener('error', onVidError); });
  }

  /* ---------- 데이터 → 화면 ---------- */
  function setSrc(im, url) { if (url && im.getAttribute('src') !== url) im.setAttribute('src', url); }
  function onVidError(e) {
    var v = e.currentTarget;
    if (v.getAttribute('src')) v.parentNode.classList.add('is-broken');
  }
  /* 영상 경로는 data-src 에만 두고 실제 재생할 때 src 를 붙인다 (없는 파일이면 error → poster 이미지 유지) */
  function prepVideo(v, src) {
    var box = v.parentNode;
    box.classList.toggle('no-vid', !src);
    if ((v.getAttribute('data-src') || '') === src) return;
    v.setAttribute('data-src', src);
    box.classList.remove('is-broken');
    if (v.getAttribute('src')) { v.removeAttribute('src'); try { v.load(); } catch (e) { /* 무시 */ } }
  }
  function splitChars(el, text) {
    if (!el) return;
    text = String(text || '');
    el.innerHTML = '<span class="sr">' + esc(text) + '</span><span aria-hidden="true">' +
      text.split(/\s+/).filter(Boolean).map(function (w) {
        return '<span class="w">' + Array.from(w).map(function (ch) {
          return '<span class="ch">' + esc(ch) + '</span>';
        }).join('') + '</span>';
      }).join(' ') + '</span>';
  }
  function cardHTML(p, o) {
    var d = C.get(), tag = C.tr(p.tag) || (o.desc ? C.tr(p.desc) : ''), cat = '';
    if (o.cat) {
      var c = (d.categories || []).filter(function (x) { return x.id === p.category; })[0];
      if (c) cat = '<span class="ov-cat">' + esc(C.tr(c.name)) + '</span>';
    }
    return '<li class="pd-item' + (o.ai ? ' ai' : '') + '"><a class="pd-card" href="' + esc(p.link || d.site.storeUrl) + '" target="_blank" rel="noopener">' +
      '<span class="pd-win"><img src="' + esc(C.asset(p.image)) + '" alt="" decoding="async" data-fit></span>' + cat +
      '<span class="pd-name">' + esc(C.tr(p.name)) + '</span>' +
      (tag ? '<span class="pd-tag">' + esc(tag) + '</span>' : '') +
      (o.note ? '<span class="ov-note">' + esc(C.t('products.priceNote')) + '</span>' : '') +
      '<span class="sr">' + esc(T('newTab')) + '</span></a></li>';
  }
  /* 흰 배경 정사각 제품컷은 창문 안에 여백을 두고(contain), 가로로 긴 사진은 창문을 채운다(cover) */
  function fitImages(root) {
    $$('img[data-fit]', root).forEach(function (im) {
      var apply = function () {
        if (im.naturalWidth && im.naturalHeight) im.classList.toggle('is-photo', im.naturalWidth / im.naturalHeight > 1.15);
      };
      if (im.complete) apply(); else im.addEventListener('load', apply, { once: true });
    });
  }
  function renderProducts() {
    var g = $('#pdGrid');
    g.innerHTML = C.products({ featured: true }).slice(0, 4).map(function (p) {
      return cardHTML(p, { ai: true });
    }).join('');
    fitImages(g);
  }
  function renderOverlay() {
    var g = $('#ovGrid');
    g.innerHTML = C.products().map(function (p) {
      return cardHTML(p, { cat: true, desc: true, note: true });
    }).join('');
    fitImages(g);
  }
  var openNotices = null;
  function renderNotices() {
    var list = C.notices(), ul = $('#ntList');
    if (!list.length) { ul.innerHTML = '<li class="nt-empty">' + esc(C.t('notice.empty')) + '</li>'; return; }
    if (!openNotices) { openNotices = {}; openNotices[list[0].id] = 1; }
    ul.innerHTML = list.map(function (n) {
      var id = esc(n.id), open = !!openNotices[n.id];
      return '<li class="nt-item' + (open ? ' is-open' : '') + '" data-id="' + id + '">' +
        '<h3 class="nt-h"><button class="nt-btn" type="button" id="ntb-' + id + '" aria-expanded="' + open + '" aria-controls="ntp-' + id + '">' +
          '<span class="nt-title">' + (n.pinned ? '<span class="nt-pin">' + esc(C.t('label.pinned')) + '</span>' : '') + esc(C.tr(n.title)) + '</span>' +
          '<time class="nt-date en" datetime="' + esc(n.date) + '">' + esc(C.fmtDate(n.date)) + '</time>' +
          '<span class="nt-ico" aria-hidden="true"></span>' +
        '</button></h3>' +
        '<div class="nt-panel" id="ntp-' + id + '" role="region" aria-labelledby="ntb-' + id + '"><div class="nt-inner">' +
          '<div class="nt-body">' + C.rich(C.tr(n.body)) + '</div></div></div>' +
        '</li>';
    }).join('');
  }

  function renderAll() {
    var d = C.get(), site = d.site, comp = d.competition;
    C.applyI18n(document);
    applyDict(document);
    $$('img[data-asset]').forEach(function (im) { setSrc(im, C.asset(im.getAttribute('data-asset'))); });
    $$('img[data-src-path]').forEach(function (im) { setSrc(im, C.asset(val(im.getAttribute('data-src-path')))); });
    $$('video[data-vid-path]').forEach(function (v) {
      var src = val(v.getAttribute('data-vid-path')), pp = v.getAttribute('data-poster-path');
      if (pp) v.setAttribute('poster', C.asset(val(pp)));
      prepVideo(v, src ? C.asset(src) : '');
    });
    var iv = $('.in-vid');
    iv.setAttribute('poster', C.asset(iv.getAttribute('data-asset-poster')));
    prepVideo(iv, C.asset(iv.getAttribute('data-asset-video')));

    $('#wyBody').innerHTML = (d.why.body || []).map(function (b) { return '<p>' + C.rich(C.tr(b)) + '</p>'; }).join('');
    splitChars($('#dcTag'), C.tr(site.taglineEn));
    splitChars($('#cpEn'), C.tr(comp.nameEn));
    $('#cpInfo').innerHTML = (comp.info || []).map(function (r) {
      return '<div class="cp-row ai"><dt>' + esc(C.tr(r.label)) + '</dt><dd>' + esc(C.tr(r.value)) + '</dd></div>';
    }).join('');
    $('#cpSample').hidden = !comp.sample;
    $('#flDivs').innerHTML = (comp.divisions || []).map(function (v) {
      return '<li class="ai"><strong>' + esc(C.tr(v.name)) + '</strong><span>' + esc(C.tr(v.desc)) + '</span></li>';
    }).join('');
    var sch = comp.schedule || [];
    $('#flSch').innerHTML = sch.map(function (r) {
      return '<li class="ai"><time class="en">' + esc(C.tr(r.time)) + '</time><span>' + esc(C.tr(r.title)) + '</span></li>';
    }).join('');
    $('#flSchLbl').hidden = !sch.length;
    renderProducts();
    renderNotices();
    C.fillDivisionSelect($('#f-div'));
    if (modal) renderOverlay();

    $$('[data-store]').forEach(function (a) { a.setAttribute('href', site.storeUrl); });
    var tel = $('#ftTel'), mail = $('#ftMail');
    tel.textContent = site.tel; tel.setAttribute('href', 'tel:' + String(site.tel).replace(/[^\d+]/g, ''));
    mail.textContent = site.email; mail.setAttribute('href', 'mailto:' + site.email);
    document.title = site.brand + ' | ' + C.tr(comp.name);
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', C.tr(site.slogan) + ' ' + C.tr(comp.summary));
    updateIntroBtn();
  }

  /* ---------- 레이아웃 수치 (창문 크기·썸네일 위치) ---------- */
  var Lyt = {};
  function layout() {
    var W = window.innerWidth, H = window.innerHeight;
    var ww = Math.round(Math.max(168, Math.min(230, W * 0.16))), wh = Math.round(ww * 347 / 230);
    if (wh > H * 0.52) { wh = Math.round(H * 0.52); ww = Math.round(wh * 230 / 347); }
    Lyt.winW = ww; Lyt.winH = wh; Lyt.winR = Math.round(ww * 100 / 230);
    var th = Math.round(Math.min(508, H * 0.6)), tw = Math.round(th * 350 / 508);
    var gap = Math.round(Math.min(110, W * 0.075)), txw = Math.round(Math.min(540, W * 0.36));
    var left = Math.max(Math.round(W * 0.07), Math.round((W - (tw + gap + txw)) / 2));
    Lyt.thumb = { left: left, top: Math.round((H - th) / 2 + 10), width: tw, height: th, r: Math.round(Math.min(120, Math.max(50, tw * 0.3))) };
    Lyt.txL = left + tw + gap;
    Lyt.txW = Math.min(txw, W - Lyt.txL - Math.round(W * 0.07));
    var st = html.style;
    st.setProperty('--win-w', ww + 'px');
    st.setProperty('--win-h', wh + 'px');
    st.setProperty('--tx-l', Lyt.txL + 'px');
    st.setProperty('--tx-w', Lyt.txW + 'px');
  }

  /* ---------- 텍스트 등장/퇴장 공통 (autoAlpha 0→1, y 30→0, blur 4→0) ---------- */
  function arr(x) {
    if (!x) return [];
    if (x.nodeType) return [x];
    return Array.prototype.filter.call(x, Boolean);
  }
  function vis(x) { x = arr(x); if (x.length) G.set(x, { autoAlpha: 1, y: 0, filter: 'none' }); }
  function hid(x, y) { x = arr(x); if (x.length) G.set(x, { autoAlpha: 0, y: y == null ? 30 : y, filter: 'blur(4px)' }); }
  function tin(tl, x, at, o) {
    x = arr(x); if (!x.length) return;
    o = o || {};
    tl.fromTo(x, { autoAlpha: 0, y: o.y == null ? 30 : o.y, filter: 'blur(4px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: o.d || 1.05, ease: o.ease || 'power2.out', stagger: o.s == null ? 0.12 : o.s }, at);
  }
  function tout(tl, x, at, o) {
    x = arr(x); if (!x.length) return;
    o = o || {};
    tl.fromTo(x, { autoAlpha: 1, y: 0, filter: 'blur(0px)' },
      { autoAlpha: 0, y: -24, filter: 'blur(4px)', duration: o.d || 0.6, ease: 'power2.in', stagger: o.s || 0 }, at);
  }
  function hidCh(c, y) { c = arr(c); if (c.length) G.set(c, { autoAlpha: 0, y: y || 14, filter: 'blur(6px)' }); }
  function visCh(c) { c = arr(c); if (c.length) G.set(c, { autoAlpha: 1, y: 0, filter: 'none' }); }

  /* ---------- 장면 정의 ---------- */
  function base(el, o) {
    return assign({
      el: el, sid: el.getAttribute('data-sid'), steps: 1, trans: 'slide', introAt: 0.5,
      toneStart: null, toneFinal: 'light',
      reset: noop, set: noop, intro: function () { return null; }, stepTl: null,
      enter: noop, leave: noop, onStep: noop
    }, o);
  }

  /* 0. 인트로 */
  function scIntro(el) {
    var lines = function () { return $$('.in-copy .line', el); };
    var hint = $('.in-hint', el);
    return base(el, {
      trans: 'none',
      reset: function () { hid(lines()); hid(hint, 16); },
      set: function () { vis(lines()); vis(hint); },
      intro: function () {
        var tl = G.timeline();
        tin(tl, lines(), 0.3, { d: 1.25, s: 0.22 });
        tin(tl, hint, 1.1, { y: 16 });
        return tl;
      },
      enter: function () { introPlay(); }
    });
  }

  /* 1. 선언: 문장 교체(2.3초 자동 + 입력) → 영문 태그라인 글자 랜덤 페이드 */
  function scDecl(el) {
    var P = function () { return { bg: $('.dc-bg img', el), st: $$('.dc-st', el), ch: $$('.dc-tag .ch', el) }; };
    var n = $$('.dc-st', el).length;
    return base(el, {
      steps: n + 1, trans: 'fade', introAt: 0,
      reset: function () { var p = P(); G.set(p.bg, { scale: 1 }); hid(p.st); hidCh(p.ch); },
      set: function (k) {
        var p = P();
        G.set(p.bg, { scale: 1.12 });
        p.st.forEach(function (e, i) { (i === k ? vis : hid)(e); });
        (k === n ? visCh : hidCh)(p.ch);
      },
      intro: function () {
        var p = P(), tl = G.timeline();
        tl.fromTo(p.bg, { scale: 1 }, { scale: 1.12, duration: 1.4, ease: 'power2.out' }, 0);
        if (n) tin(tl, p.st[0], 0.55, { d: 1.1 });
        else charsIn(tl, p.ch, 0.55);
        return tl;
      },
      stepTl: function (k) {
        var p = P(), tl = G.timeline();
        tout(tl, p.st[k - 1], 0, { d: 0.7 });
        if (k < n) tin(tl, p.st[k], 0.5, { d: 1.1 });
        else charsIn(tl, p.ch, 0.45);
        return tl;
      }
    });
  }
  function charsIn(tl, ch, at) {
    ch = arr(ch); if (!ch.length) return;
    tl.fromTo(ch, { autoAlpha: 0, y: 14, filter: 'blur(6px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'sine.out', stagger: { each: 0.035, from: 'random' } }, at);
  }

  /* 2. Why: 라인 드로잉 → 타이틀 → 본문 → 배경/글자 컬러 전환 + 헤더 색 반전 */
  function scWhy(el) {
    var P = function () {
      return { bg: $('.wy-bg', el), paths: $$('.wy-lines path', el), dots: $$('.wy-lines circle', el), title: $('.wy-title', el), body: $$('.wy-body p', el) };
    };
    var A0 = { bg: '#ffffff', t: '#453E38', b: '#453E38' }, A1 = { bg: '#67625E', t: '#EFB7AB', b: '#ECE7E1' };
    var s = base(el, {
      introAt: 0.35, toneStart: 'dark', toneFinal: 'light',
      reset: function () {
        var p = P();
        G.set(p.bg, { backgroundColor: A0.bg });
        G.set(p.paths, { attr: { 'stroke-dashoffset': 1 } });
        G.set(p.dots, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
        hid(p.title, 40); G.set(p.title, { color: A0.t });
        hid(p.body); G.set(p.body, { color: A0.b });
      },
      set: function () {
        var p = P();
        G.set(p.bg, { backgroundColor: A1.bg });
        G.set(p.paths, { attr: { 'stroke-dashoffset': 0 } });
        G.set(p.dots, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%' });
        vis(p.title); G.set(p.title, { color: A1.t });
        vis(p.body); G.set(p.body, { color: A1.b });
      },
      intro: function () {
        var p = P(), tl = G.timeline();
        tl.fromTo(p.paths, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.6, ease: 'power2.inOut', stagger: 0.22 }, 0);
        tl.fromTo(p.dots, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power2.out', stagger: 0.15 }, 1.45);
        tl.fromTo(p.title, { autoAlpha: 0, y: 40, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out' }, 0.55);
        tin(tl, p.body, 1.15, { s: 0.18 });
        tl.addLabel('shift', 2.75);
        tl.fromTo(p.bg, { backgroundColor: A0.bg }, { backgroundColor: A1.bg, duration: 1.4, ease: 'sine.inOut' }, 'shift');
        tl.fromTo(p.title, { color: A0.t }, { color: A1.t, duration: 1.4, ease: 'sine.inOut' }, 'shift');
        tl.fromTo(p.body, { color: A0.b }, { color: A1.b, duration: 1.4, ease: 'sine.inOut' }, 'shift');
        tl.call(function () { if (S[cur.i] === s) setTone('light'); }, null, 'shift+=0.5');
        return tl;
      }
    });
    return s;
  }

  /* 3~5. 스토리: 윤곽선 드로잉 → 창문 이미지 → 100vw×100vh 확장 → 좌 라벨/타이틀, 우 본문 */
  function scStory(el) {
    var cfgTone = el.getAttribute('data-tone') || 'dark';
    var P = function () {
      return { win: $('.st-win', el), img: $('.st-win img', el), ring: $('.st-ring', el), lines: $$('.st-ring path', el), scrim: $$('.st-scrim', el), l: $$('.st-l > *', el), r: $$('.st-r > *', el) };
    };
    var small = function () { return { width: Lyt.winW, height: Lyt.winH, borderRadius: Lyt.winR }; };
    var FULL = { width: '100%', height: '100%', borderRadius: 0 };
    var s = base(el, {
      introAt: 0.55, toneStart: 'light', toneFinal: cfgTone,
      reset: function () {
        var p = P();
        G.set(p.win, assign({ autoAlpha: 0 }, small()));
        G.set(p.img, { scale: 1.3 });
        G.set(p.ring, { autoAlpha: 1, scale: 1 });
        G.set(p.lines, { attr: { 'stroke-dashoffset': 1 } });
        G.set(p.scrim, { autoAlpha: 0 });
        hid(p.l); hid(p.r);
      },
      set: function () {
        var p = P();
        G.set(p.win, assign({ autoAlpha: 1 }, FULL));
        G.set(p.img, { scale: 1 });
        G.set(p.ring, { autoAlpha: 0 });
        G.set(p.lines, { attr: { 'stroke-dashoffset': 0 } });
        G.set(p.scrim, { autoAlpha: 1 });
        vis(p.l); vis(p.r);
      },
      intro: function () {
        var p = P(), tl = G.timeline();
        tl.fromTo(p.lines, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.05, ease: 'power2.inOut', stagger: 0.16 }, 0);
        tl.fromTo(p.win, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'sine.out' }, 0.4);
        tl.fromTo(p.img, { scale: 1.3 }, { scale: 1.14, duration: 1.1, ease: 'power2.out' }, 0.4);
        tl.addLabel('x', 1.4);
        tl.fromTo(p.win, small(), assign({ duration: 1.1, ease: 'power3.inOut' }, FULL), 'x');
        tl.to(p.img, { scale: 1, duration: 1.1, ease: 'power3.inOut' }, 'x');
        tl.to(p.ring, { autoAlpha: 0, scale: 1.25, duration: 0.8, ease: 'power2.in' }, 'x');
        tl.call(function () { if (S[cur.i] === s) setTone(cfgTone); }, null, 'x+=0.6');
        tl.fromTo(p.scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'sine.out' }, 'x+=0.7');
        tin(tl, p.l, 'x+=0.8');
        tin(tl, p.r, 'x+=1');
        return tl;
      }
    });
    return s;
  }

  /* 6. 대회 소개: 블러 배경 + 중앙 정렬, 영문 대회명 글자 단위 등장 */
  function scComp(el) {
    var P = function () {
      return { bg: $('.cp-bg img', el), ey: $('.cp-eyebrow', el), ch: $$('.cp-en .ch', el), txt: $$('.cp-txt', el), rows: $$('.cp-row', el), sample: $('#cpSample', el) };
    };
    return base(el, {
      trans: 'fade', introAt: 0.15,
      reset: function () {
        var p = P();
        G.set(p.bg, { scale: 1.18 });
        hid(p.ey); hidCh(p.ch, 50); hid(p.txt); hid(p.rows, 16); hid(p.sample, 10);
      },
      set: function () {
        var p = P();
        G.set(p.bg, { scale: 1.06 });
        vis(p.ey); visCh(p.ch); vis(p.txt); vis(p.rows); vis(p.sample);
      },
      intro: function () {
        var p = P(), tl = G.timeline();
        tl.fromTo(p.bg, { scale: 1.18 }, { scale: 1.06, duration: 1.6, ease: 'power2.out' }, 0);
        tin(tl, p.ey, 0.25);
        if (p.ch.length) {
          tl.fromTo(p.ch, { autoAlpha: 0, y: 50, filter: 'blur(6px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.95, ease: 'power2.out', stagger: 0.028 }, 0.35);
        }
        tin(tl, p.txt, 0.8);
        tin(tl, p.rows, 1.05, { y: 16, s: 0.08 });
        tin(tl, p.sample, 1.45, { y: 10 });
        return tl;
      }
    });
  }

  /* 7~11. 창문형 썸네일(1단계) → 풀스크린 영상/이미지(2단계) */
  function scMedia(el) {
    var P = function () {
      return {
        bg: $('.x-bg img', el), frame: $('.x-frame', el), media: $('.x-media', el), hit: $('.x-hit', el),
        scrim: $('.x-scrim', el), s0: $$('.x-s0 .ai', el), s1: $$('.x-s1 .ai', el), vid: $('.x-media video', el)
      };
    };
    var thumb = function () { var t = Lyt.thumb; return { left: t.left, top: t.top, width: t.width, height: t.height, borderRadius: t.r }; };
    var frame = function () {
      var t = Lyt.thumb, g = 14;
      return { left: t.left - g, top: t.top - g, width: t.width + 2 * g, height: t.height + 2 * g, borderRadius: t.r + g };
    };
    var FULL = { left: 0, top: 0, width: '100%', height: '100%', borderRadius: 0 };
    return base(el, {
      steps: 2, introAt: 0.5,
      reset: function () {
        var p = P();
        G.set(p.bg, { scale: 1.15 });
        G.set(p.media, assign({ autoAlpha: 0, y: 70 }, thumb()));
        G.set(p.frame, assign({ autoAlpha: 0, scale: 0.94 }, frame()));
        G.set(p.hit, { autoAlpha: 1 });
        G.set(p.scrim, { autoAlpha: 0 });
        hid(p.s0); hid(p.s1);
      },
      set: function (k) {
        var p = P();
        G.set(p.bg, { scale: 1.05 });
        if (k === 0) {
          G.set(p.media, assign({ autoAlpha: 1, y: 0 }, thumb()));
          G.set(p.frame, assign({ autoAlpha: 1, scale: 1 }, frame()));
          G.set(p.hit, { autoAlpha: 1 });
          G.set(p.scrim, { autoAlpha: 0 });
          vis(p.s0); hid(p.s1);
        } else {
          G.set(p.media, assign({ autoAlpha: 1, y: 0 }, FULL));
          G.set(p.frame, { autoAlpha: 0 });
          G.set(p.hit, { autoAlpha: 0 });
          G.set(p.scrim, { autoAlpha: 1 });
          hid(p.s0); vis(p.s1);
        }
      },
      intro: function () {
        var p = P(), tl = G.timeline();
        tl.fromTo(p.bg, { scale: 1.15 }, { scale: 1.05, duration: 1.6, ease: 'power2.out' }, 0);
        tl.fromTo(p.media, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1.15, ease: 'power2.out' }, 0.1);
        tl.fromTo(p.frame, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.3, ease: 'power2.out' }, 0.3);
        tin(tl, p.s0, 0.45);
        return tl;
      },
      stepTl: function () {
        var p = P(), tl = G.timeline();
        tout(tl, p.s0, 0, { d: 0.55, s: 0.04 });
        tl.fromTo(p.frame, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 1.06, duration: 0.5, ease: 'power2.in' }, 0);
        tl.fromTo(p.hit, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0);
        tl.fromTo(p.media, thumb(), assign({ duration: 1.1, ease: 'power3.inOut' }, FULL), 0.2);
        tl.fromTo(p.scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'sine.out' }, 0.95);
        tin(tl, p.s1, 1.05, { s: 0.05 });
        return tl;
      },
      /* 썸네일 단계에서는 정지, 확장 시 처음부터 재생, 벗어나면 정지 */
      onStep: function (k) { var v = P().vid; if (k === 1) playVid(v, true); else pauseVid(v); },
      enter: function (k) { if (k === 1) playVid(P().vid, true); },
      leave: function () { pauseVid(P().vid); }
    });
  }

  /* 12. 제품 */
  function scProd(el) {
    var P = function () { return { head: $$('.pd-head .ai', el), cards: $$('.pd-item', el), btns: $$('.pd-btns .ai', el) }; };
    return base(el, {
      toneStart: 'dark', toneFinal: 'dark',
      reset: function () { var p = P(); hid(p.head); if (p.cards.length) G.set(p.cards, { autoAlpha: 0, y: 90 }); hid(p.btns, 16); },
      set: function () { var p = P(); vis(p.head); if (p.cards.length) G.set(p.cards, { autoAlpha: 1, y: 0 }); vis(p.btns); },
      intro: function () {
        var p = P(), tl = G.timeline();
        tin(tl, p.head, 0.3, { s: 0.1 });
        if (p.cards.length) tl.fromTo(p.cards, { autoAlpha: 0, y: 90 }, { autoAlpha: 1, y: 0, duration: 1.15, ease: 'power2.out', stagger: 0.1 }, 0.55);
        tin(tl, p.btns, 1.05, { y: 16 });
        return tl;
      }
    });
  }

  /* 13. Promise: 아래에서 슬라이드 인 → 천천히 줌 */
  function scPromise(el) {
    var zoom = $('.pr-bg', el);
    var items = function () { return $$('.pr-c .ai', el); };
    return base(el, {
      reset: function () { zoom.classList.remove('is-zoom'); hid(items()); },
      set: function () { zoom.classList.add('is-zoom'); vis(items()); },
      intro: function () {
        var tl = G.timeline();
        tl.call(function () { zoom.classList.add('is-zoom'); }, null, 0.7);
        tin(tl, items(), 0.75, { s: 0.15 });
        return tl;
      }
    });
  }

  /* 14. 마지막 장면: 아래에서 올라오는 문서형 패널 (내부 일반 스크롤) */
  function scLast(el) {
    var img = $('.ls-hero img', el);
    var s = base(el, {
      introAt: 0.2, toneStart: 'light',
      reset: function () { el.scrollTop = 0; G.set(img, { scale: 1.12 }); },
      set: function () { G.set(img, { scale: 1 }); },
      intro: function () {
        var tl = G.timeline();
        tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0);
        return tl;
      },
      enter: function () {
        setTimeout(function () {
          if (!flow && S[cur.i] === s && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
        }, 60);
      },
      leave: function () { blurInside(el); }
    });
    return s;
  }

  var S = [], lastEl = null;
  function buildScenes() {
    S = $$('.stage > .scene').map(function (el, i) {
      var sid = el.getAttribute('data-sid'), s;
      if (sid === 'intro') s = scIntro(el);
      else if (sid === 'decl') s = scDecl(el);
      else if (sid === 'why') s = scWhy(el);
      else if (sid.indexOf('story-') === 0) s = scStory(el);
      else if (sid === 'comp') s = scComp(el);
      else if (sid === 'film' || sid.indexOf('exp-') === 0) s = scMedia(el);
      else if (sid === 'products') s = scProd(el);
      else if (sid === 'promise') s = scPromise(el);
      else if (sid === 'last') s = scLast(el);
      else s = base(el, {});
      s.i = i;
      return s;
    });
  }
  function sceneIndex(sid) {
    for (var i = 0; i < S.length; i++) if (S[i].sid === sid) return i;
    return -1;
  }

  /* ---------- 장면 전환 엔진 ---------- */
  var cur = { i: 0, step: 0 }, busy = false, activeTl = null, autoCall = null, modal = false, flow = false, zc = 10, obs = null;

  function show(s) { G.set(s.el, { autoAlpha: 1, yPercent: 0 }); }
  function hide(s) { G.set(s.el, { autoAlpha: 0, yPercent: 0 }); }
  function lift(s) { G.set(s.el, { zIndex: ++zc }); }
  function unlock() { busy = false; }
  /* 진행 중인 전환을 끝 상태로 감는다 (onComplete 에서 set() 정규화가 실행됨) */
  function finish() {
    if (activeTl) { var t = activeTl; activeTl = null; t.progress(1); }
    cancelAuto();
  }
  function cancelAuto() { if (autoCall) { autoCall.kill(); autoCall = null; } }
  function scheduleAuto() {
    cancelAuto();
    autoCall = G.delayedCall(2.3, function () {
      autoCall = null;
      if (!busy && !modal && !flow && S[cur.i].sid === 'decl') next();
    });
  }

  function next() {
    if (busy || modal || flow) return;
    var s = S[cur.i];
    if (cur.step < s.steps - 1) stepTo(cur.step + 1);
    else if (cur.i < S.length - 1) goScene(cur.i + 1, 1);
  }
  function prev() {
    if (busy || modal || flow) return;
    if (cur.step > 0) stepTo(cur.step - 1);
    else if (cur.i > 0) goScene(cur.i - 1, -1);
  }

  /* 다음 장면이 아래에서 덮어 올라온다 (yPercent 100→0). 페이드형 장면은 autoAlpha 교체 */
  function transIn(tl, A, B) {
    if (B.trans === 'fade') {
      tl.fromTo(B.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1, ease: 'sine.out' }, 0);
      return 1.1;
    }
    tl.fromTo(B.el, { yPercent: 100 }, { yPercent: 0, duration: 1.15, ease: 'power3.inOut' }, 0);
    tl.fromTo(A.el, { yPercent: 0 }, { yPercent: -18, duration: 1.15, ease: 'power3.inOut' }, 0);
    return 1.15;
  }
  /* 역방향: 현재 장면이 들어올 때의 움직임을 대칭으로 되돌리고, 아래에는 이전 장면의 완성 상태가 놓여 있다 */
  function transOut(tl, A, B) {
    if (A.trans === 'fade') {
      tl.fromTo(A.el, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.95, ease: 'sine.inOut' }, 0);
      return 0.95;
    }
    tl.fromTo(A.el, { yPercent: 0 }, { yPercent: 100, duration: 1.1, ease: 'power3.inOut' }, 0);
    tl.fromTo(B.el, { yPercent: -18 }, { yPercent: 0, duration: 1.1, ease: 'power3.inOut' }, 0);
    return 1.1;
  }

  function goScene(to, dir) {
    if (to < 0 || to >= S.length || to === cur.i) return;
    finish();
    var A = S[cur.i], B = S[to], last = B.steps - 1, d;
    busy = true;
    A.leave(dir);
    var tl = G.timeline({ onComplete: done });
    if (dir > 0) {
      B.reset(); show(B); lift(B);
      cur = { i: to, step: 0 };
      d = transIn(tl, A, B);
      tl.call(function () { blurInside(A.el); hide(A); }, null, d); /* 덮인 장면은 슬라이드가 끝나는 즉시 숨긴다 */
      var it = B.intro();
      if (it) tl.add(it, B.introAt);
      tl.call(setTone, [toneOf(B, 'start')], d * 0.45);
      tl.call(unlock, null, d); /* 입력 잠금은 장면 전환이 끝날 때까지. 장면 내부 연출은 이어서 재생된다 */
      setHeader(false);
    } else {
      B.set(last); show(B); lift(A);
      cur = { i: to, step: last };
      d = transOut(tl, A, B);
      tl.call(setTone, [toneOf(B, 'final')], d * 0.45);
      setHeader(true);
    }
    B.enter(cur.step, dir);
    updateInd();
    activeTl = tl;
    function done() {
      if (activeTl === tl) activeTl = null;
      blurInside(A.el);
      hide(A);
      if (dir < 0) A.reset();
      B.set(dir > 0 ? 0 : last);
      busy = false;
      after(dir);
    }
  }

  function stepTo(k) {
    var s = S[cur.i], from = cur.step;
    if (!s.stepTl || k === from || k < 0 || k >= s.steps) return;
    finish();
    busy = true;
    var fwd = k > from, inner, tl = G.timeline({ onComplete: done });
    if (fwd) {
      inner = s.stepTl(k);
      tl.add(inner, 0);
    } else {
      /* 같은 타임라인을 끝 상태로 만든 뒤 거꾸로 재생 */
      inner = s.stepTl(from);
      inner.pause();
      inner.progress(1, true);
      tl.add(inner.tweenFromTo(inner.duration(), 0, { duration: Math.min(inner.duration(), 1.3), ease: 'none' }), 0);
    }
    tl.call(unlock, null, Math.min(tl.duration(), fwd ? 1.35 : 1.1));
    cur.step = k;
    s.onStep(k, from);
    setHeader(!fwd);
    activeTl = tl;
    function done() {
      if (activeTl === tl) activeTl = null;
      if (!fwd) inner.kill();
      s.set(k);
      busy = false;
      after(fwd ? 1 : -1);
    }
  }

  /* 임의 장면으로 점프 (메뉴·인디케이터·디버그). 대상 장면을 완성 상태로 맞추고 나머지는 모두 숨긴다 */
  function jumpTo(to, step, o) {
    o = o || {};
    to = Math.max(0, Math.min(S.length - 1, to | 0));
    var B = S[to];
    step = Math.max(0, Math.min(B.steps - 1, step | 0));
    finish();
    if (!o.force && to === cur.i) {
      if (step === cur.step) { if (o.before) o.before(); return; }
      if (Math.abs(step - cur.step) === 1 && o.animate) { stepTo(step); return; }
    }
    var A = S[cur.i];
    if (A !== B || o.force) A.leave(0);
    if (!o.animate) {
      S.forEach(function (s) { if (s !== B) { blurInside(s.el); hide(s); } });
      B.set(step); show(B); lift(B);
      cur = { i: to, step: step };
      if (o.before) o.before();
      B.enter(step, 0);
      setTone(toneOf(B, 'final'));
      setHeader(true);
      updateInd();
      syncMedia();
      return;
    }
    busy = true;
    B.set(step); show(B); lift(B);
    cur = { i: to, step: step };
    if (o.before) o.before();
    B.enter(step, 0);
    var tl = G.timeline({
      onComplete: function () {
        if (activeTl === tl) activeTl = null;
        S.forEach(function (s) { if (s !== B) { blurInside(s.el); hide(s); } });
        B.set(step);
        busy = false;
        after(0);
      }
    });
    tl.fromTo(B.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'sine.out' }, 0);
    tl.call(setTone, [toneOf(B, 'final')], 0.4);
    setHeader(true);
    updateInd();
    activeTl = tl;
  }

  function after(dir) {
    syncMedia();
    var s = S[cur.i];
    if (s.sid === 'decl' && dir > 0 && cur.step < s.steps - 1) scheduleAuto();
  }

  /* ---------- 헤더·톤·인디케이터 ---------- */
  function isLast() { return !!S[cur.i] && S[cur.i].sid === 'last'; }
  function lastTone() {
    var hero = $('.ls-hero', lastEl);
    return lastEl.scrollTop > (hero ? hero.offsetHeight : 400) - 72 ? 'dark' : 'light';
  }
  function toneOf(s, phase) {
    if (s.sid === 'last') return lastTone();
    return phase === 'start' ? (s.toneStart || s.toneFinal) : s.toneFinal;
  }
  function setTone(t) {
    html.setAttribute('data-tone', t);
    html.classList.toggle('hd-solid', !flow && isLast() && t === 'dark');
  }
  function setHeader(visible) {
    if (!flow && cur.i === 0) visible = true;
    html.classList.toggle('hd-hidden', !visible);
    if (!visible) closeMnav();
  }
  function groupIdx(sid) {
    for (var g = 0; g < GROUPS.length; g++) if (GROUPS[g].test.test(sid)) return g;
    return 0;
  }
  var lastGroup = -1;
  function buildInd() {
    $('#indList').innerHTML = GROUPS.map(function (g, i) {
      return '<li><button class="ind-dash" type="button" data-group="' + i + '"></button></li>';
    }).join('');
    labelInd();
  }
  function labelInd() {
    $$('.ind-dash').forEach(function (b, i) { b.setAttribute('aria-label', T(GROUPS[i].d)); });
  }
  function updateInd() {
    var g = groupIdx(S[cur.i].sid);
    html.classList.toggle('at-last', isLast());
    $$('.ind-dash').forEach(function (b, i) {
      b.classList.toggle('on', i === g);
      if (i === g) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    if (g !== lastGroup) {
      var lab = $('#indLabel');
      lab.textContent = GROUPS[g].k;
      if (lastGroup > -1) G.fromTo(lab, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' });
      lastGroup = g;
    }
  }
  function goGroup(g) {
    for (var i = 0; i < S.length; i++) if (GROUPS[g] && GROUPS[g].test.test(S[i].sid)) { goTo(S[i].sid); return; }
  }

  /* ---------- 영상 ---------- */
  var introVid = null, introPaused = false;
  function ensureSrc(v) {
    var s = v.getAttribute('data-src');
    if (s && v.getAttribute('src') !== s) v.setAttribute('src', s);
  }
  function playVid(v, restart) {
    if (!v) return;
    var box = v.parentNode;
    if (box.classList.contains('no-vid') || box.classList.contains('is-broken')) return;
    ensureSrc(v);
    if (restart) { try { v.currentTime = 0; } catch (e) { /* 메타데이터 전이면 무시 */ } }
    var p = v.play();
    if (p && p.catch) p.catch(noop);
  }
  function pauseVid(v) { if (v && !v.paused) v.pause(); }
  function introPlay() { if (!introPaused) playVid(introVid, false); }
  function updateIntroBtn() {
    var b = $('#introBtn');
    if (!b) return;
    b.classList.toggle('is-paused', introPaused);
    b.setAttribute('aria-label', T(introPaused ? 'play' : 'pause'));
  }
  function syncMedia() {
    if (flow) return;
    if (cur.i === 0) introPlay(); else pauseVid(introVid);
  }

  /* ---------- 입력: 휠·터치(Observer) + 키보드 ---------- */
  /* 트랙패드 관성 대비: 170ms 이상 끊긴 뒤의 휠만 "새 입력"으로 인정한다. 잠금 중 시작된 휠은 버린다 */
  var wheelFresh = true, lastWheel = 0;
  function bindObserver() {
    window.addEventListener('wheel', function (e) {
      var now = e.timeStamp || Date.now();
      if (now - lastWheel > 170) wheelFresh = true;
      lastWheel = now;
    }, { capture: true, passive: true });
    obs = window.Observer.create({
      target: window,
      type: 'wheel,touch',
      wheelSpeed: -1,
      tolerance: 12,
      preventDefault: false,
      ignoreCheck: function (e) {
        return flow || modal || !!(e.target && e.target.closest && e.target.closest('.sc-last, .ov, .mnav'));
      },
      onUp: function (self) { onInput(1, self.event); },
      onDown: function (self) { onInput(-1, self.event); }
    });
  }
  function onInput(dir, ev) {
    if (flow || modal || isLast()) return;
    if (ev && ev.type === 'wheel') {
      var ok = wheelFresh && !busy;
      wheelFresh = false;
      if (!ok) return;
    } else if (busy) return;
    if (dir > 0) next(); else prev();
  }
  function onKey(e) {
    if (e.key === 'Escape') {
      if (modal) closeOv(); else closeMnav();
      return;
    }
    if (flow || modal || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    var k = e.key, dir = 0;
    if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) dir = 1;
    else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) dir = -1;
    if (!dir) return;
    if (k === ' ' && (tag === 'BUTTON' || tag === 'A')) return;
    if (isLast()) {
      /* 문서형 장면: 맨 위에서 위로 가는 키만 이전 장면, 나머지는 패널의 기본 스크롤 */
      if (dir < 0 && lastEl.scrollTop <= 0 && k !== ' ') {
        e.preventDefault();
        if (!busy && !e.repeat) prev();
      }
      return;
    }
    e.preventDefault();
    if (e.repeat || busy) return;
    if (dir > 0) next(); else prev();
  }
  function bindLast() {
    var el = lastEl, prevTop = 0, tY = 0, tTop = false;
    el.addEventListener('scroll', function () {
      if (flow) return;
      var y = el.scrollTop;
      if (isLast()) {
        setTone(lastTone());
        /* 메뉴로 이동한 프로그램 스크롤은 헤더를 숨기지 않는다 */
        if (Date.now() > progScrollUntil) {
          if (y > prevTop + 6 && y > 160) setHeader(false);
          else if (y < prevTop - 6) setHeader(true);
        }
      }
      prevTop = y;
    }, { passive: true });
    /* 맨 위에서 새로 시작한 위쪽 휠이면 이전 장면 (아래로 읽다가 관성으로 올라온 휠은 무시) */
    el.addEventListener('wheel', function (e) {
      var fresh = wheelFresh;
      wheelFresh = false;
      if (flow || modal || busy || !isLast()) return;
      if (fresh && e.deltaY < 0 && el.scrollTop <= 0) prev();
    }, { passive: true });
    el.addEventListener('touchstart', function (e) {
      tY = e.touches[0].clientY;
      tTop = el.scrollTop <= 0;
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (!flow && tTop && !busy && isLast() && e.touches[0].clientY - tY > 70) { tTop = false; prev(); }
    }, { passive: true });
  }

  /* ---------- 메뉴·점프 ---------- */
  var progScrollUntil = 0;
  function scrollPanel(id, smooth) {
    var t = document.getElementById(id);
    if (!t || !lastEl) return;
    progScrollUntil = Date.now() + (smooth ? 1200 : 300);
    var top = t.getBoundingClientRect().top - lastEl.getBoundingClientRect().top + lastEl.scrollTop - 8;
    lastEl.scrollTo({ top: Math.max(0, top), behavior: smooth && !MQ_RM.matches ? 'smooth' : 'auto' });
  }
  function goTo(sid, anchor) {
    var i = sceneIndex(sid);
    if (i < 0) return;
    if (i === cur.i && !busy) {
      if (anchor) scrollPanel(anchor, true);
      else if (sid === 'last') lastEl.scrollTo({ top: 0, behavior: MQ_RM.matches ? 'auto' : 'smooth' });
      else if (cur.step !== 0) jumpTo(i, 0, { animate: true });
      return;
    }
    jumpTo(i, 0, {
      animate: true,
      before: function () {
        if (S[i].sid !== 'last') return;
        if (anchor) scrollPanel(anchor, false); else lastEl.scrollTop = 0;
      }
    });
  }
  function onJumpClick(e, a) {
    var sid = a.getAttribute('data-jump'), anchor = a.getAttribute('data-anchor');
    closeMnav();
    if (modal) closeOv(true);
    if (flow) {
      var i = sceneIndex(sid), tgt = anchor ? document.getElementById(anchor) : (S[i] && S[i].el);
      if (tgt) {
        e.preventDefault();
        tgt.scrollIntoView({ behavior: MQ_RM.matches ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    e.preventDefault();
    goTo(sid, anchor);
  }
  function toggleMnav(open) {
    var m = $('#mnav'), b = $('#burger');
    if (!m || !b) return;
    if (open == null) open = m.hidden;
    m.hidden = !open;
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeMnav() { toggleMnav(false); }

  /* ---------- 전체 제품 오버레이 ---------- */
  var ovReturn = null, ovTimer = 0;
  function openOv(from) {
    var ov = $('#ov');
    renderOverlay();
    clearTimeout(ovTimer);
    ov.hidden = false;
    modal = true;
    cancelAuto();
    ovReturn = from || document.activeElement;
    html.classList.add('ov-open');
    $('#ovPanel').scrollTop = 0;
    void ov.offsetWidth;
    ov.classList.add('is-open');
    $('#ovClose').focus({ preventScroll: true });
  }
  function closeOv(silent) {
    var ov = $('#ov');
    if (ov.hidden) return;
    ov.classList.remove('is-open');
    modal = false;
    html.classList.remove('ov-open');
    ovTimer = setTimeout(function () { if (!modal) ov.hidden = true; }, 520);
    if (!silent && ovReturn && ovReturn.focus) ovReturn.focus({ preventScroll: true });
  }
  function trapOv(e) {
    if (!modal || e.key !== 'Tab') return;
    var f = $$('#ov a[href], #ov button').filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], lastF = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
    else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
  }

  /* ---------- 공지·신청 폼 ---------- */
  function bindNotices() {
    $('#ntList').addEventListener('click', function (e) {
      var b = e.target.closest('.nt-btn');
      if (!b) return;
      var li = b.closest('.nt-item'), open = !li.classList.contains('is-open'), id = li.getAttribute('data-id');
      li.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) openNotices[id] = 1; else delete openNotices[id];
    });
  }
  function bindForm() {
    var form = $('#apForm'), err = $('#apErr'), done = $('#apDone');
    C.bindEntryForm(form, {
      onSuccess: function (entry) {
        err.textContent = '';
        $('#apNo').textContent = entry.no;
        form.hidden = true;
        done.hidden = false;
        done.focus({ preventScroll: true });
      },
      onError: function (msg) { err.textContent = msg; }
    });
    $('#apAgain').addEventListener('click', function () {
      done.hidden = true;
      form.hidden = false;
      err.textContent = '';
      $('#f-name').focus();
    });
  }

  /* ---------- 공통 UI 바인딩 ---------- */
  function bindUI() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;
      var j = t.closest('[data-jump]');
      if (j) { onJumpClick(e, j); return; }
      var n = t.closest('[data-next]');
      if (n) { if (!flow) { e.preventDefault(); next(); } return; }
      var hit = t.closest('.x-hit');
      if (hit) {
        if (!flow && S[cur.i].el.contains(hit) && cur.step === 0 && !busy) stepTo(1);
        return;
      }
      var dash = t.closest('.ind-dash');
      if (dash) { goGroup(+dash.getAttribute('data-group')); return; }
      if (t.closest('#burger')) { toggleMnav(); return; }
      if (!t.closest('#mnav')) closeMnav();
    });
    $('#introBtn').addEventListener('click', function () {
      introPaused = !introPaused;
      if (introPaused) pauseVid(introVid); else playVid(introVid, false);
      updateIntroBtn();
    });
    $('#btnAll').addEventListener('click', function (e) { openOv(e.currentTarget); });
    $('#ovClose').addEventListener('click', function () { closeOv(); });
    $('#ov').addEventListener('click', function (e) { if (e.target === e.currentTarget) closeOv(); });
    document.addEventListener('keydown', trapOv);
    document.addEventListener('keydown', onKey);
    /* 장면 모드에서 포인터가 화면 위쪽에 오면 숨긴 헤더를 다시 보여 준다 */
    document.addEventListener('mousemove', function (e) {
      if (!flow && e.clientY < 84 && html.classList.contains('hd-hidden')) setHeader(true);
    }, { passive: true });

    /* 언어 전환은 새로고침 방식. 새로고침 뒤 같은 장면으로 돌아오도록 위치를 저장한다 */
    C.mountLangSwitcher($('#hdLang'), { reload: true });
    $('#hdLang').addEventListener('click', function (e) {
      var b = e.target.closest('[data-lang]');
      if (!b || b.getAttribute('data-lang') === C.lang) return;
      saveResume();
      try {
        var u = new URL(window.location.href);
        ['lang', 'scene', 'step'].forEach(function (k) { u.searchParams.delete(k); });
        window.history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (er) { /* 무시 */ }
    }, true);
  }
  var RESUME_KEY = 'cocoA.resume';
  function saveResume() {
    try { window.sessionStorage.setItem(RESUME_KEY, JSON.stringify({ i: cur.i, step: cur.step, flow: flow, y: window.scrollY })); } catch (e) { /* 무시 */ }
  }
  function readResume() {
    try {
      var r = JSON.parse(window.sessionStorage.getItem(RESUME_KEY) || 'null');
      window.sessionStorage.removeItem(RESUME_KEY);
      return r;
    } catch (e) { return null; }
  }

  /* ---------- 흐름 모드 (900px 이하 / 동작 줄이기) ---------- */
  var io = null, vio = null, flowTick = false;
  function observeRv() {
    if (!io) return;
    $$('[data-rv]').forEach(function (el) { if (!el.classList.contains('is-in')) io.observe(el); });
  }
  var debugEntry = false;
  function setupFlow() {
    /* ?scene 디버그 진입에서는 리빌 없이 바로 보이게 (스크린샷 확인용) */
    var rv = !MQ_RM.matches && !debugEntry && 'IntersectionObserver' in window;
    html.classList.toggle('rv-on', rv);
    if (rv) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      observeRv();
    }
    if ('IntersectionObserver' in window) {
      vio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting && en.intersectionRatio >= 0.3) {
            if (v === introVid) introPlay();
            else if (!MQ_RM.matches) playVid(v, false);
          } else pauseVid(v);
        });
      }, { threshold: [0, 0.3, 0.6] });
      $$('.stage video').forEach(function (v) { vio.observe(v); });
    }
    var fv = $('#film video');
    if (fv) fv.controls = true; /* 흐름 모드에서는 대회 홍보 영상을 직접 재생할 수 있게 */
    onFlowScroll();
  }
  function teardownFlow() {
    if (io) { io.disconnect(); io = null; }
    if (vio) { vio.disconnect(); vio = null; }
    html.classList.remove('rv-on');
    var fv = $('#film video');
    if (fv) fv.controls = false;
    $$('.stage video').forEach(pauseVid);
  }
  var flowCur = 0;
  function onFlowScroll() {
    if (!flow) return;
    var lim = (S[0] ? S[0].el.offsetHeight : 600) - 80;
    setTone(window.scrollY > lim ? 'dark' : 'light');
    flowCur = flowIndex(); /* 화면이 넓어져 장면 모드로 돌아갈 때 이어서 보여 줄 장면 */
  }
  /* GSAP 이 남긴 인라인 상태를 모두 지워 흐름 모드 CSS 가 그대로 적용되게 한다 */
  function clearAnim() {
    var els = $$('.stage [style], .ind [style]');
    if (HAS_GSAP && els.length) { G.killTweensOf(els); G.set(els, { clearProps: 'all' }); }
    els.forEach(function (el) { el.removeAttribute('style'); });
    $$('.stage [stroke-dashoffset]').forEach(function (el) { el.removeAttribute('stroke-dashoffset'); });
    $$('.pr-bg').forEach(function (z) { z.classList.remove('is-zoom'); });
    if (lastEl) lastEl.scrollTop = 0;
  }
  function scrollToScene(i, instant) {
    var s = S[i];
    if (!s) return;
    s.el.scrollIntoView({ block: 'start', behavior: instant ? 'instant' : (MQ_RM.matches ? 'auto' : 'smooth') });
  }
  function flowIndex() {
    var y = window.scrollY + window.innerHeight * 0.35, idx = 0;
    S.forEach(function (s, i) { if (s.el.offsetTop <= y) idx = i; });
    return idx;
  }
  function enterFlow(scrollI) {
    if (activeTl) { var t = activeTl; activeTl = null; t.progress(1); }
    cancelAuto();
    busy = false;
    flow = true;
    if (obs) obs.disable();
    S.forEach(function (s) { s.leave(0); });
    clearAnim();
    html.classList.remove('is-scenes', 'hd-hidden', 'at-last', 'hd-solid');
    html.classList.add('is-flow');
    setupFlow();
    if (scrollI) scrollToScene(scrollI, true);
  }
  function enterScenes(i, step) {
    teardownFlow();
    flow = false;
    html.classList.remove('is-flow');
    html.classList.add('is-scenes');
    window.scrollTo(0, 0);
    layout();
    if (!obs) bindObserver(); else obs.enable();
    S.forEach(hide);
    jumpTo(i || 0, step || 0, { animate: false, force: true });
  }
  function onModeChange() {
    var want = MQ_FLOW.matches || !HAS_GSAP;
    if (want === flow) return;
    if (want) enterFlow(cur.i);
    else enterScenes(flowCur, 0);
  }

  /* ---------- 시작 ---------- */
  function startIntro() {
    var s = S[0];
    s.reset(); show(s); lift(s);
    cur = { i: 0, step: 0 };
    setTone('light');
    setHeader(true);
    updateInd();
    s.enter(0, 1);
    var tl = G.timeline({ onComplete: function () { if (activeTl === tl) activeTl = null; s.set(0); } });
    tl.add(s.intro(), 0.15);
    activeTl = tl;
  }

  function init() {
    introVid = $('.in-vid');
    introPaused = MQ_RM.matches;
    if (MQ_RM.matches) introVid.removeAttribute('autoplay');
    buildDynamic();
    renderAll();
    buildInd();
    lastEl = $('.sc-last');
    buildScenes();
    bindUI();
    bindNotices();
    bindForm();
    bindLast();

    var q = new URLSearchParams(window.location.search);
    var qs = q.get('scene'), qScene = qs != null && qs !== '' && !isNaN(+qs) ? Math.max(0, Math.min(S.length - 1, +qs)) : null;
    var qStep = Math.max(0, (parseInt(q.get('step') || '1', 10) || 1) - 1);
    var resume = readResume();
    debugEntry = qScene != null;

    if (MQ_FLOW.matches || !HAS_GSAP) {
      flow = true;
      html.classList.remove('is-scenes');
      html.classList.add('is-flow');
      setupFlow();
      if (qScene) scrollToScene(qScene, true);
      else if (resume && resume.flow && resume.y) window.scrollTo(0, resume.y);
      else if (resume && !resume.flow && resume.i) scrollToScene(resume.i, true);
      introPlay();
    } else {
      layout();
      bindObserver();
      S.forEach(hide);
      if (qScene != null) jumpTo(qScene, qStep, { animate: false, force: true });
      else if (resume && !resume.flow) jumpTo(resume.i, resume.step, { animate: false, force: true });
      else startIntro();
    }
    if (MQ_FLOW.addEventListener) MQ_FLOW.addEventListener('change', onModeChange);
    else if (MQ_FLOW.addListener) MQ_FLOW.addListener(onModeChange);

    var rT = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rT);
      rT = setTimeout(function () {
        if (flow) return;
        layout();
        if (!activeTl) S[cur.i].set(cur.step);
      }, 120);
    });
    window.addEventListener('scroll', function () {
      if (!flow || flowTick) return;
      flowTick = true;
      window.requestAnimationFrame(function () { flowTick = false; onFlowScroll(); });
    }, { passive: true });

    /* 다른 탭에서 콘텐츠·언어가 바뀌면 다시 그린다. 장면 수가 바뀌면 같은 위치로 새로고침 */
    C.on(function (ev) {
      if (ev.type !== 'content' && ev.type !== 'lang') return;
      var d = C.get();
      if (d.statements.length !== shape.st || d.stories.length !== shape.stories || d.experiences.length !== shape.exp) {
        saveResume();
        window.location.reload();
        return;
      }
      renderAll();
      labelInd();
      if (flow) { observeRv(); return; }
      finish();
      S[cur.i].set(cur.step);
    });

    /* 첫 상태가 화면에 적용된 뒤 전환을 켠다 */
    void document.body.offsetWidth;
    setTimeout(function () { html.classList.remove('is-loading'); }, 60);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
