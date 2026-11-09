// One curated argument, grounded in the synthetic source files. No relation inference.
const root = document.querySelector('#argument');
const decision = 'example/Data Management/Decision Image Master Format.md';
const specs = {
  information: [decision, 'An [[Archival Master]]'],
  format: [decision, 'TIFF is openly documented'],
  scanner: ['example/Sources/Scan Protocol 2025.md', '- Output:'],
  master: [decision, 'Archival masters of photographs'],
  copy: ['example/Data Management/Access Copy.md', 'An access copy is'],
  alternative: [decision, 'Keeping only high-quality'],
  scope: [decision, 'The decision covers'],
  audio: ['example/Projects/Project Overview Oral History Collection.md', '- [[Decision Image Master Format]] was checked']
};
let notes = new Map();
let active = '';
let ready = false;
const svgNS = 'http://www.w3.org/2000/svg';
/** Align connecting lines to the actual rendered button boundaries after evidence reflow. */
function draw() {
  const svg = document.querySelector('#connections');
  svg.replaceChildren();
  document.querySelector('.copy-label').textContent=root.clientWidth<768?'ableiten ↓':'ableiten';
  const frame = root.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${frame.width} ${frame.height}`);
  const defs = document.createElementNS(svgNS, 'defs');
  const marker = document.createElementNS(svgNS, 'marker');
  for (const [key,value] of Object.entries({id:'decision-arrow',viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'6',markerHeight:'6',orient:'auto'})) marker.setAttribute(key,value);
  const tip = document.createElementNS(svgNS,'path'); tip.setAttribute('d','M0 0 L10 5 L0 10z'); marker.append(tip);defs.append(marker);svg.append(defs);
  for (const [from,to] of [['information','master'],['format','master'],['scanner','master'],['master','copy']]) {
    const a = root.querySelector(`[data-key="${from}"] button`).getBoundingClientRect();
    const b = root.querySelector(`[data-key="${to}"] button`).getBoundingClientRect();
    const x1=a.right-frame.left, y1=a.top+a.height/2-frame.top;
    const x2=b.left-frame.left, y2=b.top+b.height/2-frame.top;
    const path=document.createElementNS(svgNS,'path');
    path.setAttribute('d',`M${x1} ${y1} C${(x1+x2)/2} ${y1},${(x1+x2)/2} ${y2},${x2} ${y2}`);
    path.setAttribute('marker-end','url(#decision-arrow)');svg.append(path);
  }
}
/** Show exactly one original passage at its selected object; source lines include frontmatter. */
function render(key) {
  root.querySelectorAll('.evidence').forEach(node=>node.remove());
  root.querySelectorAll('button').forEach(button=>{button.setAttribute('aria-expanded','false');button.removeAttribute('aria-controls');});
  active = Object.hasOwn(specs, key) ? key : '';
  if (active && ready) {
    const [id,prefix] = specs[active]; const note = notes.get(id);
    const lines=note.text.split('\n'); const index=lines.findIndex(line=>line.includes(prefix));
    if(index<0) throw new Error('Required evidence passage missing');
    const object=root.querySelector(`[data-key="${active}"]`);
    const evidence=document.createElement('div');evidence.className='evidence';evidence.id='selected-evidence';evidence.setAttribute('role','region');evidence.setAttribute('aria-label','Originalbeleg');
    const quote=document.createElement('blockquote');quote.lang='en';quote.textContent=lines[index].replace(/^[-*] /,'').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,target,label)=>label||target);
    const link=document.createElement('a');link.href=id;link.textContent=note.title;
    const line=document.createElement('span');line.className='line-label';line.textContent=`Original, Zeile ${index+1}`;
    evidence.append(quote,link,line);object.append(evidence);
    const button=object.querySelector('button');button.setAttribute('aria-expanded','true');button.setAttribute('aria-controls','selected-evidence');
  }
  requestAnimationFrame(draw);
}
function select(key) { if(ready)location.hash=active===key?'':key; }
for(const button of root.querySelectorAll('button')) {
  const key=button.closest('[data-key]').dataset.key;
  button.addEventListener('click',()=>select(key));

}
root.addEventListener('keydown',event=>{
  if(event.key==='Escape' && active){
    event.preventDefault();const button=root.querySelector(`[data-key="${active}"] button`);
    history.replaceState(null,'',location.pathname+location.search);render('');button.focus();
  }
});
window.addEventListener('hashchange',()=>render(decodeURIComponent(location.hash.slice(1))));
new ResizeObserver(draw).observe(root);
try {
  const response=await fetch('explorer.json');if(!response.ok)throw new Error('data');
  const data=await response.json();notes=new Map(data.nodes.map(note=>[note.id,note]));
  // Fetch the public synthetic originals to retain exact frontmatter-inclusive line numbers.
  await Promise.all([...new Set(Object.values(specs).map(([id])=>id))].map(async id=>{
    const source=await fetch(id);if(!source.ok||!notes.has(id))throw new Error('source');
    notes.get(id).text=(await source.text()).replace(/\r\n/g,'\n');
  }));
  ready=true;
  render(decodeURIComponent(location.hash.slice(1)));
} catch {
  document.querySelector('#load-error').hidden=false;
  root.querySelectorAll('button').forEach(button=>button.disabled=true);
}
