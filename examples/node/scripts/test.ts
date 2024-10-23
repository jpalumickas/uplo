import { UploAnalyzer } from '@uplo/analyzer';
import ImageAnalyzer from '@uplo/analyzer-image';
import { blobStringInput } from '@uplo/node';
import { uplo } from '../src/uplo';

const analyzer = UploAnalyzer({
  analyzers: [ImageAnalyzer()],
});

const user1ID = 1;

(async () => {
  console.log('Starting');
  console.log('User 1');
  const avatar1 = await uplo.attachments.user(user1ID).avatar.findOne();
  console.log('  avatar', avatar1);
  const backgroundCovers = await uplo.attachments
    .user(user1ID)
    .backgroundCovers.findMany();
  console.log('  background covers', backgroundCovers);

  // const result = await uplo.attachments.user(user1ID).note.attachFile(
  //   await blobStringInput({
  //     content: 'test',
  //     contentType: 'text/plain',
  //     fileName: 'test.txt',
  //   })
  // );

  // console.log(result);
  // const noteBlob = await uplo.$findBlob(result.id);
  // console.log(noteBlob);

  const note = await uplo.attachments.user(user1ID).note.findOne();
  console.log('  note url', await note?.url());

  const avatarBlob = await uplo.$findBlob(9);
  console.log(avatarBlob);
  if (avatarBlob) {
    const avatarMetadata = await analyzer.analyze({ blob: avatarBlob });
    console.log('  avatar metadata', avatarMetadata);
  }
})();
