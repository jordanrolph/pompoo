# Pompoo

Built with Next.js, Tailwind, TypeScript, Prisma, and PostgreSQL.

## About this Project

Pompoo shows essential information about water quality at beaches along the coast in southern England.

### Purpose

My local water company, Southern Water, releases sewage into the sea. It is [national news](https://www.bbc.co.uk/news/science-environment-68665335), but it is unlikely to stop in the near future.

[Pompoo.org](https://pompoo.org) aggregates data from the Southern Water so you know when to swim, and when to avoid the sea.

### Functionality

Pompoo uses release data to show a straightforward _"Swim"_ or _"Don't Swim"_ status for each beach, helping you make an informed decision. It also aggegrates the all time release totals for each beach, which are some pretty big numbers.

For example, check out [Pompoo: Southsea East](https://pompoo.org/southsea-east). This beach was recently deemed [unsuitable for swimming](https://www.bbc.co.uk/news/uk-england-hampshire-67868695) by an Environment Agency spot test, but Pompoo will show you up-to-date information about the conditions.

I assume a beach is safe to swim if it hasn't been affected by a release in the last 24 hours. This heuristic is too simplistic, and unscientific... in the absence of proper water quality assessments and access to tidal or flow data, it's just a guess.

Southern Water does provide release data through their [Beachbuoy](https://www.southernwater.co.uk/water-for-life/beachbuoy/releasehistory) service, but their site is very slow and hard to use. They don't make tidal or flow data publicly available.

## Development

### Running the NextJS site

1. Add environment variables following the `.env.example` format.
2. Run `npm install`.
3. Run `npm run dev`.

### Running the worker

This handles the regular task of fetching new data, then updating the site.

`npm run script:run-worker-tasks`

This task takes a while to complete (~90s), so I run the worker on a cron schedule in a separate serverful environment outside of the Vercel context. When new data is fetched, the NextJS static pages are regenerated using an [On-Demand Revalidation](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration#using-on-demand-revalidation) webhook.

### Seeding data

You can seed data from the Beachbuoy API using this command:
`npm script:seed-historic-release-data`

The API is extremely slow and unreliable, so this script has automatic retry logic with an exponential backoff delay. You can tweak the settings, but I find fetching ~3 pages at a time is the most reliable.
