// Read-only, synthetic knowledge workspace. Literal links and their source passages are evidence;
// graph position, folder membership and connectivity make no claim about a note's meaning.
import { renderMarkdown, slug } from './markdown.js';
import { normalizeSearch, readExplorerRoute, explorerHref } from './explorer-route.js';

const de = new URLSearchParams(location.search).get('lang') === 'de';
const t = de ? {
  title:'Wissens-Explorer', provenance:'Synthetisches Beispiel. Forschungsdatenmanagement. nur lesend', method:'Methode', explorer:'Wissen erkunden', find:'Notiz suchen', placeholder:'Titel oder Text', folder:'Ordner', allFolders:'Alle Ordner', show:'Anzeigen', all:'Alle Notizen', unresolved:'Ungelöste Verweise', isolated:'Ohne Verbindungen', cross:'Ordnerübergreifende Links', notes:'Notizen', context:'Verlinkter Kontext', key:'Pfeile folgen den geschriebenen Links. Eine Notiz auswählen, um sie zu lesen.', incoming:'Verweist hierher', outgoing:'Verweist auf', evidence:'Linkbelege', missing:'Im Beispiel nicht enthalten', empty:'Keine passende Notiz. Suche oder Filter ändern.', filtered:'Die geöffnete Notiz liegt außerhalb des Filters.', noLinks:'Diese Notiz hat im Beispiel keine ein- oder ausgehenden Links. Das ist ein Prüfanlass, kein Qualitätsurteil.', noOut:'Keine ausgehenden Links.', noIn:'Keine eingehenden Links.', line:'Zeile', error:'Die Beispieldaten konnten nicht geladen werden. Bitte die Seite neu laden.', original:'Originaldatei', notFound:'Diese Notiz ist nicht im Beispiel enthalten. Eine Notiz aus der Liste wählen.', searchResults:'passende Notizen', reset:'Filter zurücksetzen', image:'Bildformat verstehen', audio:'Übertragung auf Audio prüfen', care:'Offene Verweise prüfen', skip:'Zur ausgewählten Notiz', note:'Auswahl', bodyLanguage:'Die Beispielnotizen bleiben im englischen Original.'
} : {
  title:'Knowledge explorer', provenance:'Synthetic example. research data management. read only', method:'Method', explorer:'Explore knowledge', find:'Find a note', placeholder:'Title or text', folder:'Folder', allFolders:'All folders', show:'Show', all:'All notes', unresolved:'Unresolved references', isolated:'Without links', cross:'Links across folders', notes:'Notes', context:'Linked context', key:'Arrows follow the written links. Select a note to read it.', incoming:'Links here', outgoing:'Links to', evidence:'Link evidence', missing:'Not included in this example', empty:'No matching note. Change the search or filters.', filtered:'The open note is outside the filter.', noLinks:'This note has no incoming or outgoing links in the example. This is a review candidate, not a quality judgement.', noOut:'No outgoing links.', noIn:'No incoming links.', line:'Line', error:'The example data could not be loaded. Please reload the page.', original:'Original file', notFound:'This note is not included in the example. Choose a note from the list.', searchResults:'matching notes', reset:'Reset filters', image:'Understand the image format decision', audio:'Check transfer to audio', care:'Inspect unresolved references', skip:'Skip to selected note', note:'Selected', bodyLanguage:''
};
const $ = (id) => document.getElementById(id);
const data = { nodes:[], links:[], unresolved:[], components:[] };
let byId = new Map();
let stems = new Map();
function el(tag, text='', attrs={}) {
  const node=document.createElement(tag); node.textContent=text;
  for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
  return node;
}
function route() {
  const fallback = data.nodes.find(n => n.title === 'Decision Image Master Format')?.id || data.nodes[0]?.id || '';
  return readExplorerRoute(location.hash, fallback);
}
function href(note, heading = '', changes = {}) {
  return explorerHref(route(), note, heading, changes);
}

