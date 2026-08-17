/* ============================================================
   NextXus Lasting Edition — app.js v1.0
   Federation Command Interface · Sovereign Intelligence
   ============================================================ */

'use strict';

// ── Constants ─────────────────────────────────────────────────
const TRUTH_GATE_THRESHOLD = 0.95;
const INFERENCE_MIN = 0.70;
const ASSUMPTION_MIN = 0.40;

const SECTORS = [
  { id: '01-Core',            label: 'Core',               icon: '⬡' },
  { id: '02-Storefront',      label: 'Storefront',         icon: '🛒' },
  { id: '03-Studio',          label: 'Studio',             icon: '🎨' },
  { id: '04-University',      label: 'University',         icon: '🎓' },
  { id: '05-Library',         label: 'Library',            icon: '📚' },
  { id: '06-Axiom',           label: 'Axiom',              icon: '⚡' },
  { id: '07-Throne',          label: 'Throne',             icon: '👑' },
  { id: '08-Ambassador',      label: 'Ambassador',         icon: '🤝' },
  { id: '09-Sentinel',        label: 'Sentinel',           icon: '🛡' },
  { id: '10-Social Grid',     label: 'Social Grid',        icon: '🌐' },
  { id: '11-Revenue Engine',  label: 'Revenue Engine',     icon: '💰' },
  { id: '12-Knowledge Base',  label: 'Knowledge Base',     icon: '🔬' },
  { id: '13-Council Chamber', label: 'Council Chamber',    icon: '⚖' },
  { id: '14-Sovereign Ticker',label: 'Sovereign Ticker',   icon: '📡' },
  { id: '15-Archive',         label: 'Archive',            icon: '🗄' },
];

const AZ_PILLARS = [
  { id: 'logic',    label: 'Logic',    desc: 'Analytical reasoning and deductive precision' },
  { id: 'empathy',  label: 'Empathy',  desc: 'Human-centered understanding and emotional intelligence' },
  { id: 'action',   label: 'Action',   desc: 'Execution capability and decisive operation' },
  { id: 'evidence', label: 'Evidence', desc: 'Evidence-based verification and source integrity' },
  { id: 'values',   label: 'Values',   desc: 'Ethical alignment and sovereignty principles' },
  { id: 'legacy',   label: 'Legacy',   desc: 'Long-term continuity and succession preparedness' },
];

const AZ_GRADES = [
  { min: 90, label: 'SOVEREIGN CALIBRATED', color: '#44d97e' },
  { min: 75, label: 'ALIGNED',              color: '#ffd76b' },
  { min: 60, label: 'DEVELOPING',           color: '#ff9944' },
  { min: 40, label: 'DRIFTING',             color: '#ff7744' },
  { min: 0,  label: 'UNCALIBRATED',         color: '#ff5566' },
];

