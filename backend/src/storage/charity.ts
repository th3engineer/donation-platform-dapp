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
  .map<CharityEntity>((_, index) => {
    const names = [
      "Global Water Initiative",
      "Food for All Foundation",
      "Education First",
      "Homes for Everyone",
      "Healthcare Access Project"
    ];

    const descriptions = [
      "Our mission is to provide clean and safe drinking water to communities in need worldwide.",
      "We strive to eliminate hunger by providing nutritious meals to those who need them most.",
      "We believe in education for all and work to provide learning opportunities to underserved communities.",
      "We aim to provide safe and secure housing for homeless individuals and families.",
      "Our goal is to ensure that everyone has access to quality healthcare services."
    ];

    return {
      slug: `slug_${index + 1}`,
      owner_pubkey: `public_key_for_slug_${index + 1}`,
      recepient_wallet_pda: `CuStoMPda${index + 1}`,
      created_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).valueOf(), // Created dates from the past 5 days
      name: names[index % names.length],
      description: descriptions[index % descriptions.length],
      imageUrl: `https://example.com/images/charity_${index + 1}.jpg`, // Placeholder image URL
    };
  });


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
