"use strict";
const url = 'http://books.toscrape.com/';
try {
    const res = await fetch(url);
    const html = await res.text();
    console.log(html);
}
catch (error) {
    console.log(error);
}
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/file/home/runner/deno-web-scraper/app.ts.js.map