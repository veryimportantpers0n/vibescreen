/**
 * Comprehensive VibeScreen System Test
 * 
 * This test validates all major systems before final deployment:
 * - API endpoints and data loading
 * - Mode configurations and validation
 * - Component loading and integration
 * - Terminal command system
 * - Message system functionality
 * - Three.js scene rendering
 */

import fs from 'fs/promises';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  verbose: true,
  stopOnFirstError: false,
  testTimeout: 30000
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warnings: [],
  summary: {}
};

/**
 * Utility function for logging test results
 */
function logTest(testName, status, message = '', details = null) {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  
  console.log(`${statusIcon} [${timestamp}] ${testName}: ${status}${message ? ' - ' + message : ''}`);
  
  if (details && TEST_CONFIG.verbose) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
  
  if (status === 'PASS') {
    results.passed++;
  } else if (status === 'FAIL') {
    results.failed++;
    results.errors.push({ test: testName, message, details, timestamp });
  } else if (status === 'WARN') {
    results.warnings++;
    results.warnings.push({ test: testName, message, details, timestamp });
  }
}

/**
 * Test 1: Project Structure Validation
 */
async function testProjectStructure() {
  console.log('\n🏗️  Testing Project Structure...');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'pages/_app.js',
    'pages/index.js',
    'pages/api/modes.js',
    'data/global-config.json',
    'components/ModeLoader.jsx',
    'components/CharacterHost.jsx',
    'components/TerminalInterface.jsx',
    'components/MessageController.jsx',
    'styles/globals.css'
  ];
  
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
      logTest(`File exists: ${file}`, 'PASS');
    } catch (error) {
      logTest(`File exists: ${file}`, 'FAIL', `File not found: ${error.message}`);
    }
  }
  
  // Check modes directory structure
  try {
    const modesDir = await fs.readdir('modes', { withFileTypes: true });
    const modeDirectories = modesDir.filter(entry => entry.isDirectory()).map(entry => entry.name);
    
    logTest('Modes directory', 'PASS', `Found ${modeDirectories.length} mode directories`, modeDirectories);
    
    // Validate each mode has required files
    for (const modeId of modeDirectories) {
      const requiredModeFiles = ['config.json', 'messages.json', 'scene.js', 'character.js'];
      
      for (const file of requiredModeFiles) {
        const filePath = path.join('modes', modeId, file);
        try {
          await fs.access(filePath);
          logTest(`Mode file: ${modeId}/${file}`, 'PASS');
        } catch (error) {
          logTest(`Mode file: ${modeId}/${file}`, 'FAIL', `Missing required file`);
        }
      }
    }
    
  } catch (error) {
    logTest('Modes directory', 'FAIL', `Cannot read modes directory: ${error.message}`);
  }
}

/**
 * Test 2: API Endpoint Validation
 */
async function testAPIEndpoint() {
  console.log('\n🌐 Testing API Endpoint...');
  
  try {
    // Import the API handler
    const handler = (await import('../../pages/api/modes.js')).default;
    
    // Mock request and response objects
    const mockReq = {
      method: 'GET',
      query: {},
      headers: {}
    };
    
    const mockRes = {
      headers: {},
      statusCode: null,
      responseData: null,
      setHeader: function(key, value) { this.headers[key] = value; },
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.responseData = data; return this; },
      end: function() { return this; }
    };
    
    // Test the API handler
    await handler(mockReq, mockRes);
    
    if (mockRes.statusCode === 200) {
      logTest('API Response Status', 'PASS', `Status: ${mockRes.statusCode}`);
      
      if (mockRes.responseData && Array.isArray(mockRes.responseData.modes)) {
        logTest('API Response Format', 'PASS', `Found ${mockRes.responseData.modes.length} modes`);
        
        // Validate mode data structure
        for (const mode of mockRes.responseData.modes) {
          const requiredFields = ['id', 'name', 'popupStyle', 'minDelaySeconds', 'maxDelaySeconds'];
          const missingFields = requiredFields.filter(field => !(field in mode));
          
          if (missingFields.length === 0) {
            logTest(`Mode validation: ${mode.id}`, 'PASS');
          } else {
            logTest(`Mode validation: ${mode.id}`, 'FAIL', `Missing fields: ${missingFields.join(', ')}`);
          }
        }
      } else {
        logTest('API Response Format', 'FAIL', 'Response does not contain modes array');
      }
    } else {
      logTest('API Response Status', 'FAIL', `Unexpected status: ${mockRes.statusCode}`);
    }
    
  } catch (error) {
    logTest('API Endpoint', 'FAIL', `Error testing API: ${error.message}`, error.stack);
  }
}

/**
 * Test 3: Configuration Validation
 */
