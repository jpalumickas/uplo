# @uplo/analyzer-image

Image analyzer for [Uplo](https://uplo.js.org). Stores image `width` and `height` in blob metadata.

## Installation

```sh
npm i @uplo/analyzer-image sharp
```

## Usage

```ts
import { createAnalyzer } from '@uplo/analyzer'
import { imageAnalyzer } from '@uplo/analyzer-image'

const analyzer = createAnalyzer({
  analyzers: [imageAnalyzer()],
})
```

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org/analyzers/image).
