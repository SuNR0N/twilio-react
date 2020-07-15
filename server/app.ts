import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import * as routers from './routers';

export const app = new Koa();

app.use(bodyParser());

Object.values(routers).forEach((router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});
