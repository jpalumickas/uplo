# @uplo/analyzer-image-blurhash

Blurhash analyzer for [Uplo](https://uplo.js.org). Stores image `blurhash` in blob metadata.

## Installation

```sh
npm i @uplo/analyzer-image-blurhash sharp
```

## Usage

```ts
import { createAnalyzer } from '@uplo/analyzer'
import { imageBlurhashAnalyzer } from '@uplo/analyzer-image-blurhash'

const analyzer = createAnalyzer({
  analyzers: [imageBlurhashAnalyzer()],
})
```

You can configure blurhash `size`, `xComponents` and `yComponents`:

```ts
const analyzer = createAnalyzer({
  analyzers: [
    imageBlurhashAnalyzer({
      size: 32,
      xComponents: 4,
      yComponents: 3,
    }),
  ],
})
```

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org/analyzers/image-blurhash).
