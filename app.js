'use strict';

const API = '/api';

// ── Entity types ───────────────────────────────────────
const TYPES = [
  { key: 'spell',             label: 'Incantesimi',          icon: '✦', color: '#9d72c9' },
  { key: 'monster',           label: 'Mostri',               icon: '☠', color: '#d46060' },
  { key: 'class',             label: 'Classi',               icon: '⚔', color: '#d4a060' },
  { key: 'subclass',          label: 'Sottoclassi',          icon: '◈', color: '#c08060' },
  { key: 'race',              label: 'Razze',                icon: '◉', color: '#60b878' },
  { key: 'background',        label: 'Background',           icon: '📜', color: '#6090d4' },
  { key: 'feat',              label: 'Imprese',              icon: '★', color: '#c060a0' },
  { key: 'item',              label: 'Oggetti',              icon: '⚗', color: '#50b8b8' },
  { key: 'itemBase',          label: 'Equipaggiamento',      icon: '🎒', color: '#a89464' },
  { key: 'optionalFeature',   label: 'Cap. Opzionali',       icon: '◆', color: '#8090a8' },
  { key: 'classFeature',      label: 'Cap. di Classe',       icon: '◇', color: '#9095b0' },
  { key: 'subclassFeature',   label: 'Cap. di Sottoclasse',  icon: '◈', color: '#8085a8' },
  { key: 'bookSection',       label: 'Libri',                icon: '📖', color: '#b08850' },
  { key: 'adventureSection',  label: 'Avventure',            icon: '🗺', color: '#7098a0' },
];

const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.key, t]));

// ── Conditions (SRD italiano) ──────────────────────────
const CONDITIONS = {
  blinded: {
    name: 'Accecato', key: 'blinded',
    effects: [
      'Una creatura accecata non riesce a vedere e fallisce automaticamente qualsiasi prova di caratteristica che richieda la vista.',
      'I tiri per colpire contro la creatura hanno vantaggio; i tiri per colpire della creatura hanno svantaggio.',
    ],
  },
  charmed: {
    name: 'Affascinato', key: 'charmed',
    effects: [
      'La creatura non può attaccare chi l\'ha affascinata né bersagliarla con capacità o effetti magici dannosi.',
      'Chi l\'ha affascinata ha vantaggio sulle prove di caratteristica per interagire socialmente con la creatura.',
    ],
  },
  deafened: {
    name: 'Assordato', key: 'deafened',
    effects: [
      'Una creatura assordita non riesce a sentire e fallisce automaticamente qualsiasi prova che richieda l\'udito.',
    ],
  },
  exhaustion: {
    name: 'Affaticamento', key: 'exhaustion',
    effects: [
      'Alcuni effetti speciali causano un livello di affaticamento cumulativo (da 1 a 6). Gli effetti si accumulano al livello raggiunto.',
    ],
    table: [
      ['Livello', 'Effetto'],
      ['1', 'Svantaggio alle prove di caratteristica'],
      ['2', 'Velocità dimezzata'],
      ['3', 'Svantaggio ai tiri per colpire e ai tiri salvezza'],
      ['4', 'Punti ferita massimi dimezzati'],
      ['5', 'Velocità ridotta a 0'],
      ['6', 'Morte'],
    ],
  },
  frightened: {
    name: 'Spaventato', key: 'frightened',
    effects: [
      'Una creatura spaventata ha svantaggio alle prove di caratteristica e ai tiri per colpire finché la fonte della paura è nella sua linea di visuale.',
      'La creatura non può avvicinarsi volontariamente alla fonte della sua paura.',
    ],
  },
  grappled: {
    name: 'Avvinghiato', key: 'grappled',
    effects: [
      'La velocità della creatura diventa 0 e non può beneficiare di bonus alla velocità.',
      'La condizione termina se chi ha effettuato la presa viene incapacitato, o se la creatura viene allontanata dall\'effetto che la trattiene.',
    ],
  },
  incapacitated: {
    name: 'Incapacitato', key: 'incapacitated',
    effects: [
      'Una creatura incapacitata non può compiere azioni né reazioni.',
    ],
  },
  invisible: {
    name: 'Invisibile', key: 'invisible',
    effects: [
      'La creatura è impossibile da vedere senza l\'ausilio della magia o di un senso speciale. Ai fini del nascondersi è considerata in un luogo fortemente oscurato.',
      'I tiri per colpire contro la creatura hanno svantaggio; i tiri per colpire della creatura hanno vantaggio.',
    ],
  },
  paralyzed: {
    name: 'Paralizzato', key: 'paralyzed',
    effects: [
      'Una creatura paralizzata è incapacitata e non può muoversi né parlare.',
      'Fallisce automaticamente i tiri salvezza di Forza e Destrezza.',
      'I tiri per colpire contro la creatura hanno vantaggio.',
      'Qualsiasi attacco che colpisca è un colpo critico se l\'attaccante si trova entro 1,5 m.',
    ],
  },
  petrified: {
    name: 'Pietrificato', key: 'petrified',
    effects: [
      'La creatura viene trasformata in una sostanza solida inanimata (di solito pietra). È incapacitata, inconsapevole di ciò che la circonda e il suo peso è moltiplicato per 10.',
      'Fallisce automaticamente i tiri salvezza di Forza e Destrezza; i tiri per colpire contro di essa hanno vantaggio.',
      'Ha resistenza a tutti i danni ed è immune a veleni e malattie (già in corso vengono sospesi, non neutralizzati).',
    ],
  },
  poisoned: {
    name: 'Avvelenato', key: 'poisoned',
    effects: [
      'Una creatura avvelenata ha svantaggio ai tiri per colpire e alle prove di caratteristica.',
    ],
  },
  prone: {
    name: 'Prono', key: 'prone',
    effects: [
      'L\'unica opzione di movimento disponibile è strisciare, a meno che non ci si rialzi (ponendo fine alla condizione).',
      'La creatura ha svantaggio ai tiri per colpire.',
      'I tiri per colpire contro di essa hanno vantaggio se l\'attaccante è entro 1,5 m; altrimenti hanno svantaggio.',
    ],
  },
  restrained: {
    name: 'Trattenuto', key: 'restrained',
    effects: [
      'La velocità della creatura diventa 0 e non può beneficiare di bonus alla velocità.',
      'I tiri per colpire contro di essa hanno vantaggio; i suoi tiri per colpire hanno svantaggio.',
      'Ha svantaggio ai tiri salvezza di Destrezza.',
    ],
  },
  stunned: {
    name: 'Stordito', key: 'stunned',
    effects: [
      'Una creatura stordita è incapacitata, non può muoversi e può parlare solo in modo stentato.',
      'Fallisce automaticamente i tiri salvezza di Forza e Destrezza.',
      'I tiri per colpire contro di essa hanno vantaggio.',
    ],
  },
  unconscious: {
    name: 'Privo di sensi', key: 'unconscious',
    effects: [
      'La creatura è incapacitata, non può muoversi né parlare, ed è inconsapevole di ciò che la circonda.',
      'Lascia cadere tutti gli oggetti, cade prona, e fallisce automaticamente i tiri salvezza di Forza e Destrezza.',
      'I tiri per colpire contro di essa hanno vantaggio; gli attacchi entro 1,5 m sono automaticamente critici.',
    ],
  },
};

// alias italiani → chiave inglese
const COND_ALIAS = {
  'accecato':'blinded','affascinato':'charmed','assordato':'deafened',
  'affaticamento':'exhaustion','esausto':'exhaustion','spaventato':'frightened',
  'avvinghiato':'grappled','incapacitato':'incapacitated','invisibile':'invisible',
  'paralizzato':'paralyzed','pietrificato':'petrified','avvelenato':'poisoned',
  'prono':'prone','trattenuto':'restrained','stordito':'stunned',
  'privo di sensi':'unconscious',
};

// ── Small reference-entity name cache (skill/sense/action/language) ──
// Usate dentro renderInlineTag (sincrono): precaricate una volta all'avvio
// e tenute per locale, così i tag {@skill}/{@sense}/{@action}/{@language}
// nei testi possono mostrare subito il nome tradotto e linkare l'entità.
const TAG_NAME_CACHE = {};

async function prefetchTagNames(locale) {
  const types = { skill: 50, sense: 10, action: 50, language: 200 };
  const byType = {};
  await Promise.all(Object.entries(types).map(async ([type, limit]) => {
    const map = {};
    try {
      const data = await api.list({ type, locale, limit });
      for (const r of data.results || []) map[slugify(r.originalName || r.name)] = { name: r.name, id: r.id };
    } catch { /* keep map empty, fall back to raw text */ }
    byType[type] = map;
  }));
  TAG_NAME_CACHE[locale] = byType;
}

function tagName(type, raw) {
  return TAG_NAME_CACHE[S.locale]?.[type]?.[slugify(raw)];
}

// ── State ──────────────────────────────────────────────
const S = {
  locale: 'it',
  type: null,
  search: '',
  page: 1,
  limit: 50,
  filters: {},
  activeId: null,
  stats: null,
  filterCache: {},
  filtersOpen: false,
  bookPicker: null,
  board: [],
  monsterDefenses: {}, // cache non persistita: { [boardItemId]: {resist,immune,vuln,hpFormula,hpAverage} }
  spellbook: [],
  sharedBook: null, // lista temporanea da un link condiviso, non persistita finché non si salva
};

const PWA = {
  deferredPrompt: null,
  isInstalled: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
};

// ── DOM ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const D = {
  app:          $('app'),
  catList:      $('category-list'),
  sbSearch:     $('sidebar-search'),
  sbFooter:     $('sidebar-footer'),
  listTitle:    $('list-title'),
  listCount:    $('list-count'),
  listSearch:   $('list-search'),
  filterBtn:    $('filter-btn'),
  filtersPanel: $('filters-panel'),
  filtersPanelBg:    $('filters-panel-bg'),
  filtersPanelClose: $('filters-panel-close'),
  filtersBody:  $('filters-body'),
  entityList:   $('entity-list'),
  pagination:   $('pagination'),
  detailPanel:  $('detail-panel'),
  detailContent:$('detail-content'),
  homeStats:    $('home-stats'),
  menuBtn:      $('mobile-menu-btn'),
  menuBtnList:  $('mobile-menu-btn-list'),
  sbBackdrop:   $('sidebar-backdrop'),
  homeInstallCta:$('home-install-cta'),
  homeInstallBtn:$('home-install-btn'),
  sidebarInstallBtn:$('sidebar-install-btn'),
  boardToggleBtn:  $('board-toggle-btn'),
  boardToggleCount:$('board-toggle-count'),
  boardPanel:      $('board-panel'),
  boardCards:      $('board-cards'),
  boardCount:      $('board-count'),
  boardCloseBtn:   $('board-close-btn'),
  boardClearBtn:   $('board-clear-btn'),
  boardFocusBtn:   $('board-focus-btn'),
  boardInitBtn:    $('board-init-btn'),
  boardHpBtn:      $('board-hp-btn'),
  boardAddPgBtn:   $('board-add-pg-btn'),
  boardSearchInput:   $('board-search-input'),
  boardSearchResults: $('board-search-results'),
  spellbookToggleBtn:  $('spellbook-toggle-btn'),
  spellbookToggleCount:$('spellbook-toggle-count'),
  spellbookPanel:      $('spellbook-panel'),
  spellbookList:       $('spellbook-list'),
  spellbookCount:      $('spellbook-count'),
  spellbookCloseBtn:   $('spellbook-close-btn'),
  spellbookClearBtn:   $('spellbook-clear-btn'),
  spellbookShareBtn:   $('spellbook-share-btn'),
  spellbookSharedBanner: $('spellbook-shared-banner'),
  spellbookSaveSharedBtn: $('spellbook-save-shared-btn'),
};

// ── Utils ──────────────────────────────────────────────
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function abMod(n) { const m = Math.floor((n - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; }
function abModNum(n) { return n != null ? Math.floor((n - 10) / 2) : 0; }
function rollD20() { return 1 + Math.floor(Math.random() * 20); }

// Le edizioni italiane convertono i piedi in metri usando 5 ft. = 1,5 m
// (un quadretto), non la conversione esatta (0.3048) — stesso arrotondamento
// usato nei manuali ufficiali (es. "portata 1,5 metri" per 5 ft di portata).
function ftToM(ft) {
  const m = Math.round(ft * 0.3 * 10) / 10;
  return Number.isInteger(m) ? String(m) : String(m).replace('.', ',');
}

// Tira una formula di dadi vita stile "5d10+10" (formato standard dei
// blocchi statistiche 5e, già comprensivo del modificatore di Costituzione).
// Accetta anche un numero semplice come fallback.
function rollHpFormula(formula) {
  if (!formula) return null;
  const m = String(formula).replace(/\s+/g, '').match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!m) {
    const n = parseInt(formula, 10);
    return Number.isFinite(n) ? n : null;
  }
  const [, count, faces, mod] = m;
  let total = mod ? parseInt(mod, 10) : 0;
  for (let i = 0; i < +count; i++) total += 1 + Math.floor(Math.random() * +faces);
  return Math.max(1, total);
}

// Applica resistenze/immunità/vulnerabilità di un mostro a un danno in
// arrivo. Per le regole 5e, resistenza+vulnerabilità sullo stesso tipo si
// annullano a vicenda (danno normale), e l'immunità prevale su entrambe.
function applyDamageDefenses(amount, type, defenses) {
  if (!type || !defenses) return amount;
  if (defenses.immune?.includes(type)) return 0;
  const resist = defenses.resist?.includes(type);
  const vuln   = defenses.vuln?.includes(type);
  if (resist && vuln) return amount;
  if (resist) return Math.floor(amount / 2);
  if (vuln) return amount * 2;
  return amount;
}

function setInstallUiVisible(visible) {
  const show = visible && !PWA.isInstalled;
  D.homeInstallCta?.classList.toggle('hidden', !show);
  D.sidebarInstallBtn?.classList.toggle('hidden', !show);
}

async function promptInstall() {
  if (!PWA.deferredPrompt) return;
  PWA.deferredPrompt.prompt();
  try {
    await PWA.deferredPrompt.userChoice;
  } finally {
    PWA.deferredPrompt = null;
    setInstallUiVisible(false);
  }
}

function setupPwa() {
  D.homeInstallBtn?.addEventListener('click', promptInstall);
  D.sidebarInstallBtn?.addEventListener('click', promptInstall);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }, { once: true });
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    PWA.deferredPrompt = e;
    setInstallUiVisible(true);
  });

  window.addEventListener('appinstalled', () => {
    PWA.isInstalled = true;
    PWA.deferredPrompt = null;
    setInstallUiVisible(false);
  });

  setInstallUiVisible(false);
}

const RANGE_SHAPE_NAMES = { cone:'cono', cube:'cubo', line:'linea', sphere:'sfera', radius:'raggio', hemisphere:'emisfero', cylinder:'cilindro' };

// g.range non ha mai un campo testo pronto: va ricostruito da type/distanceType/
// distanceAmount/flags (vedi normalized.range nell'API). hasAreaRange=true vuol
// dire "Se stesso" con una forma d'area (es. "Se stesso (cono di 18 metri)").
function formatSpellRange(rng) {
  if (!rng) return '—';
  const f = rng.flags || {};

  if (f.hasAreaRange && rng.distanceAmount != null) {
    const shape = RANGE_SHAPE_NAMES[rng.type] || rng.type;
    return `Se stesso (${shape} di ${ftToM(rng.distanceAmount)} metri)`;
  }
  if (f.isSelf  || rng.distanceType === 'self')  return 'Se stesso';
  if (f.isTouch || rng.distanceType === 'touch') return 'Contatto';

  switch (rng.distanceType) {
    case 'unlimited': return 'Illimitata';
    case 'sight':      return 'Vista';
    case 'special':    return 'Speciale';
    case 'plane':       return 'Lo stesso piano di esistenza';
    case 'miles': {
      const km = Math.round(rng.distanceAmount * 1.6 * 10) / 10;
      return `${Number.isInteger(km) ? km : String(km).replace('.', ',')} km`;
    }
    case 'feet':
      return rng.distanceAmount != null ? `${ftToM(rng.distanceAmount)} metri` : '—';
    default:
      return rng.distanceAmount != null ? `${ftToM(rng.distanceAmount)} metri` : cap(rng.distanceType || '—');
  }
}

function shortNum(n) {
  if (n >= 1000) return (Math.round(n / 100) / 10) + 'k';
  return String(n);
}

function schoolName(k) {
  const M = { A:'Abiurazione', C:'Invocazione', D:'Divinazione', E:'Ammaliamento',
               I:'Illusione', N:'Negromanzia', T:'Trasmutazione', V:'Evocazione' };
  if (M[k]) return M[k];
  if (k && k.length > 2) return cap(k);
  return k || '—';
}

function rarityClass(r) {
  if (!r) return '';
  const k = r.toLowerCase().replace(/\s+/g, '-');
  return `rar-${k}`;
}

function typeColor(t) { return TYPE_MAP[t]?.color ?? '#888'; }

function slugify(name) {
  return name.toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Inline tag parser ({@tag content}) ─────────────────
const ATK_LABELS = {
  mw:    'Attacco con arma da mischia:',
  rw:    'Attacco con arma a distanza:',
  ma:    'Attacco con incantesimo da mischia:',
  ra:    'Attacco con incantesimo a distanza:',
  'mw,rw': 'Attacco con arma da mischia o a distanza:',
  'mw,rw,ma,ra': 'Attacco da mischia o a distanza:',
};

function renderInlineTag(tag, content) {
  const parts   = content.split('|');
  const name    = parts[0].trim();
  const source  = (parts[1] || '').trim();
  const display = (parts[2] || name).trim();
  const t = tag.toLowerCase();

  // ── Entity links ──────────────────────────────────
  // helper per link entità con tooltip
  const entityLink = (cls, entityType, displayName, rawName, rawSrc, slugOverride) => {
    const tip = rawName !== displayName ? `title="${esc(rawName)}"` : '';
    const slug = slugOverride ?? slugify(rawName);
    return `<a class="tag-link ${cls}" data-tag="${entityType}" data-slug="${esc(slug)}" data-src="${esc(rawSrc)}" tabindex="0" ${tip}>${esc(displayName)}</a>`;
  };

  if (t === 'spell')                  return entityLink('tag-spell',   'spell',      display, name, source);
  if (t === 'creature' || t==='monster') return entityLink('tag-monster','monster',   display, name, source);
  if (t === 'item')                   return entityLink('tag-item',    'item',       display, name, source);
  if (t === 'class')                  return entityLink('tag-class',   'class',      display, name, source);
  if (t === 'race')                   return entityLink('tag-race',    'race',       display, name, source);
  if (t === 'feat')                   return entityLink('tag-feat',    'feat',       display, name, source);
  if (t === 'background')             return `<a class="tag-link" style="color:#6090d4;text-decoration-color:rgba(96,144,212,.4)" data-tag="background" data-slug="${esc(slugify(name))}" data-src="${esc(source)}" tabindex="0">${esc(display)}</a>`;

  // ── Book / Adventure (lo slug è il codice fonte, non il titolo) ───
  if (t === 'book' || t === 'adventure') {
    return entityLink(`tag-${t}`, t, display, name, source, source.toLowerCase());
  }

  // ── Class/subclass feature (la fonte è sempre l'ultimo segmento) ──
  if (t === 'classfeature' || t === 'subclassfeature') {
    const entityType  = t === 'classfeature' ? 'classFeature' : 'subclassFeature';
    const featSource  = parts[parts.length - 1] || '';
    return entityLink('tag-classfeature', entityType, name, name, featSource, slugify(name));
  }

  // ── Card (il 2° segmento è il nome del mazzo, non la fonte) ───────
  if (t === 'card') return entityLink('tag-card', 'card', name, name, parts[2] || '', slugify(name));

  // ── Altri riferimenti a entità semplici (nome|fonte) ──────────────
  const SIMPLE_TAG_ENTITY = {
    deity: 'deity', optfeature: 'optionalFeature', charoption: 'charCreationOption',
    hazard: 'hazard', trap: 'trap', variantrule: 'variantrule', cult: 'cult',
    reward: 'reward', deck: 'deck', recipe: 'recipe', disease: 'conditionDisease',
  };
  if (SIMPLE_TAG_ENTITY[t]) return entityLink(`tag-${t}`, SIMPLE_TAG_ENTITY[t], display, name, source);

  // ── Riferimenti testuali senza entità collegata ───────────────────
  if (t === 'area')     return esc(name);  // rimando a capitolo/pagina, non un'area numerata
  if (t === '5etools')  return esc(name);  // link al sito 5etools, non rilevante qui

  // ── Filter label (table headers etc.) ─────────────
  if (t === 'filter') return esc(name);

  // ── Condition / status ────────────────────────────
  if (t === 'condition' || t === 'status') {
    const key = name.toLowerCase();
    const it  = CONDITIONS[key]?.name || display;
    return `<a class="tag-link tag-condition" data-tag="condition" data-cond="${esc(key)}" tabindex="0">${esc(it)}</a>`;
  }

  // ── Dice & damage ─────────────────────────────────
  if (t === 'damage' || t === 'dice' || t === 'scaledamage' || t === 'scaledice') {
    // scaledamage/scaledice format: base|scaled|formula — show base
    const label = parts[0].trim();
    return `<span class="dice-badge">${esc(label)}</span>`;
  }

  // ── Attack hit bonus ──────────────────────────────
  if (t === 'hit') {
    const val = content.trim();
    const label = /^[+-]/.test(val) ? val : `+${val}`;
    return `<span class="hit-badge">${esc(label)}</span>`;
  }

  // ── Difficulty class ──────────────────────────────
  if (t === 'dc') {
    return `<span class="dc-badge">CD ${esc(content.trim())}</span>`;
  }

  // ── Attack type ───────────────────────────────────
  if (t === 'atk') {
    const key = content.trim();
    const label = ATK_LABELS[key] || esc(key);
    return `<em class="atk-badge">${label}</em>`;
  }

  // ── Hit marker ────────────────────────────────────
  if (t === 'h') {
    return '<strong>Colpo:</strong> ';
  }

  // ── Recharge ──────────────────────────────────────
  if (t === 'recharge') {
    const n = content.trim();
    return `<span class="recharge-badge">Ricarica ${esc(n)}${n !== '6' ? '–6' : ''}</span>`;
  }

  // ── Chance ────────────────────────────────────────
  if (t === 'chance') {
    const pct = content.trim();
    return `<span class="dc-badge">${esc(pct)}%</span>`;
  }

  // ── Formatting ────────────────────────────────────
  if (t === 'bold' || t === 'b')   return `<strong>${esc(display)}</strong>`;
  if (t === 'italic' || t === 'i') return `<em>${esc(display)}</em>`;
  if (t === 'note')  return `<span style="color:var(--c-text2);font-style:italic;">${esc(display)}</span>`;
  if (t === 'skill' || t === 'sense' || t === 'action' || t === 'language') {
    const hit = tagName(t, name);
    return hit
      ? `<a class="tag-link" data-id="${esc(hit.id)}" tabindex="0">${esc(hit.name)}</a>`
      : `<span style="font-style:italic;">${esc(name)}</span>`;
  }

  // ── Quick rule reference (just show the rule name) ─
  if (t === 'quickref') return `<span style="font-style:italic;">${esc(cap(name))}</span>`;

  // ── Dynamic spell-attack placeholder ───────────────
  if (t === 'hityourspellattack') return 'il tuo modificatore di attacco con incantesimi';

  // ── Fallback: show display text ───────────────────
  return `<span class="tag-ref">${esc(display || name || content)}</span>`;
}

function parseInlineTags(text) {
  if (!text || !text.includes('{@')) return esc(text);

  const out = [];
  const re  = /\{@(\w+)(?:\s([^}]*))?\}/g;
  let last  = 0, m;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(esc(text.slice(last, m.index)));
    out.push(renderInlineTag(m[1], m[2] ?? ''));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(esc(text.slice(last)));

  return out.join('');
}

// ── API helpers ────────────────────────────────────────
async function apiFetch(path, params = {}) {
  const url = new URL(API + path, location.origin);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err.message || res.statusText);
    e.status = res.status; e.data = err;
    throw e;
  }
  return res.json();
}

const api = {
  stats:   ()              => apiFetch('/stats'),
  list:    params          => apiFetch('/entities', params),
  bySlug:  (type, slug, src) => {
    const p = { locale: S.locale };
    if (src) p.source = src;
    // l'itemBase (equipaggiamento di base) non ha dati "game" normalizzati:
    // CA/danno/peso/valore sono disponibili solo nei dati grezzi 5e.
    if (type === 'itemBase') p.includeRaw = 'true';
    return apiFetch(`/entities/by-slug/${encodeURIComponent(type)}/${encodeURIComponent(slug)}`, p);
  },
  byId:    id => apiFetch(`/entities/by-id/${encodeURIComponent(id)}`, {
    locale: S.locale,
    ...(String(id).startsWith('itemBase:') ? { includeRaw: 'true' } : {}),
  }),
  filters: async type => {
    if (S.filterCache[type]) return S.filterCache[type];
    const d = await apiFetch(`/filters/${encodeURIComponent(type)}`);
    S.filterCache[type] = d;
    return d;
  },
};

// L'API esterna risponde talvolta 404 su by-slug per entità che esistono
// comunque (es. alcuni mostri di Curse of Strahd, quando si passa il
// parametro source — anche il filtro "source" della ricerca per lista è
// inaffidabile per le stesse fonti) e talvolta 409 con dei candidati
// suggeriti. Usato per i link a entità dentro al testo ({@creature ...}
// ecc.), dove abbiamo solo slug+source e non un id reale da cui ripartire.
async function tryExactFetch(type, slug, src) {
  try {
    return await api.bySlug(type, slug, src || undefined);
  } catch (err) {
    if (err.status === 409 && err.data?.results?.length) {
      return await api.byId(err.data.results[0].id);
    }
    throw err;
  }
}

