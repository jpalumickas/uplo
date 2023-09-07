import { uplo } from '../src/uplo';
import { blobStringInput } from '@uplo/node';

const user1ID = '31afe15c-5bb2-4390-9ecc-0b4bfaab1c88';
const user2ID = 'e63e7049-6052-46e5-9933-4568fe3075a7';

(async () => {
  console.log('Starting');
  console.log('User 1');
  const avatar1 = await uplo.attachments.user(user1ID).avatar.findOne();
  console.log('  avatar', avatar1);
  const backgroundCovers = await uplo.attachments
    .user(user1ID)
    .backgroundCovers.findMany();
  console.log('  background covers', backgroundCovers);

  const result = await uplo.attachments.user(user1ID).note.attachFile(
    await blobStringInput({
      content: 'test',
      contentType: 'text/plain',
      fileName: 'test.txt',
    })
  );

  console.log(result);

  const note = await uplo.attachments.user(user1ID).note.findOne();
  console.log('  note url', await note?.url());

  const noteBlob = await uplo.$findBlob('50dd6f74-9aa4-43ff-8b03-df624489a733');
  console.log(noteBlob);
})();
