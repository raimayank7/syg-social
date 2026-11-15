(function(){var d=window.EM_DATA||[],q=document.getElementById('em-q'),o=document.getElementById('em-out'),n=document.getElementById('em-n');if(!q)return;
function show(list){o.innerHTML=list.slice(0,150).map(function(x){return '<button type="button" data-copy="'+x[0]+'" title="'+x[1]+'" aria-label="Copy '+x[1]+'"><span class="e">'+x[0]+'</span><small>'+x[1]+'</small></button>';}).join('');
n.textContent=list.length>150?('First 150 of '+list.length+'. Type more to narrow.'):(list.length+' found');}
function run(){var v=q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);if(!v.length){show(d.slice(0,60));n.textContent='Showing 60 emoji. Type a word to search all '+d.length+'.';return;}
var r=d.filter(function(x){var t=(x[1]+' '+x[2]).toLowerCase();return v.every(function(w){return t.indexOf(w)>-1;});});
r.sort(function(a,b){var w=v[0];return (a[1].indexOf(w)===0?0:1)-(b[1].indexOf(w)===0?0:1);});show(r);}
q.addEventListener('input',run);run();})();