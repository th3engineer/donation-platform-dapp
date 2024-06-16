import {
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

import { docClient } from "../../dynamodb";
import { Campaign, PatchCampaignDto } from "./campaign.types";

export const getAllCampaigns = async (): Promise<Campaign[]> => {
  try {
    const params: ScanCommandInput = {
      TableName: "Campaigns",
    };

    const data = await docClient.send(new ScanCommand(params));

    return (data.Items || []) as Campaign[];
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    const params: GetCommandInput = {
      TableName: "Campaigns",
      Key: { campaign_id: id },
    };

    const data = await docClient.send(new GetCommand(params));

    return (data.Item as Campaign) || null;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const putCampaign = async (entity: Campaign): Promise<Campaign> => {
  try {
    const params: PutCommandInput = {
      TableName: "Campaigns",
      Item: entity,
    };

    const data = await docClient.send(new PutCommand(params));

    return data.Attributes as Campaign;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const patchCampaign = async (
  entity: PatchCampaignDto
): Promise<Campaign | null> => {
  try {
    const { campaign_id, ...attributes } = entity;

    let UpdateExpression = "set";
    const ExpressionAttributeValues: Record<string, string> = {};

    if (attributes.name) {
      UpdateExpression += " #name = :name,";
      ExpressionAttributeValues[":name"] = attributes.name;
    }
    if (attributes.description) {
      UpdateExpression += " #description = :description,";
      ExpressionAttributeValues[":description"] = attributes.description;
    }
    if (attributes.image_url) {
      UpdateExpression += " #image_url = :image_url,";
      ExpressionAttributeValues[":image_url"] = attributes.image_url;
    }

    UpdateExpression = UpdateExpression.slice(0, -1);

    const params: UpdateCommandInput = {
      TableName: "Campaigns",
      Key: { campaign_id },
      UpdateExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames: {
        "#name": "name",
        "#description": "description",
        "#image_url": "image_url",
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await docClient.send(new UpdateCommand(params));
    return (result.Attributes as Campaign) || null;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};
