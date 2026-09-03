# blotter.ts docs

Documentation site for [`blotter.ts`](https://github.com/dnhn/blotter), a TypeScript rewrite of [Blotter](https://github.com/bradley/Blotter), a JavaScript API for drawing unconventional text effects on the web.

## Stack

- [Astro 7](https://astro.build), static output, deployed to Cloudflare Pages
- [Tailwind CSS 4](https://tailwindcss.com), CSS-first tokens with a light and a dark theme
- `blotter.ts` + `three` for every live canvas, [Tweakpane](https://tweakpane.github.io/docs/) for the material controls, [CodeMirror](https://codemirror.net) for the playground
- [TypeDoc](https://typedoc.org) extracts the API signatures from the installed package; the prose lives in `src/data/api`
- [Pagefind](https://pagefind.app) builds the search index after `astro build`

## Development

```sh
pnpm install
pnpm dev        # http://localhost:4321 (search needs a build; use preview)
pnpm build      # astro build + pagefind → dist/
pnpm preview    # serve dist/
pnpm api        # regenerate src/generated/api.json after bumping blotter.ts
pnpm verify     # astro check + biome + strict build
```

## Credits

Blotter was created by [Bradley Griffith](http://bradley.computer). The five materials, the hero, the wordmark and the margin glitches are his; the site around them is new.
