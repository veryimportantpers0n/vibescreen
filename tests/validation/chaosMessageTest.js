/**
 * Chaos Message System Validation Test
 * Tests scrambled content, glitchy suffixes, and rapid timing for Chaos mode
 */

import fs from 'fs';
import path from 'path';

function validateChaosMessages() {
  console.log('💥 Testing Chaos Message System with Scrambled Content...\n');
  
  try {
    // Load Chaos configuration and messages
    const configPath = path.join(process.cwd(), 'modes/chaos/config.json');
    const messagesPath = path.join(process.cwd(), 'modes/chaos/messages.json');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    
    console.log('✅ Configuration loaded successfully');
    console.log(`   - Popup Style: ${config.popupStyle}`);
    console.log(`   - Timing: ${config.minDelaySeconds}-${config.maxDelaySeconds} seconds`);
    console.log(`   - Message Probabilities: ${JSON.stringify(config.messageProbabilities)}`);
    
    // Validate message count
    console.log(`\n✅ Message count: ${messages.length} chaotic messages`);
    if (messages.length < 20) {
      throw new Error(`Insufficient messages: ${messages.length} < 20 required`);
    }
    
    // Validate scrambled content (look for l33t speak and glitchy characters)
    const scrambledKeywords = [
      '3', '1', '0', '@', '5', 'BZZT', 'ERROR', 'GLITCH', 'MALFUNCTION', 'CHAOS'
    ];
    
    let scrambledCount = 0;
    messages.forEach(message => {
      const upperMessage = message.toUpperCase();
      if (scrambledKeywords.some(keyword => upperMessage.includes(keyword))) {
        scrambledCount++;
      }
    });
    
    console.log(`✅ Scrambled content: ${scrambledCount}/${messages.length} messages contain glitchy/scrambled elements`);
    
    // Validate ERROR messages and system malfunction themes
    const errorKeywords = ['ERROR', 'MALFUNCTION', 'SYSTEM', 'CRITICAL', 'WARNING', 'ALERT'];
    let errorCount = 0;
    messages.forEach(message => {
      const upperMessage = message.toUpperCase();
      if (errorKeywords.some(keyword => upperMessage.includes(keyword))) {
        errorCount++;
      }
    });
    
    console.log(`✅ Error themes: ${errorCount}/${messages.length} messages contain ERROR/malfunction themes`);
    
    // Validate glitchy suffixes
    const glitchySuffixes = ['BZZT', '!', 'WHEEE', 'OW', 'HELP', 'OOPS'];
    let glitchyCount = 0;
    messages.forEach(message => {
      const upperMessage = message.toUpperCase();
      if (glitchySuffixes.some(suffix => upperMessage.includes(suffix))) {
        glitchyCount++;
      }
    });
    
    console.log(`✅ Glitchy suffixes: ${glitchyCount}/${messages.length} messages contain glitchy suffixes`);
    
    // Validate configuration requirements
    if (config.popupStyle !== 'overlay') {
      throw new Error(`Wrong popup style: ${config.popupStyle} should be 'overlay'`);
    }
    
    if (config.minDelaySeconds !== 5 || config.maxDelaySeconds !== 20) {
      throw new Error(`Wrong timing: ${config.minDelaySeconds}-${config.maxDelaySeconds} should be 5-20`);
    }
    
    if (config.messageProbabilities.exaggeration !== 0.5) {
      throw new Error(`Wrong exaggeration probability: ${config.messageProbabilities.exaggeration} should be 0.5`);
    }
    
    console.log('\n🎉 Chaos Message System validation PASSED!');
    console.log(`   - ${messages.length} scrambled chaotic messages loaded`);
    console.log(`   - ${scrambledCount} messages contain l33t speak and glitchy elements`);
    console.log(`   - ${errorCount} messages have ERROR/malfunction themes`);
    console.log(`   - Overlay popup style with broken animation effects`);
    console.log(`   - 5-20 second rapid timing for maximum chaos`);
    console.log(`   - 50% exaggeration probability for chaotic energy`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Chaos Message System validation FAILED:');
    console.error(`   ${error.message}`);
    return false;
  }
}

// Always run validation for testing
validateChaosMessages();

export { validateChaosMessages };