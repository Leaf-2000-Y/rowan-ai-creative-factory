(() => {
  const data = window.CASE_DATA;
  const root = document.querySelector('#experience');
  const toast = document.querySelector('.toast');
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const notify = message => { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1500); };
  const copy = async text => {
    try { await navigator.clipboard.writeText(text); }
    catch { const area = document.createElement('textarea'); area.value = text; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); }
    notify('已复制');
  };
  const download = (name, content, type) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], {type}));
    link.download = name;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
    notify('已导出');
  };
  const head = (title, note) => `<header class="case-head"><h2>${esc(title)}</h2><p>${esc(note)}</p></header>`;

  function renderDebug() {
    root.innerHTML = head('用证据改变下一步。', data.note) + `
      <div class="debug-layout">
        <div>
          <div class="panel terminal" aria-live="polite"><div class="terminal-top"><span>SESSION / LOCAL SIMULATION</span><span id="debugStatus">未验证</span></div><pre id="debugLog"></pre><div class="meters"><div class="meter"><small>改动范围</small><strong id="changeMeter">12</strong></div><div class="meter"><small>上下文噪声</small><strong id="noiseMeter">18</strong></div><div class="meter"><small>有效证据</small><strong id="evidenceMeter">0</strong></div></div></div>
          <div class="action-grid">${data.actions.map(action => `<button class="action" data-action="${esc(action.id)}"><strong>${esc(action.label)}</strong><span>${esc(action.effect)}</span></button>`).join('')}</div>
        </div>
        <aside class="panel checklist"><h3>协作检查单</h3><ol>${data.checklist.map(item => `<li>${esc(item)}</li>`).join('')}</ol><button class="copy" data-copy="checklist">复制检查单</button></aside>
      </div>`;
    const state = {attempt:1, change:12, noise:18, evidence:0, status:'未验证', lines:['> 收到报错：页面保存后仍显示旧内容','> 当前没有复现步骤，也没有检查改动差异']};
    const draw = () => {
      document.querySelector('#debugLog').textContent = state.lines.join('\n');
      document.querySelector('#changeMeter').textContent = state.change;
      document.querySelector('#noiseMeter').textContent = state.noise;
      document.querySelector('#evidenceMeter').textContent = state.evidence;
      document.querySelector('#debugStatus').textContent = state.status;
    };
    root.addEventListener('click', event => {
      const button = event.target.closest('[data-action],[data-copy]'); if (!button) return;
      if (button.dataset.copy) return copy(data.checklist.map((item, i) => `${i + 1}. ${item}`).join('\n'));
      const action = button.dataset.action;
      if (action === 'continue') { state.attempt++; state.change += 21; state.noise += 17; state.status='风险扩大'; state.lines.push(`> 第 ${state.attempt} 次直接修改：新增 ${state.change} 行改动，仍无测试证据`); }
      if (action === 'inspect') { state.evidence = Math.min(100, state.evidence + 38); state.noise = Math.max(0, state.noise - 12); state.status='正在检查'; state.lines.push('> 已读取原始错误、依赖版本和文件差异'); }
      if (action === 'restore') { state.change=0; state.noise=Math.max(0,state.noise-18); state.evidence=Math.max(45,state.evidence); state.status='已恢复'; state.lines.push('> 已回到最后一次通过验证的检查点'); }
      if (action === 'spec') { state.evidence=Math.min(100,state.evidence+55); state.noise=Math.max(0,state.noise-20); state.status='规格已明确'; state.lines.push('> 目标：保存后显示最新内容\n> 禁改：数据格式与历史记录\n> 验收：刷新页面后文本保持一致'); }
      draw();
    });
    draw();
  }

  function renderPipeline() {
    root.innerHTML = head('七个阶段，一份可检查的内容。','点击阶段查看它必须交付什么。自动化只处理可验证的步骤，发布决定始终由人完成。') + `
      <div class="stage-nav" role="tablist">${data.stages.map((stage,i)=>`<button class="stage-btn${i===0?' is-active':''}" role="tab" aria-selected="${i===0}" data-stage="${esc(stage.id)}" data-index="${String(i+1).padStart(2,'0')}">${esc(stage.title)}</button>`).join('')}</div>
      <div class="panel stage-detail" id="stageDetail"></div>
      <div class="export-row"><button data-export>复制项目立项卡</button></div>`;
    const detail = root.querySelector('#stageDetail');
    const draw = id => {
      const stage = data.stages.find(item=>item.id===id) || data.stages[0];
      detail.innerHTML = `<div><small>STAGE</small><h3>${esc(stage.title)}</h3><p>当前阶段只在交付物明确后完成。</p></div><div><small>INPUT</small><p>${esc(stage.input)}</p><small>OUTPUT</small><p>${esc(stage.output)}</p></div><div><small>FAILURE</small><p>${esc(stage.failure)}</p></div><div><small>HUMAN</small><p>${esc(stage.human)}</p></div>`;
    };
    root.addEventListener('click', event => {
      const tab=event.target.closest('[data-stage]');
      if(tab){root.querySelectorAll('[data-stage]').forEach(el=>{const active=el===tab;el.classList.toggle('is-active',active);el.setAttribute('aria-selected',active)});draw(tab.dataset.stage);}
      if(event.target.closest('[data-export]')) copy('项目立项卡\n- 目标读者：\n- 希望发生的行动：\n- 已授权资料：\n- 必须出现：\n- 禁止出现：\n- 人工确认人：\n- 验收证据：');
    });
    draw(data.stages[0].id);
  }

  function renderRelay() {
    root.innerHTML = head('同一份任务，三种责任。','选择任务类型。每个角色只接收自己需要的上下文，并以文件和验证记录交接。') + `<div class="task-tabs" role="tablist">${data.tasks.map((task,i)=>`<button class="task-tab${i===0?' is-active':''}" role="tab" aria-selected="${i===0}" data-task="${esc(task.id)}">${esc(task.label)}</button>`).join('')}</div><div id="relayBody"></div>`;
    const body=root.querySelector('#relayBody');
    const draw=id=>{
      const task=data.tasks.find(item=>item.id===id)||data.tasks[0];
      body.innerHTML=`<div class="relay-map">${task.roles.map((role,i)=>`<article class="panel role"><small>ROLE ${String(i+1).padStart(2,'0')}</small><h3>${esc(role.name)}</h3><p>${esc(role.job)}</p><div class="artifact">HANDOFF · ${esc(role.artifact)}</div></article>`).join('')}</div><div class="warning">CONFLICT WARNING · ${esc(task.warning)}</div><div class="relay-actions"><button data-relay="json">复制 Relay JSON</button><button data-relay="markdown">复制 Markdown 交接</button></div>`;
    };
    root.addEventListener('click',event=>{
      const tab=event.target.closest('[data-task]');
      if(tab){root.querySelectorAll('[data-task]').forEach(el=>{const active=el===tab;el.classList.toggle('is-active',active);el.setAttribute('aria-selected',active)});draw(tab.dataset.task);return;}
      const relay=event.target.closest('[data-relay]');if(!relay)return;
      const active=root.querySelector('[data-task].is-active')?.dataset.task||data.tasks[0].id;const task=data.tasks.find(item=>item.id===active);
      if(relay.dataset.relay==='json') copy(JSON.stringify({task:task.label,roles:task.roles,warning:task.warning,status:'planned'},null,2));
      else copy(`# ${task.label}\n\n${task.roles.map(role=>`- ${role.name}: ${role.job}\n  - 交接物: ${role.artifact}`).join('\n')}\n\n风险：${task.warning}`);
    });
    draw(data.tasks[0].id);
  }

  function renderResource() {
    const labels = {use:'立即使用', verify:'需要核验', archive:'以后再看', reject:'拒绝采用'};
    const storageKey = data.storageKey || 'rowan_resource_compounder_v1';
    const scoreLine = (line, index) => {
      const urlMatch = line.match(/https?:\/\/[^\s]+/i);
      const url = urlMatch?.[0]?.replace(/[),.;，。；]+$/, '') || '';
      let hostname = '';
      if (url) {
        try { hostname = new URL(url).hostname; } catch { hostname = url; }
      }
      const title = line.replace(urlMatch?.[0] || '', '').trim() || hostname || `未命名资源 ${index + 1}`;
      const target = `${title} ${url}`.toLowerCase();
      const highRisk = /(sk-[a-z0-9]|api\s*key|access_token|账号池|逆向|破解|chatgpt2api|代理注册|account pool)/i.test(target);
      const official = /(anthropic\.skilljar\.com|openrouter\.ai|variant\.com|youmind\.com)/i.test(url);
      const github = /github\.com/i.test(url);
      const evidence = official ? 5 : github ? 4 : url ? 2 : 1;
      const relevance = 3;
      const actionability = /(guide|教程|课程|skill|路线)/i.test(target) ? 4 : 3;
      const maintenance = official || github ? 4 : 2;
      const risk = highRisk ? 5 : url ? 1 : 3;
      const total = relevance + evidence + actionability + maintenance - risk;
      const bucket = highRisk ? 'reject' : evidence <= 2 ? 'verify' : total >= 13 ? 'use' : 'archive';
      return {id:`resource-${Date.now()}-${index}`, title, url, relevance, evidence, actionability, maintenance, risk, total, bucket, warning:highRisk ? '检测到凭据、账号池或逆向接口风险' : evidence <= 2 ? '来源与时效需要人工核验' : ''};
    };
    const parse = text => {
      const seen = new Set();
      return text.split(/\n+/).map(line => line.trim()).filter(Boolean).map(scoreLine).filter(item => {
        const key = (item.url || item.title).toLowerCase().replace(/\/$/, '');
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
    };
    const restore = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved?.schemaVersion === 1 && Array.isArray(saved.resources)) return saved.resources;
      } catch {}
      return parse(data.seedText || '');
    };
    let resources = restore();
    root.innerHTML = head('把收藏变成下一步。','自动评分只用于初筛。来源真实性、许可和最终采用决定仍由人确认。') + `
      <div class="resource-layout">
        <section class="panel resource-input"><label for="resourceInput">每行一个链接或资源</label><textarea id="resourceInput" rows="8">${esc(data.seedText || '')}</textarea><div class="resource-actions"><button data-resource-action="analyze">分析并去重</button><button data-resource-action="import">导入 JSON</button><input id="resourceFile" type="file" accept="application/json,.json" hidden><button data-resource-action="reset">恢复示例</button></div></section>
        <aside class="panel resource-summary" aria-live="polite"><h3>资源状态</h3><div id="resourceCounts"></div><p>“立即使用”最多 ${Number(data.maxActive) || 5} 项。风险规则只检查当前文本，不会联网。</p><div class="resource-actions"><button data-resource-action="json">导出 JSON</button><button data-resource-action="markdown">导出 Markdown</button></div></aside>
      </div><div class="resource-board" id="resourceBoard"></div>`;
    const board = root.querySelector('#resourceBoard');
    const counts = root.querySelector('#resourceCounts');
    const input = root.querySelector('#resourceInput');
    const save = () => {
      try { localStorage.setItem(storageKey, JSON.stringify({schemaVersion:1, savedAt:new Date().toISOString(), resources})); } catch {}
    };
    const draw = () => {
      counts.innerHTML = Object.entries(labels).map(([key,label]) => `<span><strong>${resources.filter(item=>item.bucket===key).length}</strong>${label}</span>`).join('');
      board.innerHTML = resources.length ? resources.map(item => `<article class="panel resource-card" data-resource-id="${esc(item.id)}"><div><small>SCORE ${item.total} · RISK ${item.risk}</small><h3>${esc(item.title)}</h3>${item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.url)}</a>` : '<p>无链接</p>'}${item.warning ? `<p class="resource-warning">${esc(item.warning)}</p>` : ''}</div><dl><div><dt>相关</dt><dd>${item.relevance}</dd></div><div><dt>证据</dt><dd>${item.evidence}</dd></div><div><dt>可执行</dt><dd>${item.actionability}</dd></div><div><dt>维护</dt><dd>${item.maintenance}</dd></div></dl><label>分类<select data-resource-bucket="${esc(item.id)}">${Object.entries(labels).map(([key,label])=>`<option value="${key}"${item.bucket===key?' selected':''}>${label}</option>`).join('')}</select></label></article>`).join('') : '<p class="resource-empty">没有可分析的资源。</p>';
      save();
    };
    const exportData = () => ({schemaVersion:1, exportedAt:new Date().toISOString(), resources});
    root.addEventListener('change', async event => {
      const select = event.target.closest('[data-resource-bucket]');
      if (select) {
        const item = resources.find(candidate => candidate.id === select.dataset.resourceBucket);
        if (!item) return;
        if (select.value === 'use' && resources.filter(candidate => candidate.bucket === 'use' && candidate !== item).length >= (Number(data.maxActive) || 5)) { select.value = item.bucket; notify('立即使用最多五项'); return; }
        item.bucket = select.value; draw(); return;
      }
      if (event.target.id === 'resourceFile' && event.target.files?.[0]) {
        try {
          const parsed = JSON.parse(await event.target.files[0].text());
          const incoming = Array.isArray(parsed) ? parsed : parsed.resources;
          if (!Array.isArray(incoming)) throw new Error('JSON 中没有 resources 数组');
          resources = incoming.map((item,index) => typeof item === 'string' ? scoreLine(item,index) : {...scoreLine(`${item.title || ''} ${item.url || ''}`,index), ...item, id:`imported-${Date.now()}-${index}`});
          draw(); notify('已导入');
        } catch (error) { notify(`导入失败：${error.message}`); }
      }
    });
    root.addEventListener('click', event => {
      const action = event.target.closest('[data-resource-action]')?.dataset.resourceAction;
      if (!action) return;
      if (action === 'analyze') { resources = parse(input.value); draw(); notify('已分析'); }
      if (action === 'import') root.querySelector('#resourceFile').click();
      if (action === 'reset') { localStorage.removeItem(storageKey); input.value = data.seedText || ''; resources = parse(input.value); draw(); notify('已恢复'); }
      if (action === 'json') download('ai-resource-list.json', JSON.stringify(exportData(), null, 2), 'application/json');
      if (action === 'markdown') download('ai-resource-list.md', Object.entries(labels).map(([key,label]) => `## ${label}\n\n${resources.filter(item=>item.bucket===key).map(item=>`- ${item.title}${item.url ? ` — ${item.url}` : ''}（评分 ${item.total}，风险 ${item.risk}）`).join('\n') || '- 无'}`).join('\n\n'), 'text/markdown');
    });
    draw();
  }

  if (data.type === 'debug') renderDebug();
  if (data.type === 'pipeline') renderPipeline();
  if (data.type === 'relay') renderRelay();
  if (data.type === 'resource') renderResource();
})();
