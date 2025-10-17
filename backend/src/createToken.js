// src/createToken.js (example outline)
const {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} = require("@hashgraph/sdk");

async function createRECVToken(treasuryAccountId) {
  const tx = await new TokenCreateTransaction()
    .setTokenName("ReceiptoVerse")
    .setTokenSymbol("RECV")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(1000000)
    .setTreasuryAccountId(treasuryAccountId)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  return receipt.tokenId.toString();
}

async function createRNFTCollection(treasuryAccountId) {
  const tx = await new TokenCreateTransaction()
    .setTokenName("ReceiptoVerse Receipt")
    .setTokenSymbol("rNFT")
    .setTokenType(TokenType.NonFungibleUnique)
    .setTreasuryAccountId(treasuryAccountId)
    .setSupplyType(TokenSupplyType.Infinite)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  return receipt.tokenId.toString();
}
