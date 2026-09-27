---
title: Forevermore
description: A platform for personalized animated gift worlds. Pick a scene, fill it with photos and a song, and send it like a message.
year: "2026"
period: "2026 — Present"
kind: personal
stack: [Nuxt 4, Tailwind CSS v4, Supabase, Cloudflare Workers, Three.js, Paddle]
links:
  live: https://getforevermore.co
featured: true
order: 1
preview:
  src: /projects/forevermore/preview.webp
  alt: "Forevermore: 'Create a world for someone you love.' beside three animated gift worlds fanned out like postcards"
  og: /projects/forevermore/og.png
---

Forevermore lets you send someone a small animated world. You pick a scene from a catalog (a fairground at night, a manor seen in cross-section, a coral reef), fill it with your own photos, a short letter and a song, and send it the way you'd send any message. The person on the other end opens a link on their phone. There's no account to create and nothing to install.

I design, build and ship it on my own, from the illustrations on the catalog cards to the Postgres migrations underneath.

::gallery{cols="4"}
:figure{src="/projects/forevermore/fairground.webp" alt="Hand-illustrated poster art for a ferris wheel world at night" caption="The Fairground" width="1200" height="1600"}
:figure{src="/projects/forevermore/small-world.webp" alt="Hand-illustrated poster art of a tiny green planet with houses, a windmill and a winding path, floating in a blue sky" caption="Small World" width="1200" height="1600"}
:figure{src="/projects/forevermore/deep-reef-dive.webp" alt="Hand-illustrated poster art of an underwater reef scene with a glowing pearl" caption="Deep Reef Dive" width="1200" height="1600"}
:figure{src="/projects/forevermore/up-we-go.webp" alt="Hand-illustrated poster art of a hot-air balloon rising over green hills and a river, with photo lanterns floating in a golden sky" caption="Up We Go" width="1200" height="1600"}
::

## How it's built

It's a pnpm monorepo with five apps and two shared packages. The apps are split by who's looking at the screen:

- a **marketing site**,
- an **editor**, where someone builds a gift and pays for it,
- a small **viewer** that shows the finished gift to the person receiving it,
- and two **internal tools** that no customer ever sees.

The customer-facing apps are Nuxt 4 on Cloudflare, with Supabase for Postgres, auth and file storage, and Paddle for payments. The worlds themselves are either Three.js scenes or 2D scenes built with SVG, CSS and GSAP. Both kinds read the same data contract, which is a big part of why a new editor feature doesn't mean updating dozens of worlds one by one.

## What the write-ups cover

When I started, I assumed the hard part would be the animation. It turned out to be the plumbing: giving every gift its own subdomain, making sure the browser can never mark a gift as paid, and building worlds in a way that doesn't turn each new one into a from-scratch project.

::link-card{title="Subdomains and permissions" description="A subdomain for every gift, and a Postgres permission model that keeps payment state out of the browser's reach." to="/projects/forevermore/architecture"}
::

::link-card{title="One payload, many worlds" description="One data contract for every world, videos that pretend to be photos, and 3D assets written as code." to="/projects/forevermore/rendering-pipeline"}
::

::link-card{title="A marketing pipeline built as a state machine" description="A separate content pipeline with compare-and-swap updates and every expensive dependency behind a seam." to="/projects/forevermore/autopilot"}
::
