# Uplo

Handle file uploads to various storage services like Amazon S3, Google Cloud
or etc. It also supports various type of ORM adapters, like Prisma.

## Features

* TypeScript ready
* Direct uploads
* Supports multiple services
* Multiple ORM adapters
* File analyzers

## Getting started

Add `@uplo/node` to your package.json

```sh
yarn add @uplo/node
```

Install Adapter (for example Prisma)

```sh
yarn add @uplo/adapter-prisma dataloader
```

Install Service (for example S3)

```sh
yarn add @uplo/service-s3
```

Define uplo instance

```ts
import Uplo from '@uplo/node';
import PrismaAdapter from '@uplo/adapter-prisma';
import GCSService from '@uplo/service-gcs';

const config = {
  privateKey: process.env.APPLICATION_SECRET, // Used to sign direct upload keys
  signedIdExpiresIn: 60 * 60, // Time how long a Signed ID is valid
};

const uplo = Uplo({
  config,
  adapter: new PrismaAdapter({ prisma }),
  services: {
    s3: S3Service({
      isPublic: false,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      accessKeyId: '*****',
      secretAccessKey: '*****',
    }),
  },
  attachments: {
    user: {
      avatar: {
        validate: {
          contentType: /image\/*/
        }
      }
    },
    post: {
      images: { multiple: true }
    }
  },
});

const attachment = await uplo.attachments.user(123).avatar.attachFile(await blobFileInput({
  path: '/home/images/image.png'
}))
```

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
