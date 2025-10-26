-- Update NFT types with correct IPFS image URLs and hashes
-- Run this on production database to fix image loading issue

-- Update Bronze Rabbit NFT
UPDATE nft_types 
SET 
  image_url = 'https://ipfs.io/ipfs/QmVLArcnX2ADR7KqAdkhzSfxuahRixJCU6LSghXPM4i72z',
  image_ipfs_hash = 'QmVLArcnX2ADR7KqAdkhzSfxuahRixJCU6LSghXPM4i72z'
WHERE animal_type = 'rabbit' AND tier = 1;

-- Update Silver Fox NFT
UPDATE nft_types 
SET 
  image_url = 'https://ipfs.io/ipfs/QmcLmQZzGjrA8jWjMNiMyLzCfTmedR5ujA15cLLLqacd9k',
  image_ipfs_hash = 'QmcLmQZzGjrA8jWjMNiMyLzCfTmedR5ujA15cLLLqacd9k'
WHERE animal_type = 'fox' AND tier = 2;

-- Update Gold Eagle NFT
UPDATE nft_types 
SET 
  image_url = 'https://ipfs.io/ipfs/QmSEjCZ5FcuXUvvPmeAcfVhYH2rYEzPLmX8i5hGmwZo7YP',
  image_ipfs_hash = 'QmSEjCZ5FcuXUvvPmeAcfVhYH2rYEzPLmX8i5hGmwZo7YP'
WHERE animal_type = 'eagle' AND tier = 3;

-- Verify the updates
SELECT id, name, animal_type, tier, image_url, image_ipfs_hash FROM nft_types ORDER BY tier;
