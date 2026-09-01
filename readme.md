# Blotter.ts docs

Documentation site for [`blotter.ts`](https://github.com/dnhn/blotter), a TypeScript rewrite of [Blotter](https://github.com/bradley/Blotter), a JavaScript API for drawing unconventional text effects on the web.

## Stack

- [Astro 7](https://astro.build)
- [Tailwind CSS 4](https://tailwindcss.com)
- `blotter.ts` + `three` for the demos, [Tweakpane](https://tweakpane.github.io/docs/) for controls, [CodeMirror](https://codemirror.net) for the playground

## Development

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static site in dist/
pnpm preview    # serve dist/
pnpm verify     # astro check + biome + build
```

## Credits

Blotter was created by [Bradley Griffith](http://bradley.computer); the site's content, typography and effects follow the [original documentation](https://blotter.js.org).
