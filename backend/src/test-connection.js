const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  const client = Client.forTestnet();
  client.setOperator(
    process.env.HEDERA_ACCOUNT_ID,
    process.env.DEPLOYER_PRIVATE_KEY
  );

  const balance = await new AccountBalanceQuery()
    .setAccountId(process.env.HEDERA_ACCOUNT_ID)
    .execute(client);

  console.log(
    `Account ${process.env.HEDERA_ACCOUNT_ID} balance:`,
    balance.hbars.toString()
  );
}

main();
