import { createUplo } from '@uplo/server'
import { createS3Service } from '@uplo/service-s3'

const uplo = createUplo({
  config: {},
  services: {
    s3: createS3Service({}),
  },
  attachments: {
    user: {
      avatar: true,
    },
  },
})

console.log(uplo.attachments.user(1).avatar)
