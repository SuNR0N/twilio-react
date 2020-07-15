import Router from 'koa-router';
import { jwt } from 'twilio';

import { PREFIX, TOKEN_TTL, TWILIO_ACCOUNT_SID, TWILIO_APP_SID, TWILIO_AUTH_TOKEN } from '../config';

export const tokenRouter = new Router({ prefix: `${PREFIX}/token` });

tokenRouter.post('/generate', (ctx) => {
  const capability = new jwt.ClientCapability({
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
    ttl: TOKEN_TTL,
  });
  capability.addScope(new jwt.ClientCapability.OutgoingClientScope({ applicationSid: TWILIO_APP_SID }));
  capability.addScope(new jwt.ClientCapability.IncomingClientScope('client'));

  const token = capability.toJwt();

  ctx.body = { token };
});
