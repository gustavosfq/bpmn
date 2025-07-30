let elements = [];
let flows = [];
let selected = null;
let svg;

window.onload = () => {
  svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  document.getElementById('canvas').appendChild(svg);
};

function addNode(type){
  const el = document.createElement('div');
  el.className='node';
  el.textContent=type;
  el.style.left='100px';
  el.style.top='100px';
  el.dataset.id=Date.now()+'';
  el.dataset.type=type;
  el.onmousedown=dragStart;
  el.onclick=e=>{if(e.shiftKey){connectNode(el);} else {openModal(el);}}
  document.getElementById('canvas').appendChild(el);
  elements.push({id:el.dataset.id,type,name:type,x:100,y:100});
}

function dragStart(e){
  const el=e.target; selected=el; el.classList.add('selected');
  const offsetX=e.offsetX, offsetY=e.offsetY;
  function move(ev){el.style.left=(ev.pageX-offsetX)+'px';el.style.top=(ev.pageY-offsetY)+'px';updatePos(el);} 
  function up(){document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);el.classList.remove('selected');}
  document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
}

function updatePos(el){
  const elem = elements.find(i=>i.id===el.dataset.id);
  if(elem){ elem.x=parseInt(el.style.left); elem.y=parseInt(el.style.top); drawLines(); }
}

let connectFrom=null;
function connectNode(el){
  if(!connectFrom){ connectFrom=el; el.classList.add('selected'); return; }
  if(connectFrom===el){ connectFrom.classList.remove('selected'); connectFrom=null; return; }
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');
  line.dataset.from=connectFrom.dataset.id; line.dataset.to=el.dataset.id;
  line.setAttribute('stroke','white');
  svg.appendChild(line);
  flows.push({from:connectFrom.dataset.id,to:el.dataset.id});
  connectFrom.classList.remove('selected'); connectFrom=null; drawLines();
}

function drawLines(){
  const canvas=document.getElementById('canvas');
  const rect=canvas.getBoundingClientRect();
  [...svg.querySelectorAll('line')].forEach(l=>{
    const from=document.querySelector(`.node[data-id="${l.dataset.from}"]`);
    const to=document.querySelector(`.node[data-id="${l.dataset.to}"]`);
    if(from&&to){
      l.setAttribute('x1',from.offsetLeft+from.offsetWidth/2);
      l.setAttribute('y1',from.offsetTop+from.offsetHeight/2);
      l.setAttribute('x2',to.offsetLeft+to.offsetWidth/2);
      l.setAttribute('y2',to.offsetTop+to.offsetHeight/2);
    }
  });
}

let currentEl=null;
function openModal(el){
  currentEl=el;
  document.getElementById('m-id').value=el.dataset.id;
  document.getElementById('m-name').value=el.textContent;
  document.getElementById('m-type').value=el.dataset.type;
  document.getElementById('m-extra').value=JSON.stringify(elements.find(e=>e.id===el.dataset.id).extra||{},null,2);
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal(){document.getElementById('modal').classList.add('hidden');}
function saveModal(){
  const id=document.getElementById('m-id').value;
  const name=document.getElementById('m-name').value;
  const type=document.getElementById('m-type').value;
  const extra=JSON.parse(document.getElementById('m-extra').value||'{}');
  currentEl.dataset.id=id;currentEl.dataset.type=type;currentEl.textContent=name;
  const elem=elements.find(e=>e.id===id||e.id===currentEl.dataset.id);
  Object.assign(elem,{id,type,name,extra});
  closeModal();
}

function downloadJson(){
  const data={elements,flows};
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  a.download='diagram.json';a.click();
}

function loadJson(evt){
  const file=evt.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const data=JSON.parse(e.target.result);
    elements=[];flows=[];svg.innerHTML='';document.getElementById('canvas').innerHTML='';document.getElementById('canvas').appendChild(svg);
    data.elements.forEach(el=>{addNode(el.type);const div=document.querySelector('.node:last-child');div.style.left=el.x+'px';div.style.top=el.y+'px';div.dataset.id=el.id;div.textContent=el.name;updatePos(div);elements.find(e=>e.id===div.dataset.id).extra=el.extra;});
    data.flows.forEach(f=>{const from=document.querySelector(`.node[data-id="${f.from}"]`);const to=document.querySelector(`.node[data-id="${f.to}"]`);if(from&&to){connectFrom=from;connectNode(to);}});
  };
  reader.readAsText(file);
}
