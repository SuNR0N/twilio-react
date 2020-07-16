import { app } from './app';
import { PORT } from './config';

app.listen(PORT, () => {
  console.info(`[twilio-react-server] listening on port: ${PORT}`);
});
