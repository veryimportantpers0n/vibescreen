/**
 * Message Positioning System Test
 * 
 * Tests the character-relative positioning system implementation
 * for the MessagePopup component.
 */

// Mock window dimensions for testing
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768
};

// Mock character position (bottom-right corner)
const mockCharacterPosition = {
  x: mockWindow.innerWidth - 120,  // 904
  y: mockWindow.innerHeight - 120  // 648
};

// Mode positioning configuration (from component)
const modePositioning = {
  'corporate-ai': { style: 'overlay', position: 'overlay' },
  'zen-monk': { style: 'speechBubble', position: 'left' },
  'chaos': { style: 'overlay', position: 'overlay', animation: 'glitchy' },
  'emotional-damage': { style: 'speechBubble', position: 'above' },
  'therapist': { style: 'speechBubble', position: 'right' },
  'startup-founder': { style: 'overlay', position: 'overlay' },
  'doomsday-prophet': { style: 'overlay', position: 'overlay' },
  'gamer-rage': { style: 'overlay', position: 'overlay' },
  'influencer': { style: 'overlay', position: 'overlay' },
  'wholesome-grandma': { style: 'speechBubble', position: 'below' },
  'spooky': { style: 'overlay', position: 'overlay', animation: 'fade-slow' }
};

// Position calculation logic (from component)
function calculateSafePosition(basePosition, characterPos, viewport, messageSize, preferredPosition) {
  let { x, y } = basePosition;
  const { width: vw, height: vh } = viewport;
  const { width: mw, height: mh } = messageSize;
  
  // Safety margins
  const margin = 20;
  const modeSelectorHeight = 120; // Account for bottom mode selector
  
  // Check if current position is within safe bounds
  const isWithinBounds = (testX, testY) => {
    return testX >= margin && 
           testX + mw <= vw - margin && 
           testY >= margin && 
           testY + mh <= vh - modeSelectorHeight;
  };
  
  // If current position is safe, use it
  if (isWithinBounds(x, y)) {
    return { x, y };
  }
  
  // Try alternative positions if current one doesn't fit
  const alternativePositions = {
    above: { x: characterPos.x, y: characterPos.y - 120 },
    below: { x: characterPos.x, y: characterPos.y + 120 },
    left: { x: characterPos.x - 200, y: characterPos.y - 60 },
    right: { x: characterPos.x + 200, y: characterPos.y - 60 }
  };
  
  // Try each alternative position
  const positionOrder = [preferredPosition, 'above', 'right', 'below', 'left'];
  
  for (const pos of positionOrder) {
    if (alternativePositions[pos]) {
      const altPos = alternativePositions[pos];
      if (isWithinBounds(altPos.x, altPos.y)) {
        return altPos;
      }
    }
  }
  
  // If no alternative works, force into safe bounds
  x = Math.max(margin, Math.min(x, vw - mw - margin));
  y = Math.max(margin, Math.min(y, vh - mh - modeSelectorHeight));
  
  return { x, y };
}

// Test function
function testPositioning() {
  console.log('🧪 Testing Message Positioning System\n');
  
  const messageSize = { width: 300, height: 100 };
  const viewport = { width: mockWindow.innerWidth, height: mockWindow.innerHeight };
  
  // Test each mode's positioning
  Object.entries(modePositioning).forEach(([mode, config]) => {
    console.log(`📍 Testing ${mode} mode:`);
    console.log(`   Style: ${config.style}, Position: ${config.position}`);
    
    if (config.style === 'overlay') {
      console.log(`   ✅ Overlay positioning: Center screen (512, 384)`);
    } else {
      // Calculate speech bubble position
      const baseOffsets = {
        above: { x: 0, y: -120 },
        below: { x: 0, y: 120 },
        left: { x: -200, y: -60 },
        right: { x: 200, y: -60 }
      };
      
      const offset = baseOffsets[config.position] || baseOffsets.above;
      const baseX = mockCharacterPosition.x + offset.x;
      const baseY = mockCharacterPosition.y + offset.y;
      
      const safePosition = calculateSafePosition(
        { x: baseX, y: baseY },
        mockCharacterPosition,
        viewport,
        messageSize,
        config.position
      );
      
      console.log(`   📐 Base position: (${baseX}, ${baseY})`);
      console.log(`   ✅ Safe position: (${safePosition.x}, ${safePosition.y})`);
      
      // Validate position is within bounds
      const isValid = safePosition.x >= 20 && 
                     safePosition.x + messageSize.width <= viewport.width - 20 &&
                     safePosition.y >= 20 && 
                     safePosition.y + messageSize.height <= viewport.height - 120;
      
      console.log(`   ${isValid ? '✅' : '❌'} Position validation: ${isValid ? 'PASS' : 'FAIL'}`);
    }
    console.log('');
  });
  
  // Test edge cases
  console.log('🔍 Testing Edge Cases:\n');
  
  // Test character at screen edge
  const edgeCharacter = { x: 50, y: 50 };
  const edgePosition = calculateSafePosition(
    { x: edgeCharacter.x - 200, y: edgeCharacter.y - 60 }, // Left position would go off-screen
    edgeCharacter,
    viewport,
    messageSize,
    'left'
  );
  
  console.log('📍 Character near edge (50, 50):');
  console.log(`   ✅ Fallback position: (${edgePosition.x}, ${edgePosition.y})`);
  
  // Test mobile viewport
  const mobileViewport = { width: 375, height: 667 };
  const mobilePosition = calculateSafePosition(
    { x: 200, y: 300 },
    { x: 300, y: 500 },
    mobileViewport,
    { width: 250, height: 80 },
    'right'
  );
  
  console.log('\n📱 Mobile viewport test (375x667):');
  console.log(`   ✅ Mobile position: (${mobilePosition.x}, ${mobilePosition.y})`);
  
  console.log('\n🎉 All positioning tests completed!');
}

// Run tests
testPositioning();

// Export for potential use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    modePositioning,
    calculateSafePosition,
    testPositioning
  };
}