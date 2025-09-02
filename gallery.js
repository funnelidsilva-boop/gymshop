// gallery.js
import { $, money } from './data.js';
import { addItem } from './cart.js';

const $modal = $('modal'), $heroImg=$('heroImg'), $thumbs=$('thumbs');
const $mTitle=$('mTitle'), $mSku=$('mSku'), $mPrice=$('mPrice'), $mDesc=$('mDesc');
const $prev=$('prev'), $next=$('next'), $close=$('closeModal'), $add=$('addToCart'), $buy=$('buyNow');

let current=null, idx=0, currentImgs=[];

function setImgs(){
  currentImgs = (current && Array.isArray(current.images) && current.images.length ? current.images : [current.cover]).filter(Boolean);
  if (!currentImgs.length) currentImgs=[''];
}
function renderGallery(){
  setImgs();
  idx = Math.max(0, Math.min(idx, currentImgs.length-1));
  $heroImg.src = currentImgs[idx]; $heroImg.alt = `${current?.name||'Produit'} – image ${idx+1}`;
  $thumbs.innerHTML = currentImgs.map((src,i)=>`<img src="${src}" alt="miniature ${i+1}" data-i="${i}" class="${i===idx?'active':''}">`).join('');
}

export function openModal(p){
  current = p; idx = 0;
  $mTitle.textContent = p.name;
  $mSku.textContent = 'ID: '+p.id;
  $mPrice.textContent = money(p.price);
  $mDesc.textContent = p.desc || '';
  renderGallery();
  $modal.classList.add('open'); document.body.style.overflow='hidden';
}
function closeModal(){ $modal.classList.remove('open'); document.body.style.overflow='auto'; }

$thumbs.addEventListener('click', e=>{ const im=e.target.closest('img'); if(!im) return; idx=Number(im.dataset.i)||0; renderGallery(); });
$prev.addEventListener('click', ()=>{ if (!current) return; setImgs(); idx = (idx-1+currentImgs.length)%currentImgs.length; renderGallery(); });
$next.addEventListener('click', ()=>{ if (!current) return; setImgs(); idx = (idx+1)%currentImgs.length; renderGallery(); });
$add.addEventListener('click', ()=>{ if (current) addItem(current); });
$buy.addEventListener('click', ()=>{ if (current) addItem(current); });
$close.addEventListener('click', closeModal);
$modal.addEventListener('click', e=>{ if (e.target === $modal) closeModal(); });
document.addEventListener('keydown', e=>{ if (e.key==='Escape'){ closeModal(); } });