// Alcuni link "{@item ...}" nel testo puntano in realtà a equipaggiamento di
// base (es. "Leather Armor", "Scimitar", "Shield"), indicizzato sotto
// l'entityType "itemBase" e non "item" (oggetti magici/specifici) — categoria
// che l'app non espone ancora nella sidebar, quindi questi link sono l'unico
// modo per raggiungerla. Va provato con una corrispondenza ESATTA prima di
// arrivare alla ricerca testuale fuzzy sotto: altrimenti un'arma base come
// "Shield" può trovare per coincidenza un oggetto magico omonimo (es.
// "Shield Guardian Amulet", slug "shield-guardian-amulet") nella ricerca sul
// tipo "item" e venire scambiata per quello, mostrando l'oggetto sbagliato.
const ALT_ENTITY_TYPE = { item: 'itemBase' };

// Ultima spiaggia: ricerca testuale per nome derivato dallo slug, ignorando
// il filtro "source" (inaffidabile per alcune fonti). Si tenta la frase
// intera nella lingua corrente, poi in inglese (lo slug deriva sempre dal
// nome originale inglese), poi solo le ultime due/una parola, perché
// l'ordine delle parole nel nome localizzato può differire da quello dello
// slug (es. "Strahd's Animated Armor" → "Armatura Animata di Strahd").
// Il match valido è sempre quello con lo slug esatto tra i risultati, non il
// primo della lista.
async function tryFuzzyFetch(type, slug) {
  const words = slug.split('-').filter(Boolean);
  const attempts = [
    { locale: S.locale, q: words.join(' ') },
    { locale: 'en',     q: words.join(' ') },
    { locale: 'en',     q: words.slice(-2).join(' ') },
    { locale: 'en',     q: words.slice(-1).join(' ') },
  ];
  let variants = null;
  for (const { locale, q } of attempts) {
    if (!q) continue;
    const data = await api.list({ type, q, locale, limit: 10 }).catch(() => null);
    const results = data?.results || [];
    const hit = results.find(r => r.slug === slug);
    if (hit) return await api.byId(hit.id);
    // Riferimento generico senza variante (es. "Spell Scroll" → esistono solo
    // "Spell Scroll (1st Level)", "(2nd Level)" ecc.): propone le varianti
    // invece di un errore secco. Richiede almeno 2 corrispondenze: un singolo
    // match è quasi sempre un oggetto omonimo per coincidenza, non una vera
    // famiglia di varianti (es. "Scimitar" → "Scimitar of Speed" da solo).
    if (!variants) {
      const prefixed = results.filter(r => r.slug?.startsWith(slug + '-'));
      if (prefixed.length >= 2) variants = prefixed;
    }
  }
  if (variants) {
    const ambiguous = new Error('Riferimento generico: nessuna entità esatta, solo varianti specifiche.');
    ambiguous.variants = variants;
    throw ambiguous;
  }
  return null;
}

async function fetchEntityRobust(type, slug, src) {
  try {
    return await tryExactFetch(type, slug, src);
  } catch (err) {
    const altType = ALT_ENTITY_TYPE[type];
    if (altType) {
      try { return await tryExactFetch(altType, slug, src); } catch { /* prova comunque la ricerca fuzzy sotto */ }
    }
    const fuzzy = await tryFuzzyFetch(type, slug);
    if (fuzzy) return fuzzy;
    throw err;
  }
}

