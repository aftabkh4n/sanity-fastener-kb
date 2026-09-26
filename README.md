# Fastener Spec KB

A Sanity-powered knowledge base of metric hex fastener specifications, built for the DEV.to Sanity Challenge (Path One: an agent that queries structured content via the Sanity Context MCP server).

- **Sanity project ID:** `tko9cbz7`
- **Dataset:** `production` (public read)
- **Studio title:** Fastener Spec KB

## What the dataset models

The knowledge base captures **where DIN and ISO standards disagree** for metric hex fasteners. Modelling those disagreements explicitly is the whole point of the project.

Document types:

| Type | Purpose |
| --- | --- |
| `standard` | An issued standard (DIN 933, ISO 4017, …) with body, title, status and optional supersession reference. |
| `fastenerType` | Bolt, set screw, nut, or washer. |
| `propertyClass` | Mechanical/material class (8.8, 10.9, 12.9, A2-70, A4-80, …) with strength values and a compatible nut class. |
| `sizeSpec` | One document per nominal size **per standard**. This is deliberate: `sizeSpec` for `M12` under DIN 933 is a separate document from `sizeSpec` for `M12` under ISO 4017 so their dimensions can diverge. |
| `equivalence` | The showcase type. Describes how two standards relate (direct replacement, near equivalent, not interchangeable) and enumerates the concrete per-size differences that a customer or engineer needs to know. |

## Why equivalence documents exist

Distributors and engineers repeatedly hit questions like:

> "Can I ship DIN 933 M12 to a customer who ordered ISO 4017 M12?"

The thread and load path are the same, but the wrench size across flats differs on M10, M12, M14, and M22. A single equivalence document captures:

- the relationship between two standards,
- the specific attribute that diverges for each affected size,
- the practical impact ("requires a 19 mm spanner vs an 18 mm spanner").

An agent grounded in this dataset can answer the question deterministically and cite the exact size and value, instead of hallucinating.

## Getting started

```bash
npm install
npm run dev            # http://localhost:3333
```

## Seeding the dataset

The seed script creates the base standards, fastener types, property classes, `M6`–`M24` size specs for DIN 933 and ISO 4017, and the DIN 933 ↔ ISO 4017 equivalence document. All numeric dimensions are left empty and `verified` is set to `false`, **except** the four across-flats values that are the whole point of the demo. Fill the rest by hand against catalogue data and tick `verified`.

```bash
cp .env.example .env
# Edit .env and paste your write token (do not commit).
npm run seed
```

The script uses deterministic `_id` values and `createOrReplace`, so it is safely re-runnable.

To create a write token: <https://www.sanity.io/manage/project/tko9cbz7/api#tokens> → "Add API token" with **Editor** permission.

## Verifying the dataset is public

The public read setting lives at:

<https://www.sanity.io/manage/project/tko9cbz7/datasets>

The `production` row should show **Public**. To verify from the command line without a token:

```bash
curl "https://tko9cbz7.api.sanity.io/v2024-01-01/data/query/production?query=*%5B_type==%22standard%22%5D%5B0..2%5D%7Bcode,title%7D"
```

A `200` response with document data confirms public read access.

## Validating the schema

```bash
npx sanity schema validate
```

## Project structure

```
sanity.config.ts        Studio config (title, plugins, structure)
sanity.cli.ts           CLI project/dataset binding
schemaTypes/            Document type definitions
structure/              Custom desk structure
scripts/seed.ts         Idempotent dataset seeder
.env.example            Copy to .env and fill in a write token
```

## Not in this repo

The .NET agent that queries this dataset via the Sanity Context MCP server is a separate project.
