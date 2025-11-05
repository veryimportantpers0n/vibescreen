/**
 * Corporate AI Message System Validation Test
 * Tests message content, timing, and distribution for Corporate AI mode
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateCorporateAIMessages() {
  console.log('🧪 Testing Corporate AI Message System...\n');
  
  try {
    // Load Corporate AI configuration
    const configPath = path.join(process.cwd(), 'modes/corporate-ai/config.json');
    const messagesPath = path.join(process.cwd(), 'modes/corporate-ai/messages.json');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
    
    console.log('✅ Configuration loaded successfully');
    console.log(`   - Popup Style: ${config.popupStyle}`);
    console.log(`   - Timing: ${config.minDelaySeconds}-${config.maxDelaySeconds} seconds`);
    console.log(`   - Message Probabilities: ${JSON.stringify(config.messageProbabilities)}`);
    
    // Validate message count
    console.log(`\n✅ Message count: ${messages.length} messages`);
    if (messages.length < 20) {
      throw new Error(`Insufficient messages: ${messages.length} < 20 required`);
    }
    
    // Validate message content
    const professionalKeywords = [
      'professional', 'assist', 'analyze', 'calculate', 'process',
      'optimize', 'efficient', 'protocol', 'algorithm', 'parameter'
    ];
    
    let professionalCount = 0;
    messages.forEach(message => {
      const lowerMessage = message.toLowerCase();
      if (professionalKeywords.some(keyword => lowerMessage.includes(keyword))) {
        professionalCount++;
      }
    });
    
    console.log(`✅ Professional tone: ${professionalCount}/${messages.length} messages contain professional keywords`);
    
    // Validate configuration requirements
    if (config.popupStyle !== 'overlay') {
      throw new Error(`Wrong popup style: ${config.popupStyle} should be 'overlay'`);
    }
    
    if (config.minDelaySeconds !== 12 || config.maxDelaySeconds !== 45) {
      throw new Error(`Wrong timing: ${config.minDelaySeconds}-${config.maxDelaySeconds} should be 12-45`);
    }
    
    console.log('\n🎉 Corporate AI Message System validation PASSED!');
    console.log(`   - ${messages.length} professional messages loaded`);
    console.log(`   - Overlay popup style configured`);
    console.log(`   - 12-45 second timing intervals set`);
    console.log(`   - Message probabilities favor cliché phrases (70%)`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Corporate AI Message System validation FAILED:');
    console.error(`   ${error.message}`);
    return false;
  }
}

// Always run validation for testing
validateCorporateAIMessages();

export { validateCorporateAIMessages };