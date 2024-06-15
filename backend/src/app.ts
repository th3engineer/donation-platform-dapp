import Koa, { Context } from "koa";
import Router from "@koa/router";
import helmet from "koa-helmet";
import bodyParser from "@koa/bodyparser";
import morgan from "koa-morgan";
import fs from "fs";

import { onError } from "./middlewares";

const router = new Router();

const accessLogStream = fs.createWriteStream(__dirname + "/access.log", {
  flags: "a",
});

router.get("/", (ctx) => {
  ctx.status = 200;
  ctx.body = {
    success: true,
  };
});

export const init = async () => {
  const app = new Koa();

  app.use(morgan("combined", { stream: accessLogStream }));
  app.use(onError());
  app.use(helmet());
  app.use(bodyParser());

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};
