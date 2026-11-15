/* Price-from-your-own-costs calculator for creators. All numbers are typed by the user; nothing is stored or sent. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  if (!$('rc-n')) return;
  var ids = ['n', 'plan', 'shoot', 'edit', 'rev', 'rate', 'costs', 'usage', 'excl', 'rush', 'fees'];
  var q = new URLSearchParams(location.search);
  ids.forEach(function (k) { if (q.get(k) !== null && $('rc-' + k)) $('rc-' + k).value = q.get(k); });
  if (q.get('what')) $('rc-what').value = q.get('what');
  var num = function (k) { var v = parseFloat($('rc-' + k).value); return isFinite(v) && v >= 0 ? v : 0; };
  var inr = function (x) { return 'Rs ' + Math.round(x).toLocaleString('en-IN'); };
  var out = $('rc-out'), quote = $('rc-quote');
  function run() {
    var n = Math.max(1, num('n')), hrs = num('plan') + num('shoot') + num('edit') + num('rev'), rate = num('rate'), costs = num('costs');
    var per = hrs * rate, time = per * n, sub = time + costs;
    var u = sub * num('usage') / 100, e = sub * num('excl') / 100, r = sub * num('rush') / 100, before = sub + u + e + r, f = Math.min(num('fees'), 90) / 100, total = before / (1 - f);
    var what = $('rc-what').value.trim() || 'content';
    var rows = [['Time for one piece', hrs + ' hours x ' + inr(rate) + ' = ' + inr(per)], ['Time for ' + n + ' piece' + (n > 1 ? 's' : ''), inr(time)], ['Costs you pay (props, travel, tools)', inr(costs)], ['Subtotal', inr(sub)]];
    if (u) rows.push(['Usage rights add-on (' + num('usage') + '%)', inr(u)]);
    if (e) rows.push(['Exclusivity add-on (' + num('excl') + '%)', inr(e)]);
    if (r) rows.push(['Rush add-on (' + num('rush') + '%)', inr(r)]);
    if (f) rows.push(['Set aside for tax and fees (' + num('fees') + '% of the final price)', inr(total - before)]);
    var h = '<dl class="facts">' + rows.map(function (x) { return '<dt>' + SYG.esc(x[0]) + '</dt><dd>' + SYG.esc(x[1]) + '</dd>'; }).join('') + '</dl><p class="big">Total quote: ' + inr(total) + '</p><p>That is ' + inr(total / n) + ' per piece.</p>';
    if (!hrs || !rate) h = '<p class="hint">Enter your hours and your hourly value to see a price.</p>';
    out.innerHTML = h;
    quote.value = (!hrs || !rate) ? '' : 'Hello,\n\nThank you for thinking of me. For ' + n + ' ' + what + ' piece' + (n > 1 ? 's' : '') + ', my quote is ' + inr(total) + '.\n\nIt includes planning, shooting, editing and ' + (num('rev') ? 'revisions' : 'one round of changes') + '.' +
      (u ? ' It includes the usage rights we agree in writing.' : '') + (e ? ' It includes exclusivity for the period we agree in writing.' : '') + '\nPlease tell me the usage, the deadline and the payment terms you prefer, and I will confirm.\n\nThank you.';
  }
  ids.concat(['what']).forEach(function (k) { $('rc-' + k).addEventListener('input', run); });
  $('rc-copy').addEventListener('click', function () { if (quote.value) SYG.copy(quote.value); });
  run();
})();
