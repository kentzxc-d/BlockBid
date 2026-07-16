const Jimp = require('jimp');

async function processImage() {
  try {
    const srcPath = 'C:/Users/matub/.gemini/antigravity-ide/brain/b1cdf590-8538-42ca-912d-5eb7b7f0b925/veteran_badge_green_1784188900784.png';
    const destPath = 'web/public/veteran-badge.png';
    
    const image = await Jimp.read(srcPath);
    console.log('Image loaded. Processing...');

    // Sample background color from top-left corner
    const bgRed = image.bitmap.data[0];
    const bgGreen = image.bitmap.data[1];
    const bgBlue = image.bitmap.data[2];
    
    console.log(`Detected background color: RGB(${bgRed}, ${bgGreen}, ${bgBlue})`);

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      const distance = Math.sqrt(
        Math.pow(bgRed - red, 2) + 
        Math.pow(bgGreen - green, 2) + 
        Math.pow(bgBlue - blue, 2)
      );

      if (distance < 60) {
        if (distance < 30) {
          this.bitmap.data[idx + 3] = 0; // Fully transparent
        } else {
          // Anti-alias
          const alpha = Math.floor(((distance - 30) / 30) * 255);
          this.bitmap.data[idx + 3] = alpha;
        }
      }
    });

    // Optionally crop the image to remove empty space
    // image.autocrop();

    await image.writeAsync(destPath);
    console.log('Done! Image background removed and saved to public folder.');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
