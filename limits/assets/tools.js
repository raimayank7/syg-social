/* Counter and resizer for social.shareyourgroup.com/limits. Everything runs in the browser; nothing is uploaded. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  /* ---------- counter ---------- */
  var ta = $('lc-text');
  if (ta) {
    var preset = $('lc-preset'), out = $('lc-out'), bar = $('lc-bar'), note = $('lc-note');
    var P = window.LC_PRESETS || [];
    P.forEach(function (p, i) { var o = document.createElement('option'); o.value = i; o.textContent = p.label; preset.appendChild(o); });
    var seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
    var count = function (s) {
      var cp = Array.from(s).length, g = seg ? Array.from(seg.segment(s)).length : cp;
      var words = (s.trim().match(/\S+/g) || []).length, lines = s ? s.split(/\r\n|\r|\n/).length : 0;
      var tags = (s.match(/#[\p{L}\p{N}_]+/gu) || []).length;
      return { cp: cp, g: g, words: words, lines: lines, tags: tags, u16: s.length };
    };
    var run = function () {
      var c = count(ta.value), p = P[preset.value] || null, h = '';
      h += '<dl class="facts"><dt>Characters (code points)</dt><dd>' + c.cp + '</dd><dt>Visible symbols (a joined emoji counts as one)</dt><dd>' + c.g + '</dd><dt>Words</dt><dd>' + c.words + '</dd><dt>Lines</dt><dd>' + c.lines + '</dd><dt>Hashtags</dt><dd>' + c.tags + '</dd></dl>';
      out.innerHTML = h;
      if (p) {
        var used = p.unit === 'hashtags' ? c.tags : c.cp, left = p.max - used;
        bar.hidden = false; bar.max = p.max; bar.value = Math.min(used, p.max);
        note.innerHTML = '<b>' + SYG.esc(p.label) + ':</b> ' + used + ' of ' + p.max + ' ' + (p.unit === 'hashtags' ? 'hashtags' : 'characters') + (left >= 0 ? ', ' + left + ' left.' : ', <b>' + (-left) + ' over.</b>') +
          ' <span class="hint">Read on ' + SYG.esc(p.date) + ' at <a href="' + p.url + '" rel="noopener">the official page</a>. Apps may count some characters differently, so test in the app.</span>';
      } else { bar.hidden = true; note.textContent = 'Choose a limit to compare with, or just count.'; }
    };
    ta.addEventListener('input', run); preset.addEventListener('input', run); run();
  }
  /* ---------- count explained ---------- */
  var ex = $('ce-text');
  if (ex) {
    var out2 = $('ce-out'), seg2 = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
    var run2 = function () {
      var s = ex.value, cp = Array.from(s).length, u16 = s.length, g = seg2 ? Array.from(seg2.segment(s)).length : cp, bytes = new TextEncoder().encode(s).length;
      out2.innerHTML = '<dl class="facts"><dt>Visible symbols</dt><dd>' + g + '</dd><dt>Unicode code points</dt><dd>' + cp + '</dd><dt>UTF-16 units (what some programs count)</dt><dd>' + u16 + '</dd><dt>UTF-8 bytes (what some systems count)</dt><dd>' + bytes + '</dd></dl>';
    };
    ex.addEventListener('input', run2); run2();
  }
  /* ---------- resizer ---------- */
  var file = $('rz-file');
  if (file) {
    var sel = $('rz-size'), zoom = $('rz-zoom'), px = $('rz-x'), py = $('rz-y'), cv = $('rz-canvas'), dl = $('rz-dl'), info = $('rz-info'), fmt = $('rz-fmt'), img = null;
    var S = window.RZ_SIZES || [];
    S.forEach(function (s, i) { var o = document.createElement('option'); o.value = i; o.textContent = s.label; sel.appendChild(o); });
    var draw = function () {
      var s = S[sel.value]; if (!s) return; cv.width = s.w; cv.height = s.h; var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, s.w, s.h);
      if (!img) { info.textContent = 'Choose a picture first.'; dl.disabled = true; return; }
      var base = Math.max(s.w / img.width, s.h / img.height), k = base * parseFloat(zoom.value), w = img.width * k, h = img.height * k;
      var x = (s.w - w) * parseFloat(px.value) / 100, y = (s.h - h) * parseFloat(py.value) / 100;
      ctx.drawImage(img, x, y, w, h); dl.disabled = false; info.textContent = 'Result: ' + s.w + ' x ' + s.h + ' pixels. ' + s.note;
    };
    file.addEventListener('change', function () {
      var f = file.files[0]; if (!f) return; var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { img = im; draw(); URL.revokeObjectURL(u); }; im.onerror = function () { info.textContent = 'This file could not be read as a picture.'; }; im.src = u;
    });
    [sel, zoom, px, py].forEach(function (e) { e.addEventListener('input', draw); });
    dl.addEventListener('click', function () {
      var type = fmt.value === 'png' ? 'image/png' : 'image/jpeg'; var a = document.createElement('a'); a.download = 'resized.' + (fmt.value === 'png' ? 'png' : 'jpg');
      a.href = cv.toDataURL(type, 0.92); document.body.appendChild(a); a.click(); a.remove();
    });
    draw();
  }
})();
