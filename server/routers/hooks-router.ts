import Router from 'koa-router';
import { twiml } from 'twilio';

import { CLIENT_SCOPE, TWILIO_PHONE_NUMBER } from '../config';

export const hooksRouter = new Router({ prefix: '/hooks' });

hooksRouter.post('/call/connect', (ctx) => {
  const { phoneNumber } = ctx.request.body;
  const response = new twiml.VoiceResponse();

  const dial = response.dial({ callerId: TWILIO_PHONE_NUMBER });
  dial.number(phoneNumber);

  const responseXML = response.toString();
  console.log(responseXML);

  ctx.body = responseXML;
});

hooksRouter.post('/voice', (ctx) => {
  const response = new twiml.VoiceResponse();

  const dial = response.dial();
  dial.client(CLIENT_SCOPE);

  const responseXML = response.toString();
  console.log(responseXML);

  ctx.body = responseXML;
});
