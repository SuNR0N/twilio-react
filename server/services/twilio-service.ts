import { Twilio } from 'twilio';

import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from '../config';

export const twilioService = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
