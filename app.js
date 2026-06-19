(() => {
  const data = window.PROJECT_DATA;
  const cases = window.CASES_DATA;
  const root = document.querySelector('#content');
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const sectionHead = (index, title) => `<span class="section__index">${esc(index)}</span><h2 class="section__title reveal">${esc(title)}</h2>`;
  const caseCaption = item => `<strong>${esc(item.summary)}</strong><span>INPUT · ${esc(item.input || '未声明')}</span><span>OUTPUT · ${esc(item.output || '未声明')}</span><span>EVIDENCE · ${esc(item.evidence || '未声明')}</span><span>LIMIT · ${esc(item.limitations || '未声明')}</span><small>VERIFIED ${esc(item.lastVerified || 'UNVERIFIED')} · RISK ${esc(item.risk || 'UNKNOWN')}</small>`;
  const ticker = [...data.hero.ticker, ...data.hero.ticker].map(item => `<span>${esc(item)}</span>`).join('');
  root.innerHTML = `
    <section class="section hero" id="top"><div class="hero__eyebrow">${esc(data.hero.eyebrow)}</div><h1>${data.hero.titleLines.map(line => `<span>${esc(line)}</span>`).join('')}</h1><p class="hero__lead reveal">${esc(data.hero.lead)}</p><div class="ticker" aria-hidden="true">${ticker}</div></section>
    <section class="section paper" id="dual">${sectionHead('01 — DUAL TRACK', data.dualTrack.title)}<div class="dual-grid">${data.dualTrack.items.map(item => `<article class="dual-card reveal"><span class="dual-card__index">${esc(item.index)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p><div class="tags">${item.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div></article>`).join('')}</div></section>
    <section class="section" id="timeline">${sectionHead('02 — TIMELINE', data.timeline.title)}<div class="timeline-list">${data.timeline.items.map(item => `<article class="timeline-row reveal"><time>${esc(item.year)}</time><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('')}</div></section>
    <section class="section paper evidence" id="evidence">${sectionHead('03 — EVIDENCE', data.evidence.title)}<p class="section__lead reveal">${esc(data.evidence.lead)}</p><div class="stats">${data.evidence.stats.map(item => `<div class="stat reveal"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></div>`).join('')}</div></section>
    <section class="section cases" id="cases">${sectionHead('04 — LIVE CASES', cases.title)}<p class="section__lead reveal">${esc(cases.lead)}</p><div class="case-layout"><div class="case-list">${cases.items.map((item,i)=>`<a class="case-row reveal${i===0?' is-active':''}" href="${esc(item.href)}" target="_blank" rel="noopener" data-case-id="${esc(item.id)}"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(item.title)}</strong><em>${esc(item.creator)}</em><small>${esc(item.status)} ↗</small><img src="${esc(item.preview)}" alt="" loading="lazy"></a>`).join('')}</div><figure class="case-preview"><img src="${esc(cases.items[0].preview)}" alt="${esc(cases.items[0].title)}预览"><figcaption>${caseCaption(cases.items[0])}</figcaption></figure></div></section>
    <section class="section" id="influences">${sectionHead('05 — INFLUENCES', data.influences.title)}<div class="portraits">${data.influences.items.map((item, i) => `<article class="portrait reveal" tabindex="0"><div class="portrait__fallback" aria-hidden="true">${i + 1}</div>${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.zh)}的艺术化编辑图像" loading="lazy" onerror="this.hidden=true">` : ''}<div class="portrait__text"><small>${esc(item.name)}</small><h3>${esc(item.zh)}</h3><p>${esc(item.theme)}</p></div></article>`).join('')}</div><p class="disclaimer">${esc(data.influences.disclaimer)}</p></section>
    <section class="section paper" id="protocols">${sectionHead('06 — PROTOCOLS', data.protocols.title)}<div class="protocol-list">${data.protocols.items.map(item => `<article class="protocol reveal"><code>${esc(item.code)}</code><h3>${esc(item.title)}</h3><p>${esc(item.action)}</p></article>`).join('')}</div></section>
    <section class="section finale" id="finale"><div>${sectionHead('07 — CONTINUE', data.finale.title)}<p class="reveal">${esc(data.finale.text)}</p><div class="red-orb" aria-hidden="true"></div><p class="reveal">${esc(data.finale.cta)}</p></div></section>`;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.loader');
  if (!reduced) {
    let n = 0;
    const counter = loader.querySelector('strong');
    const tick = () => { n = Math.min(100, n + Math.ceil((100 - n) / 8)); counter.textContent = String(n).padStart(3, '0'); if (n < 100) requestAnimationFrame(tick); else setTimeout(() => loader.classList.add('done'), 260); };
    requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting)), {threshold:.14});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  const progress = document.querySelector('.progress i');
  const updateProgress = () => { const max = document.documentElement.scrollHeight - innerHeight; progress.style.transform = `scaleY(${max > 0 ? scrollY / max : 0})`; };
  addEventListener('scroll', updateProgress, {passive:true}); updateProgress();
  if (!reduced) document.querySelectorAll('.portrait').forEach(card => card.addEventListener('pointermove', event => { const r = card.getBoundingClientRect(); card.style.transform = `perspective(900px) rotateY(${((event.clientX-r.left)/r.width-.5)*5}deg) rotateX(${((event.clientY-r.top)/r.height-.5)*-5}deg)`; }));
  document.querySelectorAll('.portrait').forEach(card => card.addEventListener('pointerleave', () => card.style.transform = ''));
  const preview = document.querySelector('.case-preview');
  const setCase = row => {
    const item = cases.items.find(candidate => candidate.id === row.dataset.caseId);
    if (!item) return;
    document.querySelectorAll('.case-row').forEach(candidate => candidate.classList.toggle('is-active', candidate === row));
    preview.querySelector('img').src = item.preview;
    preview.querySelector('img').alt = `${item.title}预览`;
    preview.querySelector('figcaption').innerHTML = caseCaption(item);
  };
  document.querySelectorAll('.case-row').forEach(row => {
    row.addEventListener('mouseenter', () => setCase(row));
    row.addEventListener('focus', () => setCase(row));
  });
})();