// ── Entry renderer ─────────────────────────────────────
function renderEntry(e) {
  if (e == null) return '';
  if (typeof e === 'string') return `<p class="entry-p">${parseInlineTags(e)}</p>`;
  if (typeof e !== 'object') return `<p class="entry-p">${parseInlineTags(String(e))}</p>`;

  const t = e.type;

  if (t === 'entries' || t === 'section') {
    const name = e.name ? `<div class="entry-h2">${esc(e.name)}</div>` : '';
    return `<div class="entry-sec">${name}${(e.entries||[]).map(renderEntry).join('')}</div>`;
  }
  if (t === 'entry' || t === 'item') {
    if (e.entries) {
      const name = e.name ? `<span class="entry-h3">${esc(e.name)}.</span> ` : '';
      return `<div class="entry-sec">${name}${e.entries.map(renderEntry).join('')}</div>`;
    }
    if (e.entry) return renderEntry(e.entry);
    if (e.name) return `<p class="entry-p"><strong>${esc(e.name)}</strong></p>`;
    return '';
  }
  if (t === 'list') {
    const items = (e.items || []).map(item => {
      if (typeof item === 'string') return `<li>${parseInlineTags(item)}</li>`;
      // alcuni item localizzati perdono il "type": se hanno la forma di un
      // item/entry (name + entry/entries) li trattiamo comunque come tali,
      // altrimenti il nome del punto elenco sparisce silenziosamente.
      const looksLikeItem = item.type === 'item' || item.type === 'entry'
        || (!item.type && (item.name || item.entry || item.entries));
      if (looksLikeItem) {
        const n = item.name ? `<strong>${esc(item.name)}.</strong> ` : '';
        const body = (item.entries || (item.entry ? [item.entry] : [])).map(renderEntry).join('');
        return `<li>${n}${body}</li>`;
      }
      return `<li>${renderEntry(item)}</li>`;
    }).join('');
    return `<ul class="entry-ul">${items}</ul>`;
  }
  if (t === 'table') {
    const cap = e.caption ? `<caption style="color:var(--c-text2);font-size:12px;padding-bottom:4px;text-align:left;">${esc(e.caption)}</caption>` : '';
    const ths = (e.colLabels||[]).map(h => `<th>${esc(h)}</th>`).join('');
    const trs = (e.rows||[]).map(row => {
      const tds = row.map(cell => {
        if (typeof cell === 'object' && cell.type === 'cell') {
          const r = cell.roll;
          return `<td>${esc(r ? (r.exact !== undefined ? r.exact : `${r.min}–${r.max}`) : '')}</td>`;
        }
        return `<td>${typeof cell === 'object' ? renderEntry(cell) : parseInlineTags(String(cell))}</td>`;
      }).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<div style="overflow-x:auto"><table class="entry-table">${cap}<thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
  }
  if (t === 'inset' || t === 'insetReadaloud' || t === 'inlineBlock') {
    const title = e.name ? `<div class="entry-inset-t">${esc(e.name)}</div>` : '';
    return `<div class="entry-inset">${title}${(e.entries||[]).map(renderEntry).join('')}</div>`;
  }
  if (t === 'image') {
    const path = e.href?.path || e.href?.url;
    if (!path) return '';
    const url = `/img/${path}`;
    return `<div class="entry-img-wrap" data-img-url="${esc(url)}" data-img-name="${esc(e.title||'')}">
      <img src="${esc(url)}" alt="${esc(e.title||'')}" loading="lazy">
      ${e.title ? `<div class="entry-img-cap">${parseInlineTags(e.title)}</div>` : ''}
    </div>`;
  }
  if (t === 'gallery') {
    return `<div class="entry-gallery">${(e.images||[]).map(renderEntry).join('')}</div>`;
  }
  if (t === 'tableGroup') {
    const name = e.name ? `<div class="entry-h2">${esc(e.name)}</div>` : '';
    return `<div class="entry-sec">${name}${(e.tables||[]).map(renderEntry).join('')}</div>`;
  }
  if (t === 'inline' || t === 'p') {
    return `<p class="entry-p">${(e.entries||[]).map(renderEntry).join('')}</p>`;
  }
  if (t === 'quote') {
    const body = (e.entries||[]).map(renderEntry).join('');
    const by = e.by ? ` <footer style="color:var(--c-text3);font-size:12px;">— ${esc(e.by)}</footer>` : '';
    return `<blockquote style="border-left:3px solid var(--c-border2);margin:8px 0;padding:6px 12px;color:var(--c-text2);font-style:italic;">${body}${by}</blockquote>`;
  }
  if (t === 'abilityDc' || t === 'abilityAttackMod') return `<span>${esc(e.name||'')}</span>`;
  if (t === 'bonus') { const v = e.value >= 0 ? `+${e.value}` : e.value; return `<span>${v}</span>`; }
  if (t === 'dice' || t === 'hit') {
    const label = (e.toRoll||[]).map(r => `${r.number||''}d${r.faces||''}`).join('+') || e.number || '?';
    return `<span style="color:var(--c-gold);font-family:monospace;font-size:12px;">${esc(String(label))}</span>`;
  }
  if (t === 'link') return `<span>${esc(e.text||'')}</span>`;
  if (t === 'tag')  return `<span>${esc(e.text||'')}</span>`;

  // Fallback (entries/traits without an explicit "type", e.g. razze/background)
  // ── alcuni testi localizzati perdono il campo "type" durante il merge
  // della traduzione lato BE (es. {items:[...]} senza type:"list", o
  // {rows:[...],colLabels:[...]} senza type:"table"): senza questa rete
  // di sicurezza l'intero blocco sparisce invece di renderizzarsi.
  if (e.items && !t) {
    return renderEntry({ ...e, type: 'list' });
  }
  if (Array.isArray(e.rows) && (e.colLabels || e.caption) && !t) {
    return renderEntry({ ...e, type: 'table' });
  }
  if (e.entries) {
    const name = e.name ? `<div class="entry-h2">${esc(e.name)}</div>` : '';
    return `<div class="entry-sec">${name}${e.entries.map(renderEntry).join('')}</div>`;
  }
  if (e.entry)   return renderEntry(e.entry);
  if (e.text)    return `<p class="entry-p">${esc(e.text)}</p>`;
  return '';
}

function renderContent(content) {
  if (!content) return '<p class="entry-p" style="color:var(--c-text3)">Nessun contenuto disponibile.</p>';
  if (typeof content === 'string') return `<p class="entry-p">${esc(content)}</p>`;

  const parts = [];

  if (Array.isArray(content.entries)) {
    parts.push(content.entries.map(renderEntry).join(''));
  }
  if (Array.isArray(content.entriesHigherLevel)) {
    parts.push(content.entriesHigherLevel.map(renderEntry).join(''));
  }

  // Monster blocks
  const namedSections = [
    ['trait',        'Tratti'],
    ['action',       'Azioni'],
    ['bonus',        'Azioni Bonus'],
    ['reaction',     'Reazioni'],
    ['legendary',    'Azioni Leggendarie'],
    ['mythicActions','Azioni Mitiche'],
    ['variant',      'Varianti'],
  ];
  for (const [key, heading] of namedSections) {
    const arr = content[key];
    if (!Array.isArray(arr) || arr.length === 0) continue;
    const items = arr.map(item => {
      if (!item) return '';
      const name = item.name ? `<span class="named-block-t">${parseInlineTags(item.name)}.</span> ` : '';
      const body = (item.entries||[]).map(renderEntry).join('');
      return `<div class="named-block">${name}${body}</div>`;
    }).join('');
    parts.push(`<div class="det-section-head">${esc(heading)}</div>${items}`);
  }

  return parts.join('') || '<p class="entry-p" style="color:var(--c-text3)">Nessun contenuto disponibile.</p>';
}

// ── List item badges ───────────────────────────────────
function listBadges(ent) {
  const g = ent.game;
  const b = [];

  if (ent.source) b.push(`<span class="badge b-src">${esc(ent.source)}</span>`);

  if (g?.kind === 'spell') {
    const lvl = g.summary?.level;
    const isCT = g.summary?.isCantrip;
    const sch  = g.summary?.school;
    if (isCT) b.push(`<span class="badge b-lvl">Cantrip</span>`);
    else if (lvl != null) b.push(`<span class="badge b-lvl">Liv.${lvl}</span>`);
    if (sch?.key || sch?.label) b.push(`<span class="badge b-sch">${esc(schoolName(sch.key||sch.label))}</span>`);
  }

  if (g?.kind === 'monster') {
    const cr = g.summary?.cr;
    const tp = g.summary?.type;
    if (cr != null) b.push(`<span class="badge b-cr">GS ${esc(cr)}</span>`);
    if (tp) b.push(`<span class="badge" style="background:rgba(212,96,96,.08);color:#c08080;">${esc(cap(tp))}</span>`);
  }

  if (g?.kind === 'item') {
    const rar = g.summary?.rarity;
    if (rar) {
      const cls = rarityClass(rar);
      b.push(`<span class="badge ${cls}" style="border:1px solid currentColor;opacity:0.8;">${esc(cap(rar))}</span>`);
    }
    const it = g.summary?.itemType;
    if (it) b.push(`<span class="badge b-src">${esc(it)}</span>`);
  }

  if (ent.hasItalian) b.push(`<span class="badge b-it">IT</span>`);
  return b.join('');
}

function renderListItem(ent) {
  const col = typeColor(ent.entityType);
  const orig = (ent.originalName && ent.originalName !== ent.name)
    ? `<div class="ent-orig">${esc(ent.originalName)}</div>` : '';
  const pinned = isPinned(ent.id);

  // bottone "☆ Libro": solo per gli incantesimi, è il libro del player, non
  // la plancia del DM (che invece funziona per qualsiasi entità).
  const inBook = ent.entityType === 'spell' && isInBook(ent.id);
  const bookBtn = ent.entityType === 'spell' ? `
      <button class="ent-book-btn ${inBook?'in-book':''}"
        data-book-id="${esc(ent.id)}" data-book-slug="${esc(ent.slug)}" data-book-src="${esc(ent.source||'')}" data-book-name="${esc(ent.name)}"
        title="${inBook?'Rimuovi dal mio libro':'Aggiungi al mio libro'}">${inBook?'⭐':'☆'}</button>` : '';

  return `
    <div class="ent-item"
         data-id="${esc(ent.id)}"
         data-type="${esc(ent.entityType)}"
         data-slug="${esc(ent.slug)}"
         data-src="${esc(ent.source||'')}">
      <div class="ent-stripe" style="background:${col}"></div>
      <div class="ent-body">
        <div class="ent-name">${esc(ent.name)}</div>
        ${orig}
        <div class="ent-meta">${listBadges(ent)}</div>
      </div>
      ${bookBtn}
      <button class="ent-pin-btn ${pinned?'pinned':''}"
        data-pin-id="${esc(ent.id)}" data-pin-type="${esc(ent.entityType)}"
        data-pin-slug="${esc(ent.slug)}" data-pin-src="${esc(ent.source||'')}" data-pin-name="${esc(ent.name)}"
        title="${pinned?'Rimuovi dalla plancia':'Aggiungi alla plancia'}">${pinned?'📍':'📌'}</button>
    </div>`;
}

// ── Detail renderers ───────────────────────────────────
function spellDetail(ent) {
  const g = ent.game || {};
  const sum  = g.summary  || {};
  const cast = g.casting  || {};
  const rng  = g.range    || {};
  const comp = g.components || {};
  const dur  = g.duration || {};
  const lst  = g.spellLists || {};

  const lvlLabel = sum.isCantrip ? 'Cantrip'
    : (sum.level != null ? `${sum.level}° livello` : '—');
  const schLabel = schoolName(sum.school?.key || sum.school?.label);
  const castTime = (cast.time || []).join(', ') || '—';
  const rangeStr = formatSpellRange(rng);

  const compParts = [];
  if (comp.verbal)   compParts.push('V');
  if (comp.somatic)  compParts.push('S');
  if (comp.material) compParts.push('M');
  let compStr = compParts.join(', ') || '—';
  if (comp.material && comp.materialText) compStr += ` (${comp.materialText})`;

  let durStr = '—';
  if (dur.flags?.isInstantaneous) durStr = 'Istantanea';
  else if (dur.primary?.type) durStr = `${dur.primary.type}${dur.primary.unit ? ' '+dur.primary.unit : ''}`;

  const flags = [];
  if (dur.flags?.requiresConcentration) flags.push('<span class="badge" style="background:rgba(212,96,96,.14);color:#d46060;border:1px solid rgba(212,96,96,.28);">Concentrazione</span>');
  if (dur.flags?.isRitual)              flags.push('<span class="badge" style="background:rgba(96,144,212,.14);color:#6090d4;border:1px solid rgba(96,144,212,.28);">Rituale</span>');
  if (cast.flags?.isBonusAction)        flags.push('<span class="badge b-src">Azione Bonus</span>');
  if (cast.flags?.isReaction)           flags.push('<span class="badge b-src">Reazione</span>');

  const classes = lst.classes || [];
  const classHtml = classes.length
    ? `<div class="sg-cell full"><div class="sg-label">Classi</div><div class="class-chips">${classes.map(c=>`<span class="cls-chip">${esc(cap(c))}</span>`).join('')}</div></div>`
    : '';
  const flagHtml = flags.length
    ? `<div class="sg-cell full"><div class="sg-label">Note</div><div style="display:flex;gap:4px;flex-wrap:wrap;">${flags.join('')}</div></div>`
    : '';

  const content = ent.content?.localized || ent.content?.english;

  return `
    <div class="spell-grid">
      <div class="sg-cell"><div class="sg-label">Livello</div><div class="sg-val">${esc(lvlLabel)}</div></div>
      <div class="sg-cell"><div class="sg-label">Scuola</div><div class="sg-val">${esc(schLabel)}</div></div>
      <div class="sg-cell"><div class="sg-label">Tempo di lancio</div><div class="sg-val">${esc(castTime)}</div></div>
      <div class="sg-cell"><div class="sg-label">Gittata</div><div class="sg-val">${esc(rangeStr)}</div></div>
      <div class="sg-cell"><div class="sg-label">Componenti</div><div class="sg-val" style="font-size:12px;">${esc(compStr)}</div></div>
      <div class="sg-cell"><div class="sg-label">Durata</div><div class="sg-val">${esc(durStr)}</div></div>
      ${flagHtml}
      ${classHtml}
    </div>
    <div class="det-body">${renderContent(content)}</div>`;
}

// Alcune entità (mostri PNG nei moduli avventura, razze ristampate in più
// manuali, ecc.) sono "copy variant": 5etools non duplica il testo di
// tratti/azioni/descrizione, che va recuperato dall'entità base quando
// quella corrente non ha contenuto proprio. La catena può avere più livelli
// (copia di una copia), quindi si risale finché non si trova testo reale.
const CONTENT_SECTION_KEYS = ['entries', 'trait', 'action', 'bonus', 'reaction', 'legendary', 'mythic'];
const hasOwnMonsterContent = c => CONTENT_SECTION_KEYS.some(k => Array.isArray(c?.[k]) && c[k].length);

// I flag di copia vivono in `game.flags` per i mostri e direttamente in
// `normalized` per le razze (le razze non hanno un campo `game`).
function copyVariantFlags(ent) {
  const gf = ent.game?.flags || {};
  const n  = ent.normalized || {};
  return {
    isCopyVariant: gf.isCopyVariant ?? n.isCopyVariant ?? false,
    copiedFromId:   gf.copiedFromId   ?? n.copiedFromId   ?? null,
    copiedFromName: gf.copiedFromName ?? n.copiedFromName ?? null,
  };
}

// `labelPrefix` è la frase completa che precede il nome dell'entità base,
// es. "Tratti e azioni ereditati da" (mostri) o "Descrizione ereditata da" (razze).
async function resolveInheritedContent(ent, content, labelPrefix) {
  const fl = copyVariantFlags(ent);
  if (hasOwnMonsterContent(content) || !fl.isCopyVariant || !fl.copiedFromId) {
    return { content, inheritedHtml: '' };
  }
  const seen = new Set([ent.id]);
  let nextId = fl.copiedFromId, nextName = fl.copiedFromName;
  for (let hop = 0; nextId && hop < 5 && !seen.has(nextId); hop++) {
    seen.add(nextId);
    let base;
    try { base = await api.byId(nextId); } catch { break; }
    const baseContent = base.content?.localized || base.content?.english;
    if (hasOwnMonsterContent(baseContent)) {
      return {
        content: baseContent,
        inheritedHtml: `<div class="badge b-src" style="margin:14px 26px 0;display:inline-block;">${esc(labelPrefix)} ${esc(nextName || base.name)}</div>`,
      };
    }
    const baseFl = copyVariantFlags(base);
    nextId   = baseFl.isCopyVariant ? baseFl.copiedFromId : null;
    nextName = baseFl.copiedFromName;
  }
  return { content, inheritedHtml: '' };
}

async function monsterDetail(ent) {
  const g   = ent.game || {};
  const sum = g.summary   || {};
  const ab  = g.abilities || {};
  const def = g.defenses  || {};
  const mov = g.movement  || {};
  const sns = g.senses    || {};
  const ft  = g.features  || {};
  const fl  = g.flags     || {};

  const sizes = (sum.sizes||[]).map(s=>SIZE_NAMES[s]||s).join('/');
  const align = (sum.alignment||[]).join(' ');

  const spd = [];
  if (mov.walk)   spd.push(`${ftToM(mov.walk)} metri`);
  if (mov.fly)    spd.push(`volo ${ftToM(mov.fly)} metri`);
  if (mov.swim)   spd.push(`nuoto ${ftToM(mov.swim)} metri`);
  if (mov.climb)  spd.push(`scalata ${ftToM(mov.climb)} metri`);
  if (mov.burrow) spd.push(`scavo ${ftToM(mov.burrow)} metri`);

  const senseList = (sns.senses||[]).map(translateSenseLine).join(', ');
  const vuln = (def.damageVulnerabilities||[]).map(dmgName).join(', ');
  const res  = (def.damageResistances||[]).map(dmgName).join(', ');
  const imm  = (def.damageImmunities||[]).map(dmgName).join(', ');
  const cImm = (def.conditionImmunities||[]).map(condName).join(', ');

  const abilityKeys = ['str','dex','con','int','wis','cha'];
  const abGridHtml = abilityKeys.map(k => {
    const v = ab[k];
    if (v == null) return `<div class="ab-cell"><div class="ab-lbl">${k.toUpperCase()}</div><span class="ab-val">—</span></div>`;
    return `<div class="ab-cell"><div class="ab-lbl">${k.toUpperCase()}</div><span class="ab-val">${v}</span><span class="ab-mod">${abMod(v)}</span></div>`;
  }).join('');

  const ftBadges = [];
  if (ft.hasSpellcasting)      ftBadges.push('Magia');
  if (ft.hasLegendaryActions)  ftBadges.push('Az. Leggendarie');
  if (ft.hasMythicActions)     ftBadges.push('Az. Mitiche');
  if (fl.isSwarm)              ftBadges.push('Sciame');
  if (fl.isNamedCreature)      ftBadges.push('Creatura Nominata');

  const rawContent = ent.content?.localized || ent.content?.english;
  const { content, inheritedHtml } = await resolveInheritedContent(ent, rawContent, 'Tratti e azioni ereditati da');

  return `
    <div class="stat-block">
      <div class="sb-sub">${esc(sizes)} ${esc(cap(sum.type||''))}${align?`, ${esc(align)}`:''}</div>
      <div class="sb-divider"></div>
      <div class="sb-row">
        <div class="sb-kv"><span class="sb-k">CA</span>&nbsp;<span class="sb-v">${def.ac??'—'}</span></div>
        <div class="sb-kv"><span class="sb-k">PF</span>&nbsp;<span class="sb-v">${def.hpAverage??'—'}${def.hpFormula?` (${def.hpFormula})`:''}</span></div>
        <div class="sb-kv"><span class="sb-k">Vel.</span>&nbsp;<span class="sb-v">${esc(spd.join(', ')||'—')}</span></div>
      </div>
      <div class="sb-divider"></div>
      <div class="ab-grid">${abGridHtml}</div>
      <div class="sb-divider"></div>
      <div class="sb-row-col">
        ${senseList ? `<div class="sb-kv"><span class="sb-k">Sensi</span>&nbsp;<span class="sb-v">${esc(senseList)}</span></div>` : ''}
        ${sum.passive!=null ? `<div class="sb-kv"><span class="sb-k">Perc. passiva</span>&nbsp;<span class="sb-v">${sum.passive}</span></div>` : ''}
        ${sum.cr!=null ? `<div class="sb-kv"><span class="sb-k">GS</span>&nbsp;<span class="sb-v">${esc(sum.cr)}</span></div>` : ''}
      </div>
      ${(vuln || res || imm || cImm) ? `
      <div class="sb-divider"></div>
      <div class="sb-row-col">
        ${vuln ? `<div class="sb-kv"><span class="sb-k">Vulnerabilità</span>&nbsp;<span class="sb-v">${esc(vuln)}</span></div>` : ''}
        ${res  ? `<div class="sb-kv"><span class="sb-k">Resistenze</span>&nbsp;<span class="sb-v">${esc(res)}</span></div>` : ''}
        ${imm  ? `<div class="sb-kv"><span class="sb-k">Immunità danni</span>&nbsp;<span class="sb-v">${esc(imm)}</span></div>` : ''}
        ${cImm ? `<div class="sb-kv"><span class="sb-k">Imm. condizioni</span>&nbsp;<span class="sb-v">${esc(cImm)}</span></div>` : ''}
      </div>` : ''}
      ${ftBadges.length ? `<div class="sb-divider"></div><div style="display:flex;flex-wrap:wrap;gap:4px;">${ftBadges.map(f=>`<span class="badge b-src">${esc(f)}</span>`).join('')}</div>` : ''}
    </div>
    ${inheritedHtml}
    <div class="det-body">${renderContent(content)}</div>`;
}

// ── Equipaggiamento di base (armi/armature/attrezzatura non magica) ────
// A differenza degli item magici, l'itemBase non ha dati "game" normalizzati:
// CA, danno, peso e valore vengono dai dati grezzi 5e (richiesti con
// includeRaw, vedi api.bySlug/byId), nel formato sintetico a sigle del
// formato 5etools (es. "LA"/"MA"/"HA" per le armature, "S"/"P"/"B" per i
// tipi di danno) — qui se ne traduce solo il sottoinsieme che serve davvero
// (armi e armature), il resto dell'equipaggiamento mostra solo peso/valore.
const ARMOR_TYPE_LABELS = { LA: 'Armatura leggera', MA: 'Armatura media', HA: 'Armatura pesante', S: 'Scudo' };
const RAW_DAMAGE_LETTERS = { B: 'bludgeoning', P: 'piercing', S: 'slashing' };
const WEAPON_PROPERTY_NAMES = {
  A: 'Munizioni', F: 'Finezza', H: 'Pesante', L: 'Leggera', LD: 'Caricamento',
  R: 'Portata', RLD: 'Ricarica', S: 'Speciale', T: 'Lancio', '2H': 'A due mani', V: 'Versatile',
};

function itemBaseDetail(ent) {
  const raw = ent.raw5e || {};
  const rows = [];

  if (raw.armor || raw.ac != null) {
    const typeLabel = ARMOR_TYPE_LABELS[raw.type];
    let acText = raw.ac != null ? String(raw.ac) : '—';
    if (raw.type === 'S') acText = `+${raw.ac}`;
    else if (raw.type === 'LA') acText += ' + mod. Des';
    else if (raw.type === 'MA') acText += ' + mod. Des (max 2)';
    rows.push(['CA', acText]);
    if (typeLabel) rows.push(['Tipo', typeLabel]);
    if (raw.strength) rows.push(['Forza richiesta', raw.strength]);
    if (raw.stealth)  rows.push(['Furtività', 'Svantaggio', 'rar-uncommon']);
  }

  if (raw.weapon || raw.dmg1) {
    if (raw.weaponCategory) rows.push(['Categoria', WEAPON_CAT_NAMES[raw.weaponCategory] || cap(raw.weaponCategory)]);
    const dmgTypeLabel = raw.dmgType ? dmgName(RAW_DAMAGE_LETTERS[raw.dmgType] || raw.dmgType) : '';
    if (raw.dmg1) rows.push(['Danno', `${raw.dmg1} ${dmgTypeLabel}`.trim()]);
    if (raw.dmg2) rows.push(['Danno (due mani)', `${raw.dmg2} ${dmgTypeLabel}`.trim()]);
    const props = (raw.property || []).map(p => WEAPON_PROPERTY_NAMES[p] || p).join(', ');
    if (props) rows.push(['Proprietà', props]);
    if (raw.range) rows.push(['Gittata', raw.range]);
  }

  if (raw.weight != null) rows.push(['Peso', `${raw.weight} lb.`]);
  if (raw.value  != null) rows.push(['Valore', `${(raw.value / 100).toLocaleString()} mo`]);

  const metaGrid = rows.length ? `
    <div class="spell-grid" style="margin:18px 26px;">
      ${rows.map(([lbl, val, cls]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val ${cls||''}">${esc(val)}</div></div>`
      ).join('')}
    </div>` : '';

  const content = ent.content?.localized || ent.content?.english;
  return `${metaGrid}<div class="det-body">${renderContent(content)}</div>`;
}

function itemDetail(ent) {
  const g   = ent.game || {};
  const sum = g.summary || {};
  const usg = g.usage   || {};
  const cbt = g.combat  || {};

  const rows = [];
  if (sum.itemType)  rows.push(['Tipo', cap(sum.itemType)]);
  if (sum.rarity)    rows.push(['Rarità', cap(sum.rarity), rarityClass(sum.rarity)]);
  if (usg.requiresAttunement) rows.push(['Sintonia', 'Richiesta', 'rar-uncommon']);
  if (usg.weight != null)  rows.push(['Peso', `${usg.weight} lb.`]);
  if (usg.value  != null)  rows.push(['Valore', `${usg.value} mo`]);
  if (cbt.ac)              rows.push(['CA', `+${cbt.ac}`]);
  if (cbt.damage1)         rows.push(['Danno', `${cbt.damage1} ${cbt.damageType||''}`.trim()]);
  if (cbt.properties?.length) rows.push(['Proprietà', cbt.properties.join(', ')]);

  const metaGrid = rows.length ? `
    <div class="spell-grid" style="margin:18px 26px;">
      ${rows.map(([lbl, val, cls]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val ${cls||''}">${esc(val)}</div></div>`
      ).join('')}
    </div>` : '';

  const content = ent.content?.localized || ent.content?.english;
  return `${metaGrid}<div class="det-body">${renderContent(content)}</div>`;
}

async function raceDetail(ent) {
  const n = ent.normalized || {};
  if ((n.skillChoices?.length || n.languageChoices?.length) && !TAG_NAME_CACHE[S.locale]) {
    await prefetchTagNames(S.locale);
  }

  const skillName = s => {
    const hit = tagName('skill', s);
    return hit ? `<a class="tag-link" data-id="${esc(hit.id)}" tabindex="0">${esc(hit.name)}</a>` : esc(cap(s));
  };
  const languageName = l => {
    const hit = tagName('language', l);
    return hit ? `<a class="tag-link" data-id="${esc(hit.id)}" tabindex="0">${esc(hit.name)}</a>` : esc(cap(l));
  };

  // ── Ability bonuses ──────────────────────────────────
  const abilityParts = Object.entries(n.abilityFixed || {}).map(([k, v]) => `${abbrAbility(k)} +${v}`);
  for (const c of n.abilityChoices || []) {
    const from = (c.from?.length && !c.from.includes('any')) ? c.from.map(abbrAbility).join('/') : 'qualsiasi caratteristica';
    abilityParts.push(`Scegli ${c.count} (+${c.amount}) tra: ${from}`);
  }

  // ── Speed ─────────────────────────────────────────────
  const spd = [];
  const spdRaw = n.speedRaw;
  if (typeof spdRaw === 'number') {
    spd.push(`${ftToM(spdRaw)} metri`);
  } else if (spdRaw && typeof spdRaw === 'object') {
    if (spdRaw.walk)   spd.push(`${ftToM(spdRaw.walk)} metri`);
    if (spdRaw.fly)    spd.push(`volo ${ftToM(spdRaw.fly)} metri`);
    if (spdRaw.swim)   spd.push(`nuoto ${ftToM(spdRaw.swim)} metri`);
    if (spdRaw.climb)  spd.push(`scalata ${ftToM(spdRaw.climb)} metri`);
    if (spdRaw.burrow) spd.push(`scavo ${ftToM(spdRaw.burrow)} metri`);
  }

  // ── Senses ──────────────────────────────────────────
  const senses = [];
  if (n.darkvision)  senses.push(`Scurovisione ${ftToM(n.darkvision)} metri`);
  if (n.blindsight)  senses.push(`Vista cieca ${ftToM(n.blindsight)} metri`);

  const sizes = (n.size || []).map(s => SIZE_NAMES[s] || s).join('/');

  // ── Meta grid ─────────────────────────────────────────
  const metaRows = [];
  if (sizes)              metaRows.push(['Taglia', esc(sizes)]);
  if (spd.length)         metaRows.push(['Velocità', esc(spd.join(', '))]);
  if (abilityParts.length) metaRows.push(['Caratteristiche', esc(abilityParts.join('; '))]);
  if (senses.length)      metaRows.push(['Sensi', esc(senses.join(', '))]);
  if (n.creatureTypes?.length) metaRows.push(['Tipo', esc(n.creatureTypes.map(cap).join(', '))]);

  const metaGrid = metaRows.length ? `
    <div class="spell-grid" style="margin:18px 26px;">
      ${metaRows.map(([lbl, val]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val">${val}</div></div>`
      ).join('')}
    </div>` : '';

  // ── Proficiencies & languages ──────────────────────────
  const profRows = [];

  const langFixed = (n.languageProficiencies || []).map(languageName);
  const langChoices = (n.languageChoices || []).map(c => {
    const from = c.from || [];
    if (from.includes('anyStandard')) return `Scegli ${c.count} lingua/e standard a scelta`;
    if (from.includes('any'))         return `Scegli ${c.count} lingua/e a scelta`;
    return `Scegli ${c.count} tra: ${from.map(languageName).join(', ')}`;
  });
  const langAll = [...langFixed, ...langChoices].filter(Boolean).join(', ');
  if (langAll) profRows.push(['Lingue', langAll]);

  if (n.skillChoices?.length) {
    const skillStr = n.skillChoices.map(c => {
      const from = c.from || [];
      return from.includes('any')
        ? `Scegli ${c.count} abilità a piacere`
        : `Scegli ${c.count} tra: ${from.map(skillName).join(', ')}`;
    }).join('; ');
    profRows.push(['Abilità', skillStr]);
  }
  if (n.armorProficiencies?.length)
    profRows.push(['Armature', esc(n.armorProficiencies.map(a => ARMOR_NAMES[a] || cap(a)).join(', '))]);
  if (n.weaponProficiencies?.length)
    profRows.push(['Armi', esc(n.weaponProficiencies.map(w => WEAPON_CAT_NAMES[w] || cap(w)).join(', '))]);
  if (n.toolProficiencies?.length)
    profRows.push(['Strumenti', n.toolProficiencies.map(t => TOOL_NAMES[t] || parseInlineTags(t)).join(', ')]);

  const profGrid = profRows.length ? `
    <div class="spell-grid" style="margin:0 26px 18px;grid-template-columns:1fr;">
      ${profRows.map(([lbl, val]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val">${val}</div></div>`
      ).join('')}
    </div>` : '';

  // ── Damage / condition interactions (raro per le razze, ma capita) ──
  const vuln = (n.damageVulnerabilities || []).map(dmgName).join(', ');
  const res  = (n.damageResistances || []).map(dmgName).join(', ');
  const imm  = (n.damageImmunities || []).map(dmgName).join(', ');
  const cImm = (n.conditionImmunities || []).map(condName).join(', ');
  const defGrid = (vuln || res || imm || cImm) ? `
    <div class="spell-grid" style="margin:0 26px 18px;grid-template-columns:1fr;">
      ${vuln ? `<div class="sg-cell"><div class="sg-label">Vulnerabilità</div><div class="sg-val">${esc(vuln)}</div></div>` : ''}
      ${res  ? `<div class="sg-cell"><div class="sg-label">Resistenze</div><div class="sg-val">${esc(res)}</div></div>` : ''}
      ${imm  ? `<div class="sg-cell"><div class="sg-label">Immunità danni</div><div class="sg-val">${esc(imm)}</div></div>` : ''}
      ${cImm ? `<div class="sg-cell"><div class="sg-label">Imm. condizioni</div><div class="sg-val">${esc(cImm)}</div></div>` : ''}
    </div>` : '';

  const rawContent = ent.content?.localized || ent.content?.english;
  const { content, inheritedHtml } = await resolveInheritedContent(ent, rawContent, 'Descrizione ereditata da');
  const introHtml = content?.entries?.length
    ? `<div class="det-body" style="padding-top:0;">${renderContent(content)}</div>` : '';

  return `${metaGrid}${profGrid}${defGrid}${inheritedHtml}${introHtml}`;
}

// ── Prerequisiti (feat, optionalFeature, ...) ──────────
// formato grezzo 5etools: array di clausole alternative (OR); ogni
// clausola è un oggetto con più chiavi in AND (es. {level:4, feat:[...]})
function formatPrerequisiteClause(p) {
  const parts = [];

  if (p.level != null) {
    parts.push(typeof p.level === 'object'
      ? `Livello ${p.level.level}${p.level.class ? ` (${cap(p.level.class.name || p.level.class)})` : ''}`
      : `Livello ${p.level}`);
  }
  if (p.ability?.length) {
    parts.push(p.ability.map(a => {
      const [k, v] = Object.entries(a)[0];
      return `${abbrAbility(k)} ${v}+`;
    }).join(' o '));
  }
  if (p.race?.length) {
    parts.push(p.race.map(r => r.displayEntry || cap(r.name)).join(' o '));
  }
  if (p.background?.length) {
    parts.push(p.background.map(b => cap(b.name || b)).join(' o '));
  }
  if (p.campaign?.length) {
    parts.push(p.campaign.map(c => cap(c.name || c)).join(' o '));
  }
  if (p.proficiency?.length) {
    parts.push(p.proficiency.map(pr => {
      if (pr.armor)  return `competenza con armatura ${(ARMOR_NAMES[pr.armor] || pr.armor).toLowerCase()}`;
      if (pr.weapon) return `competenza con armi ${(WEAPON_CAT_NAMES[pr.weapon] || pr.weapon).toLowerCase()}`;
      const v = Object.values(pr)[0];
      return `competenza: ${cap(String(v))}`;
    }).join(' o '));
  }
  if (p.feat?.length) {
    parts.push(p.feat.map(f => {
      const seg = String(f).split('|');
      return cap(seg[2] || seg[0]);
    }).join(' o '));
  }
  if (p.spellcasting || p.spellcasting2020) parts.push('Capacità di lanciare almeno un incantesimo');
  if (p.other) parts.push(String(p.other));

  return parts.join(', ');
}

function formatPrerequisite(raw) {
  if (!raw?.length) return '';
  return raw.map(formatPrerequisiteClause).filter(Boolean).join(' oppure ');
}

async function featDetail(ent) {
  const n = ent.normalized || {};
  if ((n.skillChoices?.length || n.languageChoices?.length || n.toolChoices?.length) && !TAG_NAME_CACHE[S.locale]) {
    await prefetchTagNames(S.locale);
  }

  const skillName = s => {
    const hit = tagName('skill', s);
    return hit ? `<a class="tag-link" data-id="${esc(hit.id)}" tabindex="0">${esc(hit.name)}</a>` : esc(cap(s));
  };
  const languageName = l => {
    const hit = tagName('language', l);
    return hit ? `<a class="tag-link" data-id="${esc(hit.id)}" tabindex="0">${esc(hit.name)}</a>` : esc(cap(l));
  };

  // ── Prerequisito & bonus alle caratteristiche ──────────
  const prereqStr = formatPrerequisite(n.prerequisite);

  const abilityParts = Object.entries(n.abilityFixed || {}).map(([k, v]) => `${abbrAbility(k)} +${v}`);
  for (const c of n.abilityChoices || []) {
    const from = (c.from?.length && !c.from.includes('any')) ? c.from.map(abbrAbility).join('/') : 'qualsiasi caratteristica';
    abilityParts.push(`+${c.amount ?? 1} a scelta tra: ${from}`);
  }

  const metaRows = [];
  if (prereqStr)           metaRows.push(['Prerequisito', esc(prereqStr)]);
  if (abilityParts.length) metaRows.push(['Caratteristiche', esc(abilityParts.join('; '))]);

  const metaGrid = metaRows.length ? `
    <div class="spell-grid" style="margin:18px 26px;grid-template-columns:1fr;">
      ${metaRows.map(([lbl, val]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val">${val}</div></div>`
      ).join('')}
    </div>` : '';

  // ── Competenze e capacità concesse ──────────────────────
  const profRows = [];

  if (n.savingThrowProficiencies?.length || n.savingThrowChoices?.length) {
    const fixed = (n.savingThrowProficiencies || []).map(abbrAbility);
    const choices = (n.savingThrowChoices || []).map(c => {
      const from = (c.from?.length && !c.from.includes('any')) ? c.from.map(abbrAbility).join('/') : 'qualsiasi';
      return `Scegli ${c.count || 1} tra: ${from}`;
    });
    profRows.push(['Tiri Salvezza', [...fixed, ...choices].join(', ')]);
  }

  if (n.skillProficiencies?.length || n.skillChoices?.length) {
    const fixed = (n.skillProficiencies || []).map(skillName);
    const choices = (n.skillChoices || []).map(c => {
      const from = c.from || [];
      return from.includes('any')
        ? `Scegli ${c.count || 1} abilità a piacere`
        : `Scegli ${c.count || 1} tra: ${from.map(skillName).join(', ')}`;
    });
    profRows.push(['Abilità', [...fixed, ...choices].join(', ')]);
  }

  if (n.expertiseSkills?.length || n.expertiseChoices?.length) {
    const fixed = (n.expertiseSkills || []).map(skillName);
    const choices = (n.expertiseChoices || []).map(c => {
      const from = c.from || [];
      if (from.includes('any_proficient_skill')) return `Scegli ${c.count || 1} abilità in cui sei già competente`;
      if (from.includes('any'))                  return `Scegli ${c.count || 1} abilità a piacere`;
      return `Scegli ${c.count || 1} tra: ${from.map(skillName).join(', ')}`;
    });
    profRows.push(['Competenza (raddoppiata)', [...fixed, ...choices].join(', ')]);
  }

  const langFixed = (n.languageProficiencies || []).map(languageName);
  const langChoices = (n.languageChoices || []).map(c => {
    const from = c.from || [];
    if (from.includes('anyStandard')) return `Scegli ${c.count || 1} lingua/e standard a scelta`;
    if (from.includes('any'))         return `Scegli ${c.count || 1} lingua/e a scelta`;
    return `Scegli ${c.count || 1} tra: ${from.map(languageName).join(', ')}`;
  });
  const langAll = [...langFixed, ...langChoices];
  if (langAll.length) profRows.push(['Lingue', langAll.join(', ')]);

  if (n.armorProficiencies?.length)
    profRows.push(['Armature', esc(n.armorProficiencies.map(a => ARMOR_NAMES[a] || cap(a)).join(', '))]);
  if (n.weaponProficiencies?.length)
    profRows.push(['Armi', esc(n.weaponProficiencies.map(w => WEAPON_CAT_NAMES[w] || cap(w)).join(', '))]);

  if (n.toolProficiencies?.length || n.toolChoices?.length) {
    const fixed = (n.toolProficiencies || []).map(t => TOOL_NAMES[t] || parseInlineTags(t));
    const choices = (n.toolChoices || []).map(c => {
      const from = c.from || [];
      return from.includes('any')
        ? `Scegli ${c.count || 1} strumento/i a scelta`
        : `Scegli ${c.count || 1} tra: ${from.map(t => TOOL_NAMES[t] || cap(t)).join(', ')}`;
    });
    profRows.push(['Strumenti', [...fixed, ...choices].join(', ')]);
  }

  const profGrid = profRows.length ? `
    <div class="spell-grid" style="margin:0 26px 18px;grid-template-columns:1fr;">
      ${profRows.map(([lbl, val]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val">${val}</div></div>`
      ).join('')}
    </div>` : '';

  // ── Badge riassuntivi (resistenza danni, incantesimi extra) ──
  const res = (n.damageResistances || []).map(dmgName).join(', ');
  const flagBadges = [];
  if (res) flagBadges.push(`<span class="badge b-src">Resistenza: ${esc(res)}</span>`);
  if (n.hasAdditionalSpells) flagBadges.push(`<span class="badge b-src">Incantesimi extra</span>`);
  const flagHtml = flagBadges.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:0 26px 18px;">${flagBadges.join('')}</div>` : '';

  const content = ent.content?.localized || ent.content?.english;
  const introHtml = content?.entries?.length
    ? `<div class="det-body" style="padding-top:0;">${renderContent(content)}</div>` : '';

  return `${metaGrid}${profGrid}${flagHtml}${introHtml}`;
}

function genericDetail(ent) {
  const content = ent.content?.localized || ent.content?.english;
  return `<div class="det-body">${renderContent(content)}</div>`;
}

const ABIL_ABBR = { str:'For', dex:'Des', con:'Cos', int:'Int', wis:'Sag', cha:'Car' };
const abbrAbility = k => ABIL_ABBR[k] || (k||'').toUpperCase();

// ── Italian glossaries for class game terms ────────────
// (i dati grezzi dell'API per le classi sono in inglese: questi termini
// sono un set fisso e stabile delle regole 5e, tradotti a mano)
const SIZE_NAMES = { T:'Minuscolo', S:'Piccolo', M:'Medio', L:'Grande', H:'Enorme', G:'Mastodontico' };
const ARMOR_NAMES = { light:'Leggera', medium:'Media', heavy:'Pesante', shield:'Scudo' };
const WEAPON_CAT_NAMES = { simple:'Semplici', martial:'Da guerra', firearms:'Da fuoco', improvised:'Improvvisate' };
const DAMAGE_TYPE_NAMES = {
  acid:'Acido', bludgeoning:'Contundenti', cold:'Freddo', fire:'Fuoco', force:'Forza',
  lightning:'Fulmini', necrotic:'Necrotico', piercing:'Perforanti', poison:'Veleno',
  psychic:'Psichico', radiant:'Radiante', slashing:'Taglienti', thunder:'Tuono',
};
const dmgName  = k => DAMAGE_TYPE_NAMES[k] || cap(k);
const condName = k => CONDITIONS[k]?.name || cap(k);

const SENSE_SUFFIX_NAMES = {
  '(blind beyond this radius)': '(cieco oltre questo raggio)',
};

function translateSenseLine(raw) {
  const senseLabel = word => {
    const hit = tagName('sense', word);
    return hit ? hit.name : (word.toLowerCase() === 'telepathy' ? 'Telepatia' : cap(word));
  };

  const m = /^(\S+)\s+(\d+)\s*ft\.?(.*)$/i.exec(raw.trim());
  if (!m) return senseLabel(/^(\S+)/.exec(raw.trim())?.[1] || raw);

  const [, word, ftAmount, suffix] = m;
  const suffixTrim = suffix.trim();
  const suffixIt = suffixTrim ? ` ${SENSE_SUFFIX_NAMES[suffixTrim] || suffixTrim}` : '';
  return `${senseLabel(word)} ${ftToM(Number(ftAmount))} metri${suffixIt}`;
}
const TOOL_NAMES = {
  "artisan's tools":           "Attrezzi da artigiano",
  "thieves' tools":            "Attrezzi da ladro",
  "tinker's tools":            "Attrezzi da inventore",
  "herbalism kit":             "Kit di erborista",
  "disguise kit":              "Kit da travestimento",
  "forgery kit":               "Kit da falsario",
  "navigator's tools":         "Strumenti da navigatore",
  "poisoner's kit":            "Kit da avvelenatore",
  "calligrapher's supplies":   "Attrezzi da calligrafo",
  "one type of musical instrument": "Uno strumento musicale a scelta",
  "one type of gaming set":    "Un set di gioco a scelta",
  "gaming set":                "Set di gioco",
  "musical instrument":        "Strumento musicale",
  "vehicles (land)":           "Veicoli (terrestri)",
  "vehicles (water)":          "Veicoli (acquatici)",
};
const SUBCLASS_TITLE_NAMES = {
  'Martial Archetype':    'Archetipo Marziale',
  'Arcane Tradition':     'Tradizione Arcana',
  'Divine Domain':        'Dominio Divino',
  'Primal Path':          'Cammino Primordiale',
  'Roguish Archetype':    'Archetipo della Canaglia',
  'Sacred Oath':          'Giuramento Sacro',
  'Otherworldly Patron':  'Patrono Ultraterreno',
  'Bard College':         'Collegio Bardico',
  'Ranger Archetype':     'Archetipo del Ranger',
  'Ranger Conclave':      'Conclave del Ranger',
  'Sorcerous Origin':     'Origine Stregonesca',
  'Monastic Tradition':   'Tradizione Monastica',
  'Artificer Specialist': 'Specialista Artificiere',
  'Druid Circle':         'Circolo Druidico',
  'Primal Origin':        'Origine Primordiale',
};
const TABLE_HEADER_NAMES = {
  'Cantrips Known':              'Trucchetti Conosciuti',
  'Spells Known':                'Incantesimi Conosciuti',
  'Spell Slots per Spell Level': 'Slot Incantesimo per Livello',
  'Invocations Known':           'Invocazioni Conosciute',
  'Mystic Arcanum':              'Arcano Mistico',
  'Sorcery Points':               'Punti Stregoneria',
  'Rages':                       'Furie',
  'Rage Damage':                 'Danno da Furia',
  'Martial Arts':                'Arti Marziali',
  'Ki Points':                   'Punti Ki',
  'Unarmored Movement':          'Movimento senza Armatura',
  'Sneak Attack':                'Attacco Furtivo',
  'Indomitable Uses':            'Usi di Indomabile',
};

async function getFeatureNameMap(type, filterKey, filterValue) {
  if (!filterValue) return {};
  try {
    const data = await api.list({ type, locale: S.locale, [filterKey]: filterValue, limit: 300 });
    const map = {};
    for (const r of data.results || []) map[slugify(r.originalName || r.name)] = { name: r.name, id: r.id };
    return map;
  } catch {
    return {};
  }
}

function translateTableHeader(raw, featureNameMap = {}) {
  const m = /^\{@filter\s+([^|}]+)/.exec(raw);
  const label = (m ? m[1] : raw).trim();
  const hit = featureNameMap[slugify(label)];
  if (hit) return esc(hit.name);
  if (TABLE_HEADER_NAMES[label]) return esc(TABLE_HEADER_NAMES[label]);
  const ord = /^(\d+)(st|nd|rd|th)$/i.exec(label);
  if (ord) return `${ord[1]}°`;
  return parseInlineTags(raw);
}

// ── Class/subclass feature-by-level table (shared) ─────
function parseFeatureLevels(rawList, objKey) {
  const byLevel = {};
  for (const f of rawList || []) {
    const str = typeof f === 'string' ? f : f[objKey];
    if (!str) continue;
    const parts = str.split('|');
    const name  = parts[0];
    const lvl   = parseInt(parts[parts.length - 1], 10);
    if (!lvl) continue;
    (byLevel[lvl] ??= []).push(name);
  }
  return byLevel;
}

// Le celle delle tabelle di classe non sono mai semplici numeri: possono
// essere oggetti tipizzati (dado, bonus, bonus di velocità) che vanno
// formattati esplicitamente, altrimenti finiscono come "[object Object]".
function formatTableCell(v) {
  if (v == null || v === '') return '—';
  if (typeof v === 'object') {
    if (v.type === 'dice') {
      const roll = (v.toRoll || []).map(d => `${d.number}d${d.faces}`).join(' + ');
      return esc(roll || '—');
    }
    if (v.type === 'bonus')      return v.value ? `+${esc(v.value)}` : '—';
    if (v.type === 'bonusSpeed') return v.value ? `+${ftToM(v.value)} m` : '—';
    if (v.value != null) return esc(String(v.value));
    return '—';
  }
  if (v === 'Unlimited') return 'Illimitato';
  return esc(String(v));
}

function buildGroupCols(tableGroupsRaw, optionalProgressionRaw, featureNameMap) {
  const cols = [];
  for (const g of tableGroupsRaw || []) {
    const rows = g.rows || g.rowsSpellProgression || [];
    (g.colLabels || []).forEach((label, i) => {
      cols.push({ label: translateTableHeader(label, featureNameMap), valueAtLevel: lvl => formatTableCell(rows[lvl - 1]?.[i]) });
    });
  }
  for (const p of optionalProgressionRaw || []) {
    const hit   = featureNameMap[slugify(p.name)];
    const label = hit ? esc(hit.name) : esc(TABLE_HEADER_NAMES[p.name] || p.name);
    const prog  = p.progression || {};
    const keys  = Object.keys(prog).map(Number).sort((a, b) => a - b);
    cols.push({
      label,
      valueAtLevel: lvl => {
        let val = null;
        for (const k of keys) { if (k <= lvl) val = prog[k]; else break; }
        return formatTableCell(val);
      },
    });
  }
  return cols;
}

function renderProgressionTable(byLevel, groupCols, featureNameMap, { minLevel = 1, maxLevel = 20 } = {}) {
  if (!Object.keys(byLevel).length) return '';

  const ths = ['Liv.', 'Capacità', ...groupCols.map(c => c.label)].map(h => `<th>${h}</th>`).join('');

  const trs = Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => i + minLevel).map(lvl => {
    const feats = byLevel[lvl] || [];
    const featCell = feats.length ? feats.map(nm => {
      const hit = featureNameMap[slugify(nm)];
      return hit ? `<a class="tag-link" data-id="${esc(hit.id)}" tabindex="0">${esc(hit.name)}</a>` : esc(nm);
    }).join(', ') : '—';
    const extraCells = groupCols.map(c => `<td>${c.valueAtLevel(lvl)}</td>`).join('');
    return `<tr><td>${lvl}</td><td>${featCell}</td>${extraCells}</tr>`;
  }).join('');

  return `
    <div class="entry-sec" style="margin:0 26px 28px;">
      <div class="entry-h2">Progressione</div>
      <div style="overflow-x:auto"><table class="entry-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>
    </div>`;
}

async function classDetail(ent) {
  const n = ent.normalized || {};
  if (n.skillChoices?.length && !TAG_NAME_CACHE[S.locale]) await prefetchTagNames(S.locale);
  const skillName = s => {
    const hit = tagName('skill', s);
    return hit ? `<a class="tag-link" data-id="${esc(hit.id)}" tabindex="0">${esc(hit.name)}</a>` : esc(cap(s));
  };

  // ── Meta grid ──────────────────────────────────────
  const metaRows = [];
  if (n.hitDiceRaw)
    metaRows.push(['Dado Vita', `d${n.hitDiceRaw.faces}`]);
  if (n.savingThrowProficiencies?.length)
    metaRows.push(['Tiri Salvezza', n.savingThrowProficiencies.map(abbrAbility).join(', ')]);
  if (n.spellcastingAbility)
    metaRows.push(['Car. Incantesimi', abbrAbility(n.spellcastingAbility)]);
  if (n.subclassTitle)
    metaRows.push(['Sottoclasse', esc(SUBCLASS_TITLE_NAMES[n.subclassTitle] || n.subclassTitle)]);
  if (n.multiclassRequirementAbilityMinimums?.length)
    metaRows.push(['Multiclasse', n.multiclassRequirementAbilityMinimums.map(r => `${abbrAbility(r.ability)} ${r.minimum}+`).join(', ')]);

  const metaGrid = metaRows.length ? `
    <div class="spell-grid" style="margin:18px 26px;">
      ${metaRows.map(([lbl, val]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val">${val}</div></div>`
      ).join('')}
    </div>` : '';

  // ── Proficiencies ──────────────────────────────────
  const profRows = [];
  if (n.armorProficiencies?.length)
    profRows.push(['Armature', n.armorProficiencies.map(a => ARMOR_NAMES[a] || cap(a)).join(', ')]);
  if (n.weaponProficiencies?.length)
    profRows.push(['Armi', n.weaponProficiencies.map(w => WEAPON_CAT_NAMES[w] || cap(w)).join(', ')]);
  if (n.toolProficiencies?.length)
    profRows.push(['Strumenti', n.toolProficiencies.map(t => TOOL_NAMES[t] || parseInlineTags(t)).join(', ')]);
  if (n.skillChoices?.length)
    profRows.push(['Abilità', n.skillChoices.map(c => `Scegli ${c.count} tra: ${c.from.map(skillName).join(', ')}`).join('; ')]);

  const profGrid = profRows.length ? `
    <div class="spell-grid" style="margin:0 26px 18px;grid-template-columns:1fr;">
      ${profRows.map(([lbl, val]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val">${val}</div></div>`
      ).join('')}
    </div>` : '';

  // ── Starting equipment ─────────────────────────────
  const equipHtml = n.startingEquipmentDefault?.length ? `
    <div class="entry-sec" style="margin:0 26px 22px;">
      <div class="entry-h2">Equipaggiamento Iniziale</div>
      <ul class="entry-ul">${n.startingEquipmentDefault.map(e => `<li>${parseInlineTags(e)}</li>`).join('')}</ul>
    </div>` : '';

  // ── Available subclasses ───────────────────────────
  let subclassHtml = '';
  try {
    const subData = await api.list({ type: 'subclass', locale: S.locale, class: ent.slug, limit: 50 });
    if (subData.results?.length) {
      const title = SUBCLASS_TITLE_NAMES[n.subclassTitle] || n.subclassTitle || 'Sottoclassi';

      const sources = [...new Set(subData.results.map(s => s.source).filter(Boolean))].sort();
      const srcFilterHtml = sources.length > 1 ? `
        <div class="chip-row subsrc-filter" style="margin-bottom:8px;">
          <span class="fchip subsrc-chip on" data-src="">Tutte</span>
          ${sources.map(src => `<span class="fchip subsrc-chip" data-src="${esc(src)}">${esc(src)}</span>`).join('')}
        </div>` : '';

      subclassHtml = `
        <div class="entry-sec" style="margin:0 26px 18px;">
          <div class="entry-h2">${esc(title)}</div>
          ${srcFilterHtml}
          <div class="class-chips">${subData.results.map(s =>
            `<a class="tag-link cls-chip" data-id="${esc(s.id)}" data-source="${esc(s.source||'')}" tabindex="0">${esc(s.name)}${s.source ? ` <span class="cls-chip-src">(${esc(s.source)})</span>` : ''}</a>`
          ).join('')}</div>
        </div>`;
    }
  } catch { /* no subclasses available */ }

  // ── Level progression table ────────────────────────
  const featByLevel = parseFeatureLevels(n.classFeaturesRaw, 'classFeature');
  let tableHtml = '';
  if (Object.keys(featByLevel).length) {
    const featureMap = await getFeatureNameMap('classFeature', 'class', ent.slug);
    const groupCols  = buildGroupCols(n.classTableGroupsRaw, null, featureMap);
    tableHtml = renderProgressionTable(featByLevel, groupCols, featureMap);
  }

  const content = ent.content?.localized || ent.content?.english;
  const introHtml = content?.entries?.length
    ? `<div class="det-body" style="padding-bottom:0;">${renderContent(content)}</div>` : '';

  return `${metaGrid}${profGrid}${subclassHtml}${introHtml}${equipHtml}${tableHtml}`;
}

async function subclassDetail(ent) {
  const n = ent.normalized || {};

  let parentHtml = esc(n.parentClassName || '—');
  if (n.parentClassSlug) {
    try {
      const pc = await api.bySlug('class', n.parentClassSlug, n.parentClassSource);
      parentHtml = `<a class="tag-link" data-id="${esc(pc.id)}" tabindex="0">${esc(pc.name)}</a>`;
    } catch { /* keep plain english fallback */ }
  }

  const metaRows = [['Classe', parentHtml]];
  if (n.firstSubclassFeatureLevel)
    metaRows.push(['Capacità dal Livello', String(n.firstSubclassFeatureLevel)]);
  if (n.spellcastingAbility)
    metaRows.push(['Car. Incantesimi', abbrAbility(n.spellcastingAbility)]);

  const metaGrid = `
    <div class="spell-grid" style="margin:18px 26px;">
      ${metaRows.map(([lbl, val]) =>
        `<div class="sg-cell"><div class="sg-label">${esc(lbl)}</div><div class="sg-val">${val}</div></div>`
      ).join('')}
    </div>`;

  const byLevel = parseFeatureLevels(n.subclassFeaturesRaw, 'subclassFeature');
  let tableHtml = '';
  if (Object.keys(byLevel).length) {
    const featureMap = await getFeatureNameMap('subclassFeature', 'subclass', ent.slug);
    const groupCols  = buildGroupCols(n.subclassTableGroupsRaw, n.optionalFeatureProgressionRaw, featureMap);
    const minLevel   = n.firstSubclassFeatureLevel || Math.min(...Object.keys(byLevel).map(Number));
    tableHtml = renderProgressionTable(byLevel, groupCols, featureMap, { minLevel });
  }

  const content = ent.content?.localized || ent.content?.english;
  const introHtml = content?.entries?.length
    ? `<div class="det-body" style="padding-bottom:0;">${renderContent(content)}</div>` : '';

  return `${metaGrid}${introHtml}${tableHtml}`;
}

async function renderDetail(ent, inModal = false) {
  const cfg   = TYPE_MAP[ent.entityType];
  const color = cfg?.color ?? '#888';
  const srcInfo = [ent.source, ent.page ? `p.${ent.page}` : ''].filter(Boolean).join(' ');

  const origHtml = (ent.originalName && ent.originalName !== ent.name)
    ? `<div class="det-orig">${esc(ent.originalName)}</div>` : '';

  const badges = [
    `<span class="det-type-badge" style="background:${color}22;color:${color};border:1px solid ${color}44;">${esc(cfg?.label||cap(ent.entityType))}</span>`,
    srcInfo ? `<span class="badge b-src">${esc(srcInfo)}</span>` : '',
    ent.hasItalian ? `<span class="badge b-it">🇮🇹</span>` : '',
  ].filter(Boolean).join('');

  const imgBtn = ent.imageUrl
    ? `<button class="img-btn" data-img-url="${esc(ent.imageUrl)}" data-img-name="${esc(ent.name)}">
         <span class="img-btn-icon">🖼</span> Immagine
       </button>`
    : '';

  // token del mostro: sempre visibile in alto a destra nella scheda, non dietro un click
  const tokenHtml = ent.entityType === 'monster' && ent.tokenImageUrl
    ? `<img class="det-token" src="${esc(ent.tokenImageUrl)}" alt="${esc(ent.name)}" loading="lazy">`
    : '';

  const shareBtn = `<button class="share-btn" data-share-id="${esc(ent.id)}" data-share-name="${esc(ent.name)}">
       <span class="share-btn-icon">📤</span> Condividi
     </button>`;

  const pinned = isPinned(ent.id);
  const pinBtn = `<button class="pin-btn ${pinned?'pinned':''}"
       data-pin-id="${esc(ent.id)}" data-pin-type="${esc(ent.entityType)}"
       data-pin-slug="${esc(ent.slug||'')}" data-pin-src="${esc(ent.source||'')}" data-pin-name="${esc(ent.name)}">
       <span class="pin-btn-icon">${pinned?'📍':'📌'}</span> <span class="pin-btn-label">${pinned?'Sulla plancia':'Plancia'}</span>
     </button>`;

  const inBook = ent.entityType === 'spell' && isInBook(ent.id);
  const bookBtn = ent.entityType === 'spell' ? `<button class="book-btn ${inBook?'in-book':''}"
       data-book-id="${esc(ent.id)}" data-book-slug="${esc(ent.slug||'')}" data-book-src="${esc(ent.source||'')}" data-book-name="${esc(ent.name)}">
       <span class="book-btn-icon">${inBook?'⭐':'☆'}</span> <span class="book-btn-label">${inBook?'Nel libro':'Libro'}</span>
     </button>` : '';

  const backBtn = inModal ? '' : '<div class="det-back" id="det-back">← Lista</div>';

  let body;
  switch (ent.entityType) {
    case 'spell':   body = spellDetail(ent);         break;
    case 'monster': body = await monsterDetail(ent); break;
    case 'item':     body = itemDetail(ent);         break;
    case 'itemBase': body = itemBaseDetail(ent);      break;
    case 'class':    body = await classDetail(ent);    break;
    case 'subclass': body = await subclassDetail(ent); break;
    case 'race':     body = await raceDetail(ent);     break;
    case 'feat':     body = await featDetail(ent);     break;
    default:         body = genericDetail(ent);        break;
  }

  return `
    <div class="det-header" style="border-left-color:${color}">
      <div class="det-header-text">
        ${backBtn}
        <div class="det-name">${esc(ent.name)}</div>
        ${origHtml}
        <div class="det-badges">${badges}</div>
        <div class="det-actions">${imgBtn}${shareBtn}${bookBtn}${pinBtn}</div>
      </div>
      ${tokenHtml}
    </div>
    ${body}`;
}

// ── Filter UI builder ──────────────────────────────────
// L'API ritorna le size come stringhe semplici ("T","M",…) o come
// oggetti { value, label } a seconda dell'endpoint: normalizziamo
// qui prima di passarle a chipFilter per evitare di mostrare "[object Object]".
function sizeChips(sizes) {
  const sm = { T:'Tiny',S:'Small',M:'Med',L:'Large',H:'Huge',G:'Garg' };
  return sizes.map(s => {
    const value = typeof s === 'object' ? s.value : s;
    return { value, label: sm[value] || value };
  });
}

function chipFilter(key, label, values) {
  const chips = values.map(v => {
    const val = typeof v === 'object' ? v.value : String(v);
    const lbl = typeof v === 'object' ? v.label : String(v);
    const on  = S.filters[key] === val ? 'on' : '';
    return `<span class="fchip ${on}" data-key="${esc(key)}" data-val="${esc(val)}">${esc(lbl)}</span>`;
  }).join('');
  return `<div><div class="fgrp-label">${esc(label)}</div><div class="chip-row">${chips}</div></div>`;
}

function selectFilter(key, label, values) {
  const cur = S.filters[key] || '';
  const opts = ['', ...values.filter(Boolean)].map(v =>
    `<option value="${esc(v)}" ${v===cur?'selected':''}>${esc(v===''?`— ${label} —`:cap(String(v)))}</option>`
  ).join('');
  return `<div><div class="fgrp-label">${esc(label)}</div><select class="fselect" data-key="${esc(key)}">${opts}</select></div>`;
}

function rangeFilter(minKey, maxKey, label) {
  return `<div>
    <div class="fgrp-label">${esc(label)}</div>
    <div class="frange">
      <input type="number" class="frange-i" data-key="${esc(minKey)}" placeholder="Min" value="${esc(S.filters[minKey]||'')}">
      <span class="frange-sep">–</span>
      <input type="number" class="frange-i" data-key="${esc(maxKey)}" placeholder="Max" value="${esc(S.filters[maxKey]||'')}">
    </div>
  </div>`;
}

function cbFilters(pairs) {
  const checks = pairs.map(([key, lbl]) =>
    `<label class="fcb-row"><input type="checkbox" class="fcb" data-key="${esc(key)}" ${S.filters[key]==='true'?'checked':''}> ${esc(lbl)}</label>`
  ).join('');
  return `<div><div style="display:flex;flex-direction:column;gap:5px;">${checks}</div></div>`;
}

function buildFilterUI(defs, type) {
  if (!defs) return '<p style="color:var(--c-text3);font-size:12px;">Nessun filtro.</p>';
  const p = [];

  if (defs.sources?.length) p.push(chipFilter('source', 'Fonte', defs.sources));

  if (type === 'spell') {
    if (defs.levels?.length) {
      const lbls = defs.levels.map(l => ({ value: String(l), label: l===0?'CT':String(l) }));
      p.push(chipFilter('level', 'Livello', lbls));
    }
    if (defs.schools?.length) {
      const lbls = defs.schools.map(s => ({ value: s, label: schoolName(s).slice(0,4) }));
      p.push(chipFilter('school', 'Scuola', lbls));
    }
    if (defs.classes?.length) p.push(selectFilter('class', 'Classe', defs.classes));
    p.push(cbFilters([
      ['isCantrip','Cantrip'],['requiresConcentration','Concentrazione'],
      ['isRitual','Rituale'],['hasVerbal','V'],['hasSomatic','S'],['hasMaterial','M'],
    ]));
  }

  if (type === 'monster') {
    if (defs.crs?.length) p.push(selectFilter('cr', 'GS esatto', defs.crs));
    p.push(rangeFilter('crMin','crMax','GS (Min–Max)'));
    if (defs.monsterTypes?.length) p.push(selectFilter('monsterType', 'Tipo creatura', defs.monsterTypes));
    if (defs.sizes?.length) p.push(chipFilter('size', 'Taglia', sizeChips(defs.sizes)));
    if (defs.environments?.length) p.push(selectFilter('environment', 'Ambiente', defs.environments));
    p.push(cbFilters([
      ['hasSpellcasting','Con magia'],['hasLegendaryActions','Az. leggendarie'],['isSwarm','Sciame'],
    ]));
  }

  if (type === 'item') {
    if (defs.rarities?.length) p.push(chipFilter('rarity', 'Rarità', defs.rarities));
    if (defs.itemTypes?.length) p.push(selectFilter('itemType', 'Tipo oggetto', defs.itemTypes));
    if (defs.itemTypeGroups?.length) p.push(selectFilter('itemTypeGroup', 'Categoria', defs.itemTypeGroups));
    p.push(cbFilters([
      ['requiresAttunement','Richiede sintonia'],['isMagic','Magico'],
      ['isWeapon','Arma'],['isArmor','Armatura'],
    ]));
  }

  if (type === 'race') {
    if (defs.sizes?.length) p.push(chipFilter('size', 'Taglia', sizeChips(defs.sizes)));
    if (defs.languages?.length)    p.push(selectFilter('language', 'Lingua', defs.languages));
    if (defs.creatureTypes?.length) p.push(selectFilter('creatureType', 'Tipo creatura', defs.creatureTypes));
    p.push(cbFilters([['hasDarkvision','Scurovisione']]));
  }

  if (type === 'background') {
    if (defs.skills?.length)     p.push(selectFilter('skill', 'Abilità', defs.skills));
    if (defs.languages?.length)  p.push(selectFilter('language', 'Lingua', defs.languages));
  }

  if (type === 'feat') {
    if (defs.abilities?.length)  p.push(selectFilter('ability', 'Caratteristica', defs.abilities));
  }

  if (type === 'optionalFeature') {
    if (defs.featureTypes?.length)       p.push(selectFilter('featureType', 'Tipo capacità', defs.featureTypes));
    if (defs.prerequisiteClasses?.length) p.push(selectFilter('prerequisiteClass', 'Classe prerequisito', defs.prerequisiteClasses));
  }

  if (type === 'subclass' || type === 'classFeature' || type === 'subclassFeature') {
    if (defs.classes?.length) p.push(selectFilter('class', 'Classe', defs.classes));
  }

  return p.join('') || '<p style="color:var(--c-text3);font-size:12px;">Nessun filtro specifico.</p>';
}

function wireFilterEvents() {
  D.filtersBody.querySelectorAll('.fchip').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.key;
      const val = el.dataset.val;
      if (S.filters[key] === val) {
        delete S.filters[key];
        el.classList.remove('on');
      } else {
        // deselect sibling chips
        D.filtersBody.querySelectorAll(`.fchip[data-key="${CSS.escape(key)}"]`).forEach(c => c.classList.remove('on'));
        S.filters[key] = val;
        el.classList.add('on');
      }
    });
  });
  D.filtersBody.querySelectorAll('.fselect').forEach(el => {
    el.addEventListener('change', () => {
      if (el.value === '') delete S.filters[el.dataset.key];
      else S.filters[el.dataset.key] = el.value;
    });
  });
  D.filtersBody.querySelectorAll('.frange-i').forEach(el => {
    el.addEventListener('change', () => {
      if (el.value === '') delete S.filters[el.dataset.key];
      else S.filters[el.dataset.key] = el.value;
    });
  });
  D.filtersBody.querySelectorAll('.fcb').forEach(el => {
    el.addEventListener('change', () => {
      if (el.checked) S.filters[el.dataset.key] = 'true';
      else delete S.filters[el.dataset.key];
    });
  });
}

// ── Pagination ─────────────────────────────────────────
function renderPagination(page, totalPages) {
  if (totalPages <= 1) { D.pagination.innerHTML = ''; return; }

  const range = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) range.push(i);
  } else {
    range.push(1);
    if (page > 3) range.push('…');
    for (let i = Math.max(2, page-1); i <= Math.min(totalPages-1, page+1); i++) range.push(i);
    if (page < totalPages - 2) range.push('…');
    range.push(totalPages);
  }

  const btns = [
    `<button class="pg-btn" id="pg-prev" ${page===1?'disabled':''}>‹</button>`,
    ...range.map(p =>
      p === '…' ? `<span class="pg-dots">…</span>`
                : `<button class="pg-btn ${p===page?'active':''}" data-p="${p}">${p}</button>`
    ),
    `<button class="pg-btn" id="pg-next" ${page===totalPages?'disabled':''}>›</button>`,
  ];

  D.pagination.innerHTML = btns.join('');
  D.pagination.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => loadList(+b.dataset.p)));
  $('pg-prev')?.addEventListener('click', () => loadList(page-1));
  $('pg-next')?.addEventListener('click', () => loadList(page+1));
}

// ── Load entity list ───────────────────────────────────
async function loadList(page = 1) {
  if (!S.type) return;
  S.page = page;

  D.entityList.innerHTML = '<div class="loading-msg"><div class="spinner"></div> Caricamento…</div>';
  D.pagination.innerHTML = '';

  const params = { type: S.type, locale: S.locale, page, limit: S.limit };
  if (S.search) params.q = S.search;
  for (const [k, v] of Object.entries(S.filters)) {
    if (v !== '' && v != null) params[k] = v;
  }

  try {
    const data = await api.list(params);
    const { results, total, totalPages } = data;
    D.listCount.textContent = total ? `${total.toLocaleString()} risultati` : '';

    if (!results?.length) {
      D.entityList.innerHTML = '<div class="empty-msg">Nessun risultato.</div>';
      return;
    }

    // Libri/Avventure: ordine dei capitoli (dall'id "tipo:fonte:indice:slug"),
    // non alfabetico — altrimenti i capitoli appaiono in un ordine senza senso
    if (S.type === 'bookSection' || S.type === 'adventureSection') {
      results.sort((a, b) => {
        const ia = parseInt(a.id.split(':')[2], 10);
        const ib = parseInt(b.id.split(':')[2], 10);
        return (Number.isFinite(ia) ? ia : 9999) - (Number.isFinite(ib) ? ib : 9999);
      });
    }

    D.entityList.innerHTML = results.map(renderListItem).join('');

    // Re-mark active
    if (S.activeId) {
      D.entityList.querySelector(`[data-id="${CSS.escape(S.activeId)}"]`)?.classList.add('active');
    }

    renderPagination(page, totalPages);
  } catch (err) {
    D.entityList.innerHTML = `<div class="empty-msg">Errore: ${esc(err.message)}</div>`;
  }
}

// ── Load filters ───────────────────────────────────────
async function loadFilters(type) {
  D.filtersBody.innerHTML = '<div class="loading-msg" style="padding:12px;"><div class="spinner"></div></div>';
  try {
    const defs = await api.filters(type);
    D.filtersBody.innerHTML = buildFilterUI(defs, type);
    wireFilterEvents();
  } catch {
    D.filtersBody.innerHTML = '<p style="padding:10px;color:var(--c-text3);font-size:12px;">Errore filtri.</p>';
  }
}

function closeFiltersDialog() {
  S.filtersOpen = false;
  D.filtersPanel.classList.remove('open');
  D.filterBtn.classList.remove('active');
}

// ── Mobile sidebar drawer ───────────────────────────────
function openSidebarDrawer()  { D.app.classList.add('show-sidebar'); }
function closeSidebarDrawer() { D.app.classList.remove('show-sidebar'); }
function toggleSidebarDrawer() { D.app.classList.toggle('show-sidebar'); }

// ── Navigate to type ───────────────────────────────────
// ── Libri / Avventure: navigazione a due livelli ────────
// Prima si scelgono il libro/avventura (es. "La Maledizione di
// Strahd"), poi i suoi capitoli in ordine — non un elenco unico
// con tutti i capitoli di tutti i libri mescolati insieme.
const SECTION_TYPES = { bookSection: 'book', adventureSection: 'adventure' };

function sectionIndexOf(id) {
  const n = parseInt(id.split(':')[2], 10);
  return Number.isFinite(n) ? n : 9999;
}

async function navigateToBookPicker(sectionType) {
  closeSidebarDrawer();
  D.app.classList.add('show-list');
  D.app.classList.remove('show-detail');

  const parentType = SECTION_TYPES[sectionType];
  S.type = sectionType;
  S.bookPicker = { sectionType, parentType };
  S.activeId = null;

  D.catList.querySelectorAll('.cat-item').forEach(el =>
    el.classList.toggle('active', el.dataset.type === sectionType)
  );

  D.listTitle.textContent = TYPE_MAP[sectionType]?.label || cap(sectionType);
  D.listSearch.value = '';
  D.filterBtn.style.display = 'none';
  if (S.filtersOpen) closeFiltersDialog();

  D.detailContent.innerHTML = `
    <div class="home-screen" style="min-height:60vh;">
      <div style="color:var(--c-text3);font-size:13px;">Seleziona un elemento dalla lista</div>
    </div>`;

  D.pagination.innerHTML = '';
  D.entityList.innerHTML = '<div class="loading-msg"><div class="spinner"></div> Caricamento…</div>';

  try {
    const data = await api.list({ type: parentType, locale: S.locale, limit: 200 });
    const results = (data.results || []).slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'it'));

    D.listCount.textContent = results.length
      ? `${results.length} ${parentType === 'book' ? 'libri' : 'avventure'}` : '';

    if (!results.length) {
      D.entityList.innerHTML = '<div class="empty-msg">Nessun risultato.</div>';
      return;
    }

    D.entityList.innerHTML = results.map(r => `
      <div class="ent-item book-pick-item" data-source="${esc(r.source)}" data-name="${esc(r.name)}" data-section-type="${esc(sectionType)}">
        <div class="ent-stripe" style="background:${typeColor(sectionType)}"></div>
        <div class="ent-body">
          <div class="ent-name">${esc(r.name)}</div>
          ${r.originalName && r.originalName !== r.name ? `<div class="ent-orig">${esc(r.originalName)}</div>` : ''}
          <div class="ent-meta"><span class="badge b-src">${esc(r.source)}</span></div>
        </div>
        <div class="book-pick-arrow">›</div>
      </div>`).join('');
  } catch (err) {
    D.entityList.innerHTML = `<div class="empty-msg">Errore: ${esc(err.message)}</div>`;
  }
}

async function navigateToSections(sectionType, source, bookName) {
  S.bookPicker = { sectionType, parentType: SECTION_TYPES[sectionType], source, bookName };
  S.activeId = null;

  D.listTitle.textContent = bookName;
  D.listCount.textContent = '';
  D.pagination.innerHTML = '';
  D.entityList.innerHTML = '<div class="loading-msg"><div class="spinner"></div> Caricamento…</div>';

  try {
    const data = await api.list({ type: sectionType, locale: S.locale, source, limit: 200 });
    const results = (data.results || []).slice()
      .sort((a, b) => sectionIndexOf(a.id) - sectionIndexOf(b.id));

    D.listCount.textContent = results.length ? `${results.length} capitoli` : '';

    const backRow = `<div class="book-back" id="book-back">← ${esc(TYPE_MAP[sectionType]?.label || '')}</div>`;

    D.entityList.innerHTML = backRow + (results.length
      ? results.map(renderListItem).join('')
      : '<div class="empty-msg">Nessun capitolo disponibile.</div>');
  } catch (err) {
    D.entityList.innerHTML = `<div class="empty-msg">Errore: ${esc(err.message)}</div>`;
  }
}

function navigate(type) {
  if (SECTION_TYPES[type]) { navigateToBookPicker(type); return; }

  closeSidebarDrawer();
  D.app.classList.add('show-list');

  S.type    = type;
  S.page    = 1;
  S.search  = '';
  S.filters = {};
  S.activeId = null;
  S.bookPicker = null;

  D.catList.querySelectorAll('.cat-item').forEach(el =>
    el.classList.toggle('active', el.dataset.type === type)
  );

  D.listTitle.textContent = TYPE_MAP[type]?.label || cap(type);
  D.listSearch.value = '';
  D.filterBtn.style.display = 'block';

  if (S.filtersOpen) closeFiltersDialog();

  D.detailContent.innerHTML = `
    <div class="home-screen" style="min-height:60vh;">
      <div style="color:var(--c-text3);font-size:13px;">Seleziona un elemento dalla lista</div>
    </div>`;
  D.app.classList.remove('show-detail');

  loadList(1);
  loadFilters(type);
}

// ── Open entity ────────────────────────────────────────
async function openEntity(id, type, slug, src) {
  S.activeId = id;
  closeBoard();

  D.entityList.querySelectorAll('.ent-item').forEach(el =>
    el.classList.toggle('active', el.dataset.id === id)
  );

  D.detailContent.innerHTML = `
    <div class="home-screen" style="min-height:60vh;gap:12px;">
      <div class="spinner" style="width:24px;height:24px;border-width:3px;"></div>
      <div style="color:var(--c-text3);font-size:13px;">Caricamento…</div>
    </div>`;
  D.app.classList.add('show-detail');

  try {
    let ent;
    if (slug && type) {
      try {
        ent = await api.bySlug(type, slug, src);
      } catch (err) {
        if (err.status === 409 && err.data?.results?.length) {
          ent = await api.byId(err.data.results[0].id);
        } else {
          ent = await api.byId(id);
        }
      }
    } else {
      ent = await api.byId(id);
    }

    history.replaceState(null, '', `#${ent.id}`);
    D.detailContent.innerHTML = await renderDetail(ent);
    D.detailPanel.scrollTop = 0;

    $('det-back')?.addEventListener('click', () => D.app.classList.remove('show-detail'));
  } catch (err) {
    D.detailContent.innerHTML = `
      <div class="det-body" style="padding-top:40px;">
        <p class="entry-p" style="color:var(--c-text3)">Errore: ${esc(err.message)}</p>
      </div>`;
  }
}

// ── Global search ──────────────────────────────────────
async function globalSearch(q) {
  if (q.length < 2) return;
  closeSidebarDrawer();
  D.app.classList.add('show-list');

  S.type    = null;
  S.search  = q;
  S.page    = 1;
  S.filters = {};
  S.activeId = null;

  D.catList.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
  D.listTitle.textContent = `"${q}"`;
  D.listCount.textContent = '';
  D.filterBtn.style.display = 'none';
  closeFiltersDialog();

  D.entityList.innerHTML = '<div class="loading-msg"><div class="spinner"></div> Ricerca…</div>';
  D.pagination.innerHTML = '';

  try {
    const data = await api.list({ q, locale: S.locale, limit: 50 });
    const { results, total } = data;
    D.listCount.textContent = total ? `${total.toLocaleString()} risultati` : '';

    if (!results?.length) {
      D.entityList.innerHTML = '<div class="empty-msg">Nessun risultato.</div>';
      return;
    }
    D.entityList.innerHTML = results.map(renderListItem).join('');
    renderPagination(data.page, data.totalPages);
  } catch (err) {
    D.entityList.innerHTML = `<div class="empty-msg">Errore: ${esc(err.message)}</div>`;
  }
}

// ── Sidebar ────────────────────────────────────────────
function buildSidebar(stats) {
  D.catList.innerHTML = TYPES.map(t => {
    const cnt = stats?.byType?.[t.key];
    const badge = cnt ? `<span class="cat-count">${shortNum(cnt)}</span>` : '';
    return `<li class="cat-item" data-type="${t.key}">
      <span class="cat-icon" style="color:${t.color}">${t.icon}</span>
      <span class="cat-label">${t.label}</span>
      ${badge}
    </li>`;
  }).join('');

  D.catList.querySelectorAll('.cat-item').forEach(el =>
    el.addEventListener('click', () => navigate(el.dataset.type))
  );

  if (stats) {
    D.sbFooter.innerHTML =
      `${(stats.total||0).toLocaleString()} entità totali<br>
       ${(stats.translated||0).toLocaleString()} con traduzione IT`;
  }
}

function buildHomeStats(stats) {
  if (!stats?.byType) return;
  D.homeStats.innerHTML = TYPES
    .filter(t => stats.byType[t.key])
    .map(t => `
      <div class="hstat-card" data-type="${t.key}">
        <span class="hstat-count" style="color:${t.color}">${stats.byType[t.key].toLocaleString()}</span>
        <span class="hstat-label">${t.label}</span>
      </div>`)
    .join('');

  D.homeStats.querySelectorAll('.hstat-card').forEach(el =>
    el.addEventListener('click', () => navigate(el.dataset.type))
  );
}

// ── Modal ──────────────────────────────────────────────
const modal = {
  el:    $('modal'),
  body:  $('modal-body'),
  open(html) {
    this.body.innerHTML = html;
    this.el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  close() {
    this.el.classList.add('hidden');
    this.body.innerHTML = '';
    document.body.style.overflow = '';
  },
  async loadEntity(type, slug, src) {
    this.open('<div class="modal-loading"><div class="spinner" style="width:28px;height:28px;border-width:3px;"></div></div>');
    try {
      const ent = await fetchEntityRobust(type, slug, src);
      this.open(await renderDetail(ent, true));
    } catch (err) {
      if (err.variants?.length) {
        this.open(`
          <div class="modal-error">
            <p>Riferimento generico: scegli una variante specifica.</p>
            <div class="entity-suggest-list">
              ${err.variants.map(v => `<a class="tag-link entity-suggest-item" data-id="${esc(v.id)}" tabindex="0">${esc(v.name)}</a>`).join('')}
            </div>
          </div>`);
        return;
      }
      this.open(`<div class="modal-error">Entità non trovata: <em>${esc(slug)}</em><br><small style="color:var(--c-text3)">${esc(err.message)}</small></div>`);
    }
  },
  async loadById(id) {
    this.open('<div class="modal-loading"><div class="spinner" style="width:28px;height:28px;border-width:3px;"></div></div>');
    try {
      const ent = await api.byId(id);
      this.open(await renderDetail(ent, true));
    } catch (err) {
      this.open(`<div class="modal-error">Errore: ${esc(err.message)}</div>`);
    }
  },
  showImage(url, name) {
    this.open(`
      <div class="modal-img-wrap">
        <img src="${esc(url)}" alt="${esc(name)}" loading="lazy">
        <div class="modal-img-name">${esc(name)}</div>
        <a class="modal-img-link" href="${esc(url)}" target="_blank" rel="noopener">↗ Apri originale</a>
      </div>`);
  },
  showCondition(rawName) {
    const key  = COND_ALIAS[rawName.toLowerCase()] ?? rawName.toLowerCase();
    const cond = CONDITIONS[key];
    if (!cond) {
      this.open(`<div class="modal-error">Condizione sconosciuta: <em>${esc(rawName)}</em></div>`);
      return;
    }
    const effects = cond.effects.map(e =>
      `<div class="cond-effect"><span class="cond-bullet">•</span><span>${esc(e)}</span></div>`
    ).join('');

    let tableHtml = '';
    if (cond.table) {
      const [header, ...rows] = cond.table;
      tableHtml = `<table class="cond-table">
        <thead><tr>${header.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
    }

    this.open(`
      <div class="cond-header">
        <div class="cond-name">${esc(cond.name)}</div>
        <span class="cond-badge">Condizione</span>
      </div>
      <div class="cond-body">${effects}${tableHtml}</div>`);
  },
};

// close handlers
$('modal-close').addEventListener('click', () => modal.close());
$('modal-bg').addEventListener('click',    () => modal.close());

// ── DM Board (plancia) ──────────────────────────────────
// Permette al DM di tenere più schede (mostri o qualsiasi entità) aperte
// fianco a fianco, ognuna con il proprio scroll indipendente — pensata per
// l'uso da tavolo su un grande schermo, non per mobile.
const BOARD_KEY = 'nuovo5e:board:v1';

function loadBoard() {
  try {
    const arr = JSON.parse(localStorage.getItem(BOARD_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function persistBoard() {
  try { localStorage.setItem(BOARD_KEY, JSON.stringify(S.board)); } catch {}
}
function isPinned(id) { return S.board.some(b => b.id === id); }

function updateBoardToggleUi() {
  const n = S.board.length;
  D.boardToggleCount.textContent = String(n);
  D.boardToggleCount.classList.toggle('hidden', n === 0);
  D.boardCount.textContent = n ? `${n} sulla plancia` : '';
}

function syncPinButtons(id, pinned) {
  document.querySelectorAll(`[data-pin-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('pinned', pinned);
    const icon = btn.querySelector('.pin-btn-icon');
    if (icon) icon.textContent = pinned ? '📍' : '📌';
    const label = btn.querySelector('.pin-btn-label');
    if (label) label.textContent = pinned ? 'Sulla plancia' : 'Plancia';
    if (btn.classList.contains('ent-pin-btn')) {
      btn.textContent = pinned ? '📍' : '📌';
      btn.title = pinned ? 'Rimuovi dalla plancia' : 'Aggiungi alla plancia';
    }
  });
}

// ── Mostri "giocabili": tracker PF sulla plancia DM ─────
// Tira (o imposta) i punti ferita di un mostro pinnato e ne mantiene
// il valore corrente mentre il DM applica danni/cure, considerando
// resistenze, immunità e vulnerabilità del mostro.
function renderHpTracker(item, defenses) {
  const id = esc(item.id);

  if (!item.hp) {
    const rollLabel = defenses.hpFormula
      ? `🎲 Tira PF (${esc(defenses.hpFormula)})`
      : defenses.hpAverage
        ? `Usa PF medi (${defenses.hpAverage})`
        : null;
    return `
      <div class="board-hp-tracker" data-id="${id}">
        <div class="hp-init-row">
          ${rollLabel ? `<button class="hp-roll-btn" data-id="${id}">${rollLabel}</button>` : ''}
          <input type="number" class="hp-manual-input" min="1" placeholder="PF manuali">
          <button class="hp-manual-btn" data-id="${id}">Imposta</button>
        </div>
      </div>`;
  }

  const { current, max } = item.hp;
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round(current / max * 100))) : 0;
  const barClass = current <= 0 ? 'hp-dead' : pct <= 25 ? 'hp-low' : pct <= 50 ? 'hp-mid' : 'hp-ok';
  const dmgOpts = Object.entries(DAMAGE_TYPE_NAMES).map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('');

  return `
    <div class="board-hp-tracker ${barClass}" data-id="${id}">
      <div class="hp-bar-row">
        <div class="hp-bar"><div class="hp-bar-fill" style="width:${pct}%"></div></div>
        <input type="number" class="hp-current-input" min="0" max="${max}" value="${current}" data-id="${id}">
        <span class="hp-sep">/</span>
        <input type="number" class="hp-max-input" min="1" value="${max}" data-id="${id}">
        ${current <= 0 ? '<span class="hp-ko-badge">K.O.</span>' : ''}
        ${defenses.hpFormula ? `<button class="hp-reroll-btn" data-id="${id}" title="Tira di nuovo i PF">🎲</button>` : ''}
      </div>
      <div class="hp-apply-row">
        <input type="number" class="hp-amount-input" min="0" placeholder="Quantità" data-id="${id}">
        <select class="hp-dmgtype-select" data-id="${id}">
          <option value="">(generico)</option>
          ${dmgOpts}
        </select>
        <button class="hp-damage-btn" data-id="${id}">⚔ Danno</button>
        <button class="hp-heal-btn" data-id="${id}">➕ Cura</button>
      </div>
    </div>`;
}

// Usata quando cambia la struttura del tracker (primo tiro PF / PF manuali):
// sostituisce l'intero blocco. Per i soli aggiornamenti di valore durante il
// combattimento (danno/cura/modifica diretta) si usa invece updateHpVisuals,
// che aggiorna gli elementi esistenti senza ricostruire il DOM — evitare
// outerHTML lì previene la perdita del focus sull'input e una race in cui un
// secondo evento arriva su un nodo appena scollegato dal DOM.
function refreshHpTracker(container) {
  if (!container.isConnected) return;
  const id = container.dataset.id;
  const item = S.board.find(b => b.id === id);
  if (!item) return;
  container.outerHTML = renderHpTracker(item, S.monsterDefenses[id] || {});
}

function updateHpVisuals(container, item) {
  if (!container.isConnected || !item.hp) return;
  const { current, max } = item.hp;
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round(current / max * 100))) : 0;
  const barClass = current <= 0 ? 'hp-dead' : pct <= 25 ? 'hp-low' : pct <= 50 ? 'hp-mid' : 'hp-ok';
  container.classList.remove('hp-ok', 'hp-mid', 'hp-low', 'hp-dead');
  container.classList.add(barClass);

  const fill = container.querySelector('.hp-bar-fill');
  if (fill) fill.style.width = `${pct}%`;
  const curInput = container.querySelector('.hp-current-input');
  if (curInput) curInput.value = current;
  const maxInput = container.querySelector('.hp-max-input');
  if (maxInput) maxInput.value = max;

  let badge = container.querySelector('.hp-ko-badge');
  if (current <= 0 && !badge) {
    badge = document.createElement('span');
    badge.className = 'hp-ko-badge';
    badge.textContent = 'K.O.';
    maxInput?.insertAdjacentElement('afterend', badge);
  } else if (current > 0 && badge) {
    badge.remove();
  }
}

