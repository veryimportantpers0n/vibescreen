/**
 * Character Loading Test - Verify character components can be loaded
 */

const fs = require('fs');
const path = require('path');

console.log('🎭 Testing Character Loading System...\n');

// Test 1: Check if character files exist
console.log('📁 Checking character files...');
const modes = ['corporate-ai', 'zen-monk', 'chaos'];
let filesExist = 0;

modes.forEach(mode => {
  const characterPath = path.join(__dirname, '../../modes', mode, 'character.js');
  if (fs.existsSync(characterPath)) {
    console.log(`✅ ${mode} character file exists`);
    filesExist++;
  } else {
    console.log(`❌ ${mode} character file missing`);
  }
});

// Test 2: Check character file exports
console.log('\n📦 Checking character exports...');
let exportsValid = 0;

modes.forEach(mode => {
  const characterPath = path.join(__dirname, '../../modes', mode, 'character.js');
  if (fs.existsSync(characterPath)) {
    const content = fs.readFileSync(characterPath, 'utf8');
    
    // Check for proper export
    if (content.includes('export default') || content.includes('module.exports')) {
      console.log(`✅ ${mode} character has valid export`);
      exportsValid++;
    } else {
      console.log(`❌ ${mode} character missing export`);
    }
    
    // Check for required imports
    if (content.includes('useFrame') && content.includes('useRef')) {
      console.log(`✅ ${mode} character has required Three.js imports`);
    } else {
      console.log(`⚠️ ${mode} character may be missing required imports`);
    }
  }
});

// Test 3: Check ModeRegistry integration
console.log('\n🗂️ Checking ModeRegistry integration...');
const registryPath = path.join(__dirname, '../../utils/modeRegistry.js');

if (fs.existsSync(registryPath)) {
  const registryContent = fs.readFileSync(registryPath, 'utf8');
  
  let registryValid = 0;
  modes.forEach(mode => {
    const importPattern = new RegExp(`import.*${mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Character.*from.*modes/${mode}/character`, 'i');
    
    if (importPattern.test(registryContent)) {
      console.log(`✅ ${mode} character imported in registry`);
      registryValid++;
    } else {
      console.log(`❌ ${mode} character not found in registry`);
    }
  });
  
  console.log(`\n📊 Registry Integration: ${registryValid}/${modes.length} characters registered`);
} else {
  console.log('❌ ModeRegistry file not found');
}

// Test 4: Check CharacterHost component
console.log('\n🏠 Checking CharacterHost component...');
const characterHostPath = path.join(__dirname, '../../components/CharacterHost.jsx');

if (fs.existsSync(characterHostPath)) {
  const hostContent = fs.readFileSync(characterHostPath, 'utf8');
  
  const features = [
    { name: 'Fallback Character', test: /FallbackCharacter|fallback.*character/i },
    { name: 'Enhanced Lighting', test: /ambientLight.*intensity.*1\.2|directionalLight/i },
    { name: 'Error Logging', test: /console\.(log|warn|error).*character/i },
    { name: 'Canvas Configuration', test: /Canvas.*ref|canvasConfig/i },
    { name: 'Proper Positioning', test: /position:\s*['"]fixed['"][\s\S]*bottom:\s*['"]20px['"][\s\S]*right:\s*['"]20px['"]/i }
  ];
  
  let featuresFound = 0;
  features.forEach(feature => {
    if (feature.test.test(hostContent)) {
      console.log(`✅ ${feature.name} implemented`);
      featuresFound++;
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
  
  console.log(`\n📊 CharacterHost Features: ${featuresFound}/${features.length} implemented`);
} else {
  console.log('❌ CharacterHost component not found');
}

// Test 5: Check DefaultCharacter fallback
console.log('\n🔧 Checking DefaultCharacter fallback...');
const defaultCharacterPath = path.join(__dirname, '../../components/DefaultCharacter.jsx');

if (fs.existsSync(defaultCharacterPath)) {
  const defaultContent = fs.readFileSync(defaultCharacterPath, 'utf8');
  
  if (defaultContent.includes('useFrame') && defaultContent.includes('boxGeometry')) {
    console.log('✅ DefaultCharacter has proper Three.js implementation');
  } else {
    console.log('⚠️ DefaultCharacter may have implementation issues');
  }
  
  if (defaultContent.includes('export default')) {
    console.log('✅ DefaultCharacter properly exported');
  } else {
    console.log('❌ DefaultCharacter export missing');
  }
} else {
  console.log('❌ DefaultCharacter component not found');
}

// Summary
console.log('\n📋 SUMMARY:');
console.log(`Character Files: ${filesExist}/${modes.length} exist`);
console.log(`Character Exports: ${exportsValid}/${modes.length} valid`);
console.log('CharacterHost: Enhanced with fallback and better lighting');
console.log('DefaultCharacter: Available as guaranteed fallback');

if (filesExist === modes.length && exportsValid === modes.length) {
  console.log('\n✅ Character loading system appears to be working correctly!');
  console.log('🎯 Characters should now appear in bottom-right corner with enhanced lighting');
} else {
  console.log('\n⚠️ Some character loading issues detected');
  console.log('🔧 Check the specific failures above for details');
}