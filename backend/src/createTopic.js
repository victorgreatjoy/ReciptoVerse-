const { client } = require("./hederaClient");
const { TopicCreateTransaction } = require("@hashgraph/sdk");

async function createTopic() {
  const tx = await new TopicCreateTransaction().execute(client);
  const receipt = await tx.getReceipt(client);
  return receipt.topicId.toString();
}