// ── Colore delle schede sulla plancia DM ────────────────
// Tavolozza di evidenziatori per i mostri: un accento (border/topbar) sopra
// la scheda normale, sobria finché il DM non scegli esplicitamente un colore.
// I segnalibri PG restano sempre all'oro di base, senza tavolozza: la card è
// troppo stretta per ospitare il popover (viene tagliato dall'overflow:hidden).
const BOARD_COLORS = ['#d64545','#e08a3c','#e0c23c','#4caf6e','#2fb3a3','#3bb3d6','#4a7fd6','#8a5fd6','#d65fb0','#8a8a96'];

function boardAccentTextColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#171310';
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.42 ? '#171310' : '#f2efe8';
}

function applyCardColor(card, item) {
  if (!card || item.type === 'custom') return;
  const color = item.color || null;
  if (color) {
    card.style.setProperty('--board-accent', color);
    card.style.setProperty('--board-accent-text', boardAccentTextColor(color));
    card.dataset.colored = '1';
  } else {
    card.style.removeProperty('--board-accent');
    card.style.removeProperty('--board-accent-text');
    delete card.dataset.colored;
  }
}

function closeColorPopover() {
  document.querySelector('.board-card-color-pop')?.remove();
}

function openColorPopover(card, item) {
  closeColorPopover();
  const pop = document.createElement('div');
  pop.className = 'board-card-color-pop';
  pop.innerHTML = `
    <div class="board-card-color-grid">
      ${BOARD_COLORS.map(c => `<button class="board-card-color-swatch" data-id="${esc(item.id)}" data-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}
    </div>
    <button class="board-card-color-reset" data-id="${esc(item.id)}">✕ Nessuno</button>`;
  card.appendChild(pop);
}

function boardCardTopbarHtml(item) {
  const id = esc(item.id);
  // Niente bottone colore/duplica sui segnalibri PG: restano sempre all'oro
  // di base e un PG non si "sdoppia" come un gruppo di mostri uguali.
  const colorBtnHtml = item.type === 'custom' ? '' : `<button class="board-card-color-btn" data-id="${id}" title="Cambia colore">🎨</button>`;
  const dupBtnHtml = item.type === 'custom' ? '' : `<button class="board-card-dup-btn" data-id="${id}" title="Duplica (es. un altro goblin uguale)">⧉</button>`;
  return `
    <div class="board-card-topbar">
      <div class="board-card-init" title="Iniziativa">
        <span class="board-card-init-icon">🎲</span>
        <input type="number" class="board-card-init-input" data-id="${id}" value="${item.initiative ?? ''}" placeholder="—">
      </div>
      <div class="board-card-topbar-actions">
        ${dupBtnHtml}
        ${colorBtnHtml}
        <button class="board-card-remove" data-id="${id}" title="Rimuovi dalla plancia">✕</button>
      </div>
    </div>`;
}

async function renderBoardCard(item) {
  const card = document.createElement('div');
  card.className = 'board-card' + (item.type === 'custom' ? ' board-card-custom' : '');
  card.dataset.id = item.id;
  applyCardColor(card, item);

  // Segnalibro manuale (es. PG): nessuna scheda da caricare, solo nome + iniziativa,
  // per poterlo ordinare insieme ai mostri nella sequenza di iniziativa.
  if (item.type === 'custom') {
    card.innerHTML = `
      ${boardCardTopbarHtml(item)}
      <div class="board-card-body board-card-pg-body">
        <span class="board-card-pg-icon">🔖</span>
        <input type="text" class="board-card-pg-name" data-id="${esc(item.id)}" value="${esc(item.name||'')}" placeholder="Nome PG">
      </div>`;
    D.boardCards.querySelector('.board-empty-msg')?.remove();
    D.boardCards.appendChild(card);
    return;
  }

  card.innerHTML = `
    ${boardCardTopbarHtml(item)}
    <div class="board-card-hp"></div>
    <div class="board-card-body"><div class="modal-loading"><div class="spinner" style="width:24px;height:24px;border-width:3px;"></div></div></div>`;
  D.boardCards.querySelector('.board-empty-msg')?.remove();
  D.boardCards.appendChild(card);

  const body = card.querySelector('.board-card-body');
  try {
    let ent;
    if (item.slug && item.type) {
      try {
        ent = await api.bySlug(item.type, item.slug, item.src || undefined);
      } catch {
        ent = await api.byId(item.entId || item.id);
      }
    } else {
      ent = await api.byId(item.entId || item.id);
    }
    body.innerHTML = await renderDetail(ent, true);

    if (item.type === 'monster') {
      const def = ent.game?.defenses || {};
      S.monsterDefenses[item.id] = {
        resist: def.damageResistances || [],
        immune: def.damageImmunities || [],
        vuln:   def.damageVulnerabilities || [],
        hpFormula: def.hpFormula || null,
        hpAverage: def.hpAverage || null,
        dexMod: abModNum(ent.game?.abilities?.dex),
      };
      card.querySelector('.board-card-hp').innerHTML = renderHpTracker(item, S.monsterDefenses[item.id]);
    }
  } catch (err) {
    body.innerHTML = `<div class="modal-error">Errore: ${esc(err.message)}</div>`;
  }
}

function renderBoard() {
  D.boardCards.innerHTML = '';
  if (!S.board.length) {
    D.boardCards.innerHTML = '<div class="board-empty-msg">Nessuna entità sulla plancia.<br>Apri una scheda e clicca «📌 Plancia» per aggiungerla qui.</div>';
    return;
  }
  S.board.forEach(renderBoardCard);
}

function addToBoard(item) {
  if (!item.id || isPinned(item.id)) return;
  S.board.push({ id: item.id, type: item.type, slug: item.slug || '', src: item.src || '', name: item.name || '' });
  persistBoard();
  updateBoardToggleUi();
  syncPinButtons(item.id, true);
  renderBoardCard(item);
}

function removeFromBoard(id) {
  S.board = S.board.filter(b => b.id !== id);
  delete S.monsterDefenses[id];
  persistBoard();
  updateBoardToggleUi();
  syncPinButtons(id, false);
  D.boardCards.querySelector(`.board-card[data-id="${id}"]`)?.remove();
  if (!S.board.length) renderBoard();
}

function toggleBoardEntity(item) {
  if (isPinned(item.id)) removeFromBoard(item.id);
  else addToBoard(item);
}

// Id sintetico per le schede della plancia che non corrispondono 1:1 a
// un'entità pinnata (segnalibri PG, istanze da ricerca rapida, duplicati) —
// permette di avere più schede indipendenti per lo stesso mostro (es. 3 goblin).
function genBoardId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Ricerca rapida nella plancia: ogni risultato cliccato diventa una nuova
// scheda indipendente (id sintetico, non legato al "pin" dell'entità), così
// si può cliccare più volte sullo stesso mostro per aggiungerne più copie.
function addBoardInstance(entity) {
  const item = {
    id: genBoardId('inst'),
    entId: entity.id, // vero id dell'entità: serve come fallback se il fetch by-slug fallisce
    type: entity.type,
    slug: entity.slug || '',
    src: entity.src || '',
    name: entity.name || '',
  };
  S.board.push(item);
  persistBoard();
  updateBoardToggleUi();
  renderBoardCard(item);
}

// "⧉ Duplica": sdoppia una scheda mostro già sulla plancia in una copia
// indipendente (PF, iniziativa e colore propri), per i gruppi di nemici
// uguali senza dover ripetere la ricerca.
function duplicateBoardItem(id) {
  const original = S.board.find(b => b.id === id);
  if (!original) return;
  const dup = {
    id: genBoardId('dup'),
    entId: original.entId || original.id,
    type: original.type,
    slug: original.slug,
    src: original.src,
    name: original.name,
  };
  S.board.push(dup);
  persistBoard();
  updateBoardToggleUi();
  renderBoardCard(dup);
}

// ── Iniziativa sulla plancia DM ─────────────────────────
// Ordina tutte le schede (mostri + segnalibri PG) per iniziativa decrescente;
// chi non ha ancora un valore va in coda.
function sortBoardByInitiative() {
  S.board.sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity));
}

// Sposta i nodi DOM esistenti nell'ordine di S.board senza ricaricarli:
// appendChild su un nodo già presente lo muove, evitando di rifare il
// fetch della scheda (e la perdita di scroll/focus) a ogni riordino.
function reorderBoardCards() {
  S.board.forEach(item => {
    const card = D.boardCards.querySelector(`.board-card[data-id="${item.id}"]`);
    if (card) D.boardCards.appendChild(card);
  });
}

function updateInitiativeBadge(item) {
  const input = D.boardCards.querySelector(`.board-card[data-id="${item.id}"] .board-card-init-input`);
  if (input && document.activeElement !== input) input.value = item.initiative ?? '';
}

// Bottone globale "Tira Iniziativa": ogni mostro che non ha ancora tirato
// (item.initiative ancora vuoto) tira automaticamente d20 + mod. Destrezza —
// non tocca chi ha già un valore, per non perdere l'ordine a metà combattimento.
// I segnalibri PG mantengono il valore inserito a mano dal DM (il tiro lo
// fanno i giocatori al tavolo). Poi riordina tutta la plancia.
function rollBoardInitiative() {
  if (!S.board.length) return;
  S.board.forEach(item => {
    if (item.type !== 'monster' || item.initiative != null) return;
    const dexMod = S.monsterDefenses[item.id]?.dexMod ?? 0;
    item.initiative = rollD20() + dexMod;
  });
  sortBoardByInitiative();
  persistBoard();
  S.board.forEach(updateInitiativeBadge);
  reorderBoardCards();
}

// Bottone globale "Vita mostri": tira i PF (formula dado vita, o la media se
// manca) solo per i mostri che non li hanno ancora — non tocca chi è già in
// combattimento per non sovrascrivere i danni subiti finora.
function rollAllMissingHp() {
  let changed = false;
  S.board.forEach(item => {
    if (item.type !== 'monster' || item.hp) return;
    const defenses = S.monsterDefenses[item.id] || {};
    const max = rollHpFormula(defenses.hpFormula) ?? defenses.hpAverage;
    if (!max) return;
    item.hp = { current: max, max };
    changed = true;
    const container = D.boardCards.querySelector(`.board-hp-tracker[data-id="${item.id}"]`);
    if (container) refreshHpTracker(container);
  });
  if (changed) persistBoard();
}

// Aggiunge un segnalibro manuale alla plancia (tipicamente un PG): niente
// scheda da caricare, solo nome + iniziativa, per ordinarlo coi mostri.
function addPgBookmark() {
  const id = genBoardId('custom');
  const item = { id, type: 'custom', slug: '', src: '', name: '', initiative: null };
  S.board.push(item);
  persistBoard();
  updateBoardToggleUi();
  renderBoardCard(item);
  requestAnimationFrame(() => {
    D.boardCards.querySelector(`.board-card[data-id="${id}"] .board-card-pg-name`)?.focus();
  });
}

// Ricerca rapida mostri nella plancia (vedi addBoardInstance sopra).
function renderBoardSearchResults(results) {
  if (!results.length) {
    D.boardSearchResults.innerHTML = '<div class="board-search-empty">Nessun mostro trovato.</div>';
    return;
  }
  D.boardSearchResults.innerHTML = results.map(ent => `
    <div class="board-search-result"
         data-id="${esc(ent.id)}" data-type="${esc(ent.entityType)}"
         data-slug="${esc(ent.slug)}" data-src="${esc(ent.source||'')}" data-name="${esc(ent.name)}">
      <span class="board-search-result-name">${esc(ent.name)}</span>
      <span class="board-search-result-add">+ Aggiungi</span>
    </div>`).join('');
}

async function runBoardSearch(q) {
  if (!q || q.length < 2) {
    D.boardSearchResults.innerHTML = '';
    return;
  }
  D.boardSearchResults.innerHTML = '<div class="board-search-loading">Ricerca…</div>';
  try {
    const data = await api.list({ q, type: 'monster', locale: S.locale, limit: 20 });
    renderBoardSearchResults(data.results || []);
  } catch {
    D.boardSearchResults.innerHTML = '<div class="board-search-empty">Errore nella ricerca.</div>';
  }
}

function openBoard()  { D.app.classList.add('show-board'); }
function closeBoard() {
  D.app.classList.remove('show-board');
  setBoardFocus(false);
  D.boardSearchInput.value = '';
  D.boardSearchResults.innerHTML = '';
}
function toggleBoardPanel() {
  D.app.classList.contains('show-board') ? closeBoard() : openBoard();
}

// Schermo intero: nasconde sidebar + lista entità per dare alla plancia
// tutto lo spazio, lasciando il DM libero di navigare e leggere a tutto schermo.
function setBoardFocus(on) {
  D.app.classList.toggle('board-focus', on);
  D.boardFocusBtn?.classList.toggle('active', on);
  if (D.boardFocusBtn) D.boardFocusBtn.title = on
    ? 'Mostra sidebar e lista'
    : 'Schermo intero: nascondi le barre laterali';
}
function toggleBoardFocus() {
  setBoardFocus(!D.app.classList.contains('board-focus'));
}

// ── Share button ────────────────────────────────────────
// Condivide un link (Web Share API se disponibile, altrimenti copia negli
// appunti) e mostra un feedback "✓ Copiato!" sul bottone per un momento.
// Usato sia per condividere una singola entità sia il libro degli incantesimi.
async function shareUrl(url, title, btn) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // utente ha annullato la condivisione
      // altrimenti prova comunque a copiare il link come fallback
    }
  }

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }

  const original = btn.innerHTML;
  btn.classList.add('copied');
  btn.innerHTML = '<span class="share-btn-icon">✓</span> Copiato!';
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.innerHTML = original;
  }, 1600);
}

async function shareEntity(btn) {
  const id   = btn.dataset.shareId;
  const name = btn.dataset.shareName;
  const url  = `${location.origin}${location.pathname}#${id}`;
  await shareUrl(url, name, btn);
}

