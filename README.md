# redonemini.com

My personal website and portfolio, with an About page, my work experience, and write-ups of the projects I've built.

Built with Nuxt 4, Nuxt Content, Tailwind CSS and shadcn-vue, and hosted on Cloudflare Pages. Every page is prerendered, so there's no database.

## Running it locally

Requires Node 22.13 or newer.

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build in dist/
npm run preview   # serve the build the same way Cloudflare does
```

## Content

Everything on the site comes from the `content/` folder:

- `profile.yml`: name, links and current role
- `about.md`: the intro on the About page
- `experience/`: one file per role
- `projects/<slug>/`: one folder per project. `index.md` is the overview, and numbered files like `1.architecture.md` are extra pages.

Project images go in `public/projects/<slug>/`.

## Deploying

The site deploys from this repo to Cloudflare Pages, with these build settings:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `NODE_VERSION` = `22`
