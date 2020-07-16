import Router from 'koa-router';
import { twiml } from 'twilio';

import { CLIENT_SCOPE, TWILIO_PHONE_NUMBER } from '../config';

export const hooksRouter = new Router({ prefix: '/hooks' });

hooksRouter.post('/call/connect', (ctx) => {
  const { phoneNumber } = ctx.request.body;
  const response = new twiml.VoiceResponse();

  const dial = response.dial({ callerId: TWILIO_PHONE_NUMBER });
  dial.number(phoneNumber);

  ctx.body = response.toString();
});

hooksRouter.post('/voice', (ctx) => {
  const response = new twiml.VoiceResponse();

  const dial = response.dial();
  dial.client(CLIENT_SCOPE);

  ctx.body = response.toString();
});
