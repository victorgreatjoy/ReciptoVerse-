import { HashConnect } from "hashconnect";

const appMetadata = {
  name: "ReciptoVerse",
  description: "Receipt NFTs + Rewards on Hedera",
  icon: "https://via.placeholder.com/100", // your app icon
};

const network = "testnet"; // later: mainnet
const hashconnect = new HashConnect();

export async function initHashConnect(onPairing) {
  const initData = await hashconnect.init(appMetadata, network, false);

  // Restore pairing data if already paired
  const savedData = localStorage.getItem("hashconnectData");
  if (savedData) {
    const parsed = JSON.parse(savedData);
    hashconnect.connect(parsed.topic, parsed.pairingString, parsed.pairingData);
  }

  hashconnect.pairingEvent.on((pairingData) => {
    console.log("🔗 Paired with wallet:", pairingData);
    localStorage.setItem("hashconnectData", JSON.stringify(initData));
    if (onPairing) onPairing(pairingData);
  });

  return hashconnect;
}
