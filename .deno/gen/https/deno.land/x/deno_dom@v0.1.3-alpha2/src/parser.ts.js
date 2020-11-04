export let parse = (_html) => {
    console.error("Error: deno-dom: No parser registered");
    Deno.exit(1);
};
export let parseFrag = (_html) => {
    console.error("Error: deno-dom: No parser registered");
    Deno.exit(1);
};
export function register(func, fragFunc) {
    parse = func;
    parseFrag = fragFunc;
}
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/https/deno.land/x/deno_dom@v0.1.3-alpha2/src/parser.ts.js.map