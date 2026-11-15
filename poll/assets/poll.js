/* social.shareyourgroup.com/poll front end: create a poll, vote, see results. Talks to the Apps Script address in POLL_CFG.api. */
(function () {
  var cfg = window.POLL_CFG || {}, API = cfg.api || '';
  var $ = function (i) { return document.getElementById(i); };
  var esc = function (s) { return SYG.esc(String(s)); };
  function token() {
    var t = ''; try { t = localStorage.getItem('poll-token'); } catch (e) {}
    if (!t) { t = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, ''); try { localStorage.setItem('poll-token', t); } catch (e) {} }
    return t;
  }
  function mine() { try { return JSON.parse(localStorage.getItem('poll-mine') || '[]'); } catch (e) { return []; } }
  function saveMine(m) { try { localStorage.setItem('poll-mine', JSON.stringify(m.slice(0, 50))); } catch (e) {} }
  function voted(id) { try { return localStorage.getItem('poll-voted-' + id); } catch (e) { return null; } }
  function markVoted(id, opt) { try { localStorage.setItem('poll-voted-' + id, String(opt)); } catch (e) {} }
  function post(body) {
    body.token = token();
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
  }
  function get(id) { return fetch(API + (API.indexOf('?') > -1 ? '&' : '?') + 'action=get&id=' + encodeURIComponent(id)).then(function (r) { return r.json(); }); }
  function off(box) { box.innerHTML = '<p class="note">Polls are not switched on yet. The poll service is being set up; please come back soon.</p>'; }

  /* ---------- create ---------- */
  var form = $('pl-form');
  if (form) {
    var opts = $('pl-opts'), msg = $('pl-msg');
    var addOpt = function (v) {
      if (opts.children.length >= 8) return;
      var d = document.createElement('div'); d.className = 'pl-o'; d.innerHTML = '<label class="sr">Option</label><input type="text" maxlength="60" placeholder="Option ' + (opts.children.length + 1) + '" value="' + esc(v || '') + '">';
      opts.appendChild(d);
    };
    var q = new URLSearchParams(location.search);
    if (q.get('q')) $('pl-q').value = q.get('q');
    var pre = q.get('o') ? q.get('o').split('|') : [];
    for (var i = 0; i < Math.max(2, pre.length); i++) addOpt(pre[i]);
    $('pl-add').addEventListener('click', function () { addOpt(''); });
    var list = mine();
    if (list.length && $('pl-mine')) $('pl-mine').innerHTML = '<h2>Your polls on this device</h2><ul>' + list.map(function (m) { return '<li><a href="/poll/p/?id=' + esc(m.id) + '#admin=' + esc(m.admin) + '">' + esc(m.q) + '</a></li>'; }).join('') + '</ul>';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!API) { off(msg); return; }
      var o = [].slice.call(opts.querySelectorAll('input')).map(function (x) { return x.value.trim(); }).filter(Boolean);
      msg.textContent = 'Making your poll...'; $('pl-go').disabled = true;
      post({ action: 'create', q: $('pl-q').value.trim(), opts: o, days: parseInt($('pl-days').value, 10) }).then(function (r) {
        $('pl-go').disabled = false;
        if (!r.ok) { msg.textContent = r.why || 'Could not make the poll.'; return; }
        var m = mine(); m.unshift({ id: r.id, admin: r.admin, q: $('pl-q').value.trim() }); saveMine(m);
        location.href = '/poll/p/?id=' + r.id + '#admin=' + r.admin;
      }).catch(function () { $('pl-go').disabled = false; msg.textContent = 'The poll service did not answer. Please try again.'; });
    });
  }

  /* ---------- view ---------- */
  var box = $('pl-view');
  if (box) {
    var id = (new URLSearchParams(location.search).get('id') || '').toUpperCase();
    var admin = (location.hash.match(/admin=([A-Z0-9]+)/) || [])[1] || '';
    var link = location.origin + location.pathname + '?id=' + id;
    var timer = null;
    var render = function (p) {
      var mineVote = voted(p.id), showRes = p.closed || mineVote !== null;
      var h = '<h2>' + esc(p.q) + '</h2><p class="hint">' + (p.closed ? 'This poll is closed.' : 'Open until ' + new Date(p.closes).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })) + ' &middot; ' + p.total + ' vote' + (p.total === 1 ? '' : 's') + '</p>';
      if (!showRes) {
        h += '<form id="pl-vote"><fieldset class="pl-fs"><legend class="sr">Choose one option</legend>' + p.opts.map(function (o, i) { return '<label class="pl-opt"><input type="radio" name="opt" value="' + i + '"> <span>' + esc(o) + '</span></label>'; }).join('') + '</fieldset><div class="acts"><button class="btn" type="submit">Vote</button></div><p class="hint" id="pl-err" aria-live="polite"></p></form><p><button class="btn ghost sm" id="pl-see" type="button">See results without voting</button></p>';
      } else {
        h += '<div class="pl-res">' + p.opts.map(function (o, i) {
          var pc = p.total ? Math.round(p.counts[i] * 100 / p.total) : 0;
          return '<div class="pl-r' + (String(mineVote) === String(i) ? ' mine' : '') + '"><div class="pl-l"><span>' + esc(o) + (String(mineVote) === String(i) ? ' (your vote)' : '') + '</span><b>' + pc + '% &middot; ' + p.counts[i] + '</b></div><div class="pl-b"><i style="width:' + pc + '%"></i></div></div>';
        }).join('') + '</div>';
      }
      var wa = 'Please vote in this poll: ' + p.q + ' ' + link;
      h += '<div class="acts"><button class="btn ghost" type="button" data-copy="' + esc(link) + '">Copy poll link</button><button class="btn ghost" type="button" data-wa="' + esc(wa) + '">Send on WhatsApp</button></div>';
      if (admin && !p.closed) h += '<div class="acts"><button class="btn ghost sm" id="pl-close" type="button">Close this poll now</button></div>';
      h += '<p class="hint">Votes are counted once for each device. Anyone who clears their browser data could vote again, so treat polls as friendly guidance, not an official count. <button class="btn ghost sm" id="pl-rep" type="button">Report this poll</button></p>';
      box.innerHTML = h;
      var f = $('pl-vote');
      if (f) f.addEventListener('submit', function (e) {
        e.preventDefault(); var c = f.querySelector('input:checked'); if (!c) { $('pl-err').textContent = 'Choose an option first.'; return; }
        post({ action: 'vote', id: p.id, opt: parseInt(c.value, 10) }).then(function (r) {
          if (r.ok || r.voted) { markVoted(p.id, r.ok ? c.value : -1); load(); } else $('pl-err').textContent = r.why || 'Could not save your vote.';
        }).catch(function () { $('pl-err').textContent = 'The poll service did not answer. Please try again.'; });
      });
      if ($('pl-see')) $('pl-see').addEventListener('click', function () { markVoted(p.id, -1); load(); });
      if ($('pl-close')) $('pl-close').addEventListener('click', function () { if (confirm('Close this poll? Nobody will be able to vote.')) post({ action: 'close', id: p.id, admin: admin }).then(function () { load(); }); });
      $('pl-rep').addEventListener('click', function () { if (confirm('Report this poll as spam, adult, a scam or hateful?')) post({ action: 'report', id: p.id, reason: 'spam' }).then(function () { SYG.toast('Thank you. We will look at it.'); }); });
    };
    var load = function () {
      get(id).then(function (r) { if (!r.ok) { box.innerHTML = '<h2>Poll not found</h2><p>' + esc(r.why || 'This poll does not exist.') + '</p><p><a class="btn" href="/poll/">Make a poll</a></p>'; return; } render(r.poll); }).catch(function () { box.innerHTML = '<p class="note">The poll service did not answer. Please reload in a moment.</p>'; });
    };
    if (!API) off(box); else if (!id) box.innerHTML = '<h2>No poll chosen</h2><p><a class="btn" href="/poll/">Make a poll</a></p>'; else {
      load(); timer = setInterval(function () { if (!document.hidden && !document.querySelector('#pl-vote input:checked')) { var m = voted(id); if (m !== null) load(); } }, 15000);
    }
  }
})();
