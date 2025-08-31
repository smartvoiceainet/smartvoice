const fs = require('fs');
const path = require('path');

// Function to recursively find and analyze .js files
function analyzeBundles(directory) {
  console.log('\n===== Smart Voice AI Bundle Analysis =====');
  console.log('Analyzing production JavaScript bundles...');
  
  const results = {
    totalSize: 0,
    totalFiles: 0,
    largeFiles: [],
    smallFiles: [],
    chunks: {},
    recommendations: []
  };
  
  try {
    if (!fs.existsSync(directory)) {
      console.error(`Directory not found: ${directory}`);
      console.log('Please run "npm run build" first to generate production bundles.');
      return;
    }
    
    // Recursively find all .js files
    function findJsFiles(dir, fileList = []) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          findJsFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
          const sizeKB = (stat.size / 1024).toFixed(2);
          fileList.push({
            path: filePath,
            name: file,
            size: stat.size,
            sizeKB: `${sizeKB} KB`
          });
          
          results.totalSize += stat.size;
          results.totalFiles++;
          
          // Categorize by size
          if (stat.size > 100 * 1024) { // Larger than 100KB
            results.largeFiles.push({
              name: file,
              path: filePath.replace(directory, ''),
              sizeKB: `${sizeKB} KB`
            });
          } else if (stat.size < 5 * 1024) { // Smaller than 5KB
            results.smallFiles.push({
              name: file,
              path: filePath.replace(directory, ''),
              sizeKB: `${sizeKB} KB`
            });
          }
          
          // Track chunks
          if (file.includes('chunk')) {
            const chunkMatch = file.match(/chunk-([\\w-]+)/);
            if (chunkMatch && chunkMatch[1]) {
              const chunkName = chunkMatch[1];
              if (!results.chunks[chunkName]) {
                results.chunks[chunkName] = [];
              }
              results.chunks[chunkName].push({
                name: file,
                sizeKB: `${sizeKB} KB`
              });
            }
          }
        }
      });
      
      return fileList;
    }
    
    const allFiles = findJsFiles(directory);
    
    // Sort files by size (largest first)
    const sortedFiles = allFiles.sort((a, b) => b.size - a.size);
    
    // Add recommendations based on findings
    if (results.largeFiles.length > 0) {
      results.recommendations.push('Consider code-splitting for large bundles');
    }
    
    if (sortedFiles.length > 0 && sortedFiles[0].size > 250 * 1024) {
      results.recommendations.push('Main bundle exceeds recommended size (250KB). Consider lazy loading more components.');
    }
    
    if (results.smallFiles.length > 10) {
      results.recommendations.push('Too many small bundles. Consider consolidating related functionality.');
    }
    
    // Print analysis results
    console.log(`\nTotal bundle size: ${(results.totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Total JS files: ${results.totalFiles}`);
    
    console.log('\n--- Largest Bundles ---');
    sortedFiles.slice(0, 5).forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}: ${file.sizeKB}`);
    });
    
    console.log('\n--- Recommendations ---');
    if (results.recommendations.length > 0) {
      results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    } else {
      console.log('No specific recommendations. Bundle sizes look good!');
    }
    
    console.log('\nAnalysis complete! For full details, check the generated report.');
    
    // Save full analysis as JSON
    const reportDir = path.join(process.cwd(), 'public', 'reports');
    fs.mkdirSync(reportDir, { recursive: true });
    
    const reportPath = path.join(reportDir, 'bundle-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      date: new Date().toISOString(),
      totalSizeMB: (results.totalSize / (1024 * 1024)).toFixed(2),
      totalFiles: results.totalFiles,
      topBundles: sortedFiles.slice(0, 10).map(f => ({
        name: f.name,
        path: f.path.replace(directory, ''),
        sizeKB: f.sizeKB
      })),
      largeFiles: results.largeFiles,
      smallFiles: results.smallFiles.slice(0, 20),
      recommendations: results.recommendations
    }, null, 2));
    
    console.log(`Full report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error analyzing bundles:', error);
  }
}

// Look for the production build directory
const buildDir = path.join(process.cwd(), '.next');
analyzeBundles(buildDir);
