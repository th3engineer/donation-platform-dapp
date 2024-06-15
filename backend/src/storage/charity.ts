import {
  GetCommand,
  PutCommand,
  PutCommandInput,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { docClient } from "../dynamodb";

export interface CharityEntity {
  // On-chain
  slug: string;
  owner_pubkey: string;
  recepient_wallet_pda: string;
  created_at: number;

  // Off-chain
  name: string;
  description: string;
  imageUrl: string;
}

/*
  Mock data to be deleted
*/
const charities = Array.from<CharityEntity>({ length: 5 })
  .fill(0 as unknown as CharityEntity)
  .map<CharityEntity>((_, index) => ({
    slug: `slug_${index}`,
    owner_pubkey: `public_key_for_slug_${index}`,
    recepient_wallet_pda: `CuStoMPda${index}`,
    created_at: new Date().valueOf(),
    name: "Test Name Test",
    description:
      "Some long description Some long description Some long description Some long description Some long description Some long description",
    imageUrl: "",
  }));

export const getAllCharities = async () => {
  try {
    const params = {
      TableName: "Charities",
    };

    return charities;

    // const data = await docClient.send(new ScanCommand(params));

    // return (data.Items || []) as CharityEntity[];
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const getCharityBySlug = async (slug: string) => {
  try {
    const params = {
      TableName: "Charities",
      Key: { slug },
    };

    return charities[0];

    // const data = await docClient.send(new GetCommand(params));

    // return data.Item as CharityEntity;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const putCharity = async (entity: CharityEntity) => {
  try {
    const params = {
      TableName: "Charities",
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
  entity: Pick<CharityEntity, "slug"> & Partial<Omit<CharityEntity, "slug">>
) => {
  try {
    const charity = await getCharityBySlug(entity.slug);

    const updatedCharity = { ...charity, ...entity };

    return updatedCharity;

    // const params: PutCommandInput = {
    //   TableName: "Charities",
    //   Item: updatedCharity,
    // };

    // await docClient.send(new PutCommand(params));
    // return updatedCharity as CharityEntity;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};
