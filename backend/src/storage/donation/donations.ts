import {
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";

import { docClient } from "../../dynamodb";
import { Donation } from "./donation.types";

export const getAllDonations = async (): Promise<Donation[]> => {
  try {
    const params: ScanCommandInput = {
      TableName: "Donations",
    };

    const data = await docClient.send(new ScanCommand(params));

    return (data.Items || []) as Donation[];
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const getDonationById = async (id: string): Promise<Donation | null> => {
  try {
    const params: GetCommandInput = {
      TableName: "Donations",
      Key: { donation_id: id },
    };

    const data = await docClient.send(new GetCommand(params));

    return (data.Item as Donation) || null;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};

export const putDonation = async (entity: Donation): Promise<Donation> => {
  try {
    const params: PutCommandInput = {
      TableName: "Donations",
      Item: entity,
    };

    const data = await docClient.send(new PutCommand(params));

    return data.Attributes as Donation;
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};
