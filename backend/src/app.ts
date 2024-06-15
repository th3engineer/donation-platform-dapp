import Koa, { Context } from "koa";
import Router from "@koa/router";
import helmet from "koa-helmet";
import bodyParser from "@koa/bodyparser";
import morgan from "koa-morgan";
import fs from "fs";

import { onError } from "middlewares/error";
import { getAllCharities } from "storage/charity";
import { getAllCampaigns } from "storage/campaign";

const router = new Router();

const accessLogStream = fs.createWriteStream(__dirname + "/access.log", {
  flags: "a",
});

router.get('/get-active-campaigns', async (ctx) => {
  const campaigns = await getAllCampaigns()

  ctx.status = 200;
  ctx.body = {
    campaigns: campaigns.filter((_, index) => index % 3 === 0)
  }
})

router.get('/campaign/:id', async (ctx) => {
  const id = ctx.params.id as string;
  const campaigns = await getAllCampaigns()

  ctx.status = 200;
  ctx.body = {
    campaigns: campaigns.find((campaign) => campaign.campaign_id === id)
  }
})

router.get('/charity/:slug', async (ctx) => {
  const slug = ctx.params.slug as string;
  const charities = await getAllCharities()

  ctx.status = 200;
  ctx.body = {
    campaigns: charities.find((charity) => charity.slug === slug)
  }
})

router.get("/data", async (ctx) => {

  const charities = await getAllCharities()
  const campaigns = await getAllCampaigns()

  const data = charities.map(charity => ({ ...charity, campaigns: campaigns.filter(({ charity_slug }) => charity_slug === charity.slug)}))

  ctx.status = 200;
  ctx.body = {
    data,
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
