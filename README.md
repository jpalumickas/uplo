# Uplo

Handle file uploads to different storage services like Amazon S3, Google Cloud
or etc. It also supports different type of ORM adapters, like Prisma.

## Features

* TypeScript ready
* Direct uploading to services
* Multiple services
* Different ORM adapters
* File analyzers

## Getting started

Add `@uplo/node` to your package.json

```sh
yarn add @uplo/node
```

Define uplo instance

```jsx
import uplo from '@uplo/node';
import PrismaAdapter from '@uplo/adapter-prisma';
import GCSService from '@uplo/service-gcs';

const config = {
  privateKey: process.env.APPLICATION_SECRET, // Used to sign direct upload keys
  signedIdExpiresIn: 60 * 60, // Time how much signed id is valid
};

const uploader = uplo({
  adapter: new PrismaAdapter({ prisma }),
  service: new GCSService({
    credentialsPath: path.resolve(
      __dirname,
      '../../config/gcp-credentials.json'
    ),
    bucket: process.env.GCS_BUCKET,
  }),
  config,
});
`

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).``
