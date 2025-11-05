# Implementation Plan

- [x] 1. Create Corporate AI mode with professional aesthetic





  - Create modes/corporate-ai/ folder with complete file structure
  - Implement config.json with overlay popup style and 12-45 second timing
  - Build scene.js with rotating polished cubes and soft lighting using Three.js
  - Create character.js with professional cylindrical character and speak animation
  - _Requirements: 1.1, 2.1, 4.2_

- [x] 2. Implement Corporate AI message system



  - Create messages.json with formal cliché AI phrases from master lists B and C
  - Populate with 20+ professional, polite messages appropriate for corporate personality
  - Ensure message content matches formal tone and overlay popup style
  - Test message distribution and timing with configured intervals
  - _Requirements: 3.1, 3.4, 4.2_

- [x] 3. Create Zen Monk mode with peaceful aesthetic



  - Create modes/zen-monk/ folder with complete file structure including haikus.json
  - Implement config.json with speechBubble popup style and calm 20-60 second timing
  - Build scene.js with floating lotus petals and slow camera pan animation
  - Create character.js with peaceful character design and gentle speak animation
  - _Requirements: 1.2, 2.2, 4.3_

- [x] 4. Implement Zen Monk message and haiku system



  - Create messages.json with calm, peaceful messages from appropriate master lists
  - Build haikus.json with 8+ zen-style haikus about coding and mindfulness
  - Configure speechBubble style messages positioned left of character
  - Test haiku rotation and peaceful message timing
  - _Requirements: 3.2, 3.4, 4.3_

- [x] 5. Create Chaos mode with glitchy aesthetic



  - Create modes/chaos/ folder with complete file structure
  - Implement config.json with overlay popup style and rapid 5-20 second timing
  - Build scene.js with jittering planes, color glitching, and chaotic animations
  - Create character.js with unpredictable movements and glitchy speak animation
  - _Requirements: 1.3, 2.3, 4.4_

- [x] 6. Implement Chaos message system with scrambled content



  - Create messages.json with scrambled lines from master list A mixed with glitchy suffixes
  - Add chaotic message variations with ERROR messages and system malfunction themes
  - Configure overlay popup style with broken animation effects
  - Test rapid message timing and glitchy visual effects
  - _Requirements: 3.3, 3.4, 4.4_

- [x] 7. Validate complete system integration





  - Test all three modes with terminal commands (!switch Corporate AI, !switch Zen Monk, !switch Chaos)
  - Verify scene loading in SceneWrapper and character positioning in CharacterHost
  - Confirm message popup coordination with character speak animations
  - Test API endpoint returns correct metadata for all implemented modes
  - Validate performance across all modes maintains 60fps target
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_