// ── Libro degli Incantesimi del player ──────────────────
// Lista personale di incantesimi preferiti, condivisibile via link senza
// alcun backend: il link contiene direttamente fonte+slug di ogni incantesimo
// (vedi encodeBookHash/decodeBookHash), e chi lo apre rifà il fetch dalla
// stessa API pubblica usata in tutta l'app. Pensata per il telefono del
// player, a differenza della plancia DM che è solo desktop.
const SPELLBOOK_KEY = 'nuovo5e:spellbook:v1';

function loadSpellbook() {
  try {
    const arr = JSON.parse(localStorage.getItem(SPELLBOOK_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function persistSpellbook() {
  try { localStorage.setItem(SPELLBOOK_KEY, JSON.stringify(S.spellbook)); } catch {}
}
function isInBook(id) { return S.spellbook.some(b => b.id === id); }

function updateSpellbookToggleUi() {
  const n = S.spellbook.length;
  D.spellbookToggleCount.textContent = String(n);
  D.spellbookToggleCount.classList.toggle('hidden', n === 0);
  D.spellbookCount.textContent = n ? `${n} incantesimi` : '';
}

function syncBookButtons(id, inBook) {
  document.querySelectorAll(`[data-book-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('in-book', inBook);
    const icon = btn.querySelector('.book-btn-icon');
    if (icon) icon.textContent = inBook ? '⭐' : '☆';
    const label = btn.querySelector('.book-btn-label');
    if (label) label.textContent = inBook ? 'Nel libro' : 'Libro';
    if (btn.classList.contains('ent-book-btn')) btn.textContent = inBook ? '⭐' : '☆';
  });
}

function addToBook(item) {
  if (!item.id || isInBook(item.id)) return;
  S.spellbook.push({ id: item.id, slug: item.slug || '', src: item.src || '', name: item.name || '' });
  persistSpellbook();
  updateSpellbookToggleUi();
  syncBookButtons(item.id, true);
  if (D.app.classList.contains('show-spellbook') && !S.sharedBook) renderSpellbookList();
}

function removeFromBook(id) {
  S.spellbook = S.spellbook.filter(b => b.id !== id);
  persistSpellbook();
  updateSpellbookToggleUi();
  syncBookButtons(id, false);
  if (!S.sharedBook) renderSpellbookList();
}

function toggleBook(item) {
  if (isInBook(item.id)) removeFromBook(item.id);
  else addToBook(item);
}

// ── Rendering del pannello ───────────────────────────────
function spellSortKey(ent) {
  const sum = ent.game?.summary || {};
  return [sum.isCantrip ? 0 : (sum.level ?? 99), ent.name || ''];
}

async function renderSpellbookList() {
  const items = S.sharedBook || S.spellbook;
  if (!items.length) {
    D.spellbookList.innerHTML = '<div class="spellbook-empty-msg">Il tuo libro è vuoto.<br>Apri un incantesimo e clicca «☆ Libro» per aggiungerlo qui.</div>';
    return;
  }
  D.spellbookList.innerHTML = '<div class="modal-loading"><div class="spinner"></div></div>';

  const fetched = await Promise.all(items.map(async item => {
    try { return await tryExactFetch('spell', item.slug, item.src); }
    catch { return null; }
  }));

  const rows = items.map((item, i) => ({ item, ent: fetched[i] }))
    .filter(r => r.ent)
    .sort((a, b) => {
      const [ka, na] = spellSortKey(a.ent), [kb, nb] = spellSortKey(b.ent);
      return ka - kb || na.localeCompare(nb);
    });

  if (!rows.length) {
    D.spellbookList.innerHTML = '<div class="spellbook-empty-msg">Nessuno di questi incantesimi è stato trovato.</div>';
    return;
  }

  D.spellbookList.innerHTML = rows.map(({ item, ent }) => {
    const sum = ent.game?.summary || {};
    const lvl = sum.isCantrip ? 'Cantrip' : (sum.level != null ? `Liv.${sum.level}` : '—');
    const sch = schoolName(sum.school?.key || sum.school?.label);
    return `
      <div class="spellbook-item">
        <div class="spellbook-item-main" data-id="${esc(ent.id)}">
          <span class="spellbook-item-lvl">${esc(lvl)}</span>
          <span class="spellbook-item-name">${esc(ent.name)}</span>
          <span class="spellbook-item-school">${esc(sch)}</span>
        </div>
        ${S.sharedBook ? '' : `<button class="spellbook-item-remove" data-id="${esc(item.id)}" title="Rimuovi">✕</button>`}
      </div>`;
  }).join('');
}

function openSpellbookPanel() {
  closeSidebarDrawer();
  D.app.classList.add('show-spellbook');
  D.spellbookSharedBanner.classList.toggle('hidden', !S.sharedBook);
  renderSpellbookList();
}
function closeSpellbookPanel() {
  D.app.classList.remove('show-spellbook');
  S.sharedBook = null;
}
function toggleSpellbookPanel() {
  D.app.classList.contains('show-spellbook') ? closeSpellbookPanel() : openSpellbookPanel();
}

// ── Condivisione del libro ───────────────────────────────
// Nessun backend: la lista è codificata direttamente nel link come coppie
// "fonte:slug" separate da virgola — chi apre il link rifà il fetch di ogni
// incantesimo dalla stessa API pubblica, senza bisogno di storage server-side.
function encodeBookHash(items) {
  return 'book=' + items.map(i => `${i.src || '-'}:${i.slug}`).join(',');
}
function decodeBookHash(hash) {
  return hash.slice('book='.length).split(',').filter(Boolean).map(pair => {
    const idx = pair.indexOf(':');
    const src = pair.slice(0, idx);
    const slug = pair.slice(idx + 1);
    return { id: `spell:${(src === '-' ? '' : src).toLowerCase()}:${slug}`, slug, src: src === '-' ? '' : src, name: '' };
  });
}

async function shareSpellbook(btn) {
  if (!S.spellbook.length) return;
  const url = `${location.origin}${location.pathname}#${encodeBookHash(S.spellbook)}`;
  await shareUrl(url, 'Il mio Libro degli Incantesimi', btn);
}

function saveSharedBook() {
  if (!S.sharedBook) return;
  S.sharedBook.forEach(addToBook);
  S.sharedBook = null;
  D.spellbookSharedBanner.classList.add('hidden');
  renderSpellbookList();
}

// ── Forgia del Personaggio ──────────────────────────────────────────────────

const BUILDER_KEY   = 'nuovo5e:forgia:v1';
const BSTAT_ORDER   = ['str','dex','con','int','wis','cha'];
const BSTAT_SHORT   = { str:'FOR', dex:'DES', con:'COS', int:'INT', wis:'SAG', cha:'CAR' };
const BSTAT_IT      = { str:'Forza', dex:'Destrezza', con:'Costituzione', int:'Intelligenza', wis:'Saggezza', cha:'Carisma' };
const BSTD_ARRAY    = [15,14,13,12,10,8];
const BPB_COSTS     = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
const BSKILL_IT     = {
  acrobatics:'Acrobazia', animal_handling:'Gestire Animali', arcana:'Arcana',
  athletics:'Atletica', deception:'Inganno', history:'Storia', insight:'Intuizione',
  intimidation:'Intimidazione', investigation:'Investigazione', medicine:'Medicina',
  nature:'Natura', perception:'Percezione', performance:'Intrattenere',
  persuasion:'Persuasione', religion:'Religione', sleight_of_hand:'Rapidità di Mano',
  stealth:'Furtività', survival:'Sopravvivenza',
};
const BSKILLS_ALL   = [
  {k:'acrobatics',s:'dex'},{k:'animal_handling',s:'wis'},{k:'arcana',s:'int'},
  {k:'athletics',s:'str'},{k:'deception',s:'cha'},{k:'history',s:'int'},
  {k:'insight',s:'wis'},{k:'intimidation',s:'cha'},{k:'investigation',s:'int'},
  {k:'medicine',s:'wis'},{k:'nature',s:'int'},{k:'perception',s:'wis'},
  {k:'performance',s:'cha'},{k:'persuasion',s:'cha'},{k:'religion',s:'int'},
  {k:'sleight_of_hand',s:'dex'},{k:'stealth',s:'dex'},{k:'survival',s:'wis'},
];
const BCHOICE_KIND_LABELS = {
  proficiency:'Competenza', subrace:'Sottorazza', subclass:'Sottoclasse',
  feat:'Impresa', optionalFeature:'Capacità Opzionale',
  optionalFeatureProgression:'Stile/Invocazione', startingEquipment:'Equipaggiamento',
};
const BSCOPE_LABELS  = { race:'Razza', class:'Classe', background:'Background' };
const BSPELL_LABELS  = {
  cantripsKnown:'Trucchi', spellsKnown:'Incantesimi Noti', spellbook:'Libro degli Incantesimi',
  preparedSpells:'Incantesimi Preparati', spellsPrepared:'Incantesimi Preparati',
  pactMagic:'Incantesimi del Patto',
};

let BL   = null; // entity lists cache { races, classes, bgs }
let BD   = null; // current level draft (alias for BDs[BS.currentLevel])
let BDs  = {};   // per-level draft cache { 1: bd1, 2: bd2, ... }
let BHitDiceFaces = null; // class hit die faces (fetched once on class select)
let BS   = bsDefault();

function bsDefault() {
  return {
    locale:'it', name:'',
    race:'', raceSource:'', class:'', classSource:'',
    background:'', backgroundSource:'', level:1, currentLevel:1,
    method:'standardArray',
    assignments:{ str:15, dex:14, con:13, int:12, wis:10, cha:8 },
    choices:{}, spellChoices:{},
  };
}

function bsSave() { try { localStorage.setItem(BUILDER_KEY, JSON.stringify(BS)); } catch {} }
function bsLoad() {
  try {
    const raw = localStorage.getItem(BUILDER_KEY);
    if (raw) BS = { ...bsDefault(), ...JSON.parse(raw) };
  } catch { BS = bsDefault(); }
}

// ── Panel open/close ────────────────────────────────────

function openBuilderPanel() {
  D.app.classList.add('show-builder');
  if (!BL) bLoadLists(); else bRenderForm();
}
function closeBuilderPanel() { D.app.classList.remove('show-builder'); }
function toggleBuilderPanel() {
  D.app.classList.contains('show-builder') ? closeBuilderPanel() : openBuilderPanel();
}

// ── Entity lists ────────────────────────────────────────

async function bLoadLists() {
  document.getElementById('b-loading').classList.remove('hidden');
  try {
    const [races, classes, bgs] = await Promise.all([
      api.list({ type:'race',       limit:200, sort:'name', locale:BS.locale }),
      api.list({ type:'class',      limit:50,  sort:'name', locale:BS.locale }),
      api.list({ type:'background', limit:300, sort:'name', locale:BS.locale }),
    ]);
    BL = { races:races.results, classes:classes.results, bgs:bgs.results };
  } catch(e) {
    console.error('Builder: list load failed', e);
  } finally {
    document.getElementById('b-loading').classList.add('hidden');
  }
  bRenderForm();
}

function bFillSelect(id, items, curSlug, curSrc) {
  const sel = document.getElementById(id);
  if (!sel || !items) return;
  const selKey = curSlug ? `${curSlug}|${curSrc}` : '';
  sel.innerHTML = '<option value="">— Scegli —</option>' +
    items.map(e => {
      const parts = e.id.split(':');
      const src   = parts[1];
      const slug  = parts.slice(2).join(':');
      const key   = `${slug}|${src}`;
      return `<option value="${esc(key)}"${key === selKey ? ' selected' : ''}>${esc(e.name)}</option>`;
    }).join('');
}

// ── Form render ─────────────────────────────────────────

function bRenderForm() {
  document.getElementById('b-form-view').classList.remove('hidden');
  document.getElementById('b-sheet-view').classList.add('hidden');

  document.querySelectorAll('[data-b-locale]').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.bLocale === BS.locale)
  );
  if (BL) {
    bFillSelect('b-race',       BL.races,   BS.race,       BS.raceSource);
    bFillSelect('b-class',      BL.classes, BS.class,      BS.classSource);
    bFillSelect('b-background', BL.bgs,     BS.background, BS.backgroundSource);
  }
  document.getElementById('b-name').value  = BS.name || '';

  const hasDraft = !!BD;
  const canAdvance = hasDraft && BS.currentLevel < 20;
  document.getElementById('b-sec-scores').classList.toggle('hidden', !hasDraft);
  document.getElementById('b-levels-ui').classList.toggle('hidden', !hasDraft);
  document.getElementById('b-generate-row').classList.toggle('hidden', !hasDraft);

  if (hasDraft) {
    const advBtn = document.getElementById('b-advance-btn');
    const genBtn = document.getElementById('b-generate-btn');
    const hintEl = document.getElementById('b-level-hint');
    if (advBtn) {
      advBtn.classList.toggle('hidden', !canAdvance);
      advBtn.disabled = false;
      if (canAdvance) advBtn.textContent = `Avanza al livello ${BS.currentLevel + 1} →`;
    }
    if (genBtn) genBtn.classList.remove('hidden'); // always available once draft loaded
    if (hintEl) hintEl.classList.add('hidden'); // no longer needed

    bRenderScores();
    bRenderAllLevels(); // renders all loaded levels with summaries
  }
}

// ── Ability scores ──────────────────────────────────────

function bRenderScores() {
  document.querySelectorAll('[name=b-method]').forEach(r => { r.checked = r.value === BS.method; });
  bRenderScoreInputs();
}

function bRenderScoreInputs() {
  const el  = document.getElementById('b-scores-ui');
  if (!el) return;
  const met = BS.method;
  const as  = BS.assignments;

  if (met === 'standardArray') {
    el.innerHTML = `
      <div class="b-sa-hint">Assegna i valori [${BSTD_ARRAY.join(', ')}] alle sei caratteristiche:</div>
      <div class="b-scores-grid">
        ${BSTAT_ORDER.map(stat => {
          const cur = as[stat] ?? 10;
          const used = Object.entries(as).filter(([s]) => s !== stat).map(([,v]) => v);
          const avail = BSTD_ARRAY.filter(v => v === cur || !used.includes(v));
          return `<div class="b-score-cell">
            <div class="b-score-name">${BSTAT_SHORT[stat]}</div>
            <select class="b-score-sel" data-stat="${stat}">
              ${avail.map(v => `<option value="${v}"${v===cur?' selected':''}>${v}</option>`).join('')}
            </select>
            <div class="b-score-mod">${abMod(cur)}</div>
          </div>`;
        }).join('')}
      </div>`;
    el.querySelectorAll('.b-score-sel').forEach(sel => {
      sel.addEventListener('change', () => {
        const stat  = sel.dataset.stat;
        const oldV  = BS.assignments[stat];
        const newV  = +sel.value;
        const clash = BSTAT_ORDER.find(s => s !== stat && BS.assignments[s] === newV);
        if (clash) BS.assignments[clash] = oldV;
        BS.assignments[stat] = newV;
        bsSave(); bRenderScoreInputs();
      });
    });

  } else if (met === 'pointBuy') {
    const spent     = BSTAT_ORDER.reduce((sum, s) => sum + (BPB_COSTS[as[s]] ?? 0), 0);
    const remaining = 27 - spent;
    el.innerHTML = `
      <div class="b-pb-budget">Budget: <strong>${remaining} pt</strong> rimanenti su 27</div>
      <div class="b-scores-grid">
        ${BSTAT_ORDER.map(stat => {
          const val = as[stat] ?? 8;
          return `<div class="b-score-cell">
            <div class="b-score-name">${BSTAT_SHORT[stat]}</div>
            <div class="b-pb-ctrl">
              <button class="b-pb-btn" data-stat="${stat}" data-d="-">−</button>
              <span class="b-pb-val">${val}</span>
              <button class="b-pb-btn" data-stat="${stat}" data-d="+">+</button>
            </div>
            <div class="b-score-mod">${abMod(val)}</div>
          </div>`;
        }).join('')}
      </div>`;
    el.querySelectorAll('.b-pb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stat   = btn.dataset.stat;
        const dir    = btn.dataset.d;
        const cur    = BS.assignments[stat] ?? 8;
        const next   = cur + (dir === '+' ? 1 : -1);
        if (next < 8 || next > 15) return;
        const curSpent = BSTAT_ORDER.reduce((s, k) => s + (BPB_COSTS[BS.assignments[k]] ?? 0), 0);
        const addCost  = (BPB_COSTS[next] ?? 0) - (BPB_COSTS[cur] ?? 0);
        if (addCost > 0 && curSpent + addCost > 27) return;
        BS.assignments[stat] = next;
        bsSave(); bRenderScoreInputs();
      });
    });

  } else {
    el.innerHTML = `
      <div class="b-sa-hint">Inserisci i punteggi liberamente (3–20):</div>
      <div class="b-scores-grid">
        ${BSTAT_ORDER.map(stat => {
          const val = as[stat] ?? 10;
          return `<div class="b-score-cell">
            <div class="b-score-name">${BSTAT_SHORT[stat]}</div>
            <input type="number" class="b-score-input" data-stat="${stat}" min="3" max="20" value="${val}">
            <div class="b-score-mod" id="bsm-${stat}">${abMod(val)}</div>
          </div>`;
        }).join('')}
      </div>`;
    el.querySelectorAll('.b-score-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const stat = inp.dataset.stat;
        const val  = Math.max(3, Math.min(20, +inp.value || 10));
        BS.assignments[stat] = val;
        const modEl = document.getElementById(`bsm-${stat}`);
        if (modEl) modEl.textContent = abMod(val);
        bsSave();
      });
    });
  }
}

