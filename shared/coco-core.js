/* COCODRONE 데모 공통 코어
 * 3개 데모가 함께 쓰는 데이터·다국어·신청 처리 계층.
 * 데모에서는 저장소로 localStorage를 쓴다. 실서비스에서는 이 파일의
 * load/save/submitEntry 만 DB(API) 호출로 바꾸면 화면 코드는 그대로 쓸 수 있다.
 *
 * 사용: <script src="../shared/coco-data.js"></script>
 *       <script src="../shared/coco-core.js"></script>
 */
(function () {
  'use strict';

  var SEED = window.COCO_SEED;
  if (!SEED) { console.error('[Coco] coco-data.js 를 먼저 불러와야 합니다.'); return; }

  var KEY = 'coco.content.v' + SEED.__v;
  var LANG_KEY = 'coco.lang';
  var ENTRY_KEY = 'coco.entries.v1';
  var LANGS = ['ko', 'en', 'ja', 'es'];
  var LANG_META = {
    ko: { code: 'KR', name: '한국어', locale: 'ko-KR' },
    en: { code: 'EN', name: 'English', locale: 'en-US' },
    ja: { code: 'JP', name: '日本語', locale: 'ja-JP' },
    es: { code: 'ES', name: 'Español', locale: 'es-ES' }
  };

  /* 이 스크립트 위치를 기준으로 사이트 루트를 구한다 (어느 폴더 깊이에서 불러도 자산 경로가 맞도록) */
  var ROOT = (function () {
    var s = document.currentScript;
    try { return new URL('..', s.src).href; } catch (e) { return '../'; }
  })();

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { window.localStorage.removeItem(k); } catch (e) { /* 무시 */ } }

  /* ---------- 콘텐츠 ---------- */
  var content = null;
  function load() {
    var raw = lsGet(KEY);
    if (raw) {
      try {
        var o = JSON.parse(raw);
        if (o && o.__v === SEED.__v) { o.ui = SEED.ui; return o; }
      } catch (e) { /* 손상된 저장값은 시드로 대체 */ }
    }
    return clone(SEED);
  }
  function get() { if (!content) content = load(); return content; }
  function save(next) {
    content = next || content;
    var toStore = clone(content);
    delete toStore.ui; /* UI 문구는 항상 시드에서 */
    var ok = lsSet(KEY, JSON.stringify(toStore));
    content.ui = SEED.ui;
    emit({ type: 'content' });
    return ok;
  }
  function reset() { lsDel(KEY); content = clone(SEED); emit({ type: 'content' }); }
  function isCustomized() { return !!lsGet(KEY); }

  /* ---------- 언어 ---------- */
  function detectLang() {
    var q = null;
    try { q = new URLSearchParams(window.location.search).get('lang'); } catch (e) { /* 무시 */ }
    if (q && LANGS.indexOf(q) > -1) { lsSet(LANG_KEY, q); return q; }
    var saved = lsGet(LANG_KEY);
    if (saved && LANGS.indexOf(saved) > -1) return saved;
    var nav = (navigator.language || 'ko').slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) > -1 ? nav : 'ko';
  }
  var lang = detectLang();
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-lang', lang);

  function setLang(l, opts) {
    if (LANGS.indexOf(l) < 0 || l === lang) return;
    lang = l;
    lsSet(LANG_KEY, l);
    document.documentElement.lang = l;
    document.documentElement.setAttribute('data-lang', l);
    if (opts && opts.reload) { window.location.reload(); return; }
    applyI18n(document);
    emit({ type: 'lang', lang: l });
  }

  /* 다국어 객체 {ko,en,ja,es} → 현재 언어 문자열 */
  function tr(v, l) {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    l = l || lang;
    return v[l] || v.ko || v.en || '';
  }
  /* UI 문구 */
  function t(key, l) {
    var v = SEED.ui[key];
    return v ? tr(v, l) : key;
  }
  /* 'competition.info.0.value' 같은 경로로 콘텐츠 값을 읽어 현재 언어로 반환 */
  function c(path) {
    var parts = String(path).split('.');
    var cur = get();
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return '';
      cur = cur[parts[i]];
    }
    return tr(cur);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  /* 줄바꿈 → <br>, **굵게** → <strong>. 입력은 먼저 이스케이프한다. */
  function rich(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }

  /* data-i18n="키" / data-i18n-html="키" / data-i18n-attr="placeholder:키;aria-label:키"
   * data-c="콘텐츠.경로" / data-c-html="콘텐츠.경로" */
  function applyI18n(root) {
    root = root || document;
    var each = function (sel, fn) { Array.prototype.forEach.call(root.querySelectorAll(sel), fn); };
    each('[data-i18n]', function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    each('[data-i18n-html]', function (el) { el.innerHTML = rich(t(el.getAttribute('data-i18n-html'))); });
    each('[data-c]', function (el) { el.textContent = c(el.getAttribute('data-c')); });
    each('[data-c-html]', function (el) { el.innerHTML = rich(c(el.getAttribute('data-c-html'))); });
    each('[data-i18n-attr]', function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i > 0) el.setAttribute(pair.slice(0, i).trim(), t(pair.slice(i + 1).trim()));
      });
    });
  }

  /* 언어 전환 버튼을 el 안에 만든다.
   * opts: { format:'code'|'name', reload:false, activeClass:'on', tag:'button', className:'' } */
  function mountLangSwitcher(el, opts) {
    if (!el) return;
    opts = opts || {};
    var active = opts.activeClass || 'on';
    var tag = opts.tag || 'button';
    el.innerHTML = '';
    LANGS.forEach(function (l) {
      var b = document.createElement(tag);
      if (tag === 'button') b.type = 'button';
      b.className = (opts.className || 'lang-btn') + (l === lang ? ' ' + active : '');
      b.textContent = opts.format === 'name' ? LANG_META[l].name : LANG_META[l].code;
      b.setAttribute('data-lang', l);
      b.setAttribute('lang', l);
      b.setAttribute('aria-pressed', l === lang ? 'true' : 'false');
      b.setAttribute('aria-label', LANG_META[l].name);
      b.addEventListener('click', function (e) {
        e.preventDefault();
        setLang(l, { reload: !!opts.reload });
        Array.prototype.forEach.call(el.children, function (ch) {
          var on = ch.getAttribute('data-lang') === l;
          ch.classList.toggle(active, on);
          ch.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      });
      el.appendChild(b);
    });
  }

  /* ---------- 조회 헬퍼 ---------- */
  function asset(p) {
    if (!p) return '';
    if (/^(https?:|data:|blob:|\/\/)/.test(p)) return p;
    return ROOT + String(p).replace(/^\.?\//, '');
  }
  function products(filter) {
    filter = filter || {};
    return get().products.filter(function (p) {
      if (filter.category && p.category !== filter.category) return false;
      if (filter.featured != null && !!p.featured !== !!filter.featured) return false;
      return true;
    }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }
  function notices() {
    return get().notices.slice().sort(function (a, b) {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    if (isNaN(d)) return iso;
    try {
      return new Intl.DateTimeFormat(LANG_META[lang].locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    } catch (e) { return iso; }
  }
  function uid(prefix) {
    return (prefix || 'id') + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  }

  /* ---------- 관리자용 CRUD ---------- */
  function upsert(collection, item) {
    var list = get()[collection];
    if (!Array.isArray(list)) return null;
    if (!item.id) item.id = uid(collection.charAt(0));
    var idx = -1;
    list.forEach(function (x, i) { if (x.id === item.id) idx = i; });
    if (idx > -1) list[idx] = item; else list.push(item);
    save();
    return item;
  }
  function remove(collection, id) {
    var list = get()[collection];
    if (!Array.isArray(list)) return false;
    var next = list.filter(function (x) { return x.id !== id; });
    if (next.length === list.length) return false;
    get()[collection] = next;
    save();
    return true;
  }

  /* ---------- 참가 신청 (로그인 없음) ---------- */
  function entries() {
    try { return JSON.parse(lsGet(ENTRY_KEY) || '[]'); } catch (e) { return []; }
  }
  function validateEntry(d) {
    if (!d.name || !d.phone || !d.email || !d.division) return 'form.errRequired';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return 'form.errEmail';
    if (!d.agree) return 'form.errAgree';
    return null;
  }
  function submitEntry(d) {
    var err = validateEntry(d);
    if (err) return { ok: false, errorKey: err, error: t(err) };
    var list = entries();
    var now = new Date();
    var no = 'CC' + String(now.getFullYear()).slice(2) + ('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2) + '-' + ('000' + (list.length + 1)).slice(-3);
    var entry = {
      id: uid('e'), no: no, createdAt: now.toISOString(), lang: lang,
      name: String(d.name).trim(), org: String(d.org || '').trim(), phone: String(d.phone).trim(),
      email: String(d.email).trim(), division: d.division, members: Number(d.members) || 1,
      message: String(d.message || '').trim()
    };
    list.push(entry);
    if (!lsSet(ENTRY_KEY, JSON.stringify(list))) return { ok: false, errorKey: 'form.errRequired', error: 'storage' };
    emit({ type: 'entry', entry: entry });
    return { ok: true, entry: entry };
  }
  function removeEntry(id) {
    lsSet(ENTRY_KEY, JSON.stringify(entries().filter(function (x) { return x.id !== id; })));
    emit({ type: 'entry' });
  }
  function clearEntries() { lsDel(ENTRY_KEY); emit({ type: 'entry' }); }
  function entriesCSV() {
    var cols = ['no', 'createdAt', 'name', 'org', 'phone', 'email', 'division', 'members', 'message', 'lang'];
    var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    var rows = entries().map(function (e) { return cols.map(function (k) { return q(e[k]); }).join(','); });
    return '﻿' + cols.join(',') + '\n' + rows.join('\n');
  }

  /* <form> 을 참가 신청 폼으로 연결한다.
   * 필드 name: name, org, phone, email, division, members, message, agree(체크박스), website(허니팟, 숨김)
   * opts: { onSuccess(entry), onError(message, key) } */
  function bindEntryForm(form, opts) {
    if (!form) return;
    opts = opts || {};
    form.setAttribute('novalidate', 'novalidate');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website && f.website.value) return; /* 봇 차단용 숨김 필드 */
      var val = function (n) { return f[n] ? f[n].value : ''; };
      var res = submitEntry({
        name: val('name'), org: val('org'), phone: val('phone'), email: val('email'),
        division: val('division'), members: val('members'), message: val('message'),
        agree: f.agree ? f.agree.checked : false
      });
      if (res.ok) { form.reset(); if (opts.onSuccess) opts.onSuccess(res.entry); }
      else if (opts.onError) opts.onError(res.error, res.errorKey);
    });
  }
  /* <select name="division"> 옵션을 현재 언어로 채운다 */
  function fillDivisionSelect(select) {
    if (!select) return;
    var cur = select.value;
    select.innerHTML = '<option value="">' + esc(t('form.divisionPlaceholder')) + '</option>' +
      get().competition.divisions.map(function (d) {
        return '<option value="' + esc(d.id) + '">' + esc(tr(d.name)) + '</option>';
      }).join('');
    select.value = cur;
  }

  /* ---------- 이벤트 ---------- */
  var listeners = [];
  function on(fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  function emit(ev) { listeners.slice().forEach(function (fn) { try { fn(ev); } catch (e) { console.error(e); } }); }

  /* 다른 탭(관리자)에서 저장하면 열려 있는 데모가 바로 반영되도록 */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { content = null; emit({ type: 'content', remote: true }); }
    if (e.key === ENTRY_KEY) emit({ type: 'entry', remote: true });
    if (e.key === LANG_KEY && e.newValue && e.newValue !== lang && LANGS.indexOf(e.newValue) > -1) {
      lang = e.newValue;
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-lang', lang);
      applyI18n(document);
      emit({ type: 'lang', lang: lang, remote: true });
    }
  });

  window.Coco = {
    LANGS: LANGS, LANG_META: LANG_META, ROOT: ROOT,
    get lang() { return lang; },
    setLang: setLang, t: t, tr: tr, c: c, esc: esc, rich: rich,
    applyI18n: applyI18n, mountLangSwitcher: mountLangSwitcher,
    get: get, save: save, reset: reset, isCustomized: isCustomized,
    products: products, notices: notices, asset: asset, fmtDate: fmtDate, uid: uid,
    upsert: upsert, remove: remove,
    entries: entries, submitEntry: submitEntry, removeEntry: removeEntry, clearEntries: clearEntries, entriesCSV: entriesCSV,
    bindEntryForm: bindEntryForm, fillDivisionSelect: fillDivisionSelect,
    on: on
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyI18n(document); });
  } else {
    applyI18n(document);
  }
})();