function noteLink(id,label='',heading='') { return el('a',label||byId.get(id)?.title||id,{href:href(id,heading)}); }
function relations(id) { return { incoming:data.links.filter(l=>l.target===id && l.source!==id), outgoing:data.links.filter(l=>l.source===id) }; }
function matched(state) {
  return data.nodes.filter(n=>{
    if(state.query && !n.search.includes(normalizeSearch(state.query))) return false;
    if(state.domain && n.domain!==state.domain) return false;
    if(state.lens==='unresolved') return data.unresolved.some(l=>l.source===n.id);
    const r=relations(n.id);
    if(state.lens==='isolated') return !r.incoming.length&&!r.outgoing.length;
    if(state.lens==='cross') return [...r.incoming,...r.outgoing].some(l=>byId.get(l.source)?.domain!==byId.get(l.target)?.domain);
    return true;
  });
}
function filters() {
  const s=route();
  const next=href(s.note,'',{q:$('search').value,folder:$('domain').value,show:$('lens').value==='all'?'':$('lens').value});
  history.replaceState(null,'',next); render(false);
}
function renderList(state) {
  const found=matched(state); const list=$('note-list'); list.replaceChildren();
  $('search').value=state.query; $('domain').value=state.domain; $('lens').value=state.lens;
  $('results-status').textContent=(state.query||state.domain||state.lens!=='all') ? (found.length ? `${found.length} ${t.searchResults}`:t.empty) : '';
  for(const note of found) {
    const link=noteLink(note.id); if(note.id===state.note) link.setAttribute('aria-current','true');
    list.append(el('li')); list.lastChild.append(link);
  }
  if(!found.length) { const button=el('button',t.reset,{type:'button',class:'pill'}); button.addEventListener('click',()=>{ $('search').value='';$('domain').value='';$('lens').value='all';filters();}); list.append(el('li')); list.lastChild.append(button); }
  return found;
}
function renderReader(state,found) {
  const note=byId.get(state.note); $('note-body').replaceChildren(); $('evidence').replaceChildren();
  if(!note) { $('note-title').textContent=t.notFound; $('note-location').textContent=''; return; }
  $('note-title').textContent=note.title;
  $('note-location').replaceChildren(el('span',note.domain+'. '),el('a',t.original,{href:note.path}));
  if(!found.some(n=>n.id===note.id)) $('note-location').append(el('span','. '+t.filtered));
  const body=note.body.replace(/^\s*#\s+[^\n]+\n/, '').replace(/^(#{2,6}) /gm, (_, hashes) => hashes.slice(1) + ' ');
  $('note-body').innerHTML=renderMarkdown(body,{file:note.id,resolve:name=>stems.get(name)||'',href:(id,heading)=>href(id,heading)});
  const r=relations(note.id); const missing=data.unresolved.filter(l=>l.source===note.id);
  if(!r.incoming.length&&!r.outgoing.length) $('evidence').append(el('p',t.noLinks,{class:'care-note'}));
  for(const [direction,links] of [[t.outgoing,r.outgoing],[t.incoming,r.incoming]]) {
    if(!links.length) continue;
    $('evidence').append(el('h3',direction));
    for(const link of links) {
      const other=link.source===note.id?link.target:link.source;
      const item=el('div','',{class:'relation'}); item.append(noteLink(other));
      for(const occurrence of link.occurrences) {
        const quote=el('blockquote',occurrence.excerpt); const line=el('span',`${t.line} ${occurrence.line}`);
        line.className='line'; item.append(line,quote);
      }
      $('evidence').append(item);
    }
  }
  if(missing.length) {
    $('evidence').append(el('h3',t.missing));
    for(const link of missing) {
      const item=el('div','',{class:'relation'}); item.append(el('strong',link.target));
      for(const occurrence of link.occurrences) item.append(el('span',`. ${t.line} ${occurrence.line}`,{class:'line'}),el('blockquote',occurrence.excerpt));
      $('evidence').append(item);
    }
  }
  if(state.heading) {
    const target=$('note-body').querySelector(`[id="${CSS.escape(slug(state.heading))}"]`);
    if(target) target.scrollIntoView({block:'nearest'});
  }
}
function svgNode(tag,attrs={}) { const node=document.createElementNS('http://www.w3.org/2000/svg',tag); for(const [k,v] of Object.entries(attrs)) node.setAttribute(k,v); return node; }
function wrapped(title,limit=19) {
  const lines=['']; for(const word of title.split(' ')) { const i=lines.length-1;if((lines[i]+' '+word).trim().length>limit&&lines[i]) lines.push(word); else lines[i]+=(lines[i]?' ':'')+word; } return lines;
}
function renderGraph(state) {
  const host=$('context-graph'); host.replaceChildren(); const note=byId.get(state.note);if(!note)return;
  const r=relations(note.id); const incoming=[...new Set(r.incoming.map(l=>l.source))]; const outgoing=[...new Set(r.outgoing.map(l=>l.target))].filter(id=>id!==note.id);
  const count=Math.max(incoming.length,outgoing.length,1); const height=Math.max(300,80+count*105);
  const svg=svgNode('svg',{viewBox:`0 0 720 ${height}`,role:'group','aria-label':`${t.context}: ${note.title}`});
  const defs=svgNode('defs');const marker=svgNode('marker',{id:'arrow',viewBox:'0 0 10 10',refX:'10',refY:'5',markerWidth:'6',markerHeight:'6',orient:'auto-start-reverse'});marker.append(svgNode('path',{d:'M 0 0 L 10 5 L 0 10 z'}));defs.append(marker);svg.append(defs);
  const label=(text,x)=>{const n=svgNode('text',{x,y:25,class:'graph-label'});n.textContent=text;svg.append(n);};label(t.incoming,115);label(t.note,360);label(t.outgoing,605);
  const cy=height/2;
  function edge(x1,y1,x2,y2) { svg.append(svgNode('path',{d:`M${x1} ${y1} C${(x1+x2)/2} ${y1},${(x1+x2)/2} ${y2},${x2} ${y2}`,class:'graph-edge','marker-end':'url(#arrow)'})); }
  for(let i=0;i<incoming.length;i++) edge(215,80+i*105,260,cy);
  for(let i=0;i<outgoing.length;i++) edge(460,cy,505,80+i*105);
  function node(id,x,y,selected=false) {
    const note=byId.get(id);const lines=wrapped(note.title); const h=Math.max(58,lines.length*21+18);
    const a=svgNode('a',{href:href(id),class:'graph-node'+(selected?' selected':''),'aria-label':note.title,tabindex:'0'});
    a.append(svgNode('rect',{x:x-100,y:y-h/2,width:200,height:h,rx:12}));
    const text=svgNode('text',{x,y:y-(lines.length-1)*10.5});lines.forEach((line,i)=>{const span=svgNode('tspan',{x,dy:i?21:0});span.textContent=line;text.append(span);});a.append(text);
    a.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();location.hash=href(id).slice(1);}});svg.append(a);
  }
  incoming.forEach((id,i)=>node(id,115,80+i*105)); outgoing.forEach((id,i)=>node(id,605,80+i*105));node(note.id,360,cy,true);
  host.append(svg);
}
function render(moveFocus=true) {
  const state=route(); $('language-switch').href='?lang='+(de?'en':'de')+location.hash; const found=renderList(state);renderReader(state,found);renderGraph(state);
  if(moveFocus) { $('note-title').focus({preventScroll:true}); if(document.querySelector('.explorer-shell').clientWidth < 768) { document.querySelector('.note-browser').open=false; $('reader').scrollIntoView({block:'start'}); } }
}
function init() {
  document.documentElement.lang=de?'de':'en';document.title=t.title+'. Second Brain Vault';
  for(const [id,text] of Object.entries({'page-title':t.title,'provenance':t.provenance+(de?'. '+t.bodyLanguage:''),'search-label':t.find,'domain-label':t.folder,'lens-label':t.show,'browser-summary':t.notes,'context-title':t.context,'graph-key':t.key})) $(id).textContent=text;
  document.querySelector('.skip').textContent=t.skip;document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault(); $('note-title').focus(); $('reader').scrollIntoView({block:'start'});});$('search').placeholder=t.placeholder;
  const method=el('a',t.method,{href:'index.html'+(de?'?lang=de':'')}); const nav=el('nav','',{'aria-label':'Second Brain Vault',class:'site-nav'});const ul=el('ul');ul.append(el('li'),el('li'));ul.children[0].append(method);ul.children[1].append(el('a',t.explorer,{href:'explorer.html'+(de?'?lang=de':''),'aria-current':'page'}));nav.append(ul);
  const brand=el('a','',{class:'brand',href:'index.html'+(de?'?lang=de':'')});const image=el('img','',{src:'assets/dhcraft-mark-white.svg',alt:'',width:'28',height:'28'});brand.append(image,el('span','Second Brain Vault'));
  const lang=el('a',de?'EN':'DE',{href:'?lang='+(de?'en':'de')+location.hash,id:'language-switch',lang:de?'en':'de','aria-label':de?'Switch to English':'Auf Deutsch wechseln'});$('explorer-head').append(brand,nav,lang);
  const options=[t.all,t.unresolved,t.isolated,t.cross];[...$('lens').options].forEach((o,i)=>o.textContent=options[i]);$('domain').options[0].textContent=t.allFolders;
  $('search-form').addEventListener('submit',event=>event.preventDefault());$('search').addEventListener('input',filters);$('domain').addEventListener('change',filters);$('lens').addEventListener('change',filters);
  const back=el('button',de?'Zur Notizliste':'Back to notes',{type:'button',class:'return-notes'}); back.addEventListener('click',()=>{document.querySelector('.note-browser').open=true;document.querySelector('.note-browser summary').focus();document.querySelector('.note-browser').scrollIntoView({block:'start'});}); $('reader').prepend(back);
  window.addEventListener('hashchange',()=>render());
}
init();
try {
  const response=await fetch('explorer.json');if(!response.ok)throw new Error('load');
  Object.assign(data,await response.json());if(data.schemaVersion!==1||!data.nodes.length)throw new Error('schema');
  byId=new Map(data.nodes.map(n=>[n.id,n]));stems=new Map(data.nodes.map(n=>[n.path.split('/').pop().replace(/\.md$/,''),n.id]));
  for(const domain of [...new Set(data.nodes.map(n=>n.domain))].sort()) $('domain').append(el('option',domain,{value:domain}));
  const tasks=el('nav','',{class:'explorer-tasks','aria-label':de?'Einstiege':'Starting points'});
  for(const [label,title,lens] of [[t.image,'Decision Image Master Format',''],[t.audio,'Project Overview Oral History Collection',''],[t.care,'Project Overview Photo Archive','unresolved']]) {
    const note=data.nodes.find(n=>n.title===title);if(note)tasks.append(el('a',label,{href:href(note.id,'',{show:lens,q:'',folder:''})}));
  }
  $('search-form').before(tasks); if(document.querySelector('.explorer-shell').clientWidth<768)document.querySelector('.note-browser').open=false; render(false);
} catch {
  $('load-error').hidden=false;$('load-error').textContent=t.error;$('note-title').textContent=t.error;$('search-form').hidden=true;document.querySelector('.explorer-workspace').hidden=true;
}
