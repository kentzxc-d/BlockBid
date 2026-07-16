const Jimp = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('web/public/veteran-badge.png');
    console.log('Image loaded. Processing...');

    // We want to make any pixel that is very close to white, transparent.
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // Calculate how close to pure white (255, 255, 255)
      const distance = Math.sqrt(
        Math.pow(255 - red, 2) + 
        Math.pow(255 - green, 2) + 
        Math.pow(255 - blue, 2)
      );

      // If distance is less than a threshold, make it transparent
      if (distance < 50) {
        // Anti-aliasing approach: if it's kinda white, reduce alpha based on how white it is
        // distance 0 = pure white = alpha 0
        // distance 50 = not white = alpha 255
        // Let's just make everything less than 30 completely transparent, 
        // and scale alpha between 30 and 80.
        if (distance < 35) {
          this.bitmap.data[idx + 3] = 0; // Fully transparent
        } else if (distance < 80) {
          // Semi transparent
          const alpha = Math.floor(((distance - 35) / 45) * 255);
          this.bitmap.data[idx + 3] = alpha;
        }
      }
    });

    await image.writeAsync('web/public/veteran-badge.png');
    console.log('Done! Image background removed with anti-aliasing handling.');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
