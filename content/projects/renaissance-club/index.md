---
title: Renaissance Club
description: The member app and staff dashboard for a club that plans a surprise experience for its members every month.
year: "2024"
period: "2024 — Present"
kind: work
stack: [Nuxt 3, FastAPI, PostgreSQL, SQLAlchemy, Google Cloud, Stripe, Firebase Auth]
links:
  live: https://app.renaissanceclub.co
featured: true
order: 3
preview:
  src: /projects/renaissance-club/preview.webp
  srcDark: /projects/renaissance-club/preview-dark.webp
  alt: "The Renaissance Club emblem: two crossed arrows framing a lotus, crossed axes, a masquerade mask and a yin-yang symbol"
  og: /projects/renaissance-club/og.png
---

[Renaissance Club](https://renaissanceclub.co) is a membership club in Los Angeles and Orange County built on a simple promise: tell it when you're free, and it plans something for you. Each month, members pick three dates that work for them. The club finds an experience that fits, like a pottery class, a cooking lesson or a blacksmithing workshop, and reveals it a few days ahead. The member says yes or swaps it for something else. The membership covers the cost, so there's nothing to research, book or pay for on the day.

## My role

I build the platform at DataCose, where it has been my main project since September 2024. I work across all of it: the backend, the app members use, and the dashboard the club's team uses to run everything behind it. That included moving the club's day-to-day operations off Airtable and onto the new platform.

## What it does

For **members**, it's where the membership lives. They pick their dates each month, see what's been planned for them, confirm it, reschedule or swap it, and look back on everything they've done so far. They can connect with other members, RSVP to group meetups, nominate friends to join, and manage their plan and billing.

For **the club's team**, it's the tool they run the club with. They plan each member's month, manage the catalog of experiences and the vendors who host them, keep track of every booking from the first reveal to the day itself, and follow up with members when something needs an answer. Reminders, confirmations and updates go out to members by email and text automatically along the way.

## What it's built with

- **Backend:** Python and FastAPI, with PostgreSQL and SQLAlchemy.
- **Frontend:** Nuxt 3 and TypeScript, one app for members and staff.
- **Infrastructure:** Google Cloud (Cloud Run, Cloud SQL, Cloud Tasks), with Terraform.
- **Services:** Firebase Authentication for sign-in, Stripe for memberships and billing, Twilio for text messages and SendGrid for email.
