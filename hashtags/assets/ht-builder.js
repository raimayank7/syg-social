(function(){var d=window.HT_DATA||{},n=document.getElementById('hb-niche'),f=document.getElementById('hb-fest'),c=document.getElementById('hb-city'),k=document.getElementById('hb-count'),o=document.getElementById('hb-out'),cp=document.getElementById('hb-copy'),m=document.getElementById('hb-note');if(!n)return;
function opt(s,l,v){var e=document.createElement('option');e.value=v;e.textContent=l;s.appendChild(e);}
opt(n,'None','');opt(f,'None','');Object.keys(d.n).forEach(function(x){opt(n,d.n[x].t,x);});Object.keys(d.f).forEach(function(x){opt(f,d.f[x].t,x);});
function camel(s){return s.split(/[^A-Za-z0-9]+/).filter(Boolean).map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join('');}
function run(){var tags=[],lim=parseInt(k.value,10)||10;var city=camel(c.value||'');
if(n.value)d.n[n.value].g.forEach(function(g){tags=tags.concat(g.slice(0,4));});
if(city&&n.value){tags.unshift(city+camel(d.n[n.value].t.split(' ')[0]));}
if(city)tags.unshift(city);
if(f.value)d.f[f.value].g.forEach(function(g){tags=tags.concat(g.slice(0,3));});
var seen={},out=[];tags.forEach(function(t){var q=t.toLowerCase();if(!seen[q]){seen[q]=1;out.push(t);}});out=out.slice(0,lim);
o.value=out.map(function(t){return '#'+t;}).join(' ');m.textContent=out.length?out.length+' tags. Read them once and delete any that do not fit your post.':'Choose a subject or type a city.';}
[n,f,c,k].forEach(function(e){e.addEventListener('input',run);});cp.addEventListener('click',function(){if(o.value)SYG.copy(o.value);});run();})();