// import GCSService from '@uplo/service-gcs'

import { Hono } from 'hono';
import { dbMiddleware } from './middleware/dbMiddleware.js';
import { uploMiddleware } from './middleware/uploMiddleware.js';
import type { HonoEnv } from './types/hono.js';
import { imageUrlToBlobInput } from './utils/imageUrlToBlobInput.js';
import { createUploRouteHandler } from '@uplo/server/route-handler';

const app = new Hono<HonoEnv>();

app.use(dbMiddleware);
app.use(uploMiddleware);

app.get('/', (c) => c.text('Welcome to Uplo!'));

app.post('/attach-avatar', async (c) => {
  const blobInput = await imageUrlToBlobInput(
    'https://www.viewbug.com/media/mediafiles/2015/10/16/59560665_medium.jpg'
  );
  await c.get('uplo').attachments.user(1).avatar.attachFile(blobInput);

  return c.json({ success: true, message: 'Avatar attached' });
});

app.get('/avatar-url', async (c) => {
  const uplo = c.get('uplo');

  const userAttachment = await uplo.attachments.user(1).avatar.findOne();

  const avatarUrl = await userAttachment?.url();
  return c.json({ avatarUrl });
});

app.all('/uplo/*', async (c) => {
  const uplo = c.get('uplo');
  const handler = createUploRouteHandler({ uplo });

  return handler(c.req.raw);
});

export default app;
