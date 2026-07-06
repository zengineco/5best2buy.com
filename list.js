/* Worth The Hunt — shopping list. localStorage-backed, share-by-URL. No backend. */
(function () {
  var KEY = 'wth_list';
  function get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(a) { localStorage.setItem(KEY, JSON.stringify(a)); paintCount(); }
  function keyOf(it) { return (it.n || '').toLowerCase() + '|' + (it.s || ''); }
  function add(items) {
    var l = get(), seen = {}; l.forEach(function (x) { seen[keyOf(x)] = 1; });
    var added = 0;
    items.forEach(function (it) { if (it.n && !seen[keyOf(it)]) { l.push({ n: it.n, s: it.s || '', b: false }); seen[keyOf(it)] = 1; added++; } });
    save(l); return added;
  }

  // ---- styles ----
  var css = '#wth-cart{position:fixed;right:16px;bottom:16px;z-index:9999;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:.3px;color:#10203a;background:#f0c560;border:none;border-radius:24px;padding:11px 16px;box-shadow:0 4px 16px rgba(0,0,0,.35);cursor:pointer;text-decoration:none;}'
    + '#wth-cart:hover{background:#ffd877;}'
    + '.wth-add{display:inline-flex;align-items:center;gap:7px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:.4px;color:#10203a;background:#f0c560;border:none;border-radius:6px;padding:11px 18px;cursor:pointer;}'
    + '.wth-add:hover{background:#ffd877;}.wth-add.done{background:#5fe39a;}'
    + '#wth-toast{position:fixed;left:50%;bottom:74px;transform:translateX(-50%);z-index:10000;font-family:system-ui,sans-serif;font-size:13.5px;color:#eef2f8;background:#16223a;border:1px solid rgba(120,150,190,.3);border-radius:8px;padding:10px 16px;opacity:0;transition:opacity .25s;pointer-events:none;}'
    + '#wth-toast.on{opacity:1;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function toast(msg) {
    var t = document.getElementById('wth-toast');
    if (!t) { t = document.createElement('div'); t.id = 'wth-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }

  // ---- floating cart ----
  var cart;
  function paintCount() {
    if (!cart) return;
    var n = get().length;
    cart.textContent = n ? ('🛒 ' + n) : '🛒 List';
  }
  function mountCart() {
    if (document.getElementById('listApp')) return; // not on the list page itself
    cart = document.createElement('a'); cart.id = 'wth-cart'; cart.href = '/list/'; cart.setAttribute('aria-label', 'Shopping list');
    document.body.appendChild(cart); paintCount();
  }

  // ---- add buttons ----
  function wireButtons() {
    // Recipe: gather every ingredient row that links to a shelf
    document.querySelectorAll('[data-add-recipe]').forEach(function (btn) {
      btn.classList.add('wth-add');
      btn.addEventListener('click', function () {
        var items = [];
        document.querySelectorAll('.ing').forEach(function (row) {
          var a = row.querySelector('.src a[href^="/hunt/"]'), n = row.querySelector('.n');
          if (a && n) items.push({ n: n.textContent.trim(), s: a.getAttribute('href') });
        });
        var added = add(items);
        btn.classList.add('done'); btn.textContent = '✓ Added ' + added + ' to your list';
        toast(added ? (added + ' ingredient' + (added > 1 ? 's' : '') + ' added') : 'Already on your list');
      });
    });
    // Shelf: add this shelf itself
    document.querySelectorAll('[data-add-shelf]').forEach(function (btn) {
      btn.classList.add('wth-add');
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-name') || document.title;
        var added = add([{ n: name, s: location.pathname }]);
        btn.classList.add('done'); btn.textContent = added ? '✓ Added to your list' : '✓ Already on your list';
        toast(added ? 'Added to your list' : 'Already on your list');
      });
    });
  }

  // ---- the /list/ page ----
  function esc(s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function renderList() {
    var app = document.getElementById('listApp'); if (!app) return;
    // shared-list import via #l=<encoded json>
    if (location.hash.indexOf('#l=') === 0) {
      try {
        var shared = JSON.parse(decodeURIComponent(location.hash.slice(3)));
        if (Array.isArray(shared) && shared.length) {
          var cur = get(), seen = {}; cur.forEach(function (x) { seen[keyOf(x)] = 1; });
          shared.forEach(function (x) { if (x.n && !seen[keyOf(x)]) { cur.push({ n: x.n, s: x.s || '', b: !!x.b }); seen[keyOf(x)] = 1; } });
          save(cur);
        }
      } catch (e) { }
      history.replaceState(null, '', '/list/');
    }
    var l = get();
    if (!l.length) { app.innerHTML = '<p class="empty">Your list is empty. Browse the <a href="/recipes/">recipes</a> or the <a href="/shelves/">shelves</a> and tap &ldquo;Add to list.&rdquo;</p>'; return; }
    var rows = l.map(function (it, i) {
      var nm = it.s ? '<a href="' + esc(it.s) + '">' + esc(it.n) + '</a>' : esc(it.n);
      return '<li class="li' + (it.b ? ' bought' : '') + '"><label><input type="checkbox" data-i="' + i + '"' + (it.b ? ' checked' : '') + '/><span>' + nm + '</span></label><button class="rm" data-r="' + i + '" aria-label="Remove">&times;</button></li>';
    }).join('');
    app.innerHTML = '<div class="tools"><button id="share">Copy share link</button><button id="print" onclick="window.print()">Print</button><button id="clear">Clear all</button></div><ul class="items">' + rows + '</ul>';
    app.querySelectorAll('input[type=checkbox]').forEach(function (c) { c.addEventListener('change', function () { var a = get(); a[+c.dataset.i].b = c.checked; save(a); renderList(); }); });
    app.querySelectorAll('.rm').forEach(function (b) { b.addEventListener('click', function () { var a = get(); a.splice(+b.dataset.r, 1); save(a); renderList(); }); });
    app.querySelector('#clear').addEventListener('click', function () { if (confirm('Clear your whole list?')) { save([]); renderList(); } });
    app.querySelector('#share').addEventListener('click', function () {
      var url = location.origin + '/list/#l=' + encodeURIComponent(JSON.stringify(get()));
      navigator.clipboard.writeText(url).then(function () { toast('Share link copied'); }, function () { prompt('Copy your share link:', url); });
    });
  }

  function init() { mountCart(); wireButtons(); renderList(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
