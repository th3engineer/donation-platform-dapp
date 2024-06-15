// import {
//   GetCommand,
//   PutCommand,
//   PutCommandInput,
//   ScanCommand,
// } from "@aws-sdk/lib-dynamodb";

// import { docClient } from "../dynamodb";

export interface CampaignEntity {
  // On-chain
  campaign_id: string;
  charity_pda: string;
  deadline: string;
  goal: number;
  collected: number;
  created_at: number;

  // Off-chain
  name: string;
  description: string;
  imageUrl: string;
  status: string;
  charity_slug: string;
}

/*
  Mock data to be deleted
*/
const campaigns = Array.from<CampaignEntity>({ length: 25 })
  .fill(0 as unknown as CampaignEntity)
  .map<CampaignEntity>((_, index) => ({
    campaign_id: `id_${index}`,
    charity_pda: `charity_pda_${index}`,
    deadline: "Tomorrow",
    goal: index * 1000,
    collected: Math.random() > 0.5 ? index * 350 : 0,

    created_at: new Date().valueOf(),
    name: "Test Name Test",
    description:
      "Some long description Some long description Some long description Some long description Some long description Some long description",
    imageUrl: "",
    status: "Active",
    charity_slug: `slug_${index}`,
  }));
/*
  Mock data to be deleted
*/

export const getAllCampaigns = async () => {
  try {
    const params = {
      TableName: "Campaigns",
    };

    return campaigns;

    // const data = await docClient.send(new ScanCommand(params));

    // return (data.Items || []) as CampaignEntity[];
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const getCampaignById = async (slug: string) => {
  try {
    const params = {
      TableName: "Campaigns",
      Key: { slug },
    };

    return campaigns[0];

    // const data = await docClient.send(new GetCommand(params));

    // return data.Item as CampaignEntity;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const putCharity = async (entity: CampaignEntity) => {
  try {
    const params = {
      TableName: "Campaigns",
      Item: entity,
    };

    return entity;

    // await docClient.send(new PutCommand(params));
    // return entity;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const patchCharity = async (
  entity: Pick<CampaignEntity, "campaign_id"> &
    Partial<Omit<CampaignEntity, "campaign_id">>
) => {
  try {
    const campaign = await getCampaignById(entity.campaign_id);

    const updatedCampaign = { ...campaign, ...entity };

    return updatedCampaign;

    // const params: PutCommandInput = {
    //   TableName: "Campaigns",
    //   Item: updatedCampaign,
    // };

    // await docClient.send(new PutCommand(params));
    // return updatedCampaign as CampaignEntity;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};
