// data.js
export const GOOGLE_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbyV_W4NgzLd7YGmQCju7ooxXRIhwCgoq45v8Da1uY3byiDoSi5cYOvvPl1hncheJIRj/exec';
export const WHATSAPP_NUMBER = '212623126364'; // no '+'

export let products = [];
export function setProducts(arr){ products = Array.isArray(arr) ? arr : []; }

export const idStr = v => String(v);
export const money = n => Number(n||0).toLocaleString('fr-MA') + ' DH';

export const $ = id => document.getElementById(id);

// storage
export function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
export function setCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }

// fetch products.json
export async function loadProducts(){
  try{
    const res = await fetch('products.json', { cache: 'no-store' });
    setProducts(await res.json());
  }catch(e){
    console.error('products.json error', e);
    setProducts([]);
  }
}
