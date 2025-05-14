const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getSortedAudioUrls(folderName) {
  const results = await cloudinary.api.resources({
    type: "upload",
    prefix: folderName + "/",
    resource_type: "video",
    max_results: 100,
  });

  return results.resources
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((res) => res.secure_url);
}

(async () => {
  try {
    const files = await getSortedAudioUrls("AI-Radio");
    const outputName = `ai-radio-${Date.now()}.mp3`;

    const mergeResponse = await axios.post("http://localhost:3000/merge-audio", {
      files,
      outputName,
    });

    console.log("✅ Merged episode URL:", mergeResponse.data.finalUrl);
  } catch (err) {
    console.error("❌ Merge failed:", err.message);
  }
})();
