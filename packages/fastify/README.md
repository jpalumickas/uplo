# @uplo/fastify

[Fastify](https://fastify.dev) plugin for [Uplo](https://uplo.js.org) — adds routes for direct uploads.

## Installation

```sh
npm i @uplo/fastify
```

## Usage

```ts
import fastify from 'fastify'
import { uploFastify } from '@uplo/fastify'
import { createUplo } from '@uplo/node'

const uplo = createUplo({
  // ... your uplo config
})

const app = fastify()
app.register(uploFastify, { uplo })
```

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org/server/fastify).
