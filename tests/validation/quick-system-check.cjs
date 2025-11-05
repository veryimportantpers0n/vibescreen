/**
 * Quick System Check for VibeScreen
 * Tests all critical systems before deployment
 */

const fs = require('fs').promises;
const path = require('path');

async function quickSystemCheck() {
  console.log('🚀 VibeScreen Quick System Check');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  function logTest(name, status, details = '') {
    const icon = status ? '✅' : '❌';
    console.log(`${icon} ${name}${details ? ' - ' + details : ''}`);
    if (status) passed++; else failed++;
  }
  
  // Test 1: Core files exist
  console.log('\n📁 Core Files:');
  const coreFiles = [
    'package.json',
    'next.config.js', 
    'pages/index.js',
    'pages/_app.js',
    'pages/api/modes.js'
  ];
  
  for (const file of coreFiles) {
    try {
      await fs.access(file);
      logTest(file, true);
    } catch (error) {
      logTest(file, false, 'Missing');
    }
  }
  
  // Test 2: Components exist
  console.log('\n🧩 Components:');
  const components = [
    'components/ModeLoader.jsx',
    'components/CharacterHost.jsx',
    'components/TerminalInterface.jsx',
    'components/MessageController.jsx'
  ];
  
  for (const comp of components) {
    try {
      await fs.access(comp);
      logTest(path.basename(comp), true);
    } catch (error) {
      logTest(path.basename(comp), false, 'Missing');
    }
  }
  
  // Test 3: Modes directory
  console.log('\n🎭 Personality Modes:');
  try {
    const modes = await fs.readdir('modes', { withFileTypes: true });
    const modeDirectories = modes.filter(entry => entry.isDirectory());
    
    logTest('Modes directory', true, `${modeDirectories.length} modes found`);
    
    // Check each mode has required files
    for (const mode of modeDirectories) {
      const modeId = mode.name;
      const requiredFiles = ['config.json', 'messages.json', 'scene.js', 'character.js'];
      let modeValid = true;
      
      for (const file of requiredFiles) {
        try {
          await fs.access(path.join('modes', modeId, file));
        } catch (error) {
          modeValid = false;
          break;
        }
      }
      
      logTest(`  ${modeId}`, modeValid, modeValid ? 'Complete' : 'Missing files');
    }
    
  } catch (error) {
    logTest('Modes directory', false, 'Cannot read');
  }
  
  // Test 4: Configuration files
  console.log('\n⚙️ Configuration:');
  try {
    const globalConfig = await fs.readFile('data/global-config.json', 'utf8');
    JSON.parse(globalConfig);
    logTest('Global config', true, 'Valid JSON');
  } catch (error) {
    logTest('Global config', false, 'Invalid or missing');
  }
  
  // Test 5: Master message files
  console.log('\n💬 Message Data:');
  const messageFiles = [
    'data/master-messages/cliche-ai-phrases.json',
    'data/master-messages/funny-exaggerations.json'
  ];
  
  for (const file of messageFiles) {
    try {
      const data = await fs.readFile(file, 'utf8');
      const messages = JSON.parse(data);
      logTest(path.basename(file), Array.isArray(messages), `${messages.length} messages`);
    } catch (error) {
      logTest(path.basename(file), false, 'Invalid or missing');
    }
  }
  
  // Test 6: Package.json validation
  console.log('\n📦 Dependencies:');
  try {
    const packageData = await fs.readFile('package.json', 'utf8');
    const pkg = JSON.parse(packageData);
    
    const requiredDeps = ['next', 'react', 'react-dom', '@react-three/fiber', '@react-three/drei', 'three'];
    let depsValid = true;
    
    for (const dep of requiredDeps) {
      const hasdep = (pkg.dependencies && pkg.dependencies[dep]) || 
                     (pkg.devDependencies && pkg.devDependencies[dep]);
      if (!hasDepth) depsValid = false;
    }
    
    logTest('Required dependencies', depsValid);
    logTest('Build scripts', !!(pkg.scripts && pkg.scripts.build && pkg.scripts.dev));
    
  } catch (error) {
    logTest('Package.json', false, 'Invalid');
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  const status = failed === 0 ? 'READY' : 'NEEDS FIXES';
  console.log(`\n🎯 STATUS: ${status}`);
  
  if (status === 'READY') {
    console.log('🎉 System is ready for testing!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run: npm run build');
    console.log('2. Run: npm run dev');
    console.log('3. Open: http://localhost:3000');
    console.log('4. Test terminal commands: !help, !switch zen monk');
    console.log('5. Test message system: !test, !pause, !resume');
  } else {
    console.log('🔧 Fix the failed items above before testing.');
  }
  
  return { passed, failed, status };
}

// Run the check
quickSystemCheck().catch(console.error);