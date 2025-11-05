# Implementation Plan

- [x] 1. Create Emotional Damage and Therapist modes with speech bubble positioning





  - Create modes/emotional-damage/ folder with sarcastic personality and dim flickering scene
  - Implement speech bubble messages positioned above character with passive-aggressive content
  - Create modes/therapist/ folder with supportive personality and warm particle scene
  - Implement speech bubble messages positioned right of character with comforting content
  - _Requirements: 1.1, 2.1, 3.1, 3.2_

- [x] 2. Implement Startup Founder and Doomsday Prophet overlay modes


  - Create modes/startup-founder/ folder with energetic pulsing neon pillar scene
  - Implement overlay messages with buzzword-heavy hype content and rapid timing
  - Create modes/doomsday-prophet/ folder with ominous approaching red sphere scene
  - Implement overlay messages with dramatic apocalyptic content and slower timing
  - _Requirements: 1.1, 2.2, 2.3, 3.3, 4.4_

- [x] 3. Create Gamer Rage and Influencer competitive/social modes


  - Create modes/gamer-rage/ folder with scoreboard-style neon scene and competitive aesthetic
  - Implement rapid overlay messages with gaming terminology and competitive language
  - Create modes/influencer/ folder with sparkle particles and quick camera zoom effects
  - Implement overlay messages with social media style hype and call-to-action content
  - _Requirements: 1.1, 4.2, 4.3_

- [x] 4. Implement Wholesome Grandma mode with nurturing personality


  - Create modes/wholesome-grandma/ folder with cozy fireplace glow scene
  - Implement speech bubble messages positioned below character with warm, nurturing content
  - Configure slower timing (30-60 seconds) appropriate for gentle, caring personality
  - Create messages focused on comfort, care, and encouragement for developers
  - _Requirements: 1.1, 3.4, 4.4_

- [x] 5. Create Spooky bonus mode with Halloween theme


  - Create modes/spooky/ folder with fog effects and floating ghost sprite scene
  - Implement overlay messages with slow fade animation and eerie, ghostly content
  - Configure atmospheric timing and special fade-slow animation type
  - Create Halloween-themed messages appropriate for spooky ambient experience
  - _Requirements: 1.1, 1.4, 4.4_

- [x] 6. Populate all modes with personality-appropriate message content

  - Distribute messages from master lists based on personality traits and tone
  - Create custom messages for modes requiring unique content (Doomsday Prophet, Spooky)
  - Ensure each mode has 15-20 unique messages for variety and engagement
  - Test message content matches personality expectations and popup positioning
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Validate complete 11-mode system integration



  - Test terminal commands for all 8 new modes (!switch Emotional Damage, !switch Therapist, etc.)
  - Verify API endpoint returns correct metadata for all 11 personality modes
  - Test message positioning system works correctly (above, below, left, right, overlay)
  - Validate performance across all modes maintains 60fps and smooth operation
  - Confirm mode switching, scene rendering, and character positioning work for complete roster
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_