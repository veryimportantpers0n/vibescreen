/**
 * ModeLoader Validation Test
 * Validates that the ModeLoader can successfully load and validate mode components
 */

// Simple validation test that can be run in browser console or Node.js
async function validateModeLoader() {
  console.log('🧪 Starting ModeLoader validation...');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function addTest(name, passed, message) {
    results.tests.push({ name, passed, message });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}: ${message}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}: ${message}`);
    }
  }
  
  // Test 1: Check if ModeLoader component exists
  try {
    const ModeLoader = await import('../../components/ModeLoader.jsx');
    addTest('Component Import', !!ModeLoader.default, 'ModeLoader component imported successfully');
  } catch (error) {
    addTest('Component Import', false, `Failed to import ModeLoader: ${error.message}`);
    return results;
  }
  
  // Test 2: Check if CharacterHost component exists
  try {
    const CharacterHost = await import('../../components/CharacterHost.jsx');
    addTest('CharacterHost Import', !!CharacterHost.default, 'CharacterHost component imported successfully');
  } catch (error) {
    addTest('CharacterHost Import', false, `Failed to import CharacterHost: ${error.message}`);
  }
  
  // Test 3: Validate corporate-ai mode structure
  try {
    const sceneModule = await import('../../modes/corporate-ai/scene.js');
    const characterModule = await import('../../modes/corporate-ai/character.js');
    const configModule = await import('../../modes/corporate-ai/config.json');
    const messagesModule = await import('../../modes/corporate-ai/messages.json');
    
    const hasScene = !!sceneModule.CorporateAIScene;
    const hasCharacter = !!characterModule.CorporateAICharacter;
    const hasConfig = !!configModule.default;
    const hasMessages = !!messagesModule.default;
    
    addTest('Corporate AI Scene', hasScene, hasScene ? 'CorporateAIScene component found' : 'CorporateAIScene component missing');
    addTest('Corporate AI Character', hasCharacter, hasCharacter ? 'CorporateAICharacter component found' : 'CorporateAICharacter component missing');
    addTest('Corporate AI Config', hasConfig, hasConfig ? 'Config file loaded' : 'Config file missing');
    addTest('Corporate AI Messages', hasMessages, hasMessages ? 'Messages file loaded' : 'Messages file missing');
    
  } catch (error) {
    addTest('Corporate AI Mode', false, `Failed to load corporate-ai mode: ${error.message}`);
  }
  
  // Test 4: Validate zen-monk mode structure
  try {
    const sceneModule = await import('../../modes/zen-monk/scene.js');
    const characterModule = await import('../../modes/zen-monk/character.js');
    
    const hasScene = !!sceneModule.ZenMonkScene;
    const hasCharacter = !!characterModule.ZenMonkCharacter;
    
    addTest('Zen Monk Scene', hasScene, hasScene ? 'ZenMonkScene component found' : 'ZenMonkScene component missing');
    addTest('Zen Monk Character', hasCharacter, hasCharacter ? 'ZenMonkCharacter component found' : 'ZenMonkCharacter component missing');
    
  } catch (error) {
    addTest('Zen Monk Mode', false, `Failed to load zen-monk mode: ${error.message}`);
  }
  
  // Test 5: Validate chaos mode structure
  try {
    const sceneModule = await import('../../modes/chaos/scene.js');
    const characterModule = await import('../../modes/chaos/character.js');
    
    const hasScene = !!sceneModule.ChaosScene;
    const hasCharacter = !!characterModule.ChaosCharacter;
    
    addTest('Chaos Scene', hasScene, hasScene ? 'ChaosScene component found' : 'ChaosScene component missing');
    addTest('Chaos Character', hasCharacter, hasCharacter ? 'ChaosCharacter component found' : 'ChaosCharacter component missing');
    
  } catch (error) {
    addTest('Chaos Mode', false, `Failed to load chaos mode: ${error.message}`);
  }
  
  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('🎉 All ModeLoader validation tests passed!');
  } else {
    console.log('⚠️ Some validation tests failed. Check the details above.');
  }
  
  return results;
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateModeLoader };
} else if (typeof window !== 'undefined') {
  window.validateModeLoader = validateModeLoader;
}

// Auto-run if called directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('modeLoaderValidation.js')) {
  validateModeLoader().catch(console.error);
}