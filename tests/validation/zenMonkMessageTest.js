/**
 * Zen Monk Message and Haiku System Validation Test
 * Tests message content, haiku structure, timing, and speech bubble configuration
 */

import fs from 'fs';
import path from 'path';

function validateZenMonkMessages() {
  console.log('🧘 Testing Zen Monk Message and Haiku System...\n');
  
  try {
    // Load Zen Monk configuration and messages
    const configPath = path.join(process.cwd(), 'modes/zen-monk/config.json');
    const messagesPath = path.join(process.cwd(), 'modes/zen-monk/messages.json');
    const haikusPath = path.join(process.cwd(), 'modes/zen-monk/haikus.json');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    const haikus = JSON.parse(fs.readFileSync(haikusPath, 'utf8'));
    
    console.log('✅ Configuration loaded successfully');
    console.log(`   - Popup Style: ${config.popupStyle}`);
    console.log(`   - Timing: ${config.minDelaySeconds}-${config.maxDelaySeconds} seconds`);
    console.log(`   - Message Probabilities: ${JSON.stringify(config.messageProbabilities)}`);
    
    // Validate message count
    console.log(`\n✅ Message count: ${messages.length} peaceful messages`);
    if (messages.length < 20) {
      throw new Error(`Insufficient messages: ${messages.length} < 20 required`);
    }
    
    // Validate haiku count and structure
    console.log(`✅ Haiku count: ${haikus.length} zen-style haikus`);
    if (haikus.length < 8) {
      throw new Error(`Insufficient haikus: ${haikus.length} < 8 required`);
    }
    
    // Validate haiku structure (should have line breaks)
    let validHaikus = 0;
    haikus.forEach(haiku => {
      const lines = haiku.split('\n');
      if (lines.length === 3) {
        validHaikus++;
      }
    });
    
    console.log(`✅ Haiku structure: ${validHaikus}/${haikus.length} haikus have proper 3-line structure`);
    
    // Validate message content for peaceful tone
    const peacefulKeywords = [
      'peace', 'calm', 'wisdom', 'breath', 'stillness', 'mindful',
      'meditation', 'gentle', 'flow', 'balance', 'harmony', 'zen'
    ];
    
    let peacefulCount = 0;
    messages.forEach(message => {
      const lowerMessage = message.toLowerCase();
      if (peacefulKeywords.some(keyword => lowerMessage.includes(keyword))) {
        peacefulCount++;
      }
    });
    
    console.log(`✅ Peaceful tone: ${peacefulCount}/${messages.length} messages contain peaceful keywords`);
    
    // Validate configuration requirements
    if (config.popupStyle !== 'speechBubble') {
      throw new Error(`Wrong popup style: ${config.popupStyle} should be 'speechBubble'`);
    }
    
    if (config.minDelaySeconds !== 20 || config.maxDelaySeconds !== 60) {
      throw new Error(`Wrong timing: ${config.minDelaySeconds}-${config.maxDelaySeconds} should be 20-60`);
    }
    
    if (config.messageProbabilities.haiku !== 0.6) {
      throw new Error(`Wrong haiku probability: ${config.messageProbabilities.haiku} should be 0.6`);
    }
    
    console.log('\n🎉 Zen Monk Message and Haiku System validation PASSED!');
    console.log(`   - ${messages.length} peaceful messages loaded`);
    console.log(`   - ${haikus.length} zen-style coding haikus created`);
    console.log(`   - Speech bubble popup style configured`);
    console.log(`   - 20-60 second calm timing intervals set`);
    console.log(`   - 60% haiku probability for authentic zen experience`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Zen Monk Message and Haiku System validation FAILED:');
    console.error(`   ${error.message}`);
    return false;
  }
}

// Always run validation for testing
validateZenMonkMessages();

export { validateZenMonkMessages };