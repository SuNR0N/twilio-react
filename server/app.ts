import Koa from 'koa';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';

import * as routers from './routers';

export const app = new Koa();

app.use(bodyParser());
app.use(logger());

Object.values(routers).forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});
