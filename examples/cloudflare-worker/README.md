# Uplo Cloudflare Workers Example

Cloudflare Workers + Hono + Neon Postgres + Drizzle Adapter + Cloudflare R2

## Requirements

- [Neon database](https://neon.tech)

## Usage

Create `.dev.vars` file:

```text
R2_ACCOUNT_ID=""
R2_BUCKET=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
DATABASE_URL=""
UPLO_SECRET_TOKEN=""
```

`UPLO_SECRET_TOKEN` must be at least 32 bytes. Generate one with
`openssl rand -base64 32`.
