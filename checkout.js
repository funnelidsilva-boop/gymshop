// checkout.js
import { $, money, GOOGLE_WEBHOOK_URL, WHATSAPP_NUMBER, getCart } from './data.js';

const $checkoutModal = $('checkoutModal'), $cName=$('c_name'), $cCity=$('c_city'), $cPhone=$('c_phone'), $cNote=$('c_note'), $cSummary=$('c_summary');

export function openCheckout(){
  const order = collectOrder();
  if (!order.items.length){ alert('Sélectionnez au moins un article.'); return; }
  const lines = order.items.map(i=>`${i.name} x${i.qty||1}`).join('\n');
  $cSummary.value = `${lines}\n\nTotal: ${money(order.total)}`;
  $checkoutModal.classList.add('open'); document.body.style.overflow='hidden';
}

export function closeCheckout(){
  $checkoutModal.classList.remove('open'); document.body.style.overflow='auto';
}

export function collectOrder(){
  const items = getCart();
  const rows = Array.from(document.querySelectorAll('#cartList .row'));
  const selected = rows.map(row=>{
    const i = Number(row.getAttribute('data-i'));
    const chk = row.querySelector('.chk');
    return chk && chk.checked ? items[i] : null;
  }).filter(Boolean);
  const total = selected.reduce((a,b)=>a + (b.price*(b.qty||1)), 0);
  return { customer:{ name:$cName.value.trim(), city:$cCity.value.trim(), phone:$cPhone.value.trim(), note:$cNote.value.trim() }, items:selected, total };
}

export function validateCustomer(c){ return c.name && c.city && /\d{6,}/.test((c.phone||'').replace(/\D/g,'')); }

// buttons
$('closeCheckout').addEventListener('click', closeCheckout);
$checkoutModal.addEventListener('click', e=>{ if (e.target === $checkoutModal) closeCheckout(); });
document.addEventListener('keydown', e=>{ if (e.key==='Escape') closeCheckout(); });

// actions
$('confirmCall').addEventListener('click', async ()=>{
  const order = collectOrder();
  if (!validateCustomer(order.customer)){ alert('Nom, Ville et Téléphone obligatoires (téléphone valide).'); return; }
  try{
    const res = await fetch(GOOGLE_WEBHOOK_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(order) });
    if (!res.ok) throw new Error('HTTP '+res.status);
    alert('✅ Commande envoyée. Nous vous rappellerons.');
    closeCheckout();
    localStorage.removeItem('cart');
    document.dispatchEvent(new CustomEvent('cart:changed'));
  }catch(err){ alert("❌ Échec d'envoi: "+err.message); }
});

$('confirmWhatsApp').addEventListener('click', ()=>{
  const order = collectOrder();
  if (!validateCustomer(order.customer)){ alert('Nom, Ville et Téléphone obligatoires (téléphone valide).'); return; }
  const names = order.items.map(x=>x.name).join(' + ');
  const prices = order.items.map(x=>x.price).join(' + ');
  const total = Number(order.total).toLocaleString('fr-MA');
  const msg = `Bonjour, je veux confirmer une commande :\n\nProduits : ${names}\nPrix : ${prices}\nTotal : ${total} DH\n\nNom : ${order.customer.name}\nVille : ${order.customer.city}\nTéléphone : ${order.customer.phone}\nNote : ${order.customer.note || '-'}`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url,'_blank');
  closeCheckout();
  // optional: clear cart on WhatsApp confirm
  // localStorage.removeItem('cart'); document.dispatchEvent(new CustomEvent('cart:changed'));
});
