---
title: Clairwire
description: Media monitoring for PR teams. Everything said about your clients in one place, and an alert when it matters.
year: "2026"
period: "2026 — Present"
kind: personal
stack: [Nuxt 4, NestJS, PostgreSQL, Redis, BullMQ, Prisma]
links:
  live: https://clairwire.com
featured: true
order: 2
preview:
  src: /projects/clairwire/preview.webp
  alt: "Clairwire: 'Every mention. Understood.' beside an analysis card showing sentiment, credibility and virality scores with a plain-language reason"
  og: /projects/clairwire/hero.png
---

Clairwire is a media monitoring tool for PR agencies and in-house comms teams. It collects everything said about the people and brands a team represents, from news sites, X, Bluesky, YouTube, Reddit, RSS feeds, blogs and a few other sources, and puts it all in one place for each client. When something needs attention, like a story that's picking up speed or a critical piece from an outlet people trust, it sends an alert.

Without a tool like this, keeping up with a client means saved searches on every platform, a lot of open tabs, and a real chance of missing the one post that matters. Clairwire replaces that with a single feed per client. Each mention is tagged with its sentiment, how credible the source is and how fast it's spreading, and each morning the team gets a short written summary of what happened and what, if anything, to do about it.

## What's under the hood

It's a TypeScript monorepo with three parts:

- a **NestJS API** that owns the Postgres database (through Prisma) and does all the background work,
- a **Nuxt 4 dashboard** that talks to the API over HTTP,
- a small **shared package** with the types both of them depend on.

Most of what the product does isn't triggered by someone clicking a button. Sources are polled on a schedule, new mentions get analyzed, alert rules get evaluated, and briefs get written before the team starts work. All of that runs as jobs on BullMQ queues backed by Redis. The HTTP API mostly reads the results and adds new jobs.

## The two problems worth writing about

Two parts of this turned out to be more interesting than any single integration.

The first is keeping a long list of very different platforms from turning the codebase into a long list of special cases. The answer was one strict data contract that every source has to produce, and a pipeline that never asks where a mention came from.

The second is relevance. A search result that contains your client's name isn't the same thing as a story about your client, and treating the two as equal quietly corrupts every number on the dashboard. Fixing that meant changing what the system counts, and then shipping the change without making months of history disappear.

::link-card{title="One contract, many sources" description="Adapters, capability flags, job queues, and an AI layer you can swap or mock." to="/projects/clairwire/architecture"}
::

::link-card{title="Relevance, not keyword hits" description="Deciding whether a mention is actually about a client, and migrating the data without emptying anyone's dashboard." to="/projects/clairwire/relevance"}
::
