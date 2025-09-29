async function main() {
  const HelloHedera = await ethers.getContractFactory("HelloHedera");
  const hello = await HelloHedera.deploy();
  await hello.deployed();
  console.log("Contract deployed at:", hello.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