// ── Level-by-level render ────────────────────────────────

function bProfBonus(level) { return Math.floor((level - 1) / 4) + 2; }

function bSlotDeltaHTML(bd, lvl) {
  const sc = bd?.classBuilder?.spellcasting;
  if (!sc?.canCastSpells) return '';
  const curSlots  = sc.spellSlots?.slots || {};
  const prevBd    = BDs[lvl - 1];
  const prevSlots = prevBd?.classBuilder?.spellcasting?.spellSlots?.slots || {};

  const parts = [];
  for (let i = 1; i <= 9; i++) {
    const cur  = curSlots[String(i)]  || 0;
    const prev = prevSlots[String(i)] || 0;
    if (cur > prev) parts.push(`+${cur - prev} slot lv.${i} (tot. ${cur})`);
    else if (cur > 0 && lvl === 1) parts.push(`${cur} slot lv.${i}`);
  }
  if (!parts.length) return '';
  return `<span class="b-sum-badge b-sum-badge--spell">✨ ${parts.join(' · ')}</span>`;
}

function bLevelSummaryHTML(bd, lvl) {
  const features = bd?.classBuilder?.features?.classFeaturesAtLevel || [];
  const badges   = [];

  // HP
  const hd = BHitDiceFaces;
  if (hd) badges.push(`<span class="b-sum-badge b-sum-badge--hp">❤️ +1d${hd} PF</span>`);

  // Proficiency bonus (only show when it changes)
  const pb = bProfBonus(lvl);
  if (lvl === 1 || bProfBonus(lvl - 1) !== pb) {
    badges.push(`<span class="b-sum-badge b-sum-badge--prof">🛡 Bonus comp. +${pb}</span>`);
  }

  // Spell slots
  const slotHTML = bSlotDeltaHTML(bd, lvl);
  if (slotHTML) badges.push(slotHTML);

  // Class features at this level
  for (const f of features) {
    badges.push(`<span class="b-sum-badge">${esc(f.name)}</span>`);
  }

  if (!badges.length) return '';
  return `<div class="b-level-summary">${badges.join('')}</div>`;
}

function bRenderAllLevels() {
  const container = document.getElementById('b-levels-ui');
  if (!container) return;

  // Build HTML for all loaded levels
  let html = '';
  for (let lvl = 1; lvl <= BS.currentLevel; lvl++) {
    const bd = BDs[lvl];
    if (!bd) continue;
    const isCurrent = lvl === BS.currentLevel;
    const hasChoices = (bd.choiceManifest?.choices?.length || 0) > 0;
    const hasSpells  = (bd.spellChoiceManifest?.choices?.length || 0) > 0;
    const isEmpty    = !hasChoices && !hasSpells;

    html += `<div class="b-level-section${isCurrent ? ' b-level-current' : ''}" data-level="${lvl}">
      <button class="b-level-header" type="button" data-toggle-level="${lvl}">
        <span class="b-level-header-title">Livello ${lvl}</span>
        <span class="b-level-header-arrow">${isCurrent ? '▲' : '▼'}</span>
      </button>
      ${bLevelSummaryHTML(bd, lvl)}
      <div class="b-level-content${isCurrent ? '' : ' hidden'}" id="blc-${lvl}">
        <div id="b-choices-ui-${lvl}"></div>
        ${hasSpells ? `<div id="b-spells-ui-${lvl}"></div>` : ''}
        ${isEmpty   ? `<div class="b-sa-hint">Nessuna scelta richiesta a questo livello.</div>` : ''}
      </div>
    </div>`;
  }
  container.innerHTML = html;

  // Attach toggle events
  container.querySelectorAll('[data-toggle-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl  = +btn.dataset.toggleLevel;
      const cont = document.getElementById(`blc-${lvl}`);
      const arr  = btn.querySelector('.b-level-header-arrow');
      if (cont) { cont.classList.toggle('hidden'); arr.textContent = cont.classList.contains('hidden') ? '▼' : '▲'; }
    });
  });

  // Render choices and spells for each level
  for (let lvl = 1; lvl <= BS.currentLevel; lvl++) {
    const bd = BDs[lvl];
    if (!bd) continue;
    bRenderChoices(bd, `b-choices-ui-${lvl}`);
    if ((bd.spellChoiceManifest?.choices?.length || 0) > 0) {
      bRenderSpells(bd, `b-spells-ui-${lvl}`); // async, no await
    }
  }
}

// ── Non-spell choices ───────────────────────────────────

function bRenderChoices(bd, containerId) {
  const el  = document.getElementById(containerId || 'b-choices-ui');
  if (!el) return;
  const all = bd?.choiceManifest?.choices || [];
  if (!all.length) { el.innerHTML = ''; return; }

  // Pre-populate ASI default so backend always receives a valid value
  // even if the user never interacts with the widget
  let needsSave = false;
  for (const c of all) {
    if (c.kind === 'abilityScoreImprovement' && !BS.choices[c.id]) {
      BS.choices[c.id] = { mode: 'increase', abilities: ['str'] };
      needsSave = true;
    }
  }
  if (needsSave) bsSave();

  el.innerHTML = all.map(c => bChoiceWidget(c)).join('');
  all.forEach(c => bAttachChoiceEvents(c));
}

// Normalize option shapes: API can return {value,label}, {id,name}, or {key,label,items[]}
function bOptVal(o)   { return o.value ?? o.id ?? o.key ?? ''; }
function bOptLabel(o) { return o.label ?? o.name ?? bOptVal(o); }

