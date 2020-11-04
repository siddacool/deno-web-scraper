import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

const url = 'http://books.toscrape.com/';

try {
  const res = await fetch(url);
  const html = await res.text();
  const doc: any = new DOMParser().parseFromString(html, 'text/html');

  const pageHeader = doc.querySelector('.header').querySelector('.h1').textContent;

  console.log(pageHeader)
} catch(error) {
  console.log(error);
}

