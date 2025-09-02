// ui.js
import { $, money, products, loadProducts, idStr } from './data.js';
import { addItem, removeItem, renderCart } from './cart.js';
import { openModal } from './gallery.js';
import { openCheckout } from './checkout.js';

export async function initUI(){
  await loadProducts();
  renderGrid();
  renderCart();

  // Grid checkbox toggle
  $('grid').addEventListener('change', (e)=>{
    if (!e.target.classList.contains('pick')) return;
    const card = e.target.closest('.card'); if (!card) return;
    const id = card.getAttribute('data-id');
    const p = products.find(x=>idStr(x.id)===idStr(id));
    if (!p) return;
    if (e.target.checked) addItem(p); else removeItem(id);
  });

  // Open product modal on card click (but not on checkbox)
  $('grid').addEventListener('click', (e)=>{
    if (e.target.closest('.pickwrap')) return;
    const card = e.target.closest('.card'); if (!card) return;
    const p = products.find(x=>idStr(x.id)===idStr(card.getAttribute('data-id')));
    if (p) openModal(p);
  });

  // Checkout button
  $('checkoutBtn').addEventListener('click', openCheckout);

  // re-render cart when others broadcast changes
  document.addEventListener('cart:changed', renderCart);
}

function renderGrid(){
  const cartIds = new Set((JSON.parse(localStorage.getItem('cart')||'[]')).map(x=>idStr(x.id)));
  $('grid').innerHTML = products.length ? products.map(p => `
    <article class="card" data-id="${idStr(p.id)}">
      <div class="pickwrap"><input type="checkbox" class="pick" ${cartIds.has(idStr(p.id))?'checked':''} title="Sélection rapide"></div>
      <div class="img"><img src="${p.cover}" alt="${p.name}"></div>
      <div class="small">ID: ${p.id}</div>
      <div style="font-weight:700">${p.name}</div>
      <div class="price">${money(p.price)}</div>
    </article>
  `).join('') : '<p class="small">Aucun produit. Éditez <code>products.json</code>.</p>';
}
