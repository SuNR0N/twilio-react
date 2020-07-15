import Router from 'koa-router';

import { twilioService } from '../services/twilio-service';
import { PREFIX } from '../config';

export const messagesRouter = new Router({ prefix: `${PREFIX}/messages` });

messagesRouter.post('/', async (ctx) => {
  const { from, to, message } = ctx.request.body;

  const messageInstance = await twilioService.messages.create({
    from,
    to,
    body: message,
  });

  ctx.body = messageInstance;
});
