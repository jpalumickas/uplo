# @uplo/analyzer

Core analyzer runner for [Uplo](https://uplo.js.org). Analyzers extract metadata from blobs (image dimensions, blurhash, etc.) and store it on the blob record.

## Installation

```sh
npm i @uplo/analyzer
```

## Usage

```ts
import { createAnalyzer } from '@uplo/analyzer'
import { imageAnalyzer } from '@uplo/analyzer-image'

const analyzer = createAnalyzer({
  analyzers: [imageAnalyzer()],
})
```

## Available analyzers

- [`@uplo/analyzer-image`](https://www.npmjs.com/package/@uplo/analyzer-image) — image width and height
- [`@uplo/analyzer-image-blurhash`](https://www.npmjs.com/package/@uplo/analyzer-image-blurhash) — image blurhash

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org).
