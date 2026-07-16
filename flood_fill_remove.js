const Jimp = require('jimp');

async function processImage() {
  try {
    const imagePath = 'web/public/veteran-badge.png';
    const image = await Jimp.read(imagePath);
    console.log('Image loaded. Running flood fill background removal...');

    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // We will keep track of visited pixels
    const visited = new Array(width * height).fill(false);
    
    // A queue for our iterative flood fill
    const queue = [];
    
    // Function to add pixel to queue
    const addPixel = (x, y) => {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = y * width + x;
        if (!visited[idx]) {
          visited[idx] = true;
          queue.push({x, y});
        }
      }
    };
    
    // Start from all 4 edges
    for (let x = 0; x < width; x++) {
      addPixel(x, 0);
      addPixel(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      addPixel(0, y);
      addPixel(width - 1, y);
    }
    
    // Flood fill logic
    // We consider a pixel part of the background if it is very light (grayscale > 200)
    // The badge has dark silver and blue edges which will stop the flood fill
    while (queue.length > 0) {
      const {x, y} = queue.shift();
      const idx = (y * width + x) * 4;
      
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      
      // Calculate brightness
      const brightness = (r + g + b) / 3;
      
      // Calculate color variance (saturation-ish) to distinguish from blue
      const variance = Math.max(r, g, b) - Math.min(r, g, b);
      
      // If it's light and relatively colorless (checkerboard is gray/white)
      // The shadow might be darker, so let's accept brightness > 180 and variance < 30
      if (brightness > 200 && variance < 40) {
        // It's background! Make it transparent
        image.bitmap.data[idx + 3] = 0;
        
        // Add neighbors
        const visitedIdx = y * width + x;
        
        if (x > 0 && !visited[visitedIdx - 1]) addPixel(x - 1, y);
        if (x < width - 1 && !visited[visitedIdx + 1]) addPixel(x + 1, y);
        if (y > 0 && !visited[visitedIdx - width]) addPixel(x, y - 1);
        if (y < height - 1 && !visited[visitedIdx + width]) addPixel(x, y + 1);
      } else if (brightness > 160 && variance < 40) {
        // Anti-alias edge/shadow
        image.bitmap.data[idx + 3] = 100; // Semi transparent
        // Don't propagate from here
      }
    }

    await image.writeAsync(imagePath);
    console.log('Done! Background removed with flood fill.');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
