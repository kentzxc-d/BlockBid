const Jimp = require("jimp");

async function removeWhiteBg() {
  try {
    const inputPath = "C:\\Users\\matub\\.gemini\\antigravity-ide\\brain\\b1cdf590-8538-42ca-912d-5eb7b7f0b925\\crown_badge_1784187323759.png";
    const outputPath = "web/public/veteran-badge.png";
    const image = await Jimp.read(inputPath);
    
    const tolerance = 240;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      if (red >= tolerance && green >= tolerance && blue >= tolerance) {
        this.bitmap.data[idx + 3] = 0;
      }
    });

    await image.writeAsync(outputPath);
    console.log("Background removed and saved to", outputPath);
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

removeWhiteBg();
