/**
 * Upload NFT images to IPFS and update database
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Load environment variables using the config system
const config = require("./src/config");
const { query } = require("./src/database");

// Pinata configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY =
  process.env.PINATA_SECRET_API_KEY || process.env.PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  console.error("❌ Pinata API keys not found in environment variables");
  console.log(
    "Please set PINATA_API_KEY and PINATA_SECRET_API_KEY in .env file"
  );
  process.exit(1);
}

/**
 * Upload image to IPFS via Pinata
 */
async function uploadToIPFS(filePath, fileName) {
  try {
    console.log(`📤 Uploading ${fileName} to IPFS...`);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        project: "ReceiptoVerse",
        type: "reward-nft-image",
      },
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log(`✅ Uploaded successfully!`);
    console.log(`   IPFS Hash: ${ipfsHash}`);
    console.log(`   URL: ${ipfsUrl}`);

    return { ipfsHash, ipfsUrl };
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    throw error;
  }
}

/**
 * Update NFT type with image URLs
 */
async function updateNFTImage(animalType, imageUrl, ipfsHash) {
  try {
    console.log(`💾 Updating ${animalType} NFT in database...`);

    const sql = `
      UPDATE nft_types 
      SET image_url = $1, image_ipfs_hash = $2, updated_at = $3
      WHERE animal_type = $4
    `;

    await query(sql, [
      imageUrl,
      ipfsHash,
      new Date().toISOString(),
      animalType,
    ]);

    console.log(`✅ Database updated for ${animalType}`);
  } catch (error) {
    console.error(`❌ Error updating ${animalType}:`, error.message);
    throw error;
  }
}

/**
 * Main upload process
 */
async function uploadNFTImages() {
  console.log("🎨 NFT Image Upload to IPFS\n");
  console.log("=".repeat(60));

  const nftsFolder = path.join(__dirname, "../nfts");

  // Check if folder exists
  if (!fs.existsSync(nftsFolder)) {
    console.error(`❌ NFTs folder not found: ${nftsFolder}`);
    process.exit(1);
  }

  const imageMap = [
    { file: "rabbit.png", animal: "rabbit", name: "Bronze Rabbit" },
    { file: "fox.png", animal: "fox", name: "Silver Fox" },
    { file: "eagle.png", animal: "eagle", name: "Gold Eagle" },
  ];

  console.log(`\n📁 Looking for images in: ${nftsFolder}\n`);

  for (const img of imageMap) {
    const filePath = path.join(nftsFolder, img.file);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${img.file} not found, skipping...`);
      continue;
    }

    const fileSize = fs.statSync(filePath).size;
    console.log(`\n🖼️  Processing ${img.name} (${img.file})`);
    console.log(`   File size: ${(fileSize / 1024).toFixed(2)} KB`);

    try {
      // Upload to IPFS
      const { ipfsHash, ipfsUrl } = await uploadToIPFS(filePath, img.file);

      // Update database
      await updateNFTImage(img.animal, ipfsUrl, ipfsHash);

      console.log(`✅ ${img.name} complete!\n`);
    } catch (error) {
      console.error(`❌ Failed to process ${img.name}`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  // Verify updates
  console.log("\n" + "=".repeat(60));
  console.log("🔍 Verifying database updates...\n");

  const result = await query(`
    SELECT animal_type, name, image_url, image_ipfs_hash 
    FROM nft_types 
    ORDER BY tier ASC
  `);

  result.rows.forEach((nft) => {
    const hasImage = nft.image_url && nft.image_url.includes("ipfs");
    console.log(`${hasImage ? "✅" : "⚠️ "} ${nft.name}`);
    if (hasImage) {
      console.log(`   URL: ${nft.image_url}`);
      console.log(`   IPFS: ${nft.image_ipfs_hash}`);
    } else {
      console.log(`   No IPFS image set`);
    }
    console.log();
  });

  console.log("=".repeat(60));
  console.log("🎉 NFT Image Upload Complete!\n");
}

// Run the upload
uploadNFTImages().catch((error) => {
  console.error("💥 Upload failed:", error);
  process.exit(1);
});