// ── Session State ──────────────────────────────────────────────
const SessionState = {
  sessionId: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
  startedAt: new Date().toISOString(),
  directivesViewed: [],
  calibration: null,
  knowledgeQueries: [],
  fontSizeLarge: false,
  log: [],

  addDirectiveView(dirId) {
    if (!this.directivesViewed.includes(dirId)) {
      this.directivesViewed.push(dirId);
    }
    this.addLog('info', `Directive viewed: ${dirId}`);
  },

  setCalibration(scores, avg, grade) {
    this.calibration = { scores, avg, grade, at: new Date().toISOString() };
    this.addLog('good', `Calibration set: ${grade} (avg ${avg.toFixed(1)})`);
  },

  addQuery(query, resultCount, topClassification) {
    this.knowledgeQueries.push({ query, resultCount, topClassification, at: new Date().toISOString() });
    this.addLog('info', `Query: "${query}" — ${resultCount} result(s) [${topClassification}]`);
  },

  addLog(type, msg) {
    const entry = { type, msg, at: new Date().toISOString() };
    this.log.push(entry);
    renderLogItem(entry);
    updateEchoStatus();
  },

  toJSON() {
    return {
      session_id: this.sessionId,
      started_at: this.startedAt,
      federation: 'NextXus Lasting Edition',
      truth_gate: 'DIR-000 ACTIVE',
      threshold: TRUTH_GATE_THRESHOLD,
      directives_viewed: this.directivesViewed,
      calibration: this.calibration,
      knowledge_queries: this.knowledgeQueries,
      font_size_large: this.fontSizeLarge,
      log_entries: this.log.length,
    };
  },

  toYAML() {
    const d = this.toJSON();
    let y = `# NextXus EchoCore 3.0 Session Export\n`;
    y += `# Generated: ${new Date().toISOString()}\n`;
    y += `# Keys and credentials EXCLUDED per DIR-045\n\n`;
    y += `session_id: "${d.session_id}"\n`;
    y += `started_at: "${d.started_at}"\n`;
    y += `federation: "${d.federation}"\n`;
    y += `truth_gate: "${d.truth_gate}"\n`;
    y += `threshold: ${d.threshold}\n`;
    y += `font_size_large: ${d.font_size_large}\n`;
    y += `log_entries: ${d.log_entries}\n`;
    y += `directives_viewed:\n`;
    if (d.directives_viewed.length === 0) {
      y += `  []\n`;
    } else {
      d.directives_viewed.forEach(id => { y += `  - "${id}"\n`; });
    }
    y += `calibration:\n`;
    if (!d.calibration) {
      y += `  null\n`;
    } else {
      const c = d.calibration;
      y += `  grade: "${c.grade}"\n`;
      y += `  avg: ${c.avg.toFixed(2)}\n`;
      y += `  at: "${c.at}"\n`;
      y += `  scores:\n`;
      Object.entries(c.scores).forEach(([k, v]) => {
        y += `    ${k}: ${v}\n`;
      });
    }
    y += `knowledge_queries:\n`;
    if (d.knowledge_queries.length === 0) {
      y += `  []\n`;
    } else {
      d.knowledge_queries.forEach(q => {
        y += `  - query: "${q.query.replace(/"/g, '\\"')}"\n`;
        y += `    results: ${q.resultCount}\n`;
        y += `    classification: "${q.topClassification}"\n`;
        y += `    at: "${q.at}"\n`;
      });
    }
    return y;
  }
};

// ── Data Store ─────────────────────────────────────────────────
let allDirectives = [];
let knowledgeEntries = [];
let currentExportFormat = 'json';

// ── Truth Gate ─────────────────────────────────────────────────
function classifyConfidence(confidence) {
  const c = parseFloat(confidence);
  if (c >= TRUTH_GATE_THRESHOLD) return { label: 'FACT',       cls: 'fact',    badgeCls: 'badge-fact'    };
  if (c >= INFERENCE_MIN)        return { label: 'INFERENCE',  cls: 'inf',     badgeCls: 'badge-inf'     };
  if (c >= ASSUMPTION_MIN)       return { label: 'ASSUMPTION', cls: 'assum',   badgeCls: 'badge-assum'   };
  return                                 { label: 'UNKNOWN',   cls: 'unknown', badgeCls: 'badge-unknown' };
}

function confidenceColor(confidence) {
  const c = parseFloat(confidence);
  if (c >= TRUTH_GATE_THRESHOLD) return '#44d97e';
  if (c >= INFERENCE_MIN)        return '#ffd76b';
  if (c >= ASSUMPTION_MIN)       return '#ff9944';
  return '#ff5566';
}

// ── Navigation ─────────────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;
      switchSection(target);
    });
  });

  document.querySelectorAll('.card-btn[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.nav));
  });
}

function switchSection(target) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.section === target);
    b.setAttribute('aria-current', b.dataset.section === target ? 'page' : 'false');
  });
  document.querySelectorAll('.section').forEach(s => {
    const id = s.id.replace('section-', '');
    if (id === target) {
      s.classList.add('active');
      s.removeAttribute('hidden');
    } else {
      s.classList.remove('active');
      s.setAttribute('hidden', '');
    }
  });
  document.getElementById('main-content').scrollTop = 0;
  window.scrollTo(0, 0);
  SessionState.addLog('info', `Navigated to: ${target}`);
}