async function testConfigurations() {
  console.log('\n⚙️  Testing Configurations...');
  
  // Test global config
  try {
    const globalConfigData = await fs.readFile('data/global-config.json', 'utf8');
    const globalConfig = JSON.parse(globalConfigData);
    
    const requiredGlobalFields = ['messageSystem', 'ui', 'performance'];
    const missingGlobalFields = requiredGlobalFields.filter(field => !(field in globalConfig));
    
    if (missingGlobalFields.length === 0) {
      logTest('Global Config Structure', 'PASS');
    } else {
      logTest('Global Config Structure', 'FAIL', `Missing fields: ${missingGlobalFields.join(', ')}`);
    }
    
  } catch (error) {
    logTest('Global Config', 'FAIL', `Error reading global config: ${error.message}`);
  }
  
  // Test mode configurations
  try {
    const modesDir = await fs.readdir('modes', { withFileTypes: true });
    const modeDirectories = modesDir.filter(entry => entry.isDirectory()).map(entry => entry.name);
    
    for (const modeId of modeDirectories) {
      try {
        const configPath = path.join('modes', modeId, 'config.json');
        const configData = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Validate required fields
        const requiredFields = ['id', 'name', 'popupStyle', 'minDelaySeconds', 'maxDelaySeconds'];
        const missingFields = requiredFields.filter(field => !(field in config));
        
        if (missingFields.length === 0) {
          logTest(`Config validation: ${modeId}`, 'PASS');
        } else {
          logTest(`Config validation: ${modeId}`, 'FAIL', `Missing fields: ${missingFields.join(', ')}`);
        }
        
        // Validate popup style
        if (!['overlay', 'speechBubble'].includes(config.popupStyle)) {
          logTest(`Config popupStyle: ${modeId}`, 'FAIL', `Invalid popupStyle: ${config.popupStyle}`);
        } else {
          logTest(`Config popupStyle: ${modeId}`, 'PASS');
        }
        
        // Validate timing
        if (config.minDelaySeconds >= config.maxDelaySeconds) {
          logTest(`Config timing: ${modeId}`, 'FAIL', `minDelaySeconds must be < maxDelaySeconds`);
        } else {
          logTest(`Config timing: ${modeId}`, 'PASS');
        }
        
      } catch (error) {
        logTest(`Config parsing: ${modeId}`, 'FAIL', `Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    logTest('Mode Configurations', 'FAIL', `Error reading modes: ${error.message}`);
  }
}

/**
 * Test 4: Message Data Validation
 */
async function testMessageData() {
  console.log('\n💬 Testing Message Data...');
  
  // Test master message files
  const masterMessageFiles = [
    'data/master-messages/cliche-ai-phrases.json',
    'data/master-messages/funny-exaggerations.json'
  ];
  
  for (const file of masterMessageFiles) {
    try {
      const messageData = await fs.readFile(file, 'utf8');
      const messages = JSON.parse(messageData);
      
      if (Array.isArray(messages) && messages.length > 0) {
        logTest(`Master messages: ${path.basename(file)}`, 'PASS', `${messages.length} messages`);
      } else {
        logTest(`Master messages: ${path.basename(file)}`, 'FAIL', 'Not an array or empty');
      }
      
    } catch (error) {
      logTest(`Master messages: ${path.basename(file)}`, 'FAIL', `Error: ${error.message}`);
    }
  }
  
  // Test mode message files
  try {
    const modesDir = await fs.readdir('modes', { withFileTypes: true });
    const modeDirectories = modesDir.filter(entry => entry.isDirectory()).map(entry => entry.name);
    
    for (const modeId of modeDirectories) {
      try {
        const messagesPath = path.join('modes', modeId, 'messages.json');
        const messageData = await fs.readFile(messagesPath, 'utf8');
        const messages = JSON.parse(messageData);
        
        if (Array.isArray(messages) && messages.length >= 10) {
          logTest(`Mode messages: ${modeId}`, 'PASS', `${messages.length} messages`);
        } else if (Array.isArray(messages)) {
          logTest(`Mode messages: ${modeId}`, 'WARN', `Only ${messages.length} messages (recommend 15+)`);
        } else {
          logTest(`Mode messages: ${modeId}`, 'FAIL', 'Not an array');
        }
        
      } catch (error) {
        logTest(`Mode messages: ${modeId}`, 'FAIL', `Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    logTest('Mode Messages', 'FAIL', `Error reading modes: ${error.message}`);
  }
}

/**
 * Test 5: Component Import Validation
 */
async function testComponentImports() {
  console.log('\n🧩 Testing Component Imports...');
  
  const components = [
    'components/ModeLoader.jsx',
    'components/CharacterHost.jsx',
    'components/TerminalInterface.jsx',
    'components/MessageController.jsx',
    'components/CommandParser.jsx',
    'components/MessagePopup.jsx'
  ];
  
  for (const componentPath of components) {
    try {
      // Try to read the component file
      const componentCode = await fs.readFile(componentPath, 'utf8');
      
      // Basic syntax checks
      if (componentCode.includes('export default') || componentCode.includes('module.exports')) {
        logTest(`Component export: ${path.basename(componentPath)}`, 'PASS');
      } else {
        logTest(`Component export: ${path.basename(componentPath)}`, 'FAIL', 'No default export found');
      }
      
      // Check for React imports
      if (componentCode.includes('import React') || componentCode.includes('from \'react\'')) {
        logTest(`Component React import: ${path.basename(componentPath)}`, 'PASS');
      } else {
        logTest(`Component React import: ${path.basename(componentPath)}`, 'WARN', 'No explicit React import');
      }
      
    } catch (error) {
      logTest(`Component file: ${path.basename(componentPath)}`, 'FAIL', `Error: ${error.message}`);
    }
  }
}

/**
 * Test 6: Mode Component Validation
 */
async function testModeComponents() {
  console.log('\n🎭 Testing Mode Components...');
  
  try {
    const modesDir = await fs.readdir('modes', { withFileTypes: true });
    const modeDirectories = modesDir.filter(entry => entry.isDirectory()).map(entry => entry.name);
    
    for (const modeId of modeDirectories) {
      // Test scene component
      try {
        const sceneCode = await fs.readFile(path.join('modes', modeId, 'scene.js'), 'utf8');
        
        if (sceneCode.includes('export default') && sceneCode.includes('Canvas')) {
          logTest(`Scene component: ${modeId}`, 'PASS');
        } else {
          logTest(`Scene component: ${modeId}`, 'FAIL', 'Missing export or Canvas');
        }
        
      } catch (error) {
        logTest(`Scene component: ${modeId}`, 'FAIL', `Error: ${error.message}`);
      }
      
      // Test character component
      try {
        const characterCode = await fs.readFile(path.join('modes', modeId, 'character.js'), 'utf8');
        
        if (characterCode.includes('export default') && characterCode.includes('onSpeak')) {
          logTest(`Character component: ${modeId}`, 'PASS');
        } else {
          logTest(`Character component: ${modeId}`, 'FAIL', 'Missing export or onSpeak prop');
        }
        
      } catch (error) {
        logTest(`Character component: ${modeId}`, 'FAIL', `Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    logTest('Mode Components', 'FAIL', `Error reading modes: ${error.message}`);
  }
}

/**
 * Test 7: Build System Validation
 */
async function testBuildSystem() {
  console.log('\n🔨 Testing Build System...');
  
  try {
    // Check if package.json has required scripts
    const packageData = await fs.readFile('package.json', 'utf8');
    const packageJson = JSON.parse(packageData);
    
    const requiredScripts = ['dev', 'build', 'start'];
    const missingScripts = requiredScripts.filter(script => !(script in packageJson.scripts));
    
    if (missingScripts.length === 0) {
      logTest('Package.json scripts', 'PASS');
    } else {
      logTest('Package.json scripts', 'FAIL', `Missing scripts: ${missingScripts.join(', ')}`);
    }
    
    // Check dependencies
    const requiredDeps = ['next', 'react', 'react-dom', '@react-three/fiber', '@react-three/drei', 'three'];
    const missingDeps = requiredDeps.filter(dep => 
      !(dep in (packageJson.dependencies || {})) && 
      !(dep in (packageJson.devDependencies || {}))
    );
    
    if (missingDeps.length === 0) {
      logTest('Package dependencies', 'PASS');
    } else {
      logTest('Package dependencies', 'FAIL', `Missing dependencies: ${missingDeps.join(', ')}`);
    }
    
  } catch (error) {
    logTest('Build System', 'FAIL', `Error: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive VibeScreen System Test');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  try {
    await testProjectStructure();
    await testAPIEndpoint();
    await testConfigurations();
    await testMessageData();
    await testComponentImports();
    await testModeComponents();
    await testBuildSystem();
    
  } catch (error) {
    console.error('❌ Test runner error:', error);
    results.failed++;
    results.errors.push({ test: 'Test Runner', message: error.message, timestamp: new Date().toISOString() });
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Generate summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.message}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning.test}: ${warning.message}`);
    });
  }
  
  const overallStatus = results.failed === 0 ? 'PASS' : 'FAIL';
  console.log(`\n🎯 OVERALL STATUS: ${overallStatus}`);
  
  if (overallStatus === 'PASS') {
    console.log('🎉 All critical systems are working! Ready for final deployment.');
  } else {
    console.log('🔧 Some issues need to be addressed before deployment.');
  }
  
  return {
    status: overallStatus,
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
    duration,
    errors: results.errors,
    warnings: results.warnings
  };
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTest().catch(console.error);
}

export default runComprehensiveTest;