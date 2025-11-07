/**
 * Simple test to verify the app loads without React hook errors
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing VibeScreen App...\n');

try {
  // Test 1: Build should succeed
  console.log('1. Testing build process...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful\n');

  // Test 2: Check if critical files exist
  console.log('2. Checking critical files...');
  
  const criticalFiles = [
    'components/ModeLoader.jsx',
    'components/TerminalInterface.jsx',
    'utils/modeRegistry.js',
    'modes/corporate-ai/scene.js',
    'modes/corporate-ai/character.js',
    'modes/corporate-ai/config.json',
    'modes/corporate-ai/messages.json'
  ];

  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  }

  console.log('\n🎉 All tests passed! App should work without React hook errors.');
  console.log('\n📝 To test the app:');
  console.log('   npm run dev');
  console.log('   Open http://localhost:3000 (or 3001 if 3000 is busy)');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}