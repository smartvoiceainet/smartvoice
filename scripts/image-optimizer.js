// Image Optimizer for Smart Voice AI
// Part of Step 4: Testing & Optimization - Speed Optimization
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const chalk = require('chalk');

// Configuration
const config = {
  directories: ['public/images', 'public'], // Directories to search for images
  extensions: ['.jpg', '.jpeg', '.png'], // Image extensions to process
  skipFiles: ['favicon.ico'], // Files to skip
  quality: {
    jpeg: 85,
    webp: 80,
    avif: 65,
  },
  sizes: [640, 1080, 1920], // Responsive image sizes
  overwrite: false, // Whether to overwrite existing optimized images
};

// Statistics tracking
const stats = {
  processed: 0,
  skipped: 0,
  converted: 0,
  bytesOriginal: 0,
  bytesSaved: 0,
};

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Track time
const startTime = Date.now();

// Get all image files recursively
function getImageFiles(directory) {
  let results = [];
  
  if (!fs.existsSync(directory)) {
    return results;
  }

  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results = results.concat(getImageFiles(itemPath));
    } else {
      const ext = path.extname(itemPath).toLowerCase();
      if (config.extensions.includes(ext) && !config.skipFiles.includes(path.basename(itemPath))) {
        results.push(itemPath);
      }
    }
  }
  
  return results;
}

// Process an image file
async function processImage(imagePath) {
  try {
    const filename = path.basename(imagePath);
    const directory = path.dirname(imagePath);
    const fileStats = fs.statSync(imagePath);
    const originalSize = fileStats.size;
    stats.bytesOriginal += originalSize;
    
    console.log(chalk.blue(`Processing: ${imagePath}`));
    
    // Create optimized directory if needed
    const optimizedDir = path.join(directory, 'optimized');
    ensureDirectoryExists(optimizedDir);
    
    // Create responsive sizes and WebP/AVIF versions
    const baseFilename = path.parse(filename).name;
    
    // First optimize the original format
    const outputPathOptimized = path.join(optimizedDir, filename);
    if (fs.existsSync(outputPathOptimized) && !config.overwrite) {
      console.log(chalk.yellow(`  Skipping ${outputPathOptimized} (already exists)`));
      stats.skipped++;
    } else {
      // Process based on file extension
      const ext = path.extname(imagePath).toLowerCase();
      let sharpInstance = sharp(imagePath);
      
      if (ext === '.jpg' || ext === '.jpeg') {
        await sharpInstance
          .jpeg({ quality: config.quality.jpeg, mozjpeg: true })
          .toFile(outputPathOptimized);
      } else if (ext === '.png') {
        await sharpInstance
          .png({ quality: config.quality.jpeg, compressionLevel: 9, palette: true })
          .toFile(outputPathOptimized);
      }
      
      stats.processed++;
    }
    
    // Create WebP version
    const webpPath = path.join(optimizedDir, `${baseFilename}.webp`);
    if (fs.existsSync(webpPath) && !config.overwrite) {
      console.log(chalk.yellow(`  Skipping ${webpPath} (already exists)`));
    } else {
      await sharp(imagePath)
        .webp({ quality: config.quality.webp })
        .toFile(webpPath);
      
      stats.converted++;
    }
    
    // Create AVIF version
    const avifPath = path.join(optimizedDir, `${baseFilename}.avif`);
    try {
      if (fs.existsSync(avifPath) && !config.overwrite) {
        console.log(chalk.yellow(`  Skipping ${avifPath} (already exists)`));
      } else {
        await sharp(imagePath)
          .avif({ quality: config.quality.avif })
          .toFile(avifPath);
        
        stats.converted++;
      }
    } catch (avifError) {
      console.log(chalk.yellow(`  Skipping AVIF conversion for ${filename} (not supported)`));
    }
    
    // Create responsive sizes
    for (const size of config.sizes) {
      const responsivePath = path.join(optimizedDir, `${baseFilename}-${size}${path.extname(imagePath)}`);
      const responsiveWebpPath = path.join(optimizedDir, `${baseFilename}-${size}.webp`);
      
      // Get original image dimensions
      const metadata = await sharp(imagePath).metadata();
      
      // Only create responsive images if the original is larger
      if (metadata.width > size) {
        if (fs.existsSync(responsivePath) && !config.overwrite) {
          console.log(chalk.yellow(`  Skipping ${responsivePath} (already exists)`));
        } else {
          // Create responsive original format
          await sharp(imagePath)
            .resize(size)
            .toFile(responsivePath);
          
          stats.converted++;
        }
        
        if (fs.existsSync(responsiveWebpPath) && !config.overwrite) {
          console.log(chalk.yellow(`  Skipping ${responsiveWebpPath} (already exists)`));
        } else {
          // Create responsive WebP format
          await sharp(imagePath)
            .resize(size)
            .webp({ quality: config.quality.webp })
            .toFile(responsiveWebpPath);
          
          stats.converted++;
        }
      }
    }
    
    // Calculate savings
    const optimizedSize = fs.statSync(outputPathOptimized).size;
    const savedBytes = originalSize - optimizedSize;
    stats.bytesSaved += savedBytes;
    
    console.log(chalk.green(`  Optimized: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${Math.round(savedBytes / originalSize * 100)}% reduction)`));
    
  } catch (error) {
    console.error(chalk.red(`Error processing ${imagePath}:`), error);
  }
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Run the optimization process
async function run() {
  console.log(chalk.green('🖼️  Smart Voice AI Image Optimizer'));
  console.log(chalk.green('Step 4: Testing & Optimization - Speed Optimization'));
  console.log('------------------------------------------');
  
  // Install chalk if needed
  try {
    require.resolve('chalk');
  } catch (e) {
    console.log('Installing required dependencies...');
    require('child_process').execSync('npm install chalk --no-save', { stdio: 'inherit' });
  }
  
  // Find all images
  let allImages = [];
  for (const directory of config.directories) {
    allImages = allImages.concat(getImageFiles(directory));
  }
  
  console.log(`Found ${allImages.length} images to process`);
  
  // Process each image
  for (const imagePath of allImages) {
    await processImage(imagePath);
  }
  
  // Print summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('------------------------------------------');
  console.log(chalk.green('✅ Optimization complete!'));
  console.log(`⏱️  Time taken: ${totalTime} seconds`);
  console.log(`🖼️  Images processed: ${stats.processed}`);
  console.log(`🔄 Variants created: ${stats.converted}`);
  console.log(`⏭️  Images skipped: ${stats.skipped}`);
  console.log(`📊 Original size: ${formatBytes(stats.bytesOriginal)}`);
  console.log(`💾 Space saved: ${formatBytes(stats.bytesSaved)} (${Math.round(stats.bytesSaved / stats.bytesOriginal * 100)}%)`);
  console.log('------------------------------------------');
  console.log(chalk.blue('TIP: Use Next.js Image component with priority={true} for above-the-fold images'));
  console.log(chalk.blue('     and lazy loading for below-the-fold images to improve Core Web Vitals'));
}

// Run the optimizer
run().catch(console.error);
