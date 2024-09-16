import Uplo from '@uplo/server';
import S3Service from '@uplo/service-s3';

const uplo = Uplo({
  config: {},
  services: {
    s3: S3Service({}),
  },
  attachments: {
    user: {
      avatar: true,
    },
  },
});

console.log(uplo.attachments.user(1).avatar);
