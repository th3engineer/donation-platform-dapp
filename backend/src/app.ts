import Koa from "koa";
import Router from "@koa/router";
import cors from "@koa/cors";
import helmet from "koa-helmet";
import bodyParser from "@koa/bodyparser";
import morgan from "koa-morgan";
import fs from "fs";

require("dotenv").config();

import { onError } from "./middlewares/error";
import { getAllDonations } from "./storage/donation";
import {
  Charity,
  getAllCharities,
  getCharityBySlug,
  patchCharity,
  PatchCharityDto,
  putCharity,
} from "./storage/charity";
import {
  PatchCampaignDto,
  getAllCampaigns,
  getCampaignById,
  patchCampaign,
  putCampaign,
  Campaign,
} from "./storage/campaign";
import { SignedPayload, verifyPayload } from "./utils/verify-signature";

const router = new Router();

const accessLogStream = fs.createWriteStream(__dirname + "/access.log", {
  flags: "a",
});

router.get("/campaigns", async (ctx) => {
  const campaigns = await getAllCampaigns();

  ctx.status = 200;
  ctx.body = {
    campaigns,
  };
});

router.get("/campaign/:id", async (ctx) => {
  const id = ctx.params.id as string;
  const campaign = await getCampaignById(id);

  if (!campaign) {
    ctx.status = 404;
    ctx.body = {
      error: "No campaign found",
    };
  }

  ctx.status = 200;
  ctx.body = campaign;
});

router.post("/campaign", async (ctx) => {
  const body = ctx.req.body as SignedPayload<Campaign>;

  const verifiedPayload = verifyPayload(body);

  if (!verifiedPayload.isValid) {
    ctx.status = 403;
    ctx.body = {
      error: "Signature is not valid",
    };
    return;
  }

  const { name, goal, deadline } = verifiedPayload.payload;

  if (!name || !goal || !deadline) {
    ctx.status = 400;
    ctx.body = {
      error: "Payload is not valid",
    };
    return;
  }

  const createdCampaign = await putCampaign(verifiedPayload.payload);

  ctx.status = 200;
  ctx.body = createdCampaign;
});

router.patch("/campaign", async (ctx) => {
  const body = ctx.req.body as SignedPayload<PatchCampaignDto>;

  const verifiedPayload = verifyPayload(body);

  if (!verifiedPayload.isValid) {
    ctx.status = 403;
    ctx.body = {
      error: "Signature is not valid",
    };
    return;
  }

  const { name, description, image_url, campaign_id } = verifiedPayload.payload;

  const updatedCampaign = await patchCampaign({
    name,
    description,
    image_url,
    campaign_id,
  });

  if (!updatedCampaign) {
    ctx.status = 404;
    ctx.body = {
      error: "No campaign found",
    };
    return;
  }

  ctx.status = 200;
  ctx.body = updatedCampaign;
});

router.get("/campaign/:id/latest-donations", async (ctx) => {
  const id = ctx.params.id as string;
  const campaign = await getCampaignById(id);

  if (!campaign) {
    ctx.status = 404;
    ctx.body = {
      error: "No campaign found",
    };
  }

  const donations = await getAllDonations();

  ctx.status = 200;
  ctx.body = {
    donations: donations.filter((donation) => donation.campaign_id === id),
  };
});

router.get("/charities", async (ctx) => {
  const charities = await getAllCharities();

  ctx.status = 200;
  ctx.body = {
    charities,
  };
});

router.get("/charity/:slug", async (ctx) => {
  const slug = ctx.params.slug as string;
  const charity = await getCharityBySlug(slug);

  if (!charity) {
    ctx.status = 404;
    ctx.body = {
      error: "No charity found",
    };
    return;
  }

  ctx.status = 200;
  ctx.body = charity;
});

router.post("/charity", async (ctx) => {
  const body = ctx.req.body as SignedPayload<Charity>;

  const verifiedPayload = verifyPayload(body);

  if (!verifiedPayload.isValid) {
    ctx.status = 403;
    ctx.body = {
      error: "Signature is not valid",
    };
    return;
  }

  const { name } = verifiedPayload.payload;

  if (!name) {
    ctx.status = 400;
    ctx.body = {
      error: "Payload is not valid",
    };
    return;
  }

  const createdCharity = await putCharity(verifiedPayload.payload);

  ctx.status = 200;
  ctx.body = createdCharity;
});

router.patch("/charity", async (ctx) => {
  const body = ctx.req.body as SignedPayload<PatchCharityDto>;

  const verifiedPayload = verifyPayload(body);

  if (!verifiedPayload.isValid) {
    ctx.status = 403;
    ctx.body = {
      error: "Signature is not valid",
    };
    return;
  }

  const { slug, name, description, image_url } = verifiedPayload.payload;

  const updatedCharity = await patchCharity({
    name,
    description,
    image_url,
    slug,
  });

  if (!updatedCharity) {
    ctx.status = 404;
    ctx.body = {
      error: "No charity found",
    };
    return;
  }

  ctx.status = 200;
  ctx.body = updatedCharity;
});

export const init = async () => {
  const app = new Koa();

  app.use(cors());
  app.use(morgan("combined", { stream: accessLogStream }));
  app.use(onError());
  app.use(helmet());
  app.use(bodyParser());

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};
