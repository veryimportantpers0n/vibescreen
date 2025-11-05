/**
 * VibeScreen Diagnostic Check
 * Runs comprehensive system diagnostics
 */

import fs from 'fs/promises';
import path from 'path';

async function runDiagnostics() {
  console.log('🔍 VibeScreen Diagnostic Check');
  console.log('=' .repeat(60));
  
  const issues = [];
  const warnings = [];
  let checksRun = 0;
  
  function check(name, condition, issue = null, warning = null) {
    checksRun++;
    if (condition) {
      console.log(`✅ ${name}`);
    } else if (issue) {
      console.log(`❌ ${name}: ${issue}`);
      issues.push({ check: name, issue });
    } else if (warning) {
      console.log(`⚠️  ${name}: ${warning}`);
      warnings.push({ check: name, warning });
    }
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  check('Node.js Version', majorVersion >= 18, 
    majorVersion < 18 ? `Node.js ${nodeVersion} is too old, need 18+` : null);
  
  // Check package.json
  try {
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
    check('Package.json', true);
    
    // Check required dependencies
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const requiredDeps = {
      'next': '^14.0.0',
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
      '@react-three/fiber': '^8.0.0',
      '@react-three/drei': '^9.0.0',
      'three': '^0.160.0'
    };
    
    for (const [dep, minVersion] of Object.entries(requiredDeps)) {
      check(`Dependency: ${dep}`, deps[dep], 
        !deps[dep] ? `Missing required dependency` : null);
    }
    
    // Check scripts
    const requiredScripts = ['dev', 'build', 'start'];
    for (const script of requiredScripts) {
      check(`Script: ${script}`, pkg.scripts && pkg.scripts[script],
        `Missing required script in package.json`);
    }
    
  } catch (error) {
    check('Package.json', false, `Cannot read or parse: ${error.message}`);
  }
  
  // Check Next.js config
  try {
    await fs.access('next.config.js');
    check('Next.js Config', true);
  } catch (error) {
    check('Next.js Config', false, 'Missing next.config.js');
  }
  
  // Check core pages
  const corePages = ['pages/_app.js', 'pages/index.js', 'pages/api/modes.js'];
  for (const page of corePages) {
    try {
      await fs.access(page);
      check(`Page: ${path.basename(page)}`, true);
    } catch (error) {
      check(`Page: ${path.basename(page)}`, false, 'Missing required page');
    }
  }
  
  // Check components
  const coreComponents = [
    'components/ModeLoader.jsx',
    'components/CharacterHost.jsx', 
    'components/TerminalInterface.jsx',
    'components/MessageController.jsx',
    'components/CommandParser.jsx',
    'components/MessagePopup.jsx'
  ];
  
  for (const comp of coreComponents) {
    try {
      const code = await fs.readFile(comp, 'utf8');
      const hasExport = code.includes('export default') || code.includes('module.exports');
      check(`Component: ${path.basename(comp)}`, hasExport,
        !hasExport ? 'Missing default export' : null);
    } catch (error) {
      check(`Component: ${path.basename(comp)}`, false, 'Missing component file');
    }
  }
  
  // Check modes directory
  try {
    const modes = await fs.readdir('modes', { withFileTypes: true });
    const modeDirectories = modes.filter(entry => entry.isDirectory());
    
    check('Modes Directory', modeDirectories.length >= 10,
      modeDirectories.length < 10 ? `Only ${modeDirectories.length} modes found, expected 11` : null);
    
    // Check each mode
    for (const mode of modeDirectories) {
      const modeId = mode.name;
      const requiredFiles = ['config.json', 'messages.json', 'scene.js', 'character.js'];
      
      for (const file of requiredFiles) {
        try {
          await fs.access(path.join('modes', modeId, file));
          
          // Validate file content
          if (file === 'config.json') {
            const config = JSON.parse(await fs.readFile(path.join('modes', modeId, file), 'utf8'));
            const hasRequired = config.id && config.name && config.popupStyle && 
                              typeof config.minDelaySeconds === 'number' &&
                              typeof config.maxDelaySeconds === 'number';
            check(`Mode ${modeId}: config.json`, hasRequired,
              !hasRequired ? 'Invalid config structure' : null);
          }
          
          if (file === 'messages.json') {
            const messages = JSON.parse(await fs.readFile(path.join('modes', modeId, file), 'utf8'));
            check(`Mode ${modeId}: messages.json`, Array.isArray(messages) && messages.length >= 5,
              !Array.isArray(messages) ? 'Messages not an array' : 
              messages.length < 5 ? `Only ${messages.length} messages` : null);
          }
          
          if (file.endsWith('.js')) {
            const code = await fs.readFile(path.join('modes', modeId, file), 'utf8');
            const hasExport = code.includes('export default');
            check(`Mode ${modeId}: ${file}`, hasExport,
              !hasExport ? 'Missing default export' : null);
          }
          
        } catch (error) {
          check(`Mode ${modeId}: ${file}`, false, `Missing or invalid: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    check('Modes Directory', false, `Cannot read modes directory: ${error.message}`);
  }
  
  // Check data files
  try {
    const globalConfig = JSON.parse(await fs.readFile('data/global-config.json', 'utf8'));
    check('Global Config', globalConfig.messageSystem && globalConfig.ui,
      'Missing required config sections');
  } catch (error) {
    check('Global Config', false, `Cannot read global config: ${error.message}`);
  }
  
  // Check master messages
  const masterMessages = [
    'data/master-messages/cliche-ai-phrases.json',
    'data/master-messages/funny-exaggerations.json'
  ];
  
  for (const file of masterMessages) {
    try {
      const messages = JSON.parse(await fs.readFile(file, 'utf8'));
      check(`Master Messages: ${path.basename(file)}`, Array.isArray(messages) && messages.length > 0,
        !Array.isArray(messages) ? 'Not an array' : 
        messages.length === 0 ? 'Empty array' : null);
    } catch (error) {
      check(`Master Messages: ${path.basename(file)}`, false, `Cannot read: ${error.message}`);
    }
  }
  
  // Check styles
  const styleFiles = ['styles/globals.css', 'styles/terminal-effects.css', 'styles/animations.css'];
  for (const style of styleFiles) {
    try {
      await fs.access(style);
      check(`Style: ${path.basename(style)}`, true);
    } catch (error) {
      check(`Style: ${path.basename(style)}`, false, 'Missing style file');
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('=' .repeat(60));
  console.log(`🔍 Checks Run: ${checksRun}`);
  console.log(`❌ Issues: ${issues.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  
  if (issues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.check}: ${issue.issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach((warning, i) => {
      console.log(`${i + 1}. ${warning.check}: ${warning.warning}`);
    });
  }
  
  const status = issues.length === 0 ? 'HEALTHY' : 'NEEDS ATTENTION';
  console.log(`\n🎯 SYSTEM STATUS: ${status}`);
  
  if (status === 'HEALTHY') {
    console.log('\n🎉 System is healthy and ready for testing!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Test terminal commands');
    console.log('4. Verify mode switching works');
    console.log('5. Check 3D scenes render properly');
  } else {
    console.log('\n🔧 Please fix the critical issues above before testing.');
  }
  
  return { status, issues: issues.length, warnings: warnings.length, checksRun };
}

runDiagnostics().catch(console.error);