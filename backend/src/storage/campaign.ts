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
  .map<CampaignEntity>((_, index) => {
    const statuses = ["Active", "Closed"];
    const names = [
      "Water for All",
      "Feed the Hungry",
      "Education for Everyone",
      "Shelter for Homeless",
      "Healthcare for All",
      "Support for Veterans",
      "Clean Environment",
      "Animal Welfare",
      "Arts and Culture",
      "Disaster Relief",
      "Mental Health Awareness",
      "Save the Oceans",
      "Renewable Energy",
      "Fight Against Cancer",
      "End Child Labor",
      "Support Small Farmers",
      "Promote Gender Equality",
      "Wildlife Conservation",
      "Urban Greening",
      "Support for Elderly",
      "Youth Empowerment",
      "Refugee Assistance",
      "Anti-Racism Initiatives",
      "Community Building",
      "Tech for Good"
    ];

    const descriptions = [
      "Join our mission to ensure clean and safe drinking water for communities around the world.",
      "Help us provide meals to those in need and combat hunger in our communities.",
      "Education is a right, not a privilege. Support our campaign to bring education to everyone.",
      "Provide shelter and support for homeless individuals and families.",
      "Access to healthcare is crucial. Help us provide medical services to those in need.",
      "Show your support for veterans by contributing to our healthcare and rehabilitation programs.",
      "Promote a clean and healthy environment through our various green initiatives.",
      "Protect animals and promote their welfare with your contributions.",
      "Support arts and culture programs that enrich our communities.",
      "Provide aid and relief to those affected by natural disasters.",
      "Raise awareness and support for mental health issues.",
      "Join the fight to save our oceans from pollution and destruction.",
      "Promote the use of renewable energy and sustainable practices.",
      "Support cancer research and help us find a cure.",
      "End child labor and ensure a safe and bright future for children.",
      "Support small farmers and promote sustainable agriculture.",
      "Promote gender equality and empower women and girls.",
      "Help us conserve wildlife and protect endangered species.",
      "Make our cities greener and more livable with urban greening initiatives.",
      "Support programs that assist the elderly in our communities.",
      "Empower youth through education and mentorship programs.",
      "Provide assistance and support for refugees.",
      "Support initiatives that combat racism and promote equality.",
      "Build stronger communities through local projects and initiatives.",
      "Support tech innovations that drive social good and positive change."
    ];

    return {
      campaign_id: `cmp_${index + 1}`,
      charity_pda: `charity_pda_${index + 1}`,
      deadline: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(), // Adds a day to each campaign's deadline
      goal: (index + 1) * 5000, // Goals ranging from 5000 upwards
      collected: (index + 1) * 1000, // Collected funds increase incrementally

      created_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).valueOf(), // Created dates from the past 25 days
      name: names[index % names.length],
      description: descriptions[index % descriptions.length],
      imageUrl: `https://example.com/images/campaign_${index + 1}.jpg`, // Placeholder image URL
      status: statuses[index % statuses.length],
      charity_slug: `slug_${Math.floor(index / 5) + 2}`,
    };
  });

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
