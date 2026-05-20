# @uplo/service-gcs

Google Cloud Storage service for [Uplo](https://uplo.js.org).

## Installation

```sh
npm i @uplo/service-gcs
```

## Usage

```ts
import { createGCSService } from '@uplo/service-gcs'

const uplo = createUplo({
  services: {
    google: createGCSService({
      isPublic: false,
      credentialsPath: path.resolve(__dirname, './config/gcp-credentials.json'),
      bucket: process.env.GCS_BUCKET,
    }),
  },
})
```

## Authentication

The service forwards auth options to `@google-cloud/storage`. Pick one:

### Key file path

```ts
createGCSService({
  bucket: process.env.GCS_BUCKET,
  credentialsPath: '/path/to/gcp-credentials.json',
})
```

### Inline credentials

```ts
createGCSService({
  bucket: process.env.GCS_BUCKET,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY,
  },
  projectId: process.env.GCP_PROJECT_ID,
})
```

### Application Default Credentials (ADC)

Pass no credentials. The SDK auto-discovers from `GOOGLE_APPLICATION_CREDENTIALS`, gcloud user creds, or the workload's attached service account (Cloud Run, GKE, GCE, Cloud Functions).

```ts
createGCSService({
  bucket: process.env.GCS_BUCKET,
})
```

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org/services/gcs).
