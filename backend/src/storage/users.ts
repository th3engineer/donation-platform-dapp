import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../dynamodb";

// export const getUsers = async () => {
//   const params = {
//     TableName: "Users",
//     Key: {
//       PrimaryKeyAttributeName: "PrimaryKeyValue",
//     },
//   };

//   try {
//     const data = await docClient.send(new GetCommand(params));
//     console.log("Item retrieved:", data.Item);
//   } catch (err) {
//     console.error("Error retrieving item:", err);
//   }
// };

// export const getUser =
