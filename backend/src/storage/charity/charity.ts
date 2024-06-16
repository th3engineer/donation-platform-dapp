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
import { Charity, PatchCharityDto } from "./charity.types";

export const getAllCharities = async (): Promise<Charity[]> => {
  try {
    const params: ScanCommandInput = {
      TableName: "Charities",
    };

    const data = await docClient.send(new ScanCommand(params));

    return (data.Items || []) as Charity[];
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const getCharityBySlug = async (
  slug: string
): Promise<Charity | null> => {
  try {
    const params: GetCommandInput = {
      TableName: "Charities",
      Key: { slug },
    };

    const data = await docClient.send(new GetCommand(params));

    return (data.Item as Charity) || null;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const putCharity = async (entity: Charity): Promise<Charity> => {
  try {
    const params: PutCommandInput = {
      TableName: "Charities",
      Item: entity,
    };

    const data = await docClient.send(new PutCommand(params));

    return data.Attributes as Charity;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const patchCharity = async (
  entity: PatchCharityDto
): Promise<Charity | null> => {
  try {
    const { slug, ...attributes } = entity;

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
      TableName: "Charities",
      Key: { slug },
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
    return (result.Attributes as Charity) || null;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};
