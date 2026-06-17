// ─── State Management ────────────────────────────────────────

let state = {};
const STORAGE_KEY = 'spo_packing_state';

function stateKey(tabId, idx) {
  return `${tabId}__${idx}`;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = JSON.parse(saved);
  } catch (e) {
    state = {};
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage unavailable (private browsing, etc.)
  }
}

// ─── Stats Helpers ───────────────────────────────────────────

function tabStats(tab) {
  const total = tab.items.length;
  const packed = tab.items.filter((_, i) => state[stateKey(tab.id, i)]).length;
  return { total, packed };
}

function globalStats() {
  return packingData.reduce((acc, tab) => {
    const { total, packed } = tabStats(tab);
    acc.total += total;
    acc.packed += packed;
    return acc;
  }, { total: 0, packed: 0 });
}

// ─── Global Progress Bar ─────────────────────────────────────

function updateGlobal() {
  const { total, packed } = globalStats();
  const pct = total ? Math.round((packed / total) * 100) : 0;
  document.getElementById('globalFill').style.width = pct + '%';
  document.getElementById('globalLabel').textContent = `${packed} of ${total} items packed`;
  document.getElementById('globalPct').textContent = pct + '%';
}

// ─── Tab Bar ─────────────────────────────────────────────────

function renderTabBar(activeId) {
  const bar = document.getElementById('tabBar');
  bar.innerHTML = '';

  packingData.forEach(tab => {
    const { total, packed } = tabStats(tab);
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (tab.id === activeId ? ' active' : '');
    btn.innerHTML = `
      <span class="tab-icon">${tab.icon}</span>
      ${tab.label}
      <span class="tab-badge">${packed}/${total}</span>
    `;
    // Pass `true` here — this is a genuine tab switch, so the tab bar
    // is allowed to auto-scroll horizontally to reveal the active tab.
    btn.addEventListener('click', () => renderApp(tab.id, true));
    bar.appendChild(btn);
  });
}

// ─── Horizontal-only tab scroll ──────────────────────────────
// Scopes scrolling to the .tabs-wrapper element only — never touches
// window/page scroll, so it can't yank the user back to the top.
function scrollActiveTabIntoView() {
  const wrapper = document.querySelector('.tabs-wrapper');
  const activeBtn = document.querySelector('.tab-btn.active');
  if (!wrapper || !activeBtn) return;

  const btnLeft = activeBtn.offsetLeft;
  const btnRight = btnLeft + activeBtn.offsetWidth;
  const visibleLeft = wrapper.scrollLeft;
  const visibleRight = visibleLeft + wrapper.clientWidth;

  if (btnLeft < visibleLeft) {
    wrapper.scrollTo({ left: btnLeft - 16, behavior: 'smooth' });
  } else if (btnRight > visibleRight) {
    wrapper.scrollTo({ left: btnRight - wrapper.clientWidth + 16, behavior: 'smooth' });
  }
}

// ─── Tab Content ─────────────────────────────────────────────
// `didSwitchTab` defaults to false — item toggles and resets call
// renderApp() without it, so they never trigger any scroll behaviour.
function renderApp(activeId, didSwitchTab = false) {
  const tab = packingData.find(t => t.id === activeId) || packingData[0];
  renderTabBar(tab.id);

  const { total, packed } = tabStats(tab);
  const allDone = packed === total && total > 0;

  const itemsHtml = tab.items.map((item, i) => {
    const isPacked = !!state[stateKey(tab.id, i)];
    return `
      <div class="item-row${isPacked ? ' packed' : ''}" data-tab="${tab.id}" data-idx="${i}">
        <div class="check-box"><span class="check-icon">✓</span></div>
        <span class="item-name">${item.name}</span>
        <span class="item-qty">${item.qty}</span>
      </div>`;
  }).join('');

  document.getElementById('tabContent').innerHTML = `
    <div class="tab-panel active">
      <div class="list-card">
        <div class="list-card-header">
          <span class="card-icon">${tab.icon}</span>
          <h3>${tab.label}</h3>
          <span class="card-count">${packed} / ${total}</span>
        </div>
        <div>${itemsHtml}</div>
      </div>
      <div class="panel-footer">
        <div class="packed-summary">
          <strong>${packed}</strong> of ${total} packed
          ${allDone ? '<span class="done-mark"> ✓ All done!</span>' : ''}
        </div>
        <button class="reset-btn" id="resetBtn">↺ Reset</button>
      </div>
    </div>`;

  // Toggle item packed state
  document.querySelectorAll('.item-row').forEach(row => {
    row.addEventListener('click', () => {
      const key = stateKey(row.dataset.tab, parseInt(row.dataset.idx));
      state[key] = !state[key];
      saveState();
      renderApp(row.dataset.tab); // no scroll flag — page stays put
    });
  });

  // Reset button clears all items in this tab
  document.getElementById('resetBtn').addEventListener('click', e => {
    e.stopPropagation();
    tab.items.forEach((_, i) => delete state[stateKey(tab.id, i)]);
    saveState();
    renderApp(tab.id); // no scroll flag — page stays put
  });

  updateGlobal();

  // Only adjust horizontal tab-bar scroll on an actual tab switch.
  if (didSwitchTab) {
    scrollActiveTabIntoView();
  }
}

// ─── Init ────────────────────────────────────────────────────

loadState();
renderApp(packingData[0].id);
