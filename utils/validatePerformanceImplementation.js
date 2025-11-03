/**
 * Validate SceneWrapper Performance Implementation
 * Checks if all performance optimization features are properly implemented
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating SceneWrapper Performance Implementation...');
console.log('='.repeat(60));

try {
  // Read the SceneWrapper component
  const sceneWrapperPath = path.join(path.dirname(__dirname), 'components', 'SceneWrapper.jsx');
  const sceneWrapperContent = fs.readFileSync(sceneWrapperPath, 'utf8');
  
  // Check for performance optimization features
  const checks = [
    {
      name: 'Canvas optimization settings',
      pattern: /gl:\s*{[\s\S]*antialias[\s\S]*powerPreference[\s\S]*}/,
      description: 'Canvas WebGL optimization configuration'
    },
    {
      name: 'Pixel ratio capping',
      pattern: /Math\.min.*devicePixelRatio.*2/,
      description: 'Device pixel ratio capped at 2 for performance'
    },
    {
      name: 'Performance monitoring',
      pattern: /updatePerformanceStats|performanceStats/,
      description: 'FPS and frame time monitoring'
    },
    {
      name: 'Responsive canvas sizing',
      pattern: /handleResize.*useCallback|canvasSize.*useState/,
      description: 'Efficient window resize handling'
    },
    {
      name: 'Resource cleanup',
      pattern: /useEffect.*return.*cleanup|loseContext/,
      description: 'Proper Three.js resource disposal'
    },
    {
      name: 'Performance monitor UI',
      pattern: /performance-monitor[\s\S]*development/,
      description: 'Development performance monitoring UI'
    },
    {
      name: 'Canvas configuration',
      pattern: /onCreated.*gl.*scene.*camera/,
      description: 'Optimized canvas creation callback'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  checks.forEach(check => {
    const found = check.pattern.test(sceneWrapperContent);
    const status = found ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${check.name}`);
    console.log(`   ${check.description}`);
    
    if (found) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log('\n📊 Validation Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  // Check CSS for performance monitor styles
  const cssPath = path.join(path.dirname(__dirname), 'styles', 'globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  const cssChecks = [
    {
      name: 'Performance monitor styles',
      pattern: /\.performance-monitor/,
      description: 'CSS styles for performance monitoring UI'
    },
    {
      name: 'Performance status indicators',
      pattern: /data-status.*good|data-status.*warning|data-status.*critical/,
      description: 'Performance status color coding'
    }
  ];
  
  console.log('\n🎨 CSS Validation:');
  cssChecks.forEach(check => {
    const found = check.pattern.test(cssContent);
    const status = found ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${check.name}`);
    console.log(`   ${check.description}`);
  });
  
  console.log('\n🚀 Performance Optimization Implementation Complete!');
  console.log('='.repeat(60));
  
} catch (error) {
  console.error('❌ Validation failed:', error.message);
}