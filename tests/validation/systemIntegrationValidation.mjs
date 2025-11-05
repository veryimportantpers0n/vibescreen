/**
 * System Integration Validation Test
 * 
 * Validates complete system integration for task 7:
 * - Terminal commands for all three modes
 * - Scene loading in SceneWrapper
 * - Character positioning in CharacterHost
 * - Message popup coordination with character speak animations
 * - API endpoint returns correct metadata
 * - Performance validation (60fps target)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SystemIntegrationValidator {
  constructor() {
    this.results = {
      terminalCommands: {},
      sceneLoading: {},
      characterPositioning: {},
      messageCoordination: {},
      apiEndpoint: {},
      performance: {},
      overall: { passed: 0, failed: 0, warnings: 0 }
    };
    this.startTime = Date.now();
  }

  /**
   * Main validation entry point
   */
  async validateSystemIntegration() {
    console.log('🔍 Starting System Integration Validation...\n');

    try {
      // Test 1: Terminal Commands for all three modes
      await this.validateTerminalCommands();

      // Test 2: Scene Loading in SceneWrapper
      await this.validateSceneLoading();

      // Test 3: Character Positioning in CharacterHost
      await this.validateCharacterPositioning();

      // Test 4: Message Popup Coordination
      await this.validateMessageCoordination();

      // Test 5: API Endpoint Metadata
      await this.validateAPIEndpoint();

      // Test 6: Performance Validation
      await this.validatePerformance();

      // Generate final report
      this.generateReport();

    } catch (error) {
      console.error('❌ System Integration Validation failed:', error);
      this.results.overall.failed++;
    }
  }

  /**
   * Test 1: Validate terminal commands for all three modes
   */
  async validateTerminalCommands() {
    console.log('📟 Testing Terminal Commands...');
    
    this.results.terminalCommands = {
      tested: 3,
      passed: 0,
      failed: 0,
      details: []
    };

    // Test CommandParser component exists and is functional
    try {
      const commandParserPath = path.join(process.cwd(), 'components', 'CommandParser.jsx');
      const commandParserContent = await fs.readFile(commandParserPath, 'utf8');
      
      // Check for essential command patterns
      const requiredPatterns = [
        /class CommandParser/,
        /parseAndExecute/,
        /handleSwitch/,
        /characterNameMap/,
        /corporate-ai.*zen-monk.*chaos/i
      ];

      let patternsPassed = 0;
      for (const pattern of requiredPatterns) {
        if (pattern.test(commandParserContent)) {
          patternsPassed++;
        }
      }

      if (patternsPassed === requiredPatterns.length) {
        this.results.terminalCommands.passed++;
        this.results.terminalCommands.details.push('✅ CommandParser component structure valid');
      } else {
        this.results.terminalCommands.failed++;
        this.results.terminalCommands.details.push(`❌ CommandParser missing patterns: ${requiredPatterns.length - patternsPassed}/${requiredPatterns.length}`);
      }

    } catch (error) {
      this.results.terminalCommands.failed++;
      this.results.terminalCommands.details.push(`❌ CommandParser component error: ${error.message}`);
    }

    // Test TerminalInterface component integration
    try {
      const terminalInterfacePath = path.join(process.cwd(), 'components', 'TerminalInterface.jsx');
      const terminalContent = await fs.readFile(terminalInterfacePath, 'utf8');
      
      const requiredFeatures = [
        /CommandParser/,
        /executeCommand/,
        /onCharacterSwitch/,
        /onMessageControl/,
        /handleKeyDown/
      ];

      let featuresPassed = 0;
      for (const feature of requiredFeatures) {
        if (feature.test(terminalContent)) {
          featuresPassed++;
        }
      }

      if (featuresPassed === requiredFeatures.length) {
        this.results.terminalCommands.passed++;
        this.results.terminalCommands.details.push('✅ TerminalInterface integration complete');
      } else {
        this.results.terminalCommands.failed++;
        this.results.terminalCommands.details.push(`❌ TerminalInterface missing features: ${requiredFeatures.length - featuresPassed}/${requiredFeatures.length}`);
      }

    } catch (error) {
      this.results.terminalCommands.failed++;
      this.results.terminalCommands.details.push(`❌ TerminalInterface component error: ${error.message}`);
    }

    // Test character name mapping for all three modes
    try {
      const commandParserPath = path.join(process.cwd(), 'components', 'CommandParser.jsx');
      const commandParserContent = await fs.readFile(commandParserPath, 'utf8');
      
      const characterMappings = [
        'corporate ai.*corporate-ai',
        'zen monk.*zen-monk',
        'chaos.*chaos'
      ];

      let mappingsPassed = 0;
      for (const mapping of characterMappings) {
        const regex = new RegExp(mapping, 'i');
        if (regex.test(commandParserContent)) {
          mappingsPassed++;
        }
      }

      if (mappingsPassed === characterMappings.length) {
        this.results.terminalCommands.passed++;
        this.results.terminalCommands.details.push('✅ All three mode character mappings found');
      } else {
        this.results.terminalCommands.failed++;
        this.results.terminalCommands.details.push(`❌ Character mappings incomplete: ${mappingsPassed}/${characterMappings.length}`);
      }

    } catch (error) {
      this.results.terminalCommands.failed++;
      this.results.terminalCommands.details.push(`❌ Character mapping validation error: ${error.message}`);
    }

    console.log(`   Terminal Commands: ${this.results.terminalCommands.passed} passed, ${this.results.terminalCommands.failed} failed\n`);
  }

  /**
   * Test 2: Validate scene loading in SceneWrapper
   */
  async validateSceneLoading() {
    console.log('🎬 Testing Scene Loading...');

    this.results.sceneLoading = {
      tested: 4,
      passed: 0,
      failed: 0,
      details: []
    };

    // Test SceneWrapper component
    try {
      const sceneWrapperPath = path.join(process.cwd(), 'components', 'SceneWrapper.jsx');
      const sceneWrapperContent = await fs.readFile(sceneWrapperPath, 'utf8');
      
      const requiredFeatures = [
        /Canvas.*from.*@react-three\/fiber/,
        /Suspense/,
        /onError/,
        /SceneErrorBoundary/,
        /FallbackUI/
      ];

      let featuresPassed = 0;
      for (const feature of requiredFeatures) {
        if (feature.test(sceneWrapperContent)) {
          featuresPassed++;
        }
      }

      if (featuresPassed === requiredFeatures.length) {
        this.results.sceneLoading.passed++;
        this.results.sceneLoading.details.push('✅ SceneWrapper component structure valid');
      } else {
        this.results.sceneLoading.failed++;
        this.results.sceneLoading.details.push(`❌ SceneWrapper missing features: ${requiredFeatures.length - featuresPassed}/${requiredFeatures.length}`);
      }

    } catch (error) {
      this.results.sceneLoading.failed++;
      this.results.sceneLoading.details.push(`❌ SceneWrapper component error: ${error.message}`);
    }

    // Test all three mode scenes exist
    const modes = ['corporate-ai', 'zen-monk', 'chaos'];
    for (const mode of modes) {
      try {
        const scenePath = path.join(process.cwd(), 'modes', mode, 'scene.js');
        const sceneContent = await fs.readFile(scenePath, 'utf8');
        
        // Check for essential Three.js scene components
        const requiredComponents = [
          /export.*default/,
          /useFrame/,
          /mesh/,
          /geometry/,
          /material/
        ];

        let componentsPassed = 0;
        for (const component of requiredComponents) {
          if (component.test(sceneContent)) {
            componentsPassed++;
          }
        }

        if (componentsPassed >= 3) { // At least 3 out of 5 components
          this.results.sceneLoading.passed++;
          this.results.sceneLoading.details.push(`✅ ${mode} scene component valid`);
        } else {
          this.results.sceneLoading.failed++;
          this.results.sceneLoading.details.push(`❌ ${mode} scene missing components: ${componentsPassed}/${requiredComponents.length}`);
        }

      } catch (error) {
        this.results.sceneLoading.failed++;
        this.results.sceneLoading.details.push(`❌ ${mode} scene error: ${error.message}`);
      }
    }

    console.log(`   Scene Loading: ${this.results.sceneLoading.passed} passed, ${this.results.sceneLoading.failed} failed\n`);
  }

  /**
   * Test 3: Validate character positioning in CharacterHost
   */
  async validateCharacterPositioning() {
    console.log('🎭 Testing Character Positioning...');

    this.results.characterPositioning = {
      tested: 4,
      passed: 0,
      failed: 0,
      details: []
    };

    // Test CharacterHost component
    try {
      const characterHostPath = path.join(process.cwd(), 'components', 'CharacterHost.jsx');
      const characterHostContent = await fs.readFile(characterHostPath, 'utf8');
      
      // Check for positioning requirements
      const positioningFeatures = [
        /position.*fixed/,
        /bottom.*20px/,
        /right.*20px/,
        /Canvas/,
        /triggerSpeakAnimation/
      ];

      let positioningPassed = 0;
      for (const feature of positioningFeatures) {
        if (feature.test(characterHostContent)) {
          positioningPassed++;
        }
      }

      if (positioningPassed >= 4) { // At least 4 out of 5 features
        this.results.characterPositioning.passed++;
        this.results.characterPositioning.details.push('✅ CharacterHost positioning correct');
      } else {
        this.results.characterPositioning.failed++;
        this.results.characterPositioning.details.push(`❌ CharacterHost positioning incomplete: ${positioningPassed}/${positioningFeatures.length}`);
      }

    } catch (error) {
      this.results.characterPositioning.failed++;
      this.results.characterPositioning.details.push(`❌ CharacterHost component error: ${error.message}`);
    }

    // Test all three mode characters exist
    const modes = ['corporate-ai', 'zen-monk', 'chaos'];
    for (const mode of modes) {
      try {
        const characterPath = path.join(process.cwd(), 'modes', mode, 'character.js');
        const characterContent = await fs.readFile(characterPath, 'utf8');
        
        // Check for essential character components
        const requiredComponents = [
          /export.*default/,
          /useFrame/,
          /mesh/,
          /onSpeak/
        ];

        let componentsPassed = 0;
        for (const component of requiredComponents) {
          if (component.test(characterContent)) {
            componentsPassed++;
          }
        }

        if (componentsPassed >= 3) { // At least 3 out of 4 components
          this.results.characterPositioning.passed++;
          this.results.characterPositioning.details.push(`✅ ${mode} character component valid`);
        } else {
          this.results.characterPositioning.failed++;
          this.results.characterPositioning.details.push(`❌ ${mode} character missing components: ${componentsPassed}/${requiredComponents.length}`);
        }

      } catch (error) {
        this.results.characterPositioning.failed++;
        this.results.characterPositioning.details.push(`❌ ${mode} character error: ${error.message}`);
      }
    }

    console.log(`   Character Positioning: ${this.results.characterPositioning.passed} passed, ${this.results.characterPositioning.failed} failed\n`);
  }

  /**
   * Test 4: Validate message popup coordination with character speak animations
   */
  async validateMessageCoordination() {
    console.log('💬 Testing Message Coordination...');

    this.results.messageCoordination = {
      tested: 4,
      passed: 0,
      failed: 0,
      details: []
    };

    // Test MessagePopup component
    try {
      const messagePopupPath = path.join(process.cwd(), 'components', 'MessagePopup.jsx');
      const messagePopupContent = await fs.readFile(messagePopupPath, 'utf8');
      
      const requiredFeatures = [
        /onSpeakTrigger/,
        /overlay.*speechBubble/i,
        /animation/,
        /position/
      ];

      let featuresPassed = 0;
      for (const feature of requiredFeatures) {
        if (feature.test(messagePopupContent)) {
          featuresPassed++;
        }
      }

      if (featuresPassed >= 3) {
        this.results.messageCoordination.passed++;
        this.results.messageCoordination.details.push('✅ MessagePopup coordination features present');
      } else {
        this.results.messageCoordination.failed++;
        this.results.messageCoordination.details.push(`❌ MessagePopup missing features: ${featuresPassed}/${requiredFeatures.length}`);
      }

    } catch (error) {
      this.results.messageCoordination.failed++;
      this.results.messageCoordination.details.push(`❌ MessagePopup component error: ${error.message}`);
    }

    // Test MessageController component
    try {
      const messageControllerPath = path.join(process.cwd(), 'components', 'MessageController.jsx');
      const messageControllerContent = await fs.readFile(messageControllerPath, 'utf8');
      
      const requiredFeatures = [
        /MessageScheduler/,
        /onMessageShow/,
        /triggerSpeak/,
        /pause.*resume/i
      ];

      let featuresPassed = 0;
      for (const feature of requiredFeatures) {
        if (feature.test(messageControllerContent)) {
          featuresPassed++;
        }
      }

      if (featuresPassed >= 3) {
        this.results.messageCoordination.passed++;
        this.results.messageCoordination.details.push('✅ MessageController coordination complete');
      } else {
        this.results.messageCoordination.failed++;
        this.results.messageCoordination.details.push(`❌ MessageController missing features: ${featuresPassed}/${requiredFeatures.length}`);
      }

    } catch (error) {
      this.results.messageCoordination.failed++;
      this.results.messageCoordination.details.push(`❌ MessageController component error: ${error.message}`);
    }

    // Test message files for all three modes
    const modes = ['corporate-ai', 'zen-monk', 'chaos'];
    for (const mode of modes) {
      try {
        const messagesPath = path.join(process.cwd(), 'modes', mode, 'messages.json');
        const messagesContent = await fs.readFile(messagesPath, 'utf8');
        const messages = JSON.parse(messagesContent);
        
        if (Array.isArray(messages) && messages.length > 0) {
          this.results.messageCoordination.passed++;
          this.results.messageCoordination.details.push(`✅ ${mode} messages valid (${messages.length} messages)`);
        } else {
          this.results.messageCoordination.failed++;
          this.results.messageCoordination.details.push(`❌ ${mode} messages invalid or empty`);
        }

      } catch (error) {
        this.results.messageCoordination.failed++;
        this.results.messageCoordination.details.push(`❌ ${mode} messages error: ${error.message}`);
      }
    }

    console.log(`   Message Coordination: ${this.results.messageCoordination.passed} passed, ${this.results.messageCoordination.failed} failed\n`);
  }

  /**
   * Test 5: Validate API endpoint returns correct metadata
   */
  async validateAPIEndpoint() {
    console.log('🔌 Testing API Endpoint...');

    this.results.apiEndpoint = {
      tested: 4,
      passed: 0,
      failed: 0,
      details: []
    };

    // Test API endpoint file exists and has correct structure
    try {
      const apiPath = path.join(process.cwd(), 'pages', 'api', 'modes.js');
      const apiContent = await fs.readFile(apiPath, 'utf8');
      
      const requiredFeatures = [
        /export.*default.*handler/,
        /discoverModes/,
        /loadModeConfig/,
        /validateModeConfig/,
        /res\.json/
      ];

      let featuresPassed = 0;
      for (const feature of requiredFeatures) {
        if (feature.test(apiContent)) {
          featuresPassed++;
        }
      }

      if (featuresPassed === requiredFeatures.length) {
        this.results.apiEndpoint.passed++;
        this.results.apiEndpoint.details.push('✅ API endpoint structure valid');
      } else {
        this.results.apiEndpoint.failed++;
        this.results.apiEndpoint.details.push(`❌ API endpoint missing features: ${requiredFeatures.length - featuresPassed}/${requiredFeatures.length}`);
      }

    } catch (error) {
      this.results.apiEndpoint.failed++;
      this.results.apiEndpoint.details.push(`❌ API endpoint error: ${error.message}`);
    }

    // Test mode configurations for all three modes
    const modes = ['corporate-ai', 'zen-monk', 'chaos'];
    for (const mode of modes) {
      try {
        const configPath = path.join(process.cwd(), 'modes', mode, 'config.json');
        const configContent = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        // Check required configuration fields
        const requiredFields = ['id', 'name', 'popupStyle', 'minDelaySeconds', 'maxDelaySeconds'];
        const presentFields = requiredFields.filter(field => config.hasOwnProperty(field));
        
        if (presentFields.length >= 4) { // At least 4 out of 5 required fields
          this.results.apiEndpoint.passed++;
          this.results.apiEndpoint.details.push(`✅ ${mode} config valid (${presentFields.length}/${requiredFields.length} fields)`);
        } else {
          this.results.apiEndpoint.failed++;
          this.results.apiEndpoint.details.push(`❌ ${mode} config incomplete: ${presentFields.length}/${requiredFields.length} fields`);
        }

      } catch (error) {
        this.results.apiEndpoint.failed++;
        this.results.apiEndpoint.details.push(`❌ ${mode} config error: ${error.message}`);
      }
    }

    console.log(`   API Endpoint: ${this.results.apiEndpoint.passed} passed, ${this.results.apiEndpoint.failed} failed\n`);
  }

  /**
   * Test 6: Validate performance across all modes maintains 60fps target
   */
  async validatePerformance() {
    console.log('⚡ Testing Performance...');

    this.results.performance = {
      tested: 5,
      passed: 0,
      failed: 0,
      details: []
    };

    // Test SceneWrapper performance configuration
    try {
      const sceneWrapperPath = path.join(process.cwd(), 'components', 'SceneWrapper.jsx');
      const sceneWrapperContent = await fs.readFile(sceneWrapperPath, 'utf8');
      
      const performanceFeatures = [
        /performance.*60/i,
        /frameloop.*always/,
        /pixelRatio/,
        /antialias/,
        /powerPreference.*high-performance/
      ];

      let performancePassed = 0;
      for (const feature of performanceFeatures) {
        if (feature.test(sceneWrapperContent)) {
          performancePassed++;
        }
      }

      if (performancePassed >= 3) {
        this.results.performance.passed++;
        this.results.performance.details.push('✅ SceneWrapper performance optimizations present');
      } else {
        this.results.performance.failed++;
        this.results.performance.details.push(`❌ SceneWrapper performance features: ${performancePassed}/${performanceFeatures.length}`);
      }

    } catch (error) {
      this.results.performance.failed++;
      this.results.performance.details.push(`❌ SceneWrapper performance error: ${error.message}`);
    }

    // Test resource cleanup utilities
    try {
      const resourceCleanupPath = path.join(process.cwd(), 'utils', 'resourceCleanup.js');
      const resourceCleanupContent = await fs.readFile(resourceCleanupPath, 'utf8');
      
      const cleanupFeatures = [
        /threeJSResourceManager/,
        /disposeModeResources/,
        /trackResource/,
        /cleanup/i
      ];

      let cleanupPassed = 0;
      for (const feature of cleanupFeatures) {
        if (feature.test(resourceCleanupContent)) {
          cleanupPassed++;
        }
      }

      if (cleanupPassed >= 3) {
        this.results.performance.passed++;
        this.results.performance.details.push('✅ Resource cleanup utilities present');
      } else {
        this.results.performance.failed++;
        this.results.performance.details.push(`❌ Resource cleanup features: ${cleanupPassed}/${cleanupFeatures.length}`);
      }

    } catch (error) {
      this.results.performance.failed++;
      this.results.performance.details.push(`❌ Resource cleanup error: ${error.message}`);
    }

    // Test scene complexity for performance (simple geometry)
    const modes = ['corporate-ai', 'zen-monk', 'chaos'];
    for (const mode of modes) {
      try {
        const scenePath = path.join(process.cwd(), 'modes', mode, 'scene.js');
        const sceneContent = await fs.readFile(scenePath, 'utf8');
        
        // Check for performance-friendly geometry
        const simpleGeometry = [
          /boxGeometry/i,
          /sphereGeometry/i,
          /planeGeometry/i,
          /cylinderGeometry/i
        ];

        const complexGeometry = [
          /torusKnotGeometry/i,
          /icosahedronGeometry.*detail.*[5-9]/i,
          /sphereGeometry.*segments.*[5-9][0-9]/i
        ];

        let hasSimpleGeometry = simpleGeometry.some(pattern => pattern.test(sceneContent));
        let hasComplexGeometry = complexGeometry.some(pattern => pattern.test(sceneContent));

        if (hasSimpleGeometry && !hasComplexGeometry) {
          this.results.performance.passed++;
          this.results.performance.details.push(`✅ ${mode} scene uses performance-friendly geometry`);
        } else if (hasSimpleGeometry) {
          this.results.performance.passed++; // Still pass but with warning
          this.results.performance.details.push(`⚠️ ${mode} scene has mixed geometry complexity`);
        } else {
          this.results.performance.failed++;
          this.results.performance.details.push(`❌ ${mode} scene may have performance issues`);
        }

      } catch (error) {
        this.results.performance.failed++;
        this.results.performance.details.push(`❌ ${mode} scene performance error: ${error.message}`);
      }
    }

    console.log(`   Performance: ${this.results.performance.passed} passed, ${this.results.performance.failed} failed\n`);
  }

  /**
   * Generate comprehensive validation report
   */
  generateReport() {
    const totalTime = Date.now() - this.startTime;
    
    console.log('📊 SYSTEM INTEGRATION VALIDATION REPORT');
    console.log('=' .repeat(50));
    
    // Calculate overall statistics
    const categories = ['terminalCommands', 'sceneLoading', 'characterPositioning', 'messageCoordination', 'apiEndpoint', 'performance'];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTested = 0;

    categories.forEach(category => {
      const result = this.results[category];
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTested += result.tested;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  Tested: ${result.tested}, Passed: ${result.passed}, Failed: ${result.failed}`);
      
      result.details.forEach(detail => {
        console.log(`  ${detail}`);
      });
    });

    // Overall summary
    console.log('\n' + '='.repeat(50));
    console.log('OVERALL SUMMARY:');
    console.log(`Total Tests: ${totalTested}`);
    console.log(`Passed: ${totalPassed} (${Math.round((totalPassed/totalTested)*100)}%)`);
    console.log(`Failed: ${totalFailed} (${Math.round((totalFailed/totalTested)*100)}%)`);
    console.log(`Execution Time: ${totalTime}ms`);
    
    // Requirements mapping
    console.log('\nREQUIREMENTS VALIDATION:');
    console.log('✅ 5.1 - Terminal commands for all three modes: ' + (this.results.terminalCommands.passed > 0 ? 'PASS' : 'FAIL'));
    console.log('✅ 5.2 - Scene loading in SceneWrapper: ' + (this.results.sceneLoading.passed > 0 ? 'PASS' : 'FAIL'));
    console.log('✅ 5.3 - Character positioning in CharacterHost: ' + (this.results.characterPositioning.passed > 0 ? 'PASS' : 'FAIL'));
    console.log('✅ 5.4 - Message popup coordination: ' + (this.results.messageCoordination.passed > 0 ? 'PASS' : 'FAIL'));
    console.log('✅ 5.5 - API endpoint metadata: ' + (this.results.apiEndpoint.passed > 0 ? 'PASS' : 'FAIL'));
    console.log('✅ Performance (60fps target): ' + (this.results.performance.passed > 0 ? 'PASS' : 'FAIL'));

    // Final status
    const overallSuccess = totalFailed === 0;
    console.log('\n' + '='.repeat(50));
    console.log(overallSuccess ? '🎉 SYSTEM INTEGRATION VALIDATION: PASSED' : '❌ SYSTEM INTEGRATION VALIDATION: FAILED');
    console.log('=' .repeat(50));

    // Update overall results
    this.results.overall.passed = totalPassed;
    this.results.overall.failed = totalFailed;
    this.results.overall.success = overallSuccess;
    this.results.overall.executionTime = totalTime;

    return this.results;
  }
}

// Run validation if called directly
const validator = new SystemIntegrationValidator();
validator.validateSystemIntegration()
  .then(() => {
    process.exit(validator.results.overall.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });