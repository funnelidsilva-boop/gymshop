// cart.js
import { $, idStr, money, products, getCart, setCart } from './data.js';

const $cartList = $('cartList');
const $cartTotal = $('cartTotal');
const $checkAll = $('checkAll');

export function addItem(p){
  const cart = getCart();
  const ex = cart.find(x => idStr(x.id) === idStr(p.id));
  if (ex) ex.qty = (ex.qty||1) + 1;
  else cart.push({ id:idStr(p.id), name:p.name, price:Number(p.price), currency:p.currency||'DH', qty:1, cover:p.cover||'' });
  setCart(cart);
  renderCart();
}

export function removeItem(id){
  setCart(getCart().filter(x => idStr(x.id) !== idStr(id)));
  renderCart();
}

export function renderCart(){
  const items = getCart();

  if (!items.length){
    $cartList.innerHTML = '<div class="small" style="padding:12px">Votre panier est vide.</div>';
    $checkAll.checked = false;
    $cartTotal.textContent = '0 DH';
    // reset all grid checkboxes so next order starts clean
    document.querySelectorAll('.card .pick').forEach(ch => ch.checked = false);
    return;
  }

  $cartList.innerHTML = items.map((p,i)=>`
    <div class="cartRow row" data-i="${i}">
      <input type="checkbox" class="chk" checked />
      <div style="display:flex;align-items:center;gap:8px">
        <div class="cartImg">${p.cover?`<img src="${p.cover}" alt="${p.name}">`:'—'}</div>
        <div><div style="font-weight:700;font-size:14px">${p.name}</div><div class="id small">ID: ${p.id}</div></div>
      </div>
      <div class="qty" style="display:flex;align-items:center;gap:6px">
        <button class="qtyBtn minus">−</button>
        <span>${p.qty||1}</span>
        <button class="qtyBtn plus">+</button>
      </div>
      <div class="price" style="font-weight:900">${money((p.qty||1)*p.price)}</div>
      <button class="delBtn del" title="Supprimer">✕</button>
    </div>
  `).join('');

  // sync grid checkboxes with cart
  const ids = new Set(items.map(x=>idStr(x.id)));
  document.querySelectorAll('.card').forEach(card=>{
    const pick = card.querySelector('.pick');
    if (pick) pick.checked = ids.has(idStr(card.getAttribute('data-id')));
  });

  syncSelectAll();
  updateCartTotal();
}

export function syncSelectAll(){
  const chks = Array.from(document.querySelectorAll('#cartList .chk'));
  $checkAll.checked = chks.length && chks.every(c => c.checked);
}

export function updateCartTotal(){
  const items = getCart();
  const rows = Array.from(document.querySelectorAll('#cartList .row'));
  const sum = rows.reduce((total, row)=>{
    const i = Number(row.getAttribute('data-i'));
    const chk = row.querySelector('.chk');
    if (!chk || !chk.checked) return total;
    const it = items[i];
    return total + (it.price * (it.qty||1));
  }, 0);
  $cartTotal.textContent = money(sum);
}

// cart events
$cartList.addEventListener('click', (e)=>{
  const row = e.target.closest('.row'); if (!row) return;
  const i = Number(row.getAttribute('data-i'));
  const items = getCart(); const it = items[i];

  if (e.target.classList.contains('plus')){ it.qty = (it.qty||1)+1; setCart(items); renderCart(); }
  if (e.target.classList.contains('minus')){ it.qty = Math.max(1,(it.qty||1)-1); setCart(items); renderCart(); }
  if (e.target.classList.contains('del')){
    const removedId = it.id; items.splice(i,1); setCart(items); renderCart();
    const cardPick = document.querySelector(`.card[data-id="${CSS.escape(idStr(removedId))}"] .pick`);
    if (cardPick) cardPick.checked = false;
  }
});
$cartList.addEventListener('change', (e)=>{ if (e.target.classList.contains('chk')){ updateCartTotal(); syncSelectAll(); } });
$checkAll.addEventListener('change', ()=>{ document.querySelectorAll('#cartList .chk').forEach(ch=>ch.checked=$checkAll.checked); updateCartTotal(); });
