(function () {
  var $ = function (i) { return document.getElementById(i); };
  var C = [['India', '91'], ['United States / Canada', '1'], ['United Kingdom', '44'], ['United Arab Emirates', '971'], ['Pakistan', '92'], ['Bangladesh', '880'], ['Nepal', '977'], ['Sri Lanka', '94'], ['Saudi Arabia', '966'], ['Qatar', '974'], ['Kuwait', '965'], ['Oman', '968'], ['Singapore', '65'], ['Malaysia', '60'], ['Australia', '61'], ['Germany', '49'], ['France', '33'], ['Other (type the full number with country code)', 'other']];
  var cc = $('wa-cc'), num = $('wa-num'), msg = $('wa-msg'), out = $('wa-link'), qr = $('wa-qr'), info = $('wa-info'), snip = $('wa-snip');
  if (!cc) return;
  C.forEach(function (c) { var o = document.createElement('option'); o.value = c[1]; o.textContent = c[0] + (c[1] === 'other' ? '' : ' (+' + c[1] + ')'); cc.appendChild(o); });
  cc.value = '91';
  var q = new URLSearchParams(location.search);
  if (q.get('text')) msg.value = q.get('text');
  if (q.get('phone')) num.value = q.get('phone');
  var link = '';
  function digits(s) { return (s || '').replace(/\D/g, ''); }
  function draw(url) {
    var c = $('wa-canvas'), ctx = c.getContext('2d');
    try {
      var code = qrcode(0, 'M'); code.addData(url); code.make();
      var n = code.getModuleCount(), px = 8, pad = 4 * px, size = n * px + 2 * pad;
      c.width = size; c.height = size; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#000';
      for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (code.isDark(r, k)) ctx.fillRect(pad + k * px, pad + r * px, px, px);
      qr.hidden = false;
    } catch (e) { qr.hidden = true; }
  }
  function run() {
    var code = cc.value, n = digits(num.value), warn = '', full = '';
    if (n) {
      if (code !== 'other') {
        n = n.replace(/^0+/, '');
        if (code === '91' && n.length === 12 && n.indexOf('91') === 0) { n = n.slice(2); warn = 'We removed the 91 you typed, because the country is already chosen. '; }
        full = code + n;
      } else { full = n.replace(/^0+/, ''); }
      if (full.length < 8 || full.length > 15) { out.value = ''; link = ''; info.textContent = 'The full number (country code and number) should be 8 to 15 digits. You have ' + full.length + '.'; qr.hidden = true; snip.value = ''; return; }
    } else if (!msg.value.trim()) { out.value = ''; link = ''; info.textContent = 'Type a number, a message, or both.'; qr.hidden = true; snip.value = ''; return; }
    link = 'https://wa.me/' + full;
    if (msg.value.trim()) link += '?text=' + encodeURIComponent(msg.value.trim());
    out.value = link;
    info.textContent = warn + (full ? 'This link opens a chat with +' + full + '.' : 'This link lets the person pick who to send the message to.');
    snip.value = '<a href="' + link.replace(/&/g, '&amp;') + '" aria-label="Chat on WhatsApp">Chat on WhatsApp</a>';
    $('wa-open').href = link;
    draw(link);
  }
  [cc, num, msg].forEach(function (e) { e.addEventListener('input', run); });
  $('wa-copy').addEventListener('click', function () { if (link) SYG.copy(link); });
  $('wa-copysnip').addEventListener('click', function () { if (snip.value) SYG.copy(snip.value); });
  $('wa-dl').addEventListener('click', function () {
    if (qr.hidden) return; var a = document.createElement('a'); a.download = 'whatsapp-chat-qr.png'; a.href = $('wa-canvas').toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
  });
  $('wa-open').addEventListener('click', function (e) { if (!link) e.preventDefault(); });
  run();
})();
