// Mobile App Playbook: small client-side helpers (theme, search, TOC, copy buttons, checklists)
(function () {
  var root = document.documentElement;

  // Theme toggle (remembered per browser when storage is available)
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('playbook-theme', next); } catch (e) {}
    });
  }

  // Home page search
  var search = document.getElementById('search');
  if (search) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('.cat-section'));
    var empty = document.getElementById('empty');
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var match = !q || c.getAttribute('data-search').indexOf(q) !== -1;
        c.hidden = !match;
        if (match) shown++;
      });
      sections.forEach(function (s) {
        s.hidden = !s.querySelector('.card:not([hidden])');
      });
      empty.hidden = shown !== 0;
    });
  }

  function copyText(text, btn, label) {
    var done = function () {
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = label; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  // Copy buttons on code blocks
  document.querySelectorAll('.prose pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-code';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      copyText(pre.querySelector('code') ? pre.querySelector('code').innerText : pre.innerText, btn, 'Copy');
    });
    pre.appendChild(btn);
  });

  // "Copy as Markdown" for checklist pages
  document.querySelectorAll('.copy-raw').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.getAttribute('data-target'));
      var tmp = document.createElement('textarea');
      tmp.innerHTML = src.textContent;
      copyText(tmp.value, btn, 'Copy as Markdown');
    });
  });

  // Tickable checklists
  document.querySelectorAll('li.task input').forEach(function (box) {
    box.addEventListener('change', function () {
      box.parentElement.classList.toggle('done', box.checked);
    });
  });

  // Highlight the current section in the table of contents
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var headings = Array.prototype.slice.call(document.querySelectorAll('.prose h2[id]'));
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          var link = byId[entry.target.id];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    headings.forEach(function (h) { observer.observe(h); });
  }
})();
