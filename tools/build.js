// Builds the multi-page playbook site from the single README.md.
// usage: node build.js <README.md> <outDir>
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const SRC = process.argv[2];
const OUT = process.argv[3];
const src = fs.readFileSync(SRC, 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (t) => t.trim().toLowerCase().replace(/[`*]/g, '').replace(/[^\w\- ]/g, '').replace(/ /g, '-');

const ICONS = {
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  branch: '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  idcard: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h10"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  check: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  userminus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/>',
  userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};
const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const CATEGORIES = [
  { id: 'foundations', name: 'Foundations', blurb: 'Start here. The rules and the day-one checklist for every project.' },
  { id: 'setup', name: 'Project Setup', blurb: 'Repositories, environment variables and Firebase.' },
  { id: 'stores', name: 'Stores & Release', blurb: 'Developer accounts, production readiness and publishing.' },
  { id: 'after-launch', name: 'After Launch', blurb: 'Keeping live apps healthy and the ongoing work of the lead.' },
  { id: 'templates', name: 'Templates & Checklists', blurb: 'Copy-paste templates to use on every project.' },
  { id: 'reference', name: 'Reference', blurb: 'Official documentation from Apple, Google, Firebase and GitHub.' },
];

// key = section number in README; title = display title
const PAGES = [
  { key: '1', slug: 'golden-rules', cat: 'foundations', icon: 'shield', title: 'Golden Rules', desc: 'The seven non-negotiables: company ownership, no single point of failure, same-day offboarding, signing keys and secrets.' },
  { key: '2', slug: 'new-project-setup', cat: 'foundations', icon: 'rocket', title: 'New Project Setup', desc: 'Day-one kick-off: ownership decisions, Bundle IDs, stack choice, environments and folder structure.' },
  { key: '3', slug: 'repository-setup', cat: 'setup', icon: 'branch', title: 'Repository Setup (GitHub & GitLab)', desc: 'Creating repos from the company org, teams, branch rulesets, .gitignore, branching strategy and GitLab rules.' },
  { key: '4', slug: 'environment-variables', cat: 'setup', icon: 'key', title: 'Environment Variables (.env)', desc: 'What belongs in .env, what must never ship in an app, and how every .env is backed up.' },
  { key: '5', slug: 'firebase-setup', cat: 'setup', icon: 'flame', title: 'Firebase Setup', desc: 'Why Firebase matters, per-environment projects, push (FCM/APNs), Crashlytics, Remote Config and App Check.' },
  { key: '6', slug: 'store-accounts', cat: 'stores', icon: 'idcard', title: 'Store Developer Accounts', desc: 'Apple & Google: individual vs organization accounts, limitations, D-U-N-S and step-by-step enrollment.' },
  { key: '7', slug: 'production-setup', cat: 'stores', icon: 'server', title: 'Production Environment Setup', desc: 'Go-live readiness: backend, app config, signing keys and store listing assets.' },
  { key: '8', slug: 'store-publishing', cat: 'stores', icon: 'upload', title: 'Publishing to App Store & Google Play', desc: 'Step-by-step release on both stores, testing tracks, review and common rejection reasons.' },
  { key: '9', slug: 'live-app-monitoring', cat: 'after-launch', icon: 'activity', title: 'Detecting Google/Apple Changes on Live Apps', desc: 'How live apps get hit by store updates, where warnings appear, and the monitoring routine.' },
  { key: '10', slug: 'lead-responsibilities', cat: 'after-launch', icon: 'users', title: 'Other Key Responsibilities', desc: 'Code quality, CI/CD, upgrades, the expiry calendar, security, documentation and client handover.' },
  { key: '11.1', slug: 'project-registry-template', cat: 'templates', icon: 'file', title: 'Project Registry Template', desc: 'The single consolidated file holding all key information for a project.' },
  { key: '11.2', slug: 'new-project-checklist', cat: 'templates', icon: 'check', title: 'New Project Checklist', desc: 'Short tick-list for starting any new mobile project.', checklist: true },
  { key: '11.3', slug: 'release-checklist', cat: 'templates', icon: 'clipboard', title: 'Release Checklist', desc: 'Pre-release, release and post-release steps for every store build.', checklist: true },
  { key: '11.4', slug: 'live-apps-health-sheet', cat: 'templates', icon: 'table', title: 'Live Apps Health Sheet', desc: 'Monthly one-row-per-app sheet with crash, ANR, SDK and warning tracking.' },
  { key: '11.5', slug: 'offboarding-checklist', cat: 'templates', icon: 'userminus', title: 'Offboarding Checklist', desc: 'Same-day access removal across GitHub, GitLab, stores, Firebase and every other system.' },
  { key: '11.6', slug: 'onboarding-checklist', cat: 'templates', icon: 'userplus', title: 'Onboarding Checklist', desc: 'Access and walkthrough steps for a new team member.', checklist: true },
  { key: '12', slug: 'references', cat: 'reference', icon: 'link', title: 'Official Reference Links', desc: 'Apple, Google Play, Firebase, React Native, Expo, GitHub and GitLab documentation.' },
];

// ---- split README into sections ----
const lines = src.split('\n');
const sections = {}; // key -> {heading, lines}
let cur = null;
let inFence = false;
for (const line of lines) {
  if (/^\s*```/.test(line)) inFence = !inFence;
  let m;
  if (!inFence && (m = line.match(/^## (\d+)\. (.*)$/))) {
    cur = { key: m[1], heading: line.slice(3), lines: [] };
    sections[cur.key] = cur;
    continue;
  }
  if (!inFence && (m = line.match(/^### (11\.\d) (.*)$/))) {
    cur = { key: m[1], heading: line.slice(4), lines: [] };
    sections[cur.key] = cur;
    continue;
  }
  if (!inFence && /^## /.test(line)) { cur = null; continue; } // e.g. Table of Contents
  if (cur) cur.lines.push(line);
}

// ---- anchor map: GitHub slug -> target href (relative to articles/) ----
const anchorMap = { '11-templates--checklists': '../index.html#templates', 'table-of-contents': '../index.html' };
for (const p of PAGES) {
  const s = sections[p.key];
  if (!s) throw new Error('missing section ' + p.key);
  anchorMap[slugify(s.heading)] = `${p.slug}.html`;
  inFence = false;
  for (const l of s.lines) {
    if (/^\s*```/.test(l)) inFence = !inFence;
    const m = !inFence && l.match(/^#{2,4} (.*)$/);
    if (m) anchorMap[slugify(m[1])] = `${p.slug}.html#${slugify(m[1])}`;
  }
}

// ---- markdown rendering ----
let tocCollector = [];
marked.use({
  gfm: true,
  renderer: {
    heading(text, level, raw) {
      const id = slugify(raw);
      if (level === 2) tocCollector.push({ id, html: text.replace(/<[^>]+>/g, '') });
      return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${text}</h${level}>\n`;
    },
  },
});

function render(md, pageSlug) {
  tocCollector = [];
  let html = marked.parse(md);
  html = html.replace(/href="#([^"]+)"/g, (all, slug) => {
    const target = anchorMap[slug];
    if (!target) return all;
    if (target.startsWith(pageSlug + '.html#')) return `href="#${slug}"`;
    return `href="${target}"`;
  });
  html = html.replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<input disabled="" type="checkbox">/g, '<input type="checkbox">');
  html = html.replace(/<li><input type="checkbox">/g, '<li class="task"><input type="checkbox">');
  html = html.replace(/<ul>\n<li class="task">/g, '<ul class="tasks">\n<li class="task">');
  return { html, toc: tocCollector };
}

function pageMarkdown(p) {
  const s = sections[p.key];
  // strip the trailing horizontal rule left between sections
  let body = s.lines.join('\n').trim().replace(/\n+---$/, '');
  // demote headings so the article's own sub-sections start at h2
  body = body.replace(/^### /gm, '## ').replace(/^#### /gm, '### ');
  let raw = null;
  if (p.checklist) {
    const m = body.match(/```markdown\n([\s\S]*?)\n```/);
    raw = m[1];
    // turn plain group labels (e.g. "Pre-release") into sub-headings
    const unfenced = raw.split('\n').map((l) => (l.trim() && !/^\s*- /.test(l) ? `## ${l.trim()}` : l)).join('\n');
    body = body.replace(m[0], unfenced);
  }
  return { body, raw };
}

const words = (s) => s.split(/\s+/).filter(Boolean).length;
const readTime = (md) => Math.max(1, Math.round(words(md) / 200));

// ---- templates ----
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">';
const THEME_BTN = `<button class="theme-toggle" type="button" aria-label="Toggle dark mode"><svg class="icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><svg class="icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>`;
const head = (title, desc, prefix) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${FONTS}
<link rel="stylesheet" href="${prefix}assets/style.css">
<script>try{var t=localStorage.getItem('playbook-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
</head>`;
const topbar = (prefix) => `<header class="topbar"><div class="topbar-inner">
<a class="brand" href="${prefix}index.html"><span class="brand-mark">RN</span><span>Mobile App Playbook</span></a>
${THEME_BTN}
</div></header>`;
const footer = `<footer class="site-footer"><div class="footer-inner">
<p>Prepared by <strong>Saad Bawany</strong>, React Native Lead &middot; v1.0 &middot; October 2026</p>
<p class="muted">Store policies change every year. Verify dates and numbers against the official links before acting, and review this playbook at least every six months.</p>
</div></footer>`;

// ---- write ----
fs.mkdirSync(path.join(OUT, 'articles'), { recursive: true });
const catOf = (id) => CATEGORIES.find((c) => c.id === id);
const meta = {};

PAGES.forEach((p, i) => {
  const { body, raw } = pageMarkdown(p);
  const { html, toc } = render(body, p.slug);
  const mins = readTime(body);
  meta[p.slug] = mins;
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  const cat = catOf(p.cat);
  const sectionLabel = p.key.includes('.') ? `Template ${p.key}` : `Section ${p.key}`;
  const tocHtml = toc.length > 1
    ? `<nav class="toc" aria-label="On this page"><details open><summary>On this page</summary><ol>${toc.map((t) => `<li><a href="#${t.id}">${t.html}</a></li>`).join('')}</ol></details></nav>`
    : '';
  const copyBtn = raw
    ? `<button class="btn copy-raw" type="button" data-target="raw-md">Copy as Markdown</button><script type="text/plain" id="raw-md">${raw.replace(/</g, '&lt;')}</script>`
    : '';
  const navCard = (q, dir) => q
    ? `<a class="pager-link ${dir}" href="${q.slug}.html"><span class="pager-dir">${dir === 'prev' ? '&larr; Previous' : 'Next &rarr;'}</span><span class="pager-title">${esc(q.title)}</span></a>`
    : '<span></span>';

  const page = `${head(`${p.title} | Mobile App Playbook`, p.desc, '../')}
<body class="article-page" data-cat="${p.cat}">
${topbar('../')}
<div class="article-hero"><div class="article-hero-inner">
<nav class="crumbs" aria-label="Breadcrumb"><a href="../index.html">All resources</a><span>/</span><a href="../index.html#${cat.id}">${esc(cat.name)}</a></nav>
<div class="hero-row">
<div class="hero-icon cat-${p.cat}">${icon(p.icon)}</div>
<div>
<h1>${esc(p.title)}</h1>
<p class="lede">${esc(p.desc)}</p>
<p class="meta"><span>${sectionLabel}</span><span>${mins} min read</span></p>
</div>
</div>
${copyBtn}
</div></div>
<div class="layout${tocHtml ? '' : ' no-toc'}">
${tocHtml}
<main class="prose" id="content">
${html}
<nav class="pager">${navCard(prev, 'prev')}${navCard(next, 'next')}</nav>
</main>
</div>
${footer}
<script src="../assets/app.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, 'articles', `${p.slug}.html`), page);
});

// ---- index ----
const card = (p) => `<a class="card" href="articles/${p.slug}.html" data-search="${esc((p.title + ' ' + p.desc + ' ' + catOf(p.cat).name).toLowerCase())}">
<div class="card-top"><span class="card-icon cat-${p.cat}">${icon(p.icon)}</span><span class="card-num">${p.key.includes('.') ? p.key : String(p.key).padStart(2, '0')}</span></div>
<h3>${esc(p.title)}</h3>
<p>${esc(p.desc)}</p>
<span class="card-foot"><span>${meta[p.slug]} min read</span><span class="card-arrow" aria-hidden="true">&rarr;</span></span>
</a>`;

const sectionsHtml = CATEGORIES.map((c) => {
  const items = PAGES.filter((p) => p.cat === c.id);
  return `<section class="cat-section" id="${c.id}">
<div class="cat-head"><h2>${esc(c.name)}</h2><p>${esc(c.blurb)}</p></div>
<div class="grid">${items.map(card).join('\n')}</div>
</section>`;
}).join('\n');

const totalMins = Object.values(meta).reduce((a, b) => a + b, 0);
const index = `${head('Mobile App Playbook', 'React Native knowledge transfer: project setup, repositories, store accounts, Firebase, releases and live-app monitoring.', '')}
<body class="home">
${topbar('')}
<section class="hero"><div class="hero-inner">
<p class="eyebrow">Knowledge Transfer &middot; React Native</p>
<h1>Mobile App Development Playbook</h1>
<p class="hero-sub">How we set up, build, publish and look after mobile apps: from creating the repository on day one to catching Apple and Google policy changes on apps that are already live.</p>
<ul class="hero-meta">
<li><span>Prepared by</span>Saad Bawany, React Native Lead</li>
<li><span>For</span>Management &amp; the incoming Mobile Lead</li>
<li><span>Version</span>v1.0 &middot; October 2026</li>
<li><span>Content</span>${PAGES.length} resources &middot; ~${totalMins} min</li>
</ul>
<div class="search"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="search" type="search" placeholder="Search resources, e.g. keystore, firebase, offboarding" aria-label="Search resources"></div>
</div></section>
<main class="home-main">
<div class="callout-start"><strong>New here?</strong> Read <a href="articles/golden-rules.html">Golden Rules</a> first, then go through the sections in order. Each project should also have a filled-in <a href="articles/project-registry-template.html">Project Registry</a>.</div>
${sectionsHtml}
<p class="empty" id="empty" hidden>No resources match your search.</p>
</main>
${footer}
<script src="assets/app.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), index);
console.log('built', PAGES.length, 'articles; total read', totalMins, 'min');