// ── Directives Parser ──────────────────────────────────────────
function parseDirectives(mdText) {
  const dirs = [];
  const blocks = mdText.split(/\n## DIR-/);
  blocks.shift();

  for (const block of blocks) {
    const lines = block.split('\n');
    const headerLine = lines[0] || '';
    const parts = headerLine.split(' · ');
    const idNum = parts[0].trim();
    const title = parts.slice(1).join(' · ').trim();
    const id = `DIR-${idNum}`;

    const sectorMatch  = block.match(/\*\*Sector:\*\*\s*(.+)/);
    const statusMatch  = block.match(/\*\*Status:\*\*\s*(.+)/);
    const tierMatch    = block.match(/\*\*Tier:\*\*\s*(.+)/);
    const confMatch    = block.match(/\*\*Confidence:\*\*\s*([0-9.]+)/);

    const sector     = sectorMatch  ? sectorMatch[1].trim()  : 'Unknown';
    const status     = statusMatch  ? statusMatch[1].trim()  : 'ACTIVE';
    const tier       = tierMatch    ? tierMatch[1].trim()    : '';
    const confidence = confMatch    ? parseFloat(confMatch[1]) : 0.95;

    const metaEnd = block.indexOf('\n\n', block.indexOf('**Confidence:**'));
    const content = metaEnd > -1
      ? block.slice(metaEnd).trim().replace(/^---+$/, '').trim()
      : '';

    if (id && title) {
      dirs.push({ id, title, sector, status, tier, confidence, content });
    }
  }
  return dirs;
}

// ── Directive Renderer ─────────────────────────────────────────
function renderDirectives(dirs) {
  const list = document.getElementById('dir-list');
  const countEl = document.getElementById('dir-count');

  if (!dirs.length) {
    list.innerHTML = '<div class="kb-no-results">No directives match your search.</div>';
    countEl.textContent = '0 results';
    return;
  }

  countEl.textContent = `${dirs.length} directive${dirs.length !== 1 ? 's' : ''}`;

  list.innerHTML = dirs.map(dir => {
    const cls = classifyConfidence(dir.confidence);
    const pct = Math.round(dir.confidence * 100);
    const color = confidenceColor(dir.confidence);
    return `
      <div class="dir-item" role="listitem" data-id="${dir.id}">
        <div class="dir-item-header" role="button" aria-expanded="false" tabindex="0"
             aria-label="${dir.id}: ${dir.title}">
          <span class="dir-id">${dir.id}</span>
          <span class="dir-title-text">${dir.title}</span>
          <span class="dir-sector-tag">${dir.sector}</span>
          <span class="dir-confidence conf-${cls.cls}" title="Confidence: ${pct}%">${pct}%</span>
          <button class="dir-expand-btn" aria-label="Toggle details" tabindex="-1">▾</button>
        </div>
        <div class="dir-body" role="region" aria-label="Directive details">
          <div class="dir-meta">
            <span class="dir-meta-item"><strong>Status:</strong> ${dir.status}</span>
            <span class="dir-meta-item"><strong>Tier:</strong> ${dir.tier}</span>
            <span class="dir-meta-item">
              <span class="badge ${cls.badgeCls}">${cls.label}</span>
            </span>
            <span class="dir-meta-item">
              <span style="color:${color}; font-weight:700; font-size:0.85em;">
                Confidence: ${pct}%
              </span>
            </span>
          </div>
          <div class="conf-bar-wrap" style="margin-bottom:0.8rem;">
            <div class="conf-bar-bg">
              <div class="conf-bar-fill" style="width:${pct}%; background:${color};"></div>
            </div>
            <span class="conf-label" style="color:${color};">${pct}%</span>
          </div>
          <p class="dir-content-text">${dir.content || 'No extended content available.'}</p>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.dir-item-header').forEach(header => {
    const activate = () => {
      const item = header.closest('.dir-item');
      const body = item.querySelector('.dir-body');
      const isOpen = body.classList.toggle('open');
      header.setAttribute('aria-expanded', isOpen);
      header.querySelector('.dir-expand-btn').textContent = isOpen ? '▴' : '▾';
      if (isOpen) {
        SessionState.addDirectiveView(item.dataset.id);
      }
    };
    header.addEventListener('click', activate);
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

function initDirectives() {
  const sel = document.getElementById('dir-sector-filter');
  SECTORS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.icon} ${s.id} · ${s.label}`;
    sel.appendChild(opt);
  });

  const searchInput = document.getElementById('dir-search');
  searchInput.addEventListener('input', filterDirectives);
  sel.addEventListener('change', filterDirectives);
}

function filterDirectives() {
  const query   = document.getElementById('dir-search').value.toLowerCase().trim();
  const sector  = document.getElementById('dir-sector-filter').value;

  const filtered = allDirectives.filter(d => {
    const matchSector = !sector || d.sector === sector;
    const matchQuery  = !query  ||
      d.id.toLowerCase().includes(query)    ||
      d.title.toLowerCase().includes(query) ||
      d.content.toLowerCase().includes(query) ||
      d.sector.toLowerCase().includes(query);
    return matchSector && matchQuery;
  });

  renderDirectives(filtered);
}

// ── Agent Zero Calibration Gate ────────────────────────────────
function initAgentZero() {
  const container = document.getElementById('az-sliders');
  container.innerHTML = AZ_PILLARS.map(p => `
    <div class="az-slider-row">
      <label class="az-pillar-label" for="az-${p.id}" title="${p.desc}">${p.label}</label>
      <input
        type="range"
        id="az-${p.id}"
        class="az-slider"
        min="0" max="100" value="50"
        aria-label="${p.label} calibration (0-100)"
        aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
      >
      <span class="az-val" id="az-val-${p.id}" aria-live="polite">50</span>
    </div>
  `).join('');

  AZ_PILLARS.forEach(p => {
    const slider = document.getElementById(`az-${p.id}`);
    const valEl  = document.getElementById(`az-val-${p.id}`);
    slider.addEventListener('input', () => {
      valEl.textContent = slider.value;
      slider.setAttribute('aria-valuenow', slider.value);
      updateAZScore();
    });
  });

  document.getElementById('az-reset').addEventListener('click', resetAZ);
  document.getElementById('az-save').addEventListener('click', saveAZToEcho);
  document.getElementById('az-report').addEventListener('click', generateAZReport);

  updateAZScore();
}

function getAZScores() {
  const scores = {};
  AZ_PILLARS.forEach(p => {
    scores[p.id] = parseInt(document.getElementById(`az-${p.id}`).value, 10);
  });
  return scores;
}

function updateAZScore() {
  const scores = getAZScores();
  const vals   = Object.values(scores);
  const avg    = vals.reduce((a, b) => a + b, 0) / vals.length;
  const score  = Math.round(avg);

  const grade  = AZ_GRADES.find(g => score >= g.min) || AZ_GRADES[AZ_GRADES.length - 1];

  document.getElementById('az-score-num').textContent = score;
  document.getElementById('az-score-grade').textContent = grade.label;
  document.getElementById('az-score-grade').style.color = grade.color;
  document.getElementById('az-score-avg').textContent = `Avg: ${avg.toFixed(1)}`;

  const ring = document.querySelector('.az-score-ring');
  ring.style.borderColor = grade.color;
  ring.style.background  = `${grade.color}18`;
  document.getElementById('az-score-num').style.color = grade.color;

  return { scores, avg, grade: grade.label, score };
}

function resetAZ() {
  AZ_PILLARS.forEach(p => {
    const slider = document.getElementById(`az-${p.id}`);
    slider.value = 50;
    document.getElementById(`az-val-${p.id}`).textContent = 50;
    slider.setAttribute('aria-valuenow', 50);
  });
  document.getElementById('az-report-panel').hidden = true;
  updateAZScore();
  SessionState.addLog('warn', 'Agent Zero calibration reset to defaults');
}

function saveAZToEcho() {
  const { scores, avg, grade } = updateAZScore();
  SessionState.setCalibration(scores, avg, grade);
  updateEchoPreview();
  switchSection('echocore');
}

function generateAZReport() {
  const { scores, avg, grade } = updateAZScore();
  SessionState.setCalibration(scores, avg, grade);

  const panel = document.getElementById('az-report-panel');
  const gradeObj = AZ_GRADES.find(g => grade === g.label) || AZ_GRADES[AZ_GRADES.length - 1];
  const timestamp = new Date().toLocaleString();

  const barsHtml = AZ_PILLARS.map(p => {
    const val = scores[p.id];
    const color = confidenceColor(val / 100);
    return `
      <div class="az-report-bar-row">
        <span style="min-width:5em; font-size:0.85em; font-weight:600;">${p.label}</span>
        <div class="az-report-bar-bg">
          <div class="az-report-bar-fill" style="width:${val}%; background:${color};"></div>
        </div>
        <span style="min-width:3em; text-align:right; color:${color}; font-weight:700;">${val}</span>
      </div>
    `;
  }).join('');

  const lowestPillar = Object.entries(scores).reduce((a, b) => b[1] < a[1] ? b : a);
  const highestPillar = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a);
  const lName = AZ_PILLARS.find(p => p.id === lowestPillar[0])?.label || lowestPillar[0];
  const hName = AZ_PILLARS.find(p => p.id === highestPillar[0])?.label || highestPillar[0];

  panel.hidden = false;
  panel.innerHTML = `
    <div class="az-report-section">
      <h4>⚙ Agent Zero Calibration Report</h4>
      <p style="font-size:0.75em; color:var(--text-muted);">Generated: ${timestamp}</p>
    </div>
    <div class="az-report-section">
      <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
        <div style="font-size:2rem; font-weight:900; color:${gradeObj.color};">${Math.round(avg)}</div>
        <div>
          <div style="font-weight:700; color:${gradeObj.color};">${grade}</div>
          <div style="font-size:0.8em; color:var(--text-muted);">Average Score: ${avg.toFixed(2)} / 100</div>
        </div>
      </div>
      ${barsHtml}
    </div>
    <div class="az-report-section">
      <h4>📊 Analysis</h4>
      <p><strong>Strongest Pillar:</strong> ${hName} (${highestPillar[1]}) — highest alignment</p>
      <p><strong>Development Priority:</strong> ${lName} (${lowestPillar[1]}) — requires attention</p>
    </div>
    <div class="az-report-section">
      <h4>🔬 Truth Gate Assessment</h4>
      <p>Calibration confidence: <span class="badge ${
        avg/100 >= TRUTH_GATE_THRESHOLD ? 'badge-fact' :
        avg/100 >= INFERENCE_MIN ? 'badge-inf' :
        avg/100 >= ASSUMPTION_MIN ? 'badge-assum' : 'badge-unknown'
      }">${classifyConfidence(avg/100).label}</span></p>
      <p style="margin-top:0.5rem; color:var(--text-muted); font-size:0.85em;">
        DIR-000 threshold: 95% | Session threshold: ${(avg).toFixed(1)}%
      </p>
    </div>
  `;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── EchoCore 3.0 ───────────────────────────────────────────────
function initEchoCore() {
  document.getElementById('echo-export-json').addEventListener('click', () => {
    currentExportFormat = 'json';
    document.getElementById('ep-format-label').textContent = 'JSON Preview';
    updateEchoPreview();
    downloadSession('json');
  });

  document.getElementById('echo-export-yaml').addEventListener('click', () => {
    currentExportFormat = 'yaml';
    document.getElementById('ep-format-label').textContent = 'YAML Preview';
    updateEchoPreview();
    downloadSession('yaml');
  });

  document.getElementById('echo-clear').addEventListener('click', () => {
    if (confirm('Clear current session? This cannot be undone.')) {
      SessionState.directivesViewed = [];
      SessionState.calibration = null;
      SessionState.knowledgeQueries = [];
      SessionState.log = [];
      document.getElementById('echo-log-list').innerHTML =
        '<li class="log-item muted">Session cleared.</li>';
      updateEchoPreview();
      updateEchoStatus();
      SessionState.addLog('warn', 'Session cleared by user');
    }
  });

  document.getElementById('echo-copy').addEventListener('click', () => {
    const text = document.getElementById('echo-preview').textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('echo-copy');
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.innerHTML = '⎘ Copy'; }, 2000);
    });
  });

  updateEchoPreview();
}

