(function(){var d=window.RL_DATA,s=document.getElementById('rp-niche'),b=document.getElementById('rp-go'),o=document.getElementById('rp-out');if(!s)return;
Object.keys(d.n).forEach(function(k){var e=document.createElement('option');e.value=k;e.textContent=d.n[k].t;s.appendChild(e);});
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function go(){var n=d.n[s.value||pick(Object.keys(d.n))],i=pick(n.i),h=pick(d.h);
o.innerHTML='<p class="hint">'+SYG.esc(n.t)+'</p><h2 style="margin:.2em 0">'+SYG.esc(i[0])+'</h2><p>'+SYG.esc(i[1])+'</p><p><b>Start with a hook:</b> '+SYG.esc(h)+'</p><div class="acts"><button class="btn sm" id="rp-copy" type="button">Copy this idea</button></div>';
document.getElementById('rp-copy').onclick=function(){SYG.copy(i[0]+'. '+i[1]+' Hook: '+h);};}
b.addEventListener('click',go);go();})();