function bChoiceWidget(choice) {
  const { id, kind, count = 1, options = [], scope } = choice;
  const title = BCHOICE_KIND_LABELS[kind] || kind;
  const sc    = BSCOPE_LABELS[scope] || scope;

  if (kind === 'abilityScoreImprovement') return bASIWidget(choice);

  const isMulti = kind === 'proficiency';
  const current  = BS.choices[id];

  if (isMulti) {
    const sel = Array.isArray(current) ? current : [];
    return `<div class="b-choice-group" id="cg-${esc(id)}">
      <div class="b-choice-title">${esc(sc)} — ${esc(title)} <span class="b-choice-count">(scegli ${count})</span></div>
      <div class="b-checkbox-grid">
        ${options.map(o => {
          const val = bOptVal(o);
          return `<label class="b-checkbox-label">
            <input type="checkbox" data-cid="${esc(id)}" data-count="${count}" value="${esc(val)}"${sel.includes(val)?' checked':''}>
            <span>${esc(bOptLabel(o))}</span></label>`;
        }).join('')}
      </div>
    </div>`;
  }

  // Equipment choices: options are {key, label, items[]}
  if (kind === 'startingEquipment') {
    const selVal = typeof current === 'string' ? current : '';
    return `<div class="b-choice-group" id="cg-${esc(id)}">
      <div class="b-choice-title">${esc(sc)} — ${esc(title)}</div>
      <select class="b-select" data-cid="${esc(id)}">
        <option value="">— Scegli —</option>
        ${options.map(o => {
          const itemNames = (o.items||[]).map(it => {
            const name = it.item?.name || it.item?.originalName || '';
            return it.quantity > 1 ? `${it.quantity}x ${name}` : name;
          }).join(', ');
          const selectorNames = (o.selectors||[]).map(s => s.label || s.type || 'arma a scelta').join(', ');
          const display = [itemNames, selectorNames].filter(Boolean).join(', ') || o.label || o.key;
          return `<option value="${esc(o.key)}"${o.key===selVal?' selected':''}>${esc(display)}</option>`;
        }).join('')}
      </select>
    </div>`;
  }

  // Single-select (subrace, subclass, feat, optionalFeatureProgression, etc.)
  const selVal = typeof current === 'string' ? current : '';
  return `<div class="b-choice-group" id="cg-${esc(id)}">
    <div class="b-choice-title">${esc(sc)} — ${esc(title)}</div>
    <select class="b-select" data-cid="${esc(id)}">
      <option value="">— Scegli —</option>
      ${options.map(o => {
        const val = bOptVal(o);
        return `<option value="${esc(val)}"${val===selVal?' selected':''}>${esc(bOptLabel(o))}</option>`;
      }).join('')}
    </select>
  </div>`;
}

