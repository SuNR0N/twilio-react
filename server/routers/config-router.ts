import Router from 'koa-router';

import { PREFIX, TWILIO_PHONE_NUMBER } from '../config';

export const configRouter = new Router({ prefix: `${PREFIX}/config` });

configRouter.get('/', (ctx) => {
  ctx.body = { phoneNumber: TWILIO_PHONE_NUMBER };
});