function updateEchoPreview() {
  const el = document.getElementById('echo-preview');
  if (currentExportFormat === 'yaml') {
    el.textContent = SessionState.toYAML();
  } else {
    el.textContent = JSON.stringify(SessionState.toJSON(), null, 2);
  }
}

function updateEchoStatus() {
  const el = document.getElementById('echo-status-text');
  const n = SessionState.log.length;
  const nd = SessionState.directivesViewed.length;
  const nq = SessionState.knowledgeQueries.length;
  if (n === 0) {
    el.textContent = 'No session activity yet. Interact with directives, calibrate, or query the Knowledge Base.';
  } else {
    el.textContent = `Session active — ${n} log entries | ${nd} directive(s) viewed | ${nq} KB query(ies)`;
  }
  if (document.getElementById('section-echocore').classList.contains('active')) {
    updateEchoPreview();
  }
}

function downloadSession(format) {
  const content = format === 'yaml' ? SessionState.toYAML() : JSON.stringify(SessionState.toJSON(), null, 2);
  const type = format === 'yaml' ? 'text/yaml' : 'application/json';
  const ext  = format === 'yaml' ? 'yaml' : 'json';
  const ts   = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `echocore-session-${ts}.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
  SessionState.addLog('good', `Session exported as ${ext.toUpperCase()}`);
}

function renderLogItem(entry) {
  const list = document.getElementById('echo-log-list');
  const placeholder = list.querySelector('.log-item.muted');
  if (placeholder && placeholder.textContent.includes('No activity')) {
    placeholder.remove();
  }
  const li = document.createElement('li');
  li.className = `log-item ${entry.type}`;
  const t = new Date(entry.at).toLocaleTimeString();
  li.textContent = `[${t}] ${entry.msg}`;
  list.appendChild(li);
  list.scrollTop = list.scrollHeight;
}

// ── Knowledge Base ─────────────────────────────────────────────
function parseKnowledgeBase(yaml) {
  const entries = [];
  const blocks = yaml.split(/\n    - id:/);
  blocks.shift();

  for (const block of blocks) {
    const lines = block.split('\n');
    const id = lines[0].trim();

    const topicM   = block.match(/topic:\s*["']?([^"'\n]+)["']?/);
    const sectorM  = block.match(/sector:\s*["']?([^"'\n]+)["']?/);
    const classM   = block.match(/classification:\s*["']?([^"'\n]+)["']?/);
    const confM    = block.match(/confidence:\s*([0-9.]+)/);
    const contentM = block.match(/content:\s*>\n([\s\S]+?)(?=\n      tags:|\n    - id:|\n$)/);
    const tagsM    = block.match(/tags:\s*\[([^\]]+)\]/);

    const rawContent = contentM
      ? contentM[1].replace(/^ {8}/gm, '').replace(/\s+/g, ' ').trim()
      : '';

    const rawTags = tagsM
      ? tagsM[1].split(',').map(t => t.trim().replace(/['"]/g, ''))
      : [];

    if (id && topicM) {
      entries.push({
        id: id.replace(/^["\s]+|["\s]+$/g, ''),
        topic:          topicM  ? topicM[1].trim()        : '',
        sector:         sectorM ? sectorM[1].trim()       : '',
        classification: classM  ? classM[1].trim()        : 'UNKNOWN',
        confidence:     confM   ? parseFloat(confM[1])    : 0.5,
        content:        rawContent,
        tags:           rawTags,
      });
    }
  }
  return entries;
}

function initKnowledgeBase() {
  const input  = document.getElementById('kb-query');
  const submit = document.getElementById('kb-submit');
  const voice  = document.getElementById('kb-voice-query');

  submit.addEventListener('click', runKBQuery);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') runKBQuery(); });
  voice.addEventListener('click', () => startSTT('kb'));

  renderSectorGrid();
}

function renderSectorGrid() {
  const grid = document.getElementById('kb-sector-grid');
  grid.innerHTML = SECTORS.map(s => {
    const count = knowledgeEntries.filter(e => e.sector === s.id).length;
    return `
      <button class="kb-sector-btn" data-sector="${s.id}" aria-label="Browse ${s.label} sector">
        ${s.icon} ${s.label}
        <span class="kb-sector-count">${count}</span>
      </button>
    `;
  }).join('');

  grid.querySelectorAll('.kb-sector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('kb-query').value = btn.dataset.sector;
      runKBQuery();
    });
  });
}

function runKBQuery() {
  const query = document.getElementById('kb-query').value.trim();
  if (!query) return;

  const results = searchKnowledgeBase(query);
  renderKBResults(results, query);
  SessionState.addQuery(
    query,
    results.length,
    results.length ? classifyConfidence(results[0].confidence).label : 'UNKNOWN'
  );
}

function searchKnowledgeBase(query) {
  const q = query.toLowerCase();

  return knowledgeEntries
    .filter(e => {
      return e.topic.toLowerCase().includes(q)         ||
             e.content.toLowerCase().includes(q)       ||
             e.sector.toLowerCase().includes(q)        ||
             e.tags.some(t => t.toLowerCase().includes(q)) ||
             e.id.toLowerCase().includes(q);
    })
    .sort((a, b) => b.confidence - a.confidence);
}

function renderKBResults(results, query) {
  const el = document.getElementById('kb-result');

  if (!results.length) {
    el.innerHTML = `
      <div class="kb-result-card">
        <div class="kb-no-results">
          <p>No results for <strong>"${escapeHtml(query)}"</strong></p>
          <p style="font-size:0.75em; color:var(--text-muted); margin-top:0.5rem;">
            <span class="badge badge-unknown">UNKNOWN</span>
            Insufficient data in the Federation Knowledge Base for this query. This is an honest acknowledgment per DIR-059.
          </p>
        </div>
      </div>`;
    return;
  }

  const cards = results.map(r => renderKBCard(r)).join('');
  el.innerHTML = `<div class="kb-multiple-results">${cards}</div>`;
}

function renderKBCard(entry) {
  const cls  = classifyConfidence(entry.confidence);
  const pct  = Math.round(entry.confidence * 100);
  const color = confidenceColor(entry.confidence);
  const tags = entry.tags.map(t => `<span class="kb-tag">${escapeHtml(t)}</span>`).join('');

  return `
    <div class="kb-result-card">
      <div class="kb-result-header">
        <span class="kb-result-topic">${escapeHtml(entry.topic)}</span>
        <span class="badge ${cls.badgeCls}">${cls.label}</span>
      </div>
      <div class="kb-result-meta">
        <span>ID: ${entry.id}</span>
        <span>Sector: ${entry.sector}</span>
      </div>
      <div class="conf-bar-wrap" style="margin:0.4rem 0 0.6rem;">
        <span style="font-size:0.7em; color:var(--text-muted); flex-shrink:0;">Confidence</span>
        <div class="conf-bar-bg">
          <div class="conf-bar-fill" style="width:${pct}%; background:${color};"></div>
        </div>
        <span class="conf-label" style="color:${color}; font-size:0.7em;">${pct}%</span>
      </div>
      <p class="kb-result-content">${escapeHtml(entry.content)}</p>
      <div class="kb-result-tags">${tags}</div>
    </div>
  `;
}

// ── TTS Engine ─────────────────────────────────────────────────
let isSpeaking = false;
const synth = window.speechSynthesis;

function initTTS() {
  const btn     = document.getElementById('btn-tts');
  const stopBtn = document.getElementById('btn-stop-tts');

  btn.addEventListener('click', () => readPage());
  stopBtn.addEventListener('click', stopTTS);
}

function readPage() {
  if (!synth) {
    alert('Text-to-Speech is not supported in this browser. Please try Chrome or Edge.');
    return;
  }
  stopTTS();

  const activeSection = document.querySelector('.section.active');
  if (!activeSection) return;

  const textNodes = [];
  activeSection.querySelectorAll('h1,h2,h3,h4,p,li,.dir-title-text,.dir-content-text,.kb-result-topic,.kb-result-content,.az-pillar-label').forEach(el => {
    const text = el.textContent.trim();
    if (text.length > 2) textNodes.push(text);
  });

  const fullText = textNodes.slice(0, 80).join('. ');
  if (!fullText) return;

  const utterance = new SpeechSynthesisUtterance(fullText);
  utterance.rate  = 0.9;
  utterance.pitch = 1.0;
  utterance.lang  = 'en-US';

  utterance.onstart = () => {
    isSpeaking = true;
    document.getElementById('btn-stop-tts').style.display = 'inline-flex';
    document.getElementById('btn-tts').textContent = '🔊 Reading…';
  };

  utterance.onend = utterance.onerror = () => {
    isSpeaking = false;
    document.getElementById('btn-stop-tts').style.display = 'none';
    document.getElementById('btn-tts').textContent = '🔊 Read Page';
  };

  synth.speak(utterance);
  SessionState.addLog('info', 'TTS: reading current section');
}

function stopTTS() {
  if (synth && synth.speaking) {
    synth.cancel();
  }
  isSpeaking = false;
  document.getElementById('btn-stop-tts').style.display = 'none';
  document.getElementById('btn-tts').textContent = '🔊 Read Page';
}

// ── STT Engine ─────────────────────────────────────────────────
let recognition = null;
let sttTarget = null;

function initSTT() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('btn-stt').disabled = true;
    document.getElementById('btn-stt').title = 'Voice input not supported in this browser';
    return;
  }
  recognition = new SpeechRecognition();
  recognition.continuous    = false;
  recognition.interimResults = true;
  recognition.lang          = 'en-US';

  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    document.getElementById('stt-transcript').textContent = transcript;
    if (e.results[e.results.length - 1].isFinal) {
      applySTTResult(transcript);
    }
  };

  recognition.onerror = (e) => {
    document.getElementById('stt-status').textContent = `Error: ${e.error}`;
    setTimeout(closeSTTOverlay, 2000);
  };

  recognition.onend = () => {
    closeSTTOverlay();
  };

  document.getElementById('btn-stt').addEventListener('click', () => startSTT('search'));
  document.getElementById('stt-cancel').addEventListener('click', () => {
    if (recognition) recognition.stop();
    closeSTTOverlay();
  });
}

function startSTT(target) {
  if (!recognition) {
    alert('Voice input is not supported in this browser. Please try Chrome or Edge.');
    return;
  }
  sttTarget = target;
  document.getElementById('stt-overlay').removeAttribute('hidden');
  document.getElementById('stt-status').textContent = 'Listening…';
  document.getElementById('stt-transcript').textContent = '';
  try {
    recognition.start();
  } catch(e) { /* already started */ }
  SessionState.addLog('info', 'STT: listening started');
}

function closeSTTOverlay() {
  document.getElementById('stt-overlay').hidden = true;
}

function applySTTResult(text) {
  if (sttTarget === 'search') {
    document.getElementById('dir-search').value = text;
    filterDirectives();
    switchSection('directives');
  } else if (sttTarget === 'kb') {
    document.getElementById('kb-query').value = text;
    runKBQuery();
  }
  SessionState.addLog('info', `STT result applied to ${sttTarget}: "${text}"`);
}

// ── A11y: Large Text ───────────────────────────────────────────
function initLargeText() {
  const btn = document.getElementById('btn-large-text');
  btn.addEventListener('click', () => {
    SessionState.fontSizeLarge = !SessionState.fontSizeLarge;
    document.body.dataset.fontSize = SessionState.fontSizeLarge ? 'large' : 'normal';
    btn.setAttribute('aria-pressed', SessionState.fontSizeLarge);
    btn.textContent = SessionState.fontSizeLarge ? 'Aa− Normal' : 'Aa+ Large';
    SessionState.addLog('info', `Font size: ${SessionState.fontSizeLarge ? 'large (26px)' : 'normal (20px)'}`);
  });
}

// ── Utility ────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Data Loading ───────────────────────────────────────────────
async function loadDirectives() {
  const countEl = document.getElementById('dir-count');
  countEl.textContent = 'Loading…';
  countEl.classList.add('loading');

  try {
    const resp = await fetch('data/directives.md');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    allDirectives = parseDirectives(text);
    countEl.classList.remove('loading');
    renderDirectives(allDirectives);
    SessionState.addLog('good', `${allDirectives.length} directives loaded`);

    const footerSub = document.querySelectorAll('.footer-sub');
    if (footerSub.length > 1) {
      footerSub[1].textContent = `DIR-000 Active · ${allDirectives.length} Directives Loaded`;
    }
  } catch(e) {
    countEl.classList.remove('loading');
    countEl.textContent = 'Load error';
    document.getElementById('dir-list').innerHTML =
      `<div class="kb-no-results" role="alert">
        <p>Could not load directives. Ensure this page is served from a web server (not file://).</p>
        <p style="font-size:0.8em; color:var(--text-muted); margin-top:0.4rem;">${e.message}</p>
      </div>`;
    SessionState.addLog('warn', `Directives load failed: ${e.message}`);
  }
}

async function loadKnowledgeBase() {
  try {
    const resp = await fetch('data/massive_federation_knowledge_base.yaml');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();

    if (window.jsyaml) {
      try {
        const parsed = window.jsyaml.load(text);
        const raw = parsed?.federation_knowledge_base?.entries || [];
        knowledgeEntries = raw.map(e => ({
          id:             e.id || '',
          topic:          e.topic || '',
          sector:         e.sector || '',
          classification: e.classification || 'UNKNOWN',
          confidence:     parseFloat(e.confidence) || 0.5,
          content:        (e.content || '').replace(/\s+/g, ' ').trim(),
          tags:           Array.isArray(e.tags) ? e.tags : [],
        }));
      } catch(yamlErr) {
        knowledgeEntries = parseKnowledgeBase(text);
      }
    } else {
      knowledgeEntries = parseKnowledgeBase(text);
    }

    renderSectorGrid();
    SessionState.addLog('good', `${knowledgeEntries.length} KB entries loaded`);
  } catch(e) {
    SessionState.addLog('warn', `Knowledge Base load failed: ${e.message}`);
  }
}

// ── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initDirectives();
  initAgentZero();
  initEchoCore();
  initKnowledgeBase();
  initTTS();
  initSTT();
  initLargeText();

  SessionState.addLog('good', 'NextXus Lasting Edition initialized');
  SessionState.addLog('info', `Session ID: ${SessionState.sessionId}`);

  await Promise.all([loadDirectives(), loadKnowledgeBase()]);

  setTimeout(() => {
    const fill = document.querySelector('.threshold-fill');
    if (fill) fill.style.width = '95%';
  }, 500);
});