function bASIWidget(choice) {
  const { id } = choice;
  const level   = id.split('.').pop();
  const cur     = BS.choices[id] || { mode:'increase', abilities:['str'] };
  const mode    = cur.mode || 'increase';
  const abs     = cur.abilities || ['str'];
  const featVal = cur.feat || '';
  const rawFeatOpts = choice.featOptions || choice.options || [];
  const featOpts = rawFeatOpts.map(f => ({ value: bOptVal(f), label: bOptLabel(f) }));

  return `<div class="b-choice-group" id="cg-${esc(id)}">
    <div class="b-choice-title">Classe — Miglioramento Caratteristica (liv. ${esc(level)})</div>
    <div class="b-asi-radios">
      <label class="b-radio-label"><input type="radio" name="asi-m-${esc(id)}" value="increase" data-cid="${esc(id)}" data-f="mode"${mode==='increase'?' checked':''}> +2 / +1+1 a Caratteristica</label>
      <label class="b-radio-label"><input type="radio" name="asi-m-${esc(id)}" value="feat"     data-cid="${esc(id)}" data-f="mode"${mode==='feat'?' checked':''}> Impresa</label>
    </div>
    <div id="asi-inc-${esc(id)}"${mode!=='increase'?' style="display:none"':''}>
      <div class="b-label" style="margin-bottom:4px">+2 a una caratteristica:</div>
      <select class="b-select" data-cid="${esc(id)}" data-f="ab1" style="margin-bottom:8px">
        ${BSTAT_ORDER.map(s => `<option value="${s}"${abs[0]===s?' selected':''}>${BSTAT_IT[s]}</option>`).join('')}
      </select>
      <div class="b-label" style="margin-bottom:4px">— oppure — +1 a due caratteristiche:</div>
      <div style="display:flex;gap:6px">
        <select class="b-select" data-cid="${esc(id)}" data-f="ab1b">
          ${BSTAT_ORDER.map(s => `<option value="${s}"${(abs[0]===s&&abs.length>1)?' selected':''}>${BSTAT_IT[s]}</option>`).join('')}
        </select>
        <select class="b-select" data-cid="${esc(id)}" data-f="ab2">
          ${BSTAT_ORDER.map(s => `<option value="${s}"${abs[1]===s?' selected':''}>${BSTAT_IT[s]}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="asi-feat-${esc(id)}"${mode!=='feat'?' style="display:none"':''}>
      <select class="b-select" data-cid="${esc(id)}" data-f="feat">
        <option value="">— Scegli un'impresa —</option>
        ${featOpts.map(f => `<option value="${esc(f.value)}"${f.value===featVal?' selected':''}>${esc(f.label)}</option>`).join('')}
      </select>
    </div>
  </div>`;
}

function bAttachChoiceEvents(choice) {
  const { id, kind, count = 1 } = choice;
  const cg = document.getElementById(`cg-${id}`);
  if (!cg) return;

  if (kind === 'abilityScoreImprovement') {
    cg.querySelectorAll(`[name="asi-m-${id}"]`).forEach(r => {
      r.addEventListener('change', () => {
        const cur  = BS.choices[id] || {};
        BS.choices[id] = { ...cur, mode: r.value };
        const incEl  = document.getElementById(`asi-inc-${id}`);
        const featEl = document.getElementById(`asi-feat-${id}`);
        if (incEl)  incEl.style.display  = r.value === 'increase' ? '' : 'none';
        if (featEl) featEl.style.display = r.value === 'feat'     ? '' : 'none';
        bsSave();
      });
    });
    cg.querySelectorAll('select[data-f]').forEach(sel => {
      sel.addEventListener('change', () => {
        const cur = BS.choices[id] || { mode:'increase', abilities:['str'] };
        const f   = sel.dataset.f;
        if (f === 'feat') {
          BS.choices[id] = { ...cur, feat: sel.value };
        } else if (f === 'ab1') {
          BS.choices[id] = { ...cur, abilities: [sel.value] };
        } else if (f === 'ab1b') {
          const a2 = cur.abilities?.[1] || 'dex';
          BS.choices[id] = { ...cur, abilities: [sel.value, a2] };
        } else if (f === 'ab2') {
          const a1 = cur.abilities?.[0] || 'str';
          BS.choices[id] = { ...cur, abilities: [a1, sel.value] };
        }
        bsSave();
      });
    });
    return;
  }

  const isMulti = kind === 'proficiency';
  if (isMulti) {
    const initCheck = () => {
      const nowChecked = Array.from(cg.querySelectorAll('input:checked'));
      cg.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.disabled = !cb.checked && nowChecked.length >= count;
      });
    };
    cg.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (Array.from(cg.querySelectorAll('input:checked')).length > count) {
          cb.checked = false; return;
        }
        BS.choices[id] = Array.from(cg.querySelectorAll('input:checked')).map(c => c.value);
        bsSave(); initCheck();
      });
      initCheck();
    });
  } else {
    const sel = cg.querySelector('select[data-cid]');
    if (sel) sel.addEventListener('change', () => { BS.choices[id] = sel.value; bsSave(); });
  }
}

// ── Spell choices ───────────────────────────────────────

// Group spellbook choices by spellLevelMax to avoid showing many identical boxes.
// Non-spellbook choices (cantripsKnown, spellsKnown, etc.) pass through unchanged.
// Each merged group gets id "__spellbook_maxN" and carries _members for distribution.
function bGroupSpellChoices(all) {
  const out = [];
  const spellbookByMax = new Map(); // spellLevelMax → group entry

  for (const c of all) {
    if (c.kind !== 'spellbook') { out.push(c); continue; }

    const key = c.spellLevelMax ?? 'x';
    if (!spellbookByMax.has(key)) {
      const grp = {
        ...c,
        id:      `__spellbook_max${key}`,
        count:   c.count ?? 0,
        _members: [{ id: c.id, count: c.count ?? 99 }],
      };
      spellbookByMax.set(key, grp);
      out.push(grp);
    } else {
      const grp = spellbookByMax.get(key);
      // Use the path of the latest member (usually the most inclusive one)
      grp.path  = c.path;
      grp.count = (grp.count ?? 0) + (c.count ?? 0);
      grp._members.push({ id: c.id, count: c.count ?? 99 });
    }
  }
  return out;
}

// Expand merged spellbook groups back into per-ID selections for bBuildBody.
function bExpandSpellChoices(grouped, merged) {
  const out = {};
  for (const c of grouped) {
    if (!c._members) {
      out[c.id] = merged[c.id] || [];
      continue;
    }
    const selected = merged[c.id] || [];
    let offset = 0;
    for (const m of c._members) {
      out[m.id] = selected.slice(offset, offset + m.count);
      offset   += m.count;
    }
  }
  return out;
}

async function bRenderSpells(bd, containerId) {
  const el  = document.getElementById(containerId || 'b-spells-ui');
  if (!el) return;
  const raw = bd?.spellChoiceManifest?.choices || [];
  const all = bGroupSpellChoices(raw);

  // Show skeletons first
  el.innerHTML = all.map(c => {
    const { id, kind, count, spellLevelMin = 0, spellLevelMax = 9 } = c;
    const title  = BSPELL_LABELS[kind] || kind;
    const lvlStr = spellLevelMin === 0 ? 'trucchi'
      : spellLevelMin === spellLevelMax ? `liv. ${spellLevelMin}`
      : `liv. ${spellLevelMin}–${spellLevelMax}`;
    // count is null for prepared spellcasters (depends on ability scores at runtime)
    const countStr = count != null ? `scegli ${count}` : (c.countFormulaLabel || 'numero variabile');
    return `<div class="b-choice-group" id="scg-${esc(id)}">
      <div class="b-choice-title">${esc(title)} <span class="b-choice-count">(${esc(countStr)}, ${lvlStr})</span></div>
      <div class="b-sa-hint">Caricamento incantesimi…</div>
    </div>`;
  }).join('');

  // Fetch spells for each choice concurrently
  await Promise.all(all.map(async c => {
    const { id, path } = c;
    // null count = prepared spellcasters: limit depends on ability scores, allow free selection
    const effectiveCount = c.count != null ? c.count : 99;
    const cg = document.getElementById(`scg-${id}`);
    if (!cg) return;

    let spells = [];
    if (path) {
      try {
        const res  = await fetch(path);
        const data = await res.json();
        spells = data.results || [];
      } catch(e) { console.warn('Builder: spell fetch failed', id, e); }
    }

    const selected = BS.spellChoices[id] || [];
    cg.innerHTML = cg.querySelector('.b-choice-title').outerHTML +
      `<input type="text" class="b-spell-search" data-scid="${esc(id)}" placeholder="Filtra incantesimi…">
      <div class="b-checkbox-grid b-spell-grid">
        ${spells.length
          ? spells.map(s => {
              const val = s.id || '';
              const lbl = s.name || s.originalName || val;
              return `<label class="b-checkbox-label">
                <input type="checkbox" data-scid="${esc(id)}" data-count="${effectiveCount}" value="${esc(val)}"${selected.includes(val)?' checked':''}>
                <span>${esc(lbl)}</span></label>`;
            }).join('')
          : '<span class="b-sa-hint">Nessun incantesimo disponibile.</span>'}
      </div>`;
    bAttachSpellEvents(c);
  }));
}

function bAttachSpellEvents(choice) {
  const { id } = choice;
  const count = choice.count != null ? choice.count : 99; // null = prepared caster, no hard cap
  // spell containers use scg- prefix
  const cg = document.getElementById(`scg-${id}`);
  if (!cg) return;

  const search = cg.querySelector('.b-spell-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      cg.querySelectorAll('.b-checkbox-label').forEach(lbl => {
        lbl.hidden = !!(q && !lbl.querySelector('span')?.textContent?.toLowerCase().includes(q));
      });
    });
  }

  const initCheck = () => {
    const nowChecked = Array.from(cg.querySelectorAll('input:checked'));
    cg.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.disabled = !cb.checked && nowChecked.length >= count;
    });
  };
  cg.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (Array.from(cg.querySelectorAll('input:checked')).length > count) {
        cb.checked = false; return;
      }
      BS.spellChoices[id] = Array.from(cg.querySelectorAll('input:checked')).map(c => c.value);
      bsSave(); initCheck();
    });
    initCheck();
  });
}

// ── Load draft ──────────────────────────────────────────

async function bLoadChoices() {
  const errEl = document.getElementById('b-errors');
  errEl.classList.add('hidden');

  if (!BS.race || !BS.class || !BS.background) {
    errEl.innerHTML = 'Seleziona razza, classe e background prima di continuare.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('b-load-btn');
  btn.disabled = true;
  btn.textContent = 'Caricamento…';

  try {
    const [draft, classEntity] = await Promise.all([
      apiFetch('/builds/draft', {
        race:             BS.race,
        raceSource:       BS.raceSource,
        class:            BS.class,
        classSource:      BS.classSource,
        background:       BS.background,
        backgroundSource: BS.backgroundSource,
        level:            1,
        locale:           BS.locale,
      }),
      apiFetch(`/entities/by-slug/class/${encodeURIComponent(BS.class)}`, {
        source: BS.classSource, locale: BS.locale,
      }).catch(() => null),
    ]);
    BD   = draft;
    BDs  = { 1: draft };
    BHitDiceFaces = classEntity?.normalized?.hitDiceFaces ?? null;
    // Reset all choices and start at level 1
    BS.choices      = {};
    BS.spellChoices = {};
    BS.currentLevel = 1;
    bsSave();
    bRenderForm();
  } catch(e) {
    errEl.innerHTML = `Errore nel caricamento delle scelte: ${esc(e.message || 'sconosciuto')}`;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Carica Scelte →';
  }
}

// ── Current-level completeness check ────────────────────

function bCurrentLevelMissing() {
  const bd = BDs[BS.currentLevel];
  if (!bd) return [];
  const missing = [];

  const choices = bd.choiceManifest?.choices || [];
  for (const c of choices) {
    const val = BS.choices[c.id];
    if (c.kind === 'abilityScoreImprovement') {
      if (!val) missing.push(c.id);
    } else if (c.kind === 'proficiency') {
      const arr = Array.isArray(val) ? val : [];
      if (arr.length < (c.count ?? 1)) missing.push(c.id);
    } else {
      if (!val) missing.push(c.id);
    }
  }

  const raw     = bd.spellChoiceManifest?.choices || [];
  const grouped = bGroupSpellChoices(raw);
  for (const c of grouped) {
    if (c.count == null) continue; // prepared casters: no hard cap
    const arr = Array.isArray(BS.spellChoices[c.id]) ? BS.spellChoices[c.id] : [];
    if (arr.length < c.count) missing.push(c.id);
  }

  return missing;
}

// ── Advance to next level ───────────────────────────────

async function bAdvanceLevel() {
  const nextLevel = BS.currentLevel + 1;
  if (nextLevel > 20) return;

  const errEl = document.getElementById('b-errors');
  errEl.classList.add('hidden');

  const missing = bCurrentLevelMissing();
  if (missing.length) {
    errEl.innerHTML = `Completa tutte le scelte del livello ${BS.currentLevel} prima di avanzare.`;
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('b-advance-btn');
  btn.disabled = true;
  btn.textContent = 'Caricamento…';

  try {
    const draft = await apiFetch('/builds/draft', {
      race:             BS.race,
      raceSource:       BS.raceSource,
      class:            BS.class,
      classSource:      BS.classSource,
      background:       BS.background,
      backgroundSource: BS.backgroundSource,
      level:            nextLevel,
      fromLevel:        BS.currentLevel,
      locale:           BS.locale,
    });
    BD = draft;
    BDs[nextLevel] = draft;
    BS.currentLevel = nextLevel;
    bsSave();
    bRenderForm();
  } catch(e) {
    errEl.innerHTML = `Errore: ${esc(e.message || 'sconosciuto')}`;
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = `Avanza al livello ${nextLevel} →`;
  }
}

// ── Generate sheet ──────────────────────────────────────

async function apiPost(path, body) {
  const url = new URL(API + path, location.origin);
  const res = await fetch(url.toString(), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e   = new Error(err.message || res.statusText);
    e.status  = res.status; e.data = err;
    throw e;
  }
  return res.json();
}

function bBuildBody() {
  // Collect spell choice manifests from all loaded levels
  const raw     = Object.values(BDs).flatMap(bd => bd?.spellChoiceManifest?.choices || []);
  const grouped = bGroupSpellChoices(raw);
  const spellChoices = bExpandSpellChoices(grouped, BS.spellChoices);
  return {
    race:             BS.race,
    raceSource:       BS.raceSource,
    class:            BS.class,
    classSource:      BS.classSource,
    background:       BS.background,
    backgroundSource: BS.backgroundSource,
    level:            BS.currentLevel,
    locale:           BS.locale,
    choices:          BS.choices,
    spellChoices,
    abilityScores:    { method: BS.method, assignments: BS.assignments },
  };
}

async function bGenerate() {
  const errEl = document.getElementById('b-errors');
  errEl.classList.add('hidden');

  const btn = document.getElementById('b-generate-btn');
  btn.disabled = true;
  btn.textContent = 'Generazione…';

  try {
    // /builds/validate returns 422 when choices are incomplete — extract errors from e.data.errors
    let vres = null;
    try {
      vres = await apiPost('/builds/validate', bBuildBody());
    } catch(ve) {
      const verrs = ve.data?.errors;
      if (verrs?.length) {
        const msgs = verrs.slice(0,8).map(e => `• ${esc(e.message || e.code)}`).join('<br>');
        errEl.innerHTML = `<strong>Errori da correggere:</strong><br>${msgs}`;
        errEl.classList.remove('hidden');
        return;
      }
      throw ve;
    }
    if (vres && !vres.valid && vres.errors?.length) {
      const msgs = vres.errors.slice(0,8).map(e => `• ${esc(e.message || e.code)}`).join('<br>');
      errEl.innerHTML = `<strong>Errori da correggere:</strong><br>${msgs}`;
      errEl.classList.remove('hidden');
      return;
    }

    const result = await apiPost('/builds/sheet', bBuildBody());
    if (result.sheet) bRenderSheet(result.sheet);

  } catch(e) {
    // Also handle 422 from /builds/sheet
    const verrs = e.data?.errors;
    if (verrs?.length) {
      const msgs = verrs.slice(0,8).map(err => `• ${esc(err.message || err.code)}`).join('<br>');
      errEl.innerHTML = `<strong>Errori da correggere:</strong><br>${msgs}`;
      errEl.classList.remove('hidden');
      return;
    }
    const msg = e.data?.message || e.data?.error || e.message || `Errore HTTP ${e.status || ''}`;
    errEl.innerHTML = `<strong>Errore:</strong> ${esc(msg)}`;
    errEl.classList.remove('hidden');
    console.error('Forgia generate error:', e);
  } finally {
    btn.disabled = false;
    btn.textContent = '⚒ Genera Scheda';
  }
}

// ── Character sheet renderer ────────────────────────────

function bFmtMod(n) {
  if (n == null) return '—';
  return n >= 0 ? `+${n}` : `${n}`;
}

function bRenderSheet(sheet) {
  const id    = sheet.identity      || {};
  const abils = sheet.abilities?.abilities || {};   // nested one level deeper
  const cs    = sheet.combatStats   || {};
  const ds    = sheet.derivedStats  || {};
  const profs = sheet.proficiencies || {};
  const sc    = sheet.spellcasting  || {};
  const spells = sheet.spells       || {};
  const wa    = sheet.weaponAttacks?.attacks || [];
  const sa    = sheet.spellActions?.actions  || [];
  const res   = sheet.resources     || {};
  const feats = sheet.features      || {};

  const saves  = ds.savingThrows || {};
  const skills = ds.skills       || {};
  const pb     = ds.proficiencyBonus ?? 2;

  const charName  = BS.name || id.name || 'Personaggio';
  // Identity fields are entity objects { name, ... }, not plain strings
  const raceName  = id.race?.name      || id.race      || '';
  const subName   = id.subrace?.name   || id.subrace   || '';
  const clsName   = id.class?.name     || id.class     || '';
  const subClsName= id.subclass?.name  || id.subclass  || '';
  const bgName    = id.background?.name|| id.background|| '';
  const classLine = [clsName, subClsName].filter(Boolean).join(' — ');
  const subtitle  = [raceName, subName, classLine, id.level ? `Livello ${id.level}` : '', bgName].filter(Boolean).join('  ·  ');

  const hpMax    = cs.hitPoints?.maximum ?? cs.hitPoints ?? '—';
  const acVal    = cs.armorClass?.value  ?? cs.armorClass ?? '—';
  // Speed comes from sheet.speed, not combatStats
  const spd      = sheet.speed || {};
  const speedStr = spd.walkLabel || (spd.walk ? (BS.locale === 'it' ? ftToM(spd.walk) + ' m' : spd.walk + ' ft') : '—');

  const el = document.getElementById('b-sheet-content');
  el.innerHTML = `
    <div class="char-header-card">
      <div class="char-name">${esc(charName)}</div>
      <div class="char-subtitle">${esc(subtitle)}</div>
    </div>

    <div class="char-stats-grid">
      ${BSTAT_ORDER.map(stat => {
        const entry = abils[stat] || {};
        const score = entry.score ?? 10;
        const mod   = entry.modifier ?? abModNum(score);
        return `<div class="char-stat-cell">
          <div class="char-stat-name">${BSTAT_SHORT[stat]}</div>
          <div class="char-stat-score">${score}</div>
          <div class="char-stat-mod">${bFmtMod(mod)}</div>
        </div>`;
      }).join('')}
    </div>

    <div class="char-combat-row">
      <div class="char-combat-cell"><div class="char-combat-label">CA</div><div class="char-combat-val">${acVal}</div></div>
      <div class="char-combat-cell"><div class="char-combat-label">PF max</div><div class="char-combat-val">${hpMax}</div></div>
      <div class="char-combat-cell"><div class="char-combat-label">Iniziativa</div><div class="char-combat-val">${bFmtMod(ds.initiative ?? 0)}</div></div>
      <div class="char-combat-cell"><div class="char-combat-label">Velocità</div><div class="char-combat-val">${speedStr}</div></div>
      <div class="char-combat-cell"><div class="char-combat-label">Comp.</div><div class="char-combat-val">+${pb}</div></div>
    </div>

    <div class="char-two-col">
      <div class="char-section">
        <div class="char-section-title">Tiri Salvezza</div>
        <div class="char-save-list">
          ${BSTAT_ORDER.map(s => {
            const sv  = saves[s] || {};
            return `<div class="char-skill-item">
              <span class="char-prof-dot${sv.proficient?' proficient':''}"></span>
              <span>${BSTAT_IT[s]}</span>
              <span class="char-skill-mod">${bFmtMod(sv.modifier ?? 0)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="char-section">
        <div class="char-section-title">Abilità</div>
        <div class="char-skill-list">
          ${BSKILLS_ALL.map(sk => {
            const sv  = skills[sk.k] || {};
            const dot = sv.expertise ? 'expert' : sv.proficient ? 'proficient' : '';
            return `<div class="char-skill-item">
              <span class="char-prof-dot ${dot}"></span>
              <span>${BSKILL_IT[sk.k] || sk.k}</span>
              <span class="char-skill-mod">${bFmtMod(sv.modifier ?? 0)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    ${bSheetProficiencies(profs)}
    ${bSheetEquipment(sheet.equipment)}
    ${bSheetFeatures(feats)}
    ${bSheetSpellcasting(sc, spells)}
    ${bSheetWeaponAttacks(wa)}
    ${bSheetSpellActions(sa)}
    ${bSheetResources(res)}
  `;

  // Wire up spell chip clicks → open entity
  el.querySelectorAll('.char-spell-chip[data-id]').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.id;
      if (id) { closeBuilderPanel(); openEntity(id, 'spell'); }
    });
  });

  // Show sheet view
  document.getElementById('b-sheet-char-name').textContent = charName;
  document.getElementById('b-form-view').classList.add('hidden');
  document.getElementById('b-sheet-view').classList.remove('hidden');
  document.getElementById('b-sheet-view').scrollTop = 0;
}

function bSheetProficiencies(profs) {
  // Each item is { value, label, sources } — extract label for display
  const toLabels = arr => (arr || []).map(p => (typeof p === 'object' ? (p.label || p.value) : p));
  const rows = [
    { cat:'Armature',   items: toLabels(profs.armor)     },
    { cat:'Armi',       items: toLabels(profs.weapons)   },
    { cat:'Strumenti',  items: toLabels(profs.tools)     },
    { cat:'Lingue',     items: toLabels(profs.languages) },
  ].filter(r => r.items.length);
  if (!rows.length) return '';
  return `<div class="char-section">
    <div class="char-section-title">Competenze</div>
    ${rows.map(r => `<div class="char-prof-row"><span class="char-prof-cat">${esc(r.cat)}</span>${esc(r.items.join(', '))}</div>`).join('')}
  </div>`;
}

function bSheetEquipment(equip) {
  const items = equip?.selectedItems || equip?.items || [];
  if (!items.length) return '';
  return `<div class="char-section">
    <div class="char-section-title">Equipaggiamento</div>
    <div class="char-equip-list">
      ${items.map(it => {
        const inner = it.item || it;
        const name  = inner.name || inner.originalName || inner.id || '?';
        const qty   = it.quantity && it.quantity > 1 ? ` ×${it.quantity}` : '';
        return `<div class="char-equip-item">${esc(name)}${qty}</div>`;
      }).join('')}
    </div>
  </div>`;
}

// Normalise a feature entry block (which may have an `entries` array of strings/objects)
// into { name, body } for display.
function bNormFeature(f) {
  if (!f || typeof f !== 'object') return { name: String(f), body: '' };
  const name = f.name || f.originalName || f.label || '';
  // `entries` is the 5etools content array — grab first string element as body
  let body = '';
  if (typeof f.content === 'string')     body = f.content;
  else if (typeof f.description === 'string') body = f.description;
  else if (Array.isArray(f.entries)) {
    body = f.entries.map(e => (typeof e === 'string' ? e : (e.entries?.[0] || ''))).join(' ');
  }
  return { name, body };
}
// Flatten a trait block that may be { entries:[{name, entries:[]}] }, { names:[] }, or a plain array
function bFlatTraits(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.entries)) return raw.entries;
  // backgroundFeatures has .names[] listing feature names
  if (Array.isArray(raw.names)) return raw.names.map(n => ({ name: n }));
  return [];
}

function bSheetFeatures(feats) {
  const groups = [
    { lbl:'Tratti di Razza',      list: bFlatTraits(feats.raceTraits)    },
    { lbl:'Tratti di Sottorazza', list: bFlatTraits(feats.subraceTraits) },
    // classFeatures is { known:[], atLevel:[] }
    { lbl:'Capacità di Classe',   list: feats.classFeatures?.known || feats.classFeatures?.atLevel || [] },
    { lbl:'Background',           list: bFlatTraits(feats.backgroundFeatures) },
    { lbl:'Imprese',              list: feats.feats           || [] },
    { lbl:'Capacità Opzionali',   list: feats.optionalFeatures || [] },
  ].filter(g => g.list.length);
  if (!groups.length) return '';

  return `<div class="char-section">
    <div class="char-section-title">Caratteristiche & Tratti</div>
    ${groups.map(g => `
      <div class="char-feat-group">
        <div class="char-feat-group-title">${esc(g.lbl)}</div>
        ${g.list.map(f => {
          const { name, body } = bNormFeature(f);
          return `<div class="char-feature">
            ${name ? `<div class="char-feature-name">${esc(name)}</div>` : ''}
            ${body ? `<div class="char-feature-body">${esc(body.substring(0,300))}${body.length>300?'…':''}</div>` : ''}
          </div>`;
        }).join('')}
      </div>`).join('')}
  </div>`;
}

function bSheetSpellcasting(sc, spells) {
  if (!sc?.ability) return '';
  const slots   = sc.spellSlots || {};
  const cantrips = spells.cantrips || [];
  const leveled  = spells.leveled  || {};
  const hasAnything = cantrips.length || Object.values(leveled).some(l => l?.length);
  if (!hasAnything && !Object.values(slots).some(n => n > 0)) return '';

  return `<div class="char-section">
    <div class="char-section-title">Magia</div>
    <div class="char-spell-stats">
      <span>Caratteristica: <strong>${BSTAT_IT[sc.ability] || sc.ability}</strong></span>
      ${sc.spellSaveDc       ? `<span>CD: <strong>${sc.spellSaveDc}</strong></span>` : ''}
      ${sc.spellAttackBonus != null ? `<span>Attacco: <strong>${bFmtMod(sc.spellAttackBonus)}</strong></span>` : ''}
    </div>
    ${Object.entries(slots).filter(([,n]) => n > 0).length ? `
    <div class="char-slot-row">
      ${Object.entries(slots).filter(([,n]) => n > 0).map(([lvl, n]) =>
        `<div class="char-slot-group"><div class="char-slot-level">Liv. ${lvl}</div><div class="char-slot-count">${n}</div></div>`
      ).join('')}
    </div>` : ''}
    ${cantrips.length ? `<div class="char-spell-level">
      <div class="char-spell-level-title">Trucchi</div>
      <div class="char-spell-chips">${cantrips.map(s => `<span class="char-spell-chip" data-id="${esc(s.id)}">${esc(s.name || s.originalName)}</span>`).join('')}</div>
    </div>` : ''}
    ${Object.entries(leveled).filter(([,l]) => l?.length).map(([lvl, list]) =>
      `<div class="char-spell-level">
        <div class="char-spell-level-title">Livello ${lvl}</div>
        <div class="char-spell-chips">${list.map(s => `<span class="char-spell-chip" data-id="${esc(s.id)}">${esc(s.name || s.originalName)}</span>`).join('')}</div>
      </div>`).join('')}
  </div>`;
}

function bSheetWeaponAttacks(attacks) {
  if (!attacks.length) return '';
  return `<div class="char-section">
    <div class="char-section-title">Attacchi con Arma</div>
    <div class="char-attack-list">
      ${attacks.map(a => `<div class="char-attack-row">
        <span class="char-attack-name">${esc(a.name || a.weaponName || '—')}</span>
        <span class="char-attack-bonus">${bFmtMod(a.attackBonus)}</span>
        <span class="char-attack-damage">${esc(a.damage || '—')}</span>
        <span class="char-attack-type">${esc(a.damageType || '')}</span>
      </div>`).join('')}
    </div>
  </div>`;
}

function bSheetSpellActions(actions) {
  if (!actions.length) return '';
  return `<div class="char-section">
    <div class="char-section-title">Azioni da Incantesimo</div>
    <div class="char-attack-list">
      ${actions.map(a => {
        const d = a.displayLabels || {};
        const line2 = [d.attack, d.save, d.damage, d.healing].filter(Boolean).join('  ·  ');
        return `<div class="char-attack-row">
          <span class="char-attack-name">${esc(a.name || a.id || '—')}</span>
          <span class="char-attack-bonus">${esc(d.activation || '')}</span>
          <span class="char-attack-damage">${esc(line2)}</span>
          <span class="char-attack-type"></span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function bSheetResources(res) {
  // resourcePools is { pools: [{key, label, die, max, recharge, ...}], ... }
  const pools = res.resourcePools?.pools || [];
  if (!pools.length) return '';
  return `<div class="char-section">
    <div class="char-section-title">Risorse</div>
    <div class="char-slot-row">
      ${pools.map(pool => `<div class="char-slot-group">
        <div class="char-slot-level">${esc(pool.label || pool.key)}</div>
        <div class="char-slot-count">${pool.unlimited ? '∞' : pool.max ?? '?'}</div>
        ${pool.die      ? `<div class="char-slot-die">${esc(pool.die)}</div>` : ''}
        ${pool.recharge ? `<div class="char-slot-recharge">${esc(pool.recharge)}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>`;
}

// ── Builder init & event wiring (called from init()) ────

function initBuilder() {
  bsLoad();

  const D_builder = {
    toggleBtn:  document.getElementById('builder-toggle-btn'),
    closeBtn:   document.getElementById('builder-close-btn'),
    resetBtn:   document.getElementById('b-reset-btn'),
    loadBtn:    document.getElementById('b-load-btn'),
    advanceBtn: document.getElementById('b-advance-btn'),
    generateBtn:document.getElementById('b-generate-btn'),
    backBtn:    document.getElementById('b-back-btn'),
    raceEl:     document.getElementById('b-race'),
    classEl:    document.getElementById('b-class'),
    bgEl:       document.getElementById('b-background'),
    nameEl:     document.getElementById('b-name'),
  };

  D_builder.toggleBtn?.addEventListener('click', toggleBuilderPanel);
  D_builder.closeBtn?.addEventListener('click', closeBuilderPanel);

  D_builder.resetBtn?.addEventListener('click', () => {
    if (!confirm('Azzerare tutta la Forgia del PG?')) return;
    BD  = null;
    BDs = {};
    BHitDiceFaces = null;
    BS  = bsDefault();
    bsSave();
    bRenderForm();
  });

  D_builder.loadBtn?.addEventListener('click', bLoadChoices);
  D_builder.advanceBtn?.addEventListener('click', bAdvanceLevel);
  D_builder.generateBtn?.addEventListener('click', bGenerate);
  D_builder.backBtn?.addEventListener('click', () => {
    document.getElementById('b-sheet-view').classList.add('hidden');
    document.getElementById('b-form-view').classList.remove('hidden');
  });

  // Identity selects
  const bResetDraft = () => { BD = null; BDs = {}; BHitDiceFaces = null; BS.currentLevel = 1; };
  D_builder.raceEl?.addEventListener('change', e => {
    const [slug, src] = e.target.value.split('|');
    BS.race = slug || ''; BS.raceSource = src || '';
    bResetDraft(); bsSave();
    document.getElementById('b-sec-scores').classList.add('hidden');
    document.getElementById('b-levels-ui').classList.add('hidden');
    document.getElementById('b-generate-row').classList.add('hidden');
  });
  D_builder.classEl?.addEventListener('change', e => {
    const [slug, src] = e.target.value.split('|');
    BS.class = slug || ''; BS.classSource = src || '';
    bResetDraft(); bsSave();
    document.getElementById('b-sec-scores').classList.add('hidden');
    document.getElementById('b-levels-ui').classList.add('hidden');
    document.getElementById('b-generate-row').classList.add('hidden');
  });
  D_builder.bgEl?.addEventListener('change', e => {
    const [slug, src] = e.target.value.split('|');
    BS.background = slug || ''; BS.backgroundSource = src || '';
    bResetDraft(); bsSave();
    document.getElementById('b-sec-scores').classList.add('hidden');
    document.getElementById('b-levels-ui').classList.add('hidden');
    document.getElementById('b-generate-row').classList.add('hidden');
  });
  D_builder.nameEl?.addEventListener('input', e => { BS.name = e.target.value; bsSave(); });

  // Locale buttons
  document.querySelectorAll('[data-b-locale]').forEach(btn => {
    btn.addEventListener('click', () => {
      BS.locale = btn.dataset.bLocale;
      document.querySelectorAll('[data-b-locale]').forEach(b =>
        b.classList.toggle('active', b.dataset.bLocale === BS.locale)
      );
      BD = null; BDs = {}; BHitDiceFaces = null; BL = null; // reload lists & draft for new locale
      bsSave();
      bLoadLists();
    });
  });

  // Score method radios
  document.querySelectorAll('[name=b-method]').forEach(r => {
    r.addEventListener('change', () => {
      BS.method = r.value;
      // Reset to neutral when switching methods
      if (r.value === 'standardArray') {
        BS.assignments = { str:15, dex:14, con:13, int:12, wis:10, cha:8 };
      } else if (r.value === 'pointBuy') {
        BS.assignments = { str:8, dex:8, con:8, int:8, wis:8, cha:8 };
      }
      bsSave(); bRenderScoreInputs();
    });
  });
}

// tag & image click delegation
document.addEventListener('click', e => {
  // chiude la tavolozza colori della plancia se si clicca fuori da bottone/popover
  if (!e.target.closest('.board-card-color-btn, .board-card-color-pop')) {
    closeColorPopover();
  }
  // chiude i risultati della ricerca rapida mostri se si clicca fuori dalla riga
  if (!e.target.closest('.board-search-row')) {
    D.boardSearchResults.innerHTML = '';
  }

  // image button
  const imgBtn = e.target.closest('.img-btn, .entry-img-wrap');
  if (imgBtn) {
    modal.showImage(imgBtn.dataset.imgUrl, imgBtn.dataset.imgName);
    return;
  }

  // share button
  const shareBtn = e.target.closest('.share-btn');
  if (shareBtn) {
    shareEntity(shareBtn);
    return;
  }

  // pin button (plancia DM) — presente sia nel dettaglio/modal sia nelle righe lista
  const pinBtn = e.target.closest('.pin-btn, .ent-pin-btn');
  if (pinBtn) {
    e.stopPropagation();
    toggleBoardEntity({
      id:   pinBtn.dataset.pinId,
      type: pinBtn.dataset.pinType,
      slug: pinBtn.dataset.pinSlug,
      src:  pinBtn.dataset.pinSrc,
      name: pinBtn.dataset.pinName,
    });
    return;
  }

  // bottone "☆ Libro" (libro degli incantesimi del player) — dettaglio/modal e righe lista
  const bookBtn = e.target.closest('.book-btn, .ent-book-btn');
  if (bookBtn) {
    e.stopPropagation();
    toggleBook({
      id:   bookBtn.dataset.bookId,
      slug: bookBtn.dataset.bookSlug,
      src:  bookBtn.dataset.bookSrc,
      name: bookBtn.dataset.bookName,
    });
    return;
  }

  // rimuovi una scheda dalla plancia
  const boardRemoveBtn = e.target.closest('.board-card-remove');
  if (boardRemoveBtn) {
    removeFromBoard(boardRemoveBtn.dataset.id);
    return;
  }

  // libro degli incantesimi: rimuovi una riga, oppure apri il dettaglio nella modale
  const sbRemoveBtn = e.target.closest('.spellbook-item-remove');
  if (sbRemoveBtn) {
    removeFromBook(sbRemoveBtn.dataset.id);
    return;
  }
  const sbItemMain = e.target.closest('.spellbook-item-main');
  if (sbItemMain) {
    modal.loadById(sbItemMain.dataset.id);
    return;
  }

  // risultato della ricerca rapida: aggiunge una nuova istanza alla plancia
  // (il dropdown resta aperto, per poter cliccare più volte sullo stesso mostro)
  const searchResult = e.target.closest('.board-search-result');
  if (searchResult) {
    addBoardInstance({
      id:   searchResult.dataset.id,
      type: searchResult.dataset.type,
      slug: searchResult.dataset.slug,
      src:  searchResult.dataset.src,
      name: searchResult.dataset.name,
    });
    return;
  }

  // duplica una scheda mostro (es. un altro goblin uguale)
  const dupBtn = e.target.closest('.board-card-dup-btn');
  if (dupBtn) {
    duplicateBoardItem(dupBtn.dataset.id);
    return;
  }

  // apri/chiudi la tavolozza colori di una scheda della plancia
  const colorBtn = e.target.closest('.board-card-color-btn');
  if (colorBtn) {
    const card = colorBtn.closest('.board-card');
    const wasOpen = !!card.querySelector('.board-card-color-pop');
    closeColorPopover();
    if (!wasOpen) {
      const item = S.board.find(b => b.id === colorBtn.dataset.id);
      if (item) openColorPopover(card, item);
    }
    return;
  }

  // scelta di un colore nella tavolozza
  const colorSwatch = e.target.closest('.board-card-color-swatch');
  if (colorSwatch) {
    const item = S.board.find(b => b.id === colorSwatch.dataset.id);
    if (item) {
      item.color = colorSwatch.dataset.color;
      persistBoard();
      applyCardColor(colorSwatch.closest('.board-card'), item);
    }
    closeColorPopover();
    return;
  }

  // reset del colore (torna sobrio per i mostri, oro di base per i segnalibri)
  const colorReset = e.target.closest('.board-card-color-reset');
  if (colorReset) {
    const item = S.board.find(b => b.id === colorReset.dataset.id);
    if (item) {
      item.color = null;
      persistBoard();
      applyCardColor(colorReset.closest('.board-card'), item);
    }
    closeColorPopover();
    return;
  }

  // tracker PF mostri "giocabili": tira/imposta i punti ferita iniziali
  const hpRollBtn = e.target.closest('.hp-roll-btn, .hp-reroll-btn');
  if (hpRollBtn) {
    const isReroll = hpRollBtn.classList.contains('hp-reroll-btn');
    const container = hpRollBtn.closest('.board-hp-tracker');
    const id = container.dataset.id;
    const defenses = S.monsterDefenses[id] || {};
    if (isReroll && !confirm('Tirare di nuovo i Punti Ferita? Il valore attuale verrà sovrascritto.')) return;
    const max = rollHpFormula(defenses.hpFormula) ?? defenses.hpAverage;
    if (!max) return;
    const item = S.board.find(b => b.id === id);
    if (!item) return;
    item.hp = { current: max, max };
    persistBoard();
    // il primo tiro cambia la struttura del tracker (da "non tirato" a barra PF);
    // il re-tiro aggiorna solo i valori, la struttura resta la stessa.
    if (isReroll) updateHpVisuals(container, item);
    else refreshHpTracker(container);
    return;
  }

  const hpManualBtn = e.target.closest('.hp-manual-btn');
  if (hpManualBtn) {
    const container = hpManualBtn.closest('.board-hp-tracker');
    const input = container.querySelector('.hp-manual-input');
    const val = parseInt(input.value, 10);
    if (!Number.isFinite(val) || val < 1) return;
    const item = S.board.find(b => b.id === container.dataset.id);
    if (!item) return;
    item.hp = { current: val, max: val };
    persistBoard();
    refreshHpTracker(container);
    return;
  }

  // applica danno (considerando resistenze/immunità/vulnerabilità) o cura
  const hpDamageBtn = e.target.closest('.hp-damage-btn, .hp-heal-btn');
  if (hpDamageBtn) {
    const container = hpDamageBtn.closest('.board-hp-tracker');
    const item = S.board.find(b => b.id === container.dataset.id);
    if (!item?.hp) return;
    const amount = parseInt(container.querySelector('.hp-amount-input').value, 10);
    if (!Number.isFinite(amount) || amount <= 0) return;

    if (hpDamageBtn.classList.contains('hp-heal-btn')) {
      item.hp.current = Math.min(item.hp.max, item.hp.current + amount);
    } else {
      const type = container.querySelector('.hp-dmgtype-select').value;
      const effective = applyDamageDefenses(amount, type, S.monsterDefenses[item.id]);
      item.hp.current = Math.max(0, item.hp.current - effective);
    }
    persistBoard();
    updateHpVisuals(container, item);
    return;
  }

  // mini filtro fonte per le sottoclassi
  const srcChip = e.target.closest('.subsrc-chip');
  if (srcChip) {
    const row = srcChip.closest('.subsrc-filter');
    row.querySelectorAll('.subsrc-chip').forEach(c => c.classList.remove('on'));
    srcChip.classList.add('on');

    const src = srcChip.dataset.src;
    const chips = row.parentElement.querySelectorAll('.cls-chip');
    chips.forEach(c => {
      c.style.display = (!src || c.dataset.source === src) ? '' : 'none';
    });
    return;
  }

  // entity / condition tag links
  const link = e.target.closest('.tag-link');
  if (!link) return;
  e.preventDefault();

  const id   = link.dataset.id;
  const tag  = link.dataset.tag;
  const slug = link.dataset.slug;
  const src  = link.dataset.src || undefined;
  const cond = link.dataset.cond;

  if (id) {
    modal.loadById(id);
  } else if (tag === 'condition') {
    modal.showCondition(cond || link.textContent.trim());
  } else if (tag && slug) {
    modal.loadEntity(tag, slug, src);
  }
});

// modifica diretta dei PF attuali/massimi sulla plancia DM
document.addEventListener('change', e => {
  const curInput = e.target.closest('.hp-current-input');
  const maxInput = e.target.closest('.hp-max-input');
  if (!curInput && !maxInput) return;

  const container = (curInput || maxInput).closest('.board-hp-tracker');
  const item = S.board.find(b => b.id === container.dataset.id);
  if (!item?.hp) return;

  if (maxInput) {
    const val = parseInt(maxInput.value, 10);
    item.hp.max = Number.isFinite(val) && val >= 1 ? val : item.hp.max;
    item.hp.current = Math.min(item.hp.current, item.hp.max);
  } else {
    const val = parseInt(curInput.value, 10);
    item.hp.current = Number.isFinite(val) ? Math.max(0, Math.min(item.hp.max, val)) : item.hp.current;
  }
  persistBoard();
  updateHpVisuals(container, item);
});

// iniziativa manuale e nome dei segnalibri PG sulla plancia DM
document.addEventListener('change', e => {
  const initInput = e.target.closest('.board-card-init-input');
  if (initInput) {
    const item = S.board.find(b => b.id === initInput.dataset.id);
    if (!item) return;
    const val = parseInt(initInput.value, 10);
    item.initiative = Number.isFinite(val) ? val : null;
    persistBoard();
    sortBoardByInitiative();
    reorderBoardCards();
    return;
  }

  const pgNameInput = e.target.closest('.board-card-pg-name');
  if (pgNameInput) {
    const item = S.board.find(b => b.id === pgNameInput.dataset.id);
    if (!item) return;
    item.name = pgNameInput.value.trim();
    persistBoard();
  }
});

// ── Init ───────────────────────────────────────────────
async function init() {
  setupPwa();

  // Plancia DM: ripristina lo stato da una sessione precedente
  S.board = loadBoard();
  updateBoardToggleUi();
  renderBoard();
  D.boardToggleBtn.addEventListener('click', toggleBoardPanel);
  D.boardCloseBtn.addEventListener('click', closeBoard);
  D.boardFocusBtn.addEventListener('click', toggleBoardFocus);
  D.boardInitBtn.addEventListener('click', rollBoardInitiative);
  D.boardHpBtn.addEventListener('click', rollAllMissingHp);
  D.boardAddPgBtn.addEventListener('click', addPgBookmark);
  D.boardSearchInput.addEventListener('input', debounce(e => runBoardSearch(e.target.value.trim()), 300));
  D.boardClearBtn.addEventListener('click', () => {
    if (!S.board.length) return;
    if (!confirm('Svuotare la plancia DM?')) return;
    const ids = S.board.map(b => b.id);
    S.board = [];
    persistBoard();
    updateBoardToggleUi();
    ids.forEach(id => syncPinButtons(id, false));
    renderBoard();
  });

  // Forgia del Personaggio
  initBuilder();

  // Libro degli Incantesimi: ripristina lo stato da una sessione precedente
  S.spellbook = loadSpellbook();
  updateSpellbookToggleUi();
  D.spellbookToggleBtn.addEventListener('click', toggleSpellbookPanel);
  D.spellbookCloseBtn.addEventListener('click', closeSpellbookPanel);
  D.spellbookShareBtn.addEventListener('click', () => shareSpellbook(D.spellbookShareBtn));
  D.spellbookSaveSharedBtn.addEventListener('click', saveSharedBook);
  D.spellbookClearBtn.addEventListener('click', () => {
    if (!S.spellbook.length) return;
    if (!confirm('Svuotare il tuo Libro degli Incantesimi?')) return;
    const ids = S.spellbook.map(b => b.id);
    S.spellbook = [];
    persistSpellbook();
    updateSpellbookToggleUi();
    ids.forEach(id => syncBookButtons(id, false));
    renderSpellbookList();
  });

  // Stats + reference name cache (skill/sense/action/language tags)
  const [statsResult] = await Promise.allSettled([api.stats(), prefetchTagNames(S.locale)]);
  if (statsResult.status === 'fulfilled') {
    S.stats = statsResult.value;
    buildSidebar(S.stats);
    buildHomeStats(S.stats);
  } else {
    buildSidebar(null);
  }

  // Mobile sidebar drawer
  D.menuBtn.addEventListener('click', toggleSidebarDrawer);
  D.menuBtnList.addEventListener('click', toggleSidebarDrawer);
  D.sbBackdrop.addEventListener('click', closeSidebarDrawer);
  $('sidebar-close-btn').addEventListener('click', closeSidebarDrawer);

  // Locale buttons
  document.querySelectorAll('.locale-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      S.locale = btn.dataset.locale;
      document.querySelectorAll('.locale-btn').forEach(b => b.classList.toggle('active', b === btn));
      if (!TAG_NAME_CACHE[S.locale]) prefetchTagNames(S.locale);
      if (S.type) loadList(1);
      if (D.app.classList.contains('show-spellbook')) renderSpellbookList();
    })
  );

  // Sidebar search
  D.sbSearch.addEventListener('input', debounce(e => {
    const q = e.target.value.trim();
    if (q) globalSearch(q);
  }, 380));

  // List search
  D.listSearch.addEventListener('input', debounce(e => {
    S.search = e.target.value.trim();
    loadList(1);
  }, 300));

  // Filter button
  D.filterBtn.addEventListener('click', () => {
    S.filtersOpen = !S.filtersOpen;
    D.filtersPanel.classList.toggle('open', S.filtersOpen);
    D.filterBtn.classList.toggle('active', S.filtersOpen);
  });
  D.filtersPanelBg.addEventListener('click', closeFiltersDialog);
  D.filtersPanelClose.addEventListener('click', closeFiltersDialog);

  // Apply / clear filters
  $('apply-filters-btn').addEventListener('click', () => {
    closeFiltersDialog();
    loadList(1);
  });
  $('clear-filters-btn').addEventListener('click', () => {
    S.filters = {};
    if (S.type) loadFilters(S.type);
    loadList(1);
  });

  // Entity list click (delegation)
  D.entityList.addEventListener('click', e => {
    if (e.target.closest('.ent-pin-btn')) return; // gestito dal listener globale
    if (e.target.closest('.ent-book-btn')) return; // gestito dal listener globale
    if (e.target.closest('.book-back')) {
      navigateToBookPicker(S.bookPicker.sectionType);
      return;
    }
    const pickItem = e.target.closest('.book-pick-item');
    if (pickItem) {
      const { source, name, sectionType } = pickItem.dataset;
      navigateToSections(sectionType, source, name);
      return;
    }
    const item = e.target.closest('.ent-item[data-id]');
    if (!item) return;
    const { id, type, slug, src } = item.dataset;
    openEntity(id, type, slug, src || undefined);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      D.listSearch.focus();
    }
    if (e.key === 'Escape') {
      if (!modal.el.classList.contains('hidden')) { modal.close(); return; }
      if (D.app.classList.contains('show-sidebar')) { closeSidebarDrawer(); return; }
      if (D.app.classList.contains('board-focus')) { setBoardFocus(false); return; }
      if (D.app.classList.contains('show-board')) { closeBoard(); return; }
      if (D.app.classList.contains('show-builder')) { closeBuilderPanel(); return; }
      if (S.filtersOpen) { closeFiltersDialog(); return; }
      D.app.classList.remove('show-detail');
    }
  });

  // URL hash routing
  const hash = location.hash.slice(1);
  if (hash.startsWith('book=')) {
    // link condiviso del libro degli incantesimi: vedi encodeBookHash/decodeBookHash
    S.sharedBook = decodeBookHash(hash);
    openSpellbookPanel();
  } else if (hash) {
    const parts = hash.split(':');
    if (parts.length >= 3) {
      const type = parts[0];
      if (TYPE_MAP[type]) navigate(type);
      openEntity(hash, type, parts.slice(2).join(':'), parts[1]);
    } else if (parts.length === 1 && TYPE_MAP[parts[0]]) {
      navigate(parts[0]);
    }
  }
}

init();
