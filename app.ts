import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

const url = 'http://books.toscrape.com/';

try {
  const res = await fetch(url);
  const html = await res.text();
  const doc: any = new DOMParser().parseFromString(html, 'text/html');
  const books: any = [];

  const productsPods = doc.querySelectorAll('.product_pod');

  productsPods.forEach((product: any) => {
    const title = product.querySelector('h3').querySelector('a').getAttribute('title');
    const price = product.querySelector('.price_color').textContent;
    const availability = product.querySelector('.availability').textContent.trim();

    books.push({
      title,
      price,
      availability,
    })
  });

  console.log(books);
} catch(error) {
  console.log(error);
}

