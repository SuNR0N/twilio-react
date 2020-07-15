import Router from 'koa-router';
import { twiml } from 'twilio';

import { twilioService } from '../services/twilio-service';
import { PREFIX } from '../config';

export const callsRouter = new Router({ prefix: `${PREFIX}/calls` });

callsRouter.post('/', async (ctx) => {
  const { from, to, message } = ctx.request.body;

  const response = new twiml.VoiceResponse();
  response.say(message);

  const callInstance = await twilioService.calls.create({
    from,
    to,
    twiml: response.toString(),
  });

  ctx.body = callInstance;
});
