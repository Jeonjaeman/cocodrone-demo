/* COCODRONE 데모 B: 동남기업 레퍼런스(Lenis + GSAP ScrollTrigger) 문법 재현
 * 모든 콘텐츠는 Coco API 에서 읽어 그린다.
 * 디버그 진입점: ?goto=<섹션 id> (해당 섹션으로 즉시 이동 + 진입 연출 완료 상태), ?nointro=1, ?slide=2 */
(function () {
  'use strict';

  var C = window.Coco;
  if (!C) return;

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var params = new URLSearchParams(window.location.search);
  var GOTO = params.get('goto');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_GSAP = !!(gsap && ST);
  var MOTION = HAS_GSAP && !REDUCED;
  var root = document.documentElement;

  /* ?lang= 은 Coco 가 이미 저장했으므로 주소에서 지운다 (언어 버튼으로 바꾼 뒤 새로고침해도 쿼리가 덮어쓰지 않도록) */
  if (params.has('lang') && window.history.replaceState) {
    var q = new URLSearchParams(window.location.search);
    q.delete('lang');
    var qs = q.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
  }

  if (HAS_GSAP) gsap.registerPlugin(ST);
  if (!MOTION) root.classList.add('no-motion');

  /* ---------- 데모 B 전용 문구 (4개 언어) ---------- */
  var L = function (ko, en, ja, es) { return { ko: ko, en: en, ja: ja, es: es }; };
  var DICT = {
    'b.skip': L('본문 바로가기', 'Skip to content', '本文へ移動', 'Saltar al contenido'),
    'b.gnb': L('주 메뉴', 'Main menu', 'メインメニュー', 'Menú principal'),
    'b.lang': L('언어 선택', 'Language', '言語の選択', 'Idioma'),
    'b.prev': L('이전 슬라이드', 'Previous slide', '前のスライド', 'Diapositiva anterior'),
    'b.next': L('다음 슬라이드', 'Next slide', '次のスライド', 'Diapositiva siguiente'),
    'b.play': L('영상 재생', 'Play video', '映像を再生', 'Reproducir vídeo'),
    'b.pause': L('영상 일시정지', 'Pause video', '映像を一時停止', 'Pausar vídeo'),
    'b.course': L('대회 비행 코스 예시: 출발점에서 게이트 7개를 차례로 통과합니다.', 'Sample flight course: from the start, fly through seven gates in order.', '飛行コースの例：スタートから7つのゲートを順番に通過します。', 'Circuito de ejemplo: desde la salida, pasa por siete aros en orden.'),
    'b.lineup': L('{n}종의 종이드론', '{n} Paper Drones', '{n}種類のペーパードローン', '{n} drones de papel'),
    'b.outroApply': L('로그인 없이 누구나 바로 신청할 수 있습니다.', 'Anyone can apply right away, no login needed.', 'ログイン不要で、どなたでもすぐに申し込めます。', 'Cualquiera puede inscribirse ya, sin iniciar sesión.'),
    'b.outroStore': L('대회 연습용 키트와 전 제품을 스마트스토어에서 만나 보세요.', 'Find practice kits and every model in our online store.', '大会練習用キットと全製品をオンラインストアで。', 'Encuentra kits de práctica y todos los modelos en la tienda online.'),
    'b.footInfo': L('회사 정보', 'Company', '会社情報', 'Empresa'),
    'b.footLinks': L('바로가기', 'Quick links', 'クイックリンク', 'Accesos rápidos'),
    'b.newTab': L('(새 탭에서 열림)', '(opens in a new tab)', '（新しいタブで開きます）', '(se abre en una pestaña nueva)'),
    'b.filter': L('제품 분류', 'Product categories', '製品カテゴリー', 'Categorías de producto')
  };
  function T(k) { return DICT[k] ? C.tr(DICT[k]) : k; }

  /* ---------- 유틸 ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function D() { return C.get(); }
  function esc(s) { return C.esc(s); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function lines(s) { return String(s || '').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function linesHTML(s) { return lines(s).map(function (l) { return '<span class="line-unit">' + esc(l) + '</span>'; }).join(''); }
  function plain(s) { return String(s || '').replace(/\*\*/g, ''); }
  function img(path) { return C.asset(path); }
  function bg(el, path) { if (el && path) el.style.backgroundImage = 'url("' + img(path) + '")'; }

  /* 진입 연출 재생. ?goto 모드에서는 즉시 완료 상태로 */
  function play(tl) { if (!tl) return; if (GOTO) tl.progress(1); else tl.restart(); }

  /* ---------- 고정 문구 / 링크 ---------- */
  function applyB() {
    $$('[data-b]').forEach(function (el) { el.textContent = T(el.getAttribute('data-b')); });
    $$('[data-b-attr]').forEach(function (el) {
      el.getAttribute('data-b-attr').split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i > 0) el.setAttribute(pair.slice(0, i).trim(), T(pair.slice(i + 1).trim()));
      });
    });
  }
  function renderStatic() {
    var s = D().site;
    document.title = 'COCODRONE | ' + C.c('site.tagline');
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', C.c('site.slogan'));
    $$('[data-store]').forEach(function (a) { a.href = s.storeUrl; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-site="email"]').forEach(function (el) { el.textContent = s.email; if (el.tagName === 'A') el.href = 'mailto:' + s.email; });
    $$('[data-site="tel"]').forEach(function (el) { el.textContent = s.tel; if (el.tagName === 'A') el.href = 'tel:' + String(s.tel).replace(/[^+\d]/g, ''); });
    $$('[data-site="bizNo"]').forEach(function (el) { el.textContent = s.bizNo; });
  }

  /* ---------- Lenis (768px 이상에서만) ---------- */
  var lenis = null;
  if (MOTION && window.innerWidth >= 768 && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: function (t) { return 1 - Math.pow(1 - t, 4); },
      smoothWheel: true,
      wheelMultiplier: 0.9
    });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToY(y, immediate) {
    y = Math.max(0, y);
    if (lenis) lenis.scrollTo(y, { immediate: !!immediate, duration: 1, force: true });
    else window.scrollTo({ top: y, behavior: (immediate || REDUCED) ? 'instant' : 'smooth' });
  }
  function sectionTop(el) {
    var t = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
    return t.getBoundingClientRect().top + window.pageYOffset;
  }
  function lockScroll(on) {
    if (lenis) { if (on) lenis.stop(); else lenis.start(); }
  }

  /* 모바일: 히어로 높이를 innerHeight(px)로 1회 고정 (주소창 흔들림 방지) */
  if (window.innerWidth <= 768) root.style.setProperty('--visual-h', window.innerHeight + 'px');

  /* ---------- 헤더 ---------- */
  var header = $('#header');
  var topBtn = $('#topBtn');
  var menuOpen = false;
  var lastY = window.pageYOffset;
  var acc = 0;
  var ticking = false;

  function headerUpdate() {
    ticking = false;
    var y = window.pageYOffset;
    var dy = y - lastY;
    lastY = y;
    if (y <= 0) {
      header.classList.remove('header-hide', 'activated');
      acc = 0;
    } else if (!menuOpen) {
      if ((dy > 0 && acc < 0) || (dy < 0 && acc > 0)) acc = 0;
      acc += dy;
      if (acc > 12 && y > 80) header.classList.add('header-hide');
      else if (acc < -12) { header.classList.remove('header-hide'); header.classList.add('activated'); }
      var hero = $('#visual');
      if (hero && y > hero.offsetHeight - 100 && !header.classList.contains('header-hide')) header.classList.add('activated');
    }
    if (topBtn) topBtn.classList.toggle('is-show', y > 300);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(headerUpdate); }
  }, { passive: true });

  /* 메뉴 영역 hover → 헤더 흰 배경 (80ms 지연 후 닫힘) */
  (function () {
    var gnb = $('.gnb');
    if (!gnb) return;
    var t = null;
    function on() { clearTimeout(t); header.classList.add('menu-hover'); }
    function off() { clearTimeout(t); t = setTimeout(function () { header.classList.remove('menu-hover'); }, 80); }
    gnb.addEventListener('mouseenter', on);
    gnb.addEventListener('mouseleave', off);
    gnb.addEventListener('focusin', on);
    gnb.addEventListener('focusout', off);
  })();

  /* 언어 pill: 흰 원 인디케이터가 hover/선택 항목으로 이동, 클릭 시 저장 후 새로고침 */
  function mountLangPill() {
    var el = $('.lang-pill');
    if (!el) return;
    C.mountLangSwitcher(el, { format: 'code', reload: true, activeClass: 'on', className: 'lang-btn' });
    var ind = document.createElement('span');
    ind.className = 'lang-ind';
    ind.setAttribute('aria-hidden', 'true');
    el.appendChild(ind);
    function active() { return $('.lang-btn.on', el) || $('.lang-btn', el); }
    function moveTo(btn) {
      if (!btn) return;
      ind.style.left = (btn.offsetLeft + (btn.offsetWidth - ind.offsetWidth) / 2) + 'px';
      $$('.lang-btn', el).forEach(function (b) { b.classList.toggle('is-ind', b === btn); });
    }
    $$('.lang-btn', el).forEach(function (b) {
      b.addEventListener('mouseenter', function () { moveTo(b); });
      b.addEventListener('focus', function () { moveTo(b); });
    });
    el.addEventListener('mouseleave', function () { moveTo(active()); });
    el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) moveTo(active()); });
    el.classList.add('no-anim');
    moveTo(active());
    window.requestAnimationFrame(function () { el.classList.remove('no-anim'); });
    window.addEventListener('load', function () { moveTo(active()); });
  }

  /* 풀스크린 메뉴 */
  function initMenu() {
    var menu = $('#menu');
    var ham = $('.ham');
    if (!menu || !ham) return;
    C.mountLangSwitcher($('.m-lang', menu), { format: 'name', reload: true, activeClass: 'on', className: 'm-lang-btn' });
    function set(open) {
      menuOpen = open;
      menu.classList.toggle('open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.classList.toggle('menu-open', open);
      lockScroll(open);
      if (open) { var f = $('a, button', menu); window.setTimeout(function () { if (f) f.focus(); }, 60); }
      else ham.focus({ preventScroll: true });
    }
    ham.addEventListener('click', function () { set(!menuOpen); });
    $('.menu-close', menu).addEventListener('click', function () { set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) set(false); });
    menu.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a && menuOpen) { menuOpen = false; menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); ham.setAttribute('aria-expanded', 'false'); root.classList.remove('menu-open'); lockScroll(false); }
    });
  }

  /* 앵커 이동 (Lenis 사용 시 lenis.scrollTo) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    scrollToY(sectionTop(target), false);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    window.setTimeout(function () { target.focus({ preventScroll: true }); }, REDUCED ? 0 : 900);
  });

  if (topBtn) topBtn.addEventListener('click', function () { scrollToY(0, false); });

  /* ---------- 영상 공통: 실패 시 poster 로 대체 ---------- */
  function setupVideo(wrap, video, src, poster) {
    bg(wrap, poster);
    if (poster) video.poster = img(poster);
    video.muted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.addEventListener('error', function () { wrap.classList.add('is-failed'); });
    if (src) video.src = img(src); else wrap.classList.add('is-failed');
  }
  function tryPlay(v) {
    if (!v || v.parentNode.classList.contains('is-failed')) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* 자동 재생 차단 시 poster 유지 */ });
  }

  /* ---------- 0c 인트로 커튼 ---------- */
  function runIntro(done) {
    var intro = $('#intro');
    if (!root.classList.contains('has-intro') || !HAS_GSAP || !intro) {
      if (intro) intro.style.display = 'none';
      root.classList.add('intro-done');
      done();
      return;
    }
    try { window.localStorage.setItem('cocoB.introAt', String(Date.now())); } catch (e) { /* 저장 불가 시 매번 표시 */ }
    lockScroll(true);
    gsap.set('.intro .text-wrap p', { opacity: 0, y: 30 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to('.intro .text-wrap p', { opacity: 1, y: 0, duration: 2, delay: 0.5 })
      .to({}, { duration: 0.5 })
      .to('.intro .text-wrap', { opacity: 0, duration: 0.8 })
      .to('.intro .vertical.left', { width: '0%', duration: 1 }, '-=0.3')
      .to('.intro .vertical.right', { width: '0%', duration: 1 }, '<')
      .call(done, null, '<0.2')
      .to('.intro', {
        autoAlpha: 0, duration: 0.3, onComplete: function () {
          intro.style.display = 'none';
          root.classList.add('intro-done');
          lockScroll(false);
        }
      });
  }

  /* ---------- 1 히어로 (Swiper fade, 영상 길이 기반 자동 넘김) ---------- */
  var hero = { start: function () {} };
  function initHero() {
    var sec = $('#visual');
    if (!sec) return;
    var comp = D().competition || {};
    var medias = $$('.v-media', sec);
    var videos = medias.map(function (m) {
      var v = $('video', m);
      var src = m.getAttribute('data-src');
      var poster = m.getAttribute('data-poster');
      if (m.getAttribute('data-src-from') === 'competition' && comp.video) {
        src = comp.video.src || src;
        poster = comp.video.poster || poster;
      }
      setupVideo(m, v, src, poster);
      return v;
    });
    var texts = $$('.v-text', sec);
    var N = medias.length;
    var cur = $('.v-cur', sec);
    var tot = $('.v-tot', sec);
    var line = $('.v-line i', sec);
    var bar = $('.v-bar div', sec);
    var idx = 0;
    var timer = null;
    var barTween = null;
    var started = false;
    var swiper = null;
    tot.textContent = pad(N);

    function setText(i) {
      texts.forEach(function (t, k) {
        t.classList.remove('is-active-anim');
        if (k === i) { void t.offsetWidth; t.classList.add('is-active-anim'); }
      });
    }
    function setCounter(i) {
      cur.textContent = pad(i + 1);
      line.style.width = (100 / N * (i + 1)) + '%';
    }
    function schedule() {
      window.clearTimeout(timer);
      if (barTween) barTween.kill();
      if (!started || REDUCED) return;
      var v = videos[idx];
      var remain = 8000;
      if (v && !v.parentNode.classList.contains('is-failed') && isFinite(v.duration) && v.duration > 0) {
        remain = Math.max(1000, (v.duration - v.currentTime) * 1000);
      }
      if (HAS_GSAP) barTween = gsap.fromTo(bar, { width: '0%' }, { width: '100%', duration: remain / 1000, ease: 'none' });
      timer = window.setTimeout(function () { go((idx + 1) % N); }, remain);
    }
    function activate(i) {
      idx = i;
      setCounter(i);
      setText(i);
      videos.forEach(function (v, k) {
        if (k === i) { try { v.currentTime = 0; } catch (e) { /* 메타데이터 전 */ } if (!REDUCED) tryPlay(v); }
        else v.pause();
      });
      schedule();
    }
    function go(i) {
      if (swiper) swiper.slideTo(i);
      else {
        $$('.swiper-slide', sec).forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
        activate(i);
      }
    }
    videos.forEach(function (v, k) {
      v.addEventListener('loadedmetadata', function () { if (k === idx && started) schedule(); });
      v.addEventListener('error', function () { if (k === idx && started) schedule(); });
    });

    if (window.Swiper) {
      swiper = new window.Swiper($('.visual-swiper', sec), {
        slidesPerView: 1, effect: 'fade', fadeEffect: { crossFade: true }, speed: 1000,
        allowTouchMove: false, simulateTouch: false,
        on: { slideChangeTransitionStart: function (s) { if (started) activate(s.activeIndex); } }
      });
    } else {
      sec.classList.add('no-swiper');
      $$('.swiper-slide', sec)[0].classList.add('is-on');
    }
    var first = Math.min(N - 1, Math.max(0, (parseInt(params.get('slide'), 10) || 1) - 1));
    if (first && swiper) swiper.slideTo(first, 0, false);
    idx = first;
    setCounter(first);

    $('.v-arrow.prev', sec).addEventListener('click', function () { go((idx - 1 + N) % N); });
    $('.v-arrow.next', sec).addEventListener('click', function () { go((idx + 1) % N); });

    /* 화면 밖에서는 영상 일시정지 */
    if (HAS_GSAP) {
      ST.create({
        trigger: sec, start: 'top top', end: 'bottom top',
        onLeave: function () { videos[idx].pause(); },
        onEnterBack: function () { if (!REDUCED) tryPlay(videos[idx]); }
      });
    }

    hero.start = function () {
      if (started) return;
      started = true;
      activate(idx);
    };
  }

  /* ---------- 2 About ---------- */
  function renderAbout() {
    var tit = $('.about-tit');
    if (tit) tit.innerHTML = linesHTML(C.c('site.tagline'));
    var why = D().why || {};
    var line = $('.info-line');
    if (line) line.innerHTML = linesHTML(C.tr((why.body || [])[0]));
    bg($('#who'), 'assets/img/b-about.jpg');
  }

  /* ---------- 3 대회 ---------- */
  function catmull(pts) {
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ' ' + p2[0] + ' ' + p2[1];
    }
    return d;
  }
  var COURSE = [[130, 430], [262, 300], [380, 160], [540, 228], [624, 398], [786, 440], [884, 292], [792, 128]];
  function courseSVG() {
    var d = catmull(COURSE);
    var line = 'fill="none" stroke="#1f2c41" stroke-width="2"';
    var s = '<svg viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(T('b.course')) + '">' +
      '<defs>' +
        '<pattern id="cGrid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,.06)"/></pattern>' +
        '<mask id="cMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="560"><path class="c-mask" d="' + d + '" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/></mask>' +
      '</defs>' +
      '<g class="c-court">' +
        '<rect x="40" y="40" width="920" height="480" rx="26" fill="rgba(31,44,65,.38)"/>' +
        '<rect x="40" y="40" width="920" height="480" rx="26" fill="url(#cGrid)"/>' +
        '<rect x="40" y="40" width="920" height="480" rx="26" ' + line + '/>' +
        '<line x1="500" y1="40" x2="500" y2="520" ' + line + '/>' +
        '<circle cx="500" cy="280" r="66" ' + line + '/>' +
        '<path d="M40 196 H176 V364 H40" ' + line + '/>' +
        '<path d="M960 196 H824 V364 H960" ' + line + '/>' +
        '<path d="M176 222 A58 58 0 0 1 176 338" ' + line + '/>' +
        '<path d="M824 222 A58 58 0 0 0 824 338" ' + line + '/>' +
      '</g>' +
      '<path class="c-route" d="' + d + '" fill="none" stroke="rgba(255,255,255,.62)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 13" mask="url(#cMask)"/>';
    COURSE.slice(1).forEach(function (p, i) {
      s += '<g class="c-gate" transform="translate(' + p[0] + ' ' + p[1] + ')">' +
        '<circle class="c-wave" r="12" fill="#fff" style="animation-delay:' + ((i % 3) * 2) + 's"/>' +
        '<g class="c-pin">' +
          '<path d="M0 0 C-4 -6 -12 -13 -12 -21 A12 12 0 1 1 12 -21 C12 -13 4 -6 0 0Z" fill="#fff"/>' +
          '<circle cy="-21" r="4.5" fill="#000D1D"/>' +
          '<text class="c-num" x="18" y="-24">' + pad(i + 1) + '</text>' +
        '</g></g>';
    });
    var st = COURSE[0];
    s += '<g class="c-drone" transform="translate(' + st[0] + ' ' + st[1] + ')">' +
      '<circle class="c-ring" r="62"/><circle class="c-ring" r="62" style="animation-delay:.5s"/>' +
      '<circle class="c-ring" r="62" style="animation-delay:1s"/><circle class="c-ring" r="62" style="animation-delay:1.5s"/>' +
      '<circle r="13" fill="none" stroke="#00A1DA" stroke-opacity=".55"/>' +
      '<circle r="6.5" fill="#00A1DA"/>' +
      '<g transform="translate(0 -34)"><rect x="-36" y="-14" width="72" height="28" rx="14" fill="#fff"/>' +
      '<text class="c-label-t" text-anchor="middle" y="4.5">START</text></g>' +
      '</g></svg>';
    return s;
  }
  function renderCompetition() {
    var comp = D().competition || {};
    var tit = $('.g-title');
    if (tit) tit.innerHTML = linesHTML(C.tr(comp.name));
    var stats = D().stats || [];
    var ul = $('.g-stats');
    if (ul) {
      ul.innerHTML = stats.map(function (s) {
        var v = Number(s.value) || 0;
        return '<li><span class="lab">' + esc(C.tr(s.label)) + '</span>' +
          '<span class="num" data-count="' + v + '" data-suffix="' + esc(s.suffix || '') + '">' + v + esc(s.suffix || '') + '</span></li>';
      }).join('');
    }
    var map = $('.g-map');
    if (map && !map.firstChild) map.innerHTML = courseSVG();
    var sum = $('.g-summary');
    if (sum) sum.textContent = C.tr(comp.summary);
    var sample = $('.g-sample');
    if (sample) { sample.hidden = !comp.sample; sample.textContent = C.t('label.sample'); }

    var info = comp.info || [];
    var divs = comp.divisions || [];
    var sched = comp.schedule || [];
    var html = '';
    if (info.length) {
      html += '<div class="g-row"><h3 class="g-row-head">' + esc(C.t('comp.infoTitle')) + '</h3>' +
        '<dl class="g-cells" style="--n:' + Math.min(info.length, 4) + '">' + info.map(function (it) {
          return '<div class="g-cell"><dt>' + esc(C.tr(it.label)) + '</dt><dd>' + esc(C.tr(it.value)) + '</dd></div>';
        }).join('') + '</dl></div>';
    }
    if (divs.length) {
      html += '<div class="g-row"><h3 class="g-row-head">' + esc(C.t('comp.divisionTitle')) + '</h3>' +
        '<ul class="g-cells" style="--n:' + Math.min(divs.length, 4) + '">' + divs.map(function (dv, i) {
          return '<li class="g-div"><span class="g-k">' + pad(i + 1) + '</span><h3>' + esc(C.tr(dv.name)) + '</h3><p>' + esc(C.tr(dv.desc)) + '</p></li>';
        }).join('') + '</ul></div>';
    }
    if (sched.length) {
      html += '<div class="g-row"><h3 class="g-row-head">' + esc(C.t('comp.scheduleTitle')) + '</h3>' +
        '<ol class="g-sched" style="--n:' + Math.min(sched.length, 6) + '">' + sched.map(function (sc) {
          return '<li><time>' + esc(sc.time) + '</time><span>' + esc(C.tr(sc.title)) + '</span></li>';
        }).join('') + '</ol></div>';
    }
    var tb = $('.g-table');
    if (tb) tb.innerHTML = html;
  }

  /* ---------- 4 대회 홍보 영상 ---------- */
  var film = { video: null, userPaused: false, opened: false };
  function renderFilm() {
    var sec = $('#film');
    if (!sec) return;
    var comp = D().competition || {};
    var v = comp.video || {};
    var floor = $('.floor', sec);
    film.video = $('video', floor);
    setupVideo(floor, film.video, v.src || 'assets/video/comp-promo.mp4', v.poster || 'assets/img/a-compete.jpg');
    /* 문장 부호 단위로 나눠 순서대로 켠다 */
    var tag = C.tr(comp.tagline);
    var parts = tag.split(/(?<=[,.、。!?！？])\s*/).filter(Boolean);
    $('.biz-title h2', sec).innerHTML = parts.map(function (p) { return '<span>' + esc(p) + '</span>'; }).join(' ');

    var btn = $('.film-toggle', sec);
    function sync() {
      var paused = film.video.paused;
      btn.classList.toggle('is-paused', paused);
      btn.setAttribute('aria-pressed', paused ? 'false' : 'true');
      btn.setAttribute('aria-label', paused ? T('b.play') : T('b.pause'));
    }
    film.video.addEventListener('play', sync);
    film.video.addEventListener('pause', sync);
    film.video.addEventListener('error', function () { btn.classList.remove('is-show'); });
    btn.addEventListener('click', function () {
      if (film.video.paused) { film.userPaused = false; tryPlay(film.video); }
      else { film.userPaused = true; film.video.pause(); }
    });
    sync();
    film.setOpen = function (open) {
      film.opened = open;
      var ok = !floor.classList.contains('is-failed');
      btn.classList.toggle('is-show', open && ok);
    };
    film.state = function (p) {
      if (p > 0.15 && !film.userPaused && !REDUCED) tryPlay(film.video);
      else if (p < 0.05) film.video.pause();
      film.setOpen(p > 0.85);
    };
  }

  /* ---------- 5 3분할 패널 ---------- */
  var PANELS = [['MAKE', 'assets/img/b-panel1.jpg'], ['CODE', 'assets/img/b-panel2.jpg'], ['FLY', 'assets/img/b-panel3.jpg']];
  function renderPrograms() {
    var ul = $('#programs ul');
    if (!ul) return;
    var exps = D().experiences || [];
    var items = PANELS.map(function (p) {
      var e = exps.filter(function (x) { return x.key === p[0]; })[0];
      return e ? { e: e, img: p[1] } : null;
    }).filter(Boolean);
    ul.innerHTML = items.map(function (it) {
      var title = lines(C.tr(it.e.title)).map(esc).join('<br>');
      var desc = plain(C.tr(it.e.detail).split(/\n\s*\n/)[0]);
      return '<li><a class="w-item" href="#products">' +
        '<div class="w-bg" style="background-image:url(&quot;' + esc(img(it.img)) + '&quot;)"></div>' +
        '<div class="w-txt"><h5 lang="en">' + esc(it.e.key) + '</h5><h2>' + title + '</h2>' +
        '<p class="w-desc">' + esc(desc) + '</p><span class="w-arrow" aria-hidden="true"></span></div>' +
        '<div class="vertical" aria-hidden="true"></div></a></li>';
    }).join('');
    ul.style.setProperty('--count', Math.max(1, items.length));
  }

  /* ---------- 제품 ---------- */
  var currentCat = '';
  function catName(id) {
    var c = (D().categories || []).filter(function (x) { return x.id === id; })[0];
    return c ? C.tr(c.name) : '';
  }
  function renderChips() {
    var box = $('.chips');
    if (!box) return;
    var cats = D().categories || [];
    var list = [{ id: '', label: C.t('products.all') }].concat(cats.map(function (c) { return { id: c.id, label: C.tr(c.name) }; }));
    box.innerHTML = list.map(function (c) {
      var on = c.id === currentCat;
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-cat="' + esc(c.id) + '" aria-pressed="' + on + '">' + esc(c.label) + '</button>';
    }).join('');
  }
  function renderProducts(animate) {
    var grid = $('.p-grid');
    if (!grid) return;
    var list = C.products(currentCat ? { category: currentCat } : {});
    grid.innerHTML = list.map(function (p) {
      var name = C.tr(p.name);
      var hover = p.hoverImage && p.hoverImage !== p.image ? '<img class="p-hover" src="' + esc(img(p.hoverImage)) + '" alt="" loading="lazy" onerror="this.remove()">' : '';
      var badges = '<span class="p-badge">' + esc(catName(p.category)) + '</span>' +
        (p.featured ? '<span class="p-badge is-feat">' + esc(C.t('products.featured')) + '</span>' : '');
      return '<li class="p-card"><a href="' + esc(p.link || D().site.storeUrl) + '" target="_blank" rel="noopener">' +
        '<div class="p-thumb"><img class="p-main" src="' + esc(img(p.image)) + '" alt="' + esc(name) + '" loading="lazy">' + hover + '</div>' +
        '<div class="p-info"><div class="p-badges">' + badges + '</div>' +
        '<h3 class="p-name">' + esc(name) + '</h3>' +
        '<p class="p-desc">' + esc(C.tr(p.desc)) + '</p>' +
        '<p class="p-price"><span>' + esc(C.t('products.priceNote')) + '</span><i aria-hidden="true"></i></p>' +
        '<span class="sr-only">' + esc(T('b.newTab')) + '</span></div></a></li>';
    }).join('');
    $$('.p-main', grid).forEach(function (im) {
      im.addEventListener('error', function () {
        var th = im.parentNode;
        th.classList.add('is-empty');
        th.textContent = 'COCODRONE';
      });
    });
    if (animate && MOTION) gsap.from($$('.p-card', grid), { opacity: 0, y: 24, duration: 0.5, stagger: 0.04, ease: 'power2.out' });
  }
  function initProducts() {
    var box = $('.chips');
    if (!box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      currentCat = b.getAttribute('data-cat');
      $$('.chip', box).forEach(function (c) {
        var on = c === b;
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      renderProducts(true);
      if (HAS_GSAP) ST.refresh();
    });
  }

  /* ---------- 6 라인업 마퀴 ---------- */
  var LINEUP = ['p-ladybug', 'p-bee', 'p-firefly', 'p-turtleship', 'p-cheomseongdae', 'p-tiger', 'p-whale', 'p-cherry'];
  function renderLineup() {
    var stats = D().stats || [];
    var n = stats[0] ? stats[0].value : '';
    var t = T('b.lineup').replace('{n}', n);
    var h = $('.l-title');
    if (h) {
      h.setAttribute('aria-label', t);
      h.innerHTML = Array.prototype.map.call(t, function (ch) {
        return ch === ' ' ? ' ' : '<span class="ch" aria-hidden="true">' + esc(ch) + '</span>';
      }).join('');
    }
    var tracks = $$('#lineup .track');
    tracks.forEach(function (tr, k) {
      var order = k ? LINEUP.slice().reverse() : LINEUP;
      var set = order.map(function (f) { return '<img src="' + esc(img('assets/img/' + f + '.jpg')) + '" alt="" loading="lazy">'; }).join('');
      tr.innerHTML = set + set + set + set;
    });
    syncMarquee();
  }
  /* 두 줄의 px/s 를 같게: 이동 거리(scrollWidth*0.5) / 평균 속도(기준 30초) */
  function syncMarquee() {
    var tracks = $$('#lineup .track');
    if (!tracks.length) return;
    var dist = tracks.map(function (t) { return t.scrollWidth * 0.5; });
    var avg = dist.reduce(function (a, b) { return a + b; }, 0) / dist.length;
    if (!avg) return;
    var pxs = avg / 30;
    tracks.forEach(function (t, i) { t.style.setProperty('--partner-marquee-duration', (dist[i] / pxs).toFixed(2) + 's'); });
  }

  /* ---------- 공지 ---------- */
  function renderNotices() {
    var ul = $('.nt-list');
    if (!ul) return;
    var list = C.notices();
    if (!list.length) { ul.innerHTML = '<li class="nt-empty">' + esc(C.t('notice.empty')) + '</li>'; return; }
    var normal = list.filter(function (n) { return !n.pinned; });
    ul.innerHTML = list.map(function (n, i) {
      var id = 'nt-' + esc(n.id || i);
      var no = n.pinned ? '<span class="nt-pin">' + esc(C.t('label.pinned')) + '</span>'
        : '<span class="nt-no">' + (normal.length - normal.indexOf(n)) + '</span>';
      return '<li class="nt-item">' +
        '<button type="button" class="nt-head" aria-expanded="false" aria-controls="' + id + '">' + no +
          '<span class="nt-title">' + esc(C.tr(n.title)) + '</span>' +
          '<time class="nt-date" datetime="' + esc(n.date) + '">' + esc(C.fmtDate(n.date)) + '</time>' +
          '<span class="nt-ico" aria-hidden="true"></span></button>' +
        '<div class="nt-body" id="' + id + '" role="region" aria-hidden="true"><div><div class="in">' + C.rich(C.tr(n.body)) + '</div></div></div></li>';
    }).join('');
  }
  function initNotices() {
    var ul = $('.nt-list');
    if (!ul) return;
    ul.addEventListener('click', function (e) {
      var b = e.target.closest('.nt-head');
      if (!b) return;
      var li = b.parentNode;
      var open = !li.classList.contains('open');
      li.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      $('.nt-body', li).setAttribute('aria-hidden', open ? 'false' : 'true');
      if (HAS_GSAP) window.setTimeout(function () { ST.refresh(); }, 450);
    });
  }

  /* ---------- 참가 신청 ---------- */
  function renderDivisions() {
    var box = $('.f-radios');
    if (!box) return;
    var cur = (box.querySelector('input:checked') || {}).value;
    box.innerHTML = (D().competition.divisions || []).map(function (d) {
      return '<label class="f-radio"><input type="radio" name="division" value="' + esc(d.id) + '"' + (d.id === cur ? ' checked' : '') + '><span>' + esc(C.tr(d.name)) + '</span></label>';
    }).join('');
  }
  function initApply() {
    var form = $('.ap-form');
    var done = $('.ap-done');
    if (!form) return;
    var msg = $('.f-msg', form);
    function clearErr() { $$('.is-error', form).forEach(function (el) { el.classList.remove('is-error'); }); msg.textContent = ''; }
    form.addEventListener('input', clearErr);
    form.addEventListener('change', clearErr);
    C.bindEntryForm(form, {
      onSuccess: function (entry) {
        clearErr();
        $('.ap-no dd', done).textContent = entry.no;
        form.hidden = true;
        done.hidden = false;
        done.focus();
        if (HAS_GSAP) ST.refresh();
      },
      onError: function (message, key) {
        clearErr();
        msg.textContent = message;
        var f = form.elements;
        var first = null;
        function mark(el, row) { if (row) row.classList.add('is-error'); if (!first) first = el; }
        if (key === 'form.errRequired') {
          ['name', 'phone', 'email'].forEach(function (n) { if (!f[n].value.trim()) mark(f[n], f[n].closest('.f-row')); });
          if (!form.querySelector('input[name="division"]:checked')) mark(form.querySelector('input[name="division"]'), $('.f-division', form));
        } else if (key === 'form.errEmail') mark(f.email, f.email.closest('.f-row'));
        else if (key === 'form.errAgree') mark(f.agree, $('.f-agree', form));
        if (first) first.focus();
      }
    });
    $('.ap-again', done).addEventListener('click', function () {
      done.hidden = true;
      form.hidden = false;
      var n = form.elements.name;
      if (n) n.focus();
      if (HAS_GSAP) ST.refresh();
    });
  }

  /* ---------- Outro ---------- */
  function renderOutro() { bg($('#outro'), 'assets/img/b-outro.jpg'); }

  /* =========================================================
     스크롤 연출 (GSAP ScrollTrigger): 수치는 분석 문서 5.3 그대로
     ========================================================= */
  var filmST = null;
  var filmTL = null;

  /* 줄 단위 등장: y34 → 0, .9s, stagger .24, sine.out. 진입/재진입 시 재생, 위로 벗어나면 리셋 */
  function lineReveal(trigger, targets, start, end, extra) {
    targets = targets.filter(Boolean);
    if (!targets.length) return null;
    gsap.set(targets, { opacity: 0, y: 34 });
    var tl = gsap.timeline({ paused: true });
    tl.to(targets, { opacity: 1, y: 0, duration: 0.9, stagger: 0.24, ease: 'sine.out' });
    if (extra) extra(tl);
    ST.create({
      trigger: trigger, start: start, end: end,
      onEnter: function () { play(tl); },
      onEnterBack: function () { play(tl); },
      onLeaveBack: function () { tl.pause(0); }
    });
    return tl;
  }

  function fadeUp(selector, startPos) {
    var els = $$(selector);
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 40 });
    ST.batch(els, {
      start: startPos || 'top 90%',
      once: true,
      onEnter: function (batch) {
        if (GOTO) gsap.set(batch, { opacity: 1, y: 0 });
        else gsap.to(batch, { opacity: 1, y: 0, duration: 1, delay: 0.2, stagger: 0.08, ease: 'power2.out', overwrite: true });
      }
    });
  }

  function countUp(on) {
    $$('.g-stats .num').forEach(function (el) {
      var target = Number(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      gsap.killTweensOf(el);
      if (!on) { el.textContent = '0' + suffix; return; }
      if (GOTO) { el.textContent = target + suffix; return; }
      var o = { v: 0 };
      gsap.to(o, {
        v: target, duration: 2, ease: 'power2.out',
        onUpdate: function () { el.textContent = String(Math.round(o.v)) + suffix; },
        onComplete: function () { el.textContent = String(target) + suffix; }
      });
    });
  }

  function initMotion() {
    if (!MOTION) {
      if (film.setOpen) film.setOpen(true);
      return;
    }
    ST.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();

    /* About 타이틀 / 문구 (1024px 이하는 정적) */
    mm.add('(min-width: 1025px)', function () {
      lineReveal('.about-inner', [$('.about-inner .small-txt')].concat($$('.about-tit .line-unit')), 'top 86%', 'bottom 58%');
      lineReveal('.who-inner', $$('.info-line .line-unit'), 'top 92%', 'bottom 20%', function (tl) {
        var btn = $('.who-we-are .btn-box');
        gsap.set(btn, { opacity: 0, y: 18 });
        tl.to(btn, { opacity: 1, y: 0, duration: 0.52, ease: 'sine.out' }, '+=0.12');
      });
    });

    /* 대회 타이틀: kicker 1.15s power2.out → 0.22s 뒤 타이틀 줄 stagger .3 */
    (function () {
      var kicker = $('.g-tit .small-txt');
      var tl = $$('.g-title .line-unit');
      var btn = $('.g-btn');
      gsap.set([kicker, btn], { opacity: 0, y: 34 });
      gsap.set(tl, { opacity: 0, y: 34 });
      var t = gsap.timeline({ paused: true });
      t.to(kicker, { opacity: 1, y: 0, duration: 1.15, ease: 'power2.out' })
        .to(tl, { opacity: 1, y: 0, duration: 1.15, stagger: 0.3, ease: 'power2.out' }, 0.22)
        .to(btn, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0.4);
      ST.create({
        trigger: '#competition', start: 'top 70%', end: 'bottom 35%',
        onEnter: function () { play(t); }, onEnterBack: function () { play(t); },
        onLeaveBack: function () { t.pause(0); }
      });
    })();

    /* 숫자 카운터: 진입/재진입 시 0 → 목표값(2s), 이탈 시 0 */
    countUp(false);
    ST.create({
      trigger: '#competition', start: 'top center', end: 'bottom center',
      onEnter: function () { countUp(true); }, onEnterBack: function () { countUp(true); },
      onLeave: function () { countUp(false); }, onLeaveBack: function () { countUp(false); }
    });

    /* 비행 코스: 바닥 페이드 .28s → 점선 경로가 그려지고 → 게이트 핀이 순서대로 */
    (function () {
      var svg = $('.g-map svg');
      if (!svg) return;
      var maskPath = $('.c-mask', svg);
      var len = maskPath.getTotalLength();
      var pins = $$('.c-pin', svg);
      var drone = $('.c-drone', svg);
      gsap.set(svg, { opacity: 0 });
      gsap.set(maskPath, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(pins, { opacity: 0, y: 20 });
      gsap.set(drone, { opacity: 0 });
      var t = gsap.timeline({ paused: true });
      t.to(svg, { opacity: 1, duration: 0.28, ease: 'power2.out' })
        .to(drone, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.05)
        .to(maskPath, { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 0.1)
        .to(pins, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out', stagger: 0.2 }, 0.25);
      ST.create({
        trigger: '.g-map', start: 'top 82%', end: 'bottom 25%',
        onEnter: function () { play(t); }, onEnterBack: function () { play(t); },
        onLeaveBack: function () { t.pause(0); }
      });
    })();

    fadeUp('.g-summary-wrap, .g-row');

    /* 대회 홍보 영상: pin + scrub 0.8, clip-path inset(70% 10% 0 10%) → inset(0) */
    var small = $('.biz-title small');
    var spans = $$('.biz-title h2 span');
    mm.add('(min-width: 769px)', function () {
      gsap.set([small].concat(spans), { opacity: 0, y: 24 });
      filmTL = gsap.timeline({
        scrollTrigger: {
          trigger: '#film', start: 'top top', end: '+=60%', scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { film.state(self.progress); }
        }
      });
      filmTL.to('.floor', { delay: 0.5, clipPath: 'inset(0% 0% 0% 0%)', ease: 'power1.out' })
        .to(small, { opacity: 1, y: 0, ease: 'sine.out', duration: 0.7 }, '+=0.25')
        .to(spans, { opacity: 1, y: 0, stagger: 0.22, ease: 'power2.out', duration: 0.9 }, '+=0.15');
      filmST = filmTL.scrollTrigger;
      return function () { filmST = null; filmTL = null; };
    });
    mm.add('(max-width: 768px)', function () {
      gsap.set([small].concat(spans), { opacity: 0, y: 24 });
      filmTL = gsap.timeline({
        scrollTrigger: {
          trigger: '#film', start: 'top 78%', end: 'top 28%', scrub: true,
          onUpdate: function (self) { film.state(self.progress); }
        }
      });
      filmTL.to('.floor', { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' })
        .to(small, { opacity: 1, y: 0, ease: 'none', duration: 0.7 })
        .to(spans, { opacity: 1, y: 0, stagger: 0.22, ease: 'none', duration: 0.9 });
      filmST = filmTL.scrollTrigger;
      return function () { filmST = null; filmTL = null; };
    });
    ST.create({
      trigger: '#film', start: 'top bottom', end: 'bottom top',
      onLeave: function () { film.video.pause(); },
      onLeaveBack: function () { film.video.pause(); },
      onEnterBack: function () { if (film.opened && !film.userPaused) tryPlay(film.video); }
    });

    /* 3분할 패널: 흰 커튼이 홀수 열은 위로, 짝수 열은 아래로 걷힘 → 텍스트 stagger .1 (최초 1회) */
    (function () {
      var odd = $$('#programs li:nth-child(odd) .vertical');
      var even = $$('#programs li:nth-child(even) .vertical');
      var txt = $$('#programs .w-txt');
      gsap.set(txt, { opacity: 0, y: 40 });
      var t = gsap.timeline({ paused: true });
      t.to(odd, { yPercent: -100, ease: 'power3.inOut', duration: 0.5 }, 0)
        .to(even, { yPercent: 100, ease: 'power3.inOut', duration: 0.5 }, 0)
        .to(txt, { opacity: 1, y: 0, stagger: 0.1, ease: 'power3.out', duration: 0.5 }, '-=0.5');
      ST.create({ trigger: '#programs', start: 'top center', end: 'top top', once: true, onEnter: function () { play(t); } });
    })();

    /* 제품 섹션 머리 + 카드 */
    lineReveal('#products .sec-head', $$('#products .sec-head > *'), 'top 86%', 'bottom 40%');
    fadeUp('#products .chips');
    fadeUp('#products .p-card');
    fadeUp('#products .p-more');

    /* 라인업 타이틀: 글자 opacity 0 → 1, stagger .05, scrub 1 */
    (function () {
      var chars = $$('.l-title .ch');
      if (!chars.length) return;
      var tw = gsap.fromTo(chars, { opacity: 0 }, {
        opacity: 1, stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: '#lineup', start: 'top center', end: 'center center', scrub: 1 }
      });
      if (GOTO === 'lineup') tw.progress(1);
    })();
    fadeUp('#lineup .sub_title');

    /* 공지 / 신청 / Outro (서브 페이지의 fade-up 1000ms + 200ms 지연) */
    fadeUp('#notice .title');
    fadeUp('#notice .nt-item', 'top 95%');
    fadeUp('#apply .ap-info');
    fadeUp('#apply .ap-form-wrap');
    fadeUp('#footer .f-title', 'top 92%');
  }

  /* ---------- ?goto=<id> : 즉시 이동 + 연출 완료 상태 ---------- */
  function doGoto() {
    if (!GOTO) return;
    var el = document.getElementById(GOTO);
    if (!el) return;
    var y;
    if (GOTO === 'film' && filmST && window.innerWidth > 768) y = filmST.end;
    else y = sectionTop(el) - (GOTO === 'lineup' ? header.offsetHeight + 40 : 0);
    scrollToY(y, true);
    if (HAS_GSAP) {
      ST.update();
      if (GOTO === 'film' && filmTL) { filmTL.progress(1); film.state(1); }
    }
    lastY = window.pageYOffset;
    if (y > 0) { header.classList.remove('header-hide'); header.classList.add('activated'); }
    if (topBtn) topBtn.classList.toggle('is-show', y > 300);
  }

  /* ---------- 실행 ---------- */
  function renderAll() {
    applyB();
    renderStatic();
    renderAbout();
    renderCompetition();
    renderPrograms();
    renderChips();
    renderProducts(false);
    renderLineup();
    renderNotices();
    renderDivisions();
    renderOutro();
  }

  renderAll();
  mountLangPill();
  initMenu();
  initHero();
  renderFilm();
  initProducts();
  initNotices();
  initApply();
  initMotion();

  runIntro(function () { hero.start(); });

  function ready() {
    syncMarquee();
    if (HAS_GSAP) ST.refresh();
    window.requestAnimationFrame(function () {
      doGoto();
      if (GOTO && HAS_GSAP) window.setTimeout(function () { doGoto(); }, 300);
    });
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { syncMarquee(); if (HAS_GSAP) ST.refresh(); });

  /* 관리자(다른 탭)에서 콘텐츠를 저장하면 목록을 다시 그린다. 원격 언어 변경은 새로고침 */
  C.on(function (ev) {
    if (ev.type === 'lang') { window.location.reload(); return; }
    if (ev.type !== 'content') return;
    C.applyI18n(document);
    applyB();
    renderStatic();
    renderCompetition();
    renderChips();
    renderProducts(false);
    renderNotices();
    renderDivisions();
    renderLineup();
    if (HAS_GSAP) ST.refresh();
  });
})();
