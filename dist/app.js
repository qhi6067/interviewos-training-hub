(function () {
  'use strict';

  const localHost = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
  const labs = {
    flightlab: {
      label: 'Flightlab', subtitle: 'Drone integrations',
      local: 'http://127.0.0.1:4317/?mode=browser',
      hosted: 'https://flightlab-nine-mothers-jp.jaime123perez43.chatgpt.site/'
    },
    restcraft: {
      label: 'RESTcraft', subtitle: 'API integrations',
      local: 'http://127.0.0.1:4321/',
      hosted: 'https://restcraft-api-lab-jp.jaime123perez43.chatgpt.site/'
    },
    systemforge: {
      label: 'SystemForge', subtitle: 'System design',
      local: 'http://127.0.0.1:4322/',
      hosted: 'https://systemforge-interview-lab-jp.jaime123perez43.chatgpt.site/'
    }
  };

  const tabs = Array.from(document.querySelectorAll('.lab-tab'));
  const frame = document.getElementById('lab-frame');
  const loading = document.getElementById('frame-loading');
  const stageName = document.getElementById('stage-name');
  const stageSubtitle = document.getElementById('stage-subtitle');
  const stageStatus = document.getElementById('stage-status');
  const openSeparately = document.getElementById('open-separately');
  const fallback = document.getElementById('frame-fallback');
  const fallbackLink = document.getElementById('fallback-link');
  const progressCopy = document.getElementById('progress-copy');
  const envChip = document.getElementById('environment-chip');
  const footerMode = document.getElementById('footer-mode');
  let current = null;

  function setEnvironment() {
    if (localHost) {
      envChip.innerHTML = '<i></i> Local workspace';
      footerMode.textContent = 'LOCAL READY';
    } else {
      envChip.innerHTML = '<i></i> Published workspace';
      footerMode.textContent = 'PUBLISHED';
    }
  }

  function setTab(id, writeHistory) {
    const lab = labs[id] || labs.flightlab;
    current = id;
    tabs.forEach((tab) => {
      const active = tab.dataset.lab === id;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    loading.classList.remove('is-hidden');
    stageStatus.textContent = localHost ? 'Connecting to lab…' : 'Private lab · may need sign-in';
    stageName.textContent = lab.label;
    stageSubtitle.textContent = lab.subtitle;
    openSeparately.href = localHost ? lab.local : lab.hosted;
    fallbackLink.href = localHost ? lab.local : lab.hosted;
    frame.title = lab.label + ' training lab';
    frame.src = localHost ? lab.local : lab.hosted;
    progressCopy.textContent = 'Practicing in ' + lab.label;
    if (localHost) {
      fallback.hidden = true;
    } else {
      fallback.hidden = false;
      loading.classList.add('is-hidden');
    }
    if (writeHistory) history.replaceState(null, '', '#' + id);
    try { localStorage.setItem('interviewos-active-lab', id); } catch (_) {}
  }

  frame.addEventListener('load', function () {
    loading.classList.add('is-hidden');
    stageStatus.textContent = localHost ? 'Lab ready' : 'Panel loaded';
  });
  tabs.forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.lab, true)));
  document.addEventListener('keydown', (event) => {
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
    const key = String(event.key);
    if (key === '1' || key === '2' || key === '3') {
      const tab = tabs[Number(key) - 1];
      if (tab) { setTab(tab.dataset.lab, true); tab.focus(); }
    }
  });

  setEnvironment();
  const fromHash = location.hash.replace('#', '');
  let initial = fromHash && labs[fromHash] ? fromHash : null;
  if (!initial) { try { initial = localStorage.getItem('interviewos-active-lab'); } catch (_) {} }
  setTab(initial && labs[initial] ? initial : 'flightlab', false);
})();
