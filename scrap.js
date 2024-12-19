const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseURL = 'https://illustrations.popsy.co';
const outputDir = 'downloaded_images';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const instance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://illustrations.popsy.co/',
    'Connection': 'keep-alive'
  },
  timeout: 10000,
  maxRedirects: 5
});

async function downloadSVG(imageName) {
  try {
    const cleanName = imageName.replace(/\.svg$/, '').trim();
    const url = `${baseURL}/amber/${cleanName}.svg`;
    const outputPath = path.join(outputDir, `${cleanName}.svg`);

    console.log(`Attempting to download: ${url}`);

    const response = await instance.get(url, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        console.log(`Successfully downloaded: ${cleanName}.svg`);
        resolve(true);
      });

      writer.on('error', (err) => {
        console.error(`Error writing file ${cleanName}.svg:`, err.message);
        fs.unlink(outputPath, () => {});
        resolve(false);
      });
    });

  } catch (error) {
    console.error(`Failed to download ${imageName}:`, error.message);
    return false;
  }
}

async function downloadMultipleSVGs(imageNames, maxRetries = 3, delayMs = 2000) {
  const results = {
    successful: [],
    failed: []
  };

  for (const imageName of imageNames) {
    let success = false;
    let attempts = 0;

    while (!success && attempts < maxRetries) {
      attempts++;
      if (attempts > 1) {
        console.log(`Retry attempt ${attempts} for ${imageName}`);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempts));
      }

      success = await downloadSVG(imageName);
    }

    if (success) {
      results.successful.push(imageName);
    } else {
      results.failed.push(imageName);
    }

    const randomDelay = delayMs + Math.random() * 1500;
    await new Promise(resolve => setTimeout(resolve, randomDelay));
  }

  return results;
}

async function main() {
  const imageNames = [
    "cooking-soup",
    "chef-serving-chicken",
    "man-riding-a-rocket"
  ];

  console.log(`Starting download of ${imageNames.length} images...`);
  const results = await downloadMultipleSVGs(imageNames);

  console.log('\n=== Download Summary ===');
  console.log(`Successfully downloaded: ${results.successful.length} files`);
  console.log(`Failed downloads: ${results.failed.length} files`);

  if (results.failed.length > 0) {
    console.log('\nFailed files:');
    results.failed.forEach(file => console.log(`- ${file}`));
  }
}

main().catch(console.error);