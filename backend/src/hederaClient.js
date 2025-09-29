// src/hederaClient.js
require("dotenv").config();
const { Client, PrivateKey } = require("@hashgraph/sdk");

const client = Client.forTestnet();
client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

module.exports = { client, PrivateKey };
