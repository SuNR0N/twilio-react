import { app } from './app';
import { PORT } from './config';

app.listen(PORT, () => {
  console.info(`Server is listening on port: ${PORT}`);
});
