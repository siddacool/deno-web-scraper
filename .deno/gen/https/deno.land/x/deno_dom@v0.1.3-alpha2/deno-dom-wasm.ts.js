import init, { parse, parse_frag } from "./build/deno-wasm/deno-wasm.js";
import { register } from "./src/parser.ts";
await init();
register(parse, parse_frag);
export * from "./src/api.ts";
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/https/deno.land/x/deno_dom@v0.1.3-alpha2/deno-dom-wasm.ts.js.map