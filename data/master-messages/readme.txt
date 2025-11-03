VibeScreen Message Distribution Guidelines
==========================================

This document explains how to distribute messages from the master lists to individual personality modes, ensuring each character maintains authentic tone and engagement patterns.

MASTER MESSAGE LISTS OVERVIEW
=============================

A. funny-exaggerations.json (24 messages)
   - Tone: Humorous, confident, energetic, supportive
   - Style: Tech-savvy compliments, exaggerated confidence boosts
   - Target audience: High-energy personalities that need engaging content
   - Examples: "System check: confidence = over 9000", "You're built different"

B. cliche-ai-phrases.json (20 messages)  
   - Tone: Formal, helpful, standard AI assistant responses
   - Style: Professional, polite, typical chatbot language
   - Target audience: Professional or supportive personalities
   - Examples: "As an AI language model...", "I hope that helps!"

C. cliche-ai-things.json (20 messages)
   - Tone: Calm, neutral, philosophical, versatile
   - Style: Balanced responses suitable for multiple contexts
   - Target audience: Balanced personalities needing adaptable content
   - Examples: "That's a great idea!", "Let's approach this step by step"

PERSONALITY MODE DISTRIBUTION STRATEGY
=====================================

HIGH-ENERGY MODES (Use List A + selective C)
--------------------------------------------
startup-founder:
  - Primary: List A (funny-exaggerations) - matches hype and confidence
  - Secondary: Custom hype messages like "We're revolutionizing synergy..."
  - Avoid: List B (too formal for startup energy)

gamer-rage:
  - Primary: Subset of List A (shorter, snappier lines)
  - Focus on: Confidence boosters and achievement-style messages
  - Custom additions: Gaming-specific taunts and encouragement

influencer:
  - Primary: List A (matches energy and confidence)
  - Secondary: Short CTA-style messages
  - Style: Keep messages brief and action-oriented

chaos:
  - Primary: Scrambled mix of List A + List C
  - Special treatment: Add nonsense suffixes, glitch effects
  - Style: Intentionally broken or corrupted versions of normal messages

PROFESSIONAL/SUPPORTIVE MODES (Use List B + C)
----------------------------------------------
corporate-ai:
  - Primary: List B (cliche-ai-phrases) - perfect professional tone
  - Secondary: List C for variety
  - Style: Maintain formal, helpful assistant persona

therapist:
  - Primary: List B (supportive and understanding tone)
  - Secondary: Custom calming messages like "Tell me more about that missing semicolon"
  - Avoid: List A (too energetic for therapeutic setting)

emotional-damage:
  - Primary: Sarcastic edits of List B + List A
  - Style: Passive-aggressive, short snarky phrases
  - Treatment: Modify existing messages to add subtle sarcasm

BALANCED/PHILOSOPHICAL MODES (Use List C + custom)
-------------------------------------------------
zen-monk:
  - Primary: Custom haiku-style messages (8-12 entries)
  - Secondary: Calm selections from List C
  - Style: Peaceful, mindful, nature-inspired
  - Format: Traditional 5-7-5 syllable structure when possible

wholesome-grandma:
  - Primary: Custom warm, nurturing messages
  - Secondary: Supportive selections from List C
  - Style: Cozy, kind, cookie-related, family-oriented
  - Examples: "You're doing wonderfully, dear", "Time for a snack break"

doomsday-prophet:
  - Primary: Custom dramatic, apocalyptic messages
  - Style: Ominous but not genuinely frightening
  - Tone: Theatrical doom with underlying humor

spooky (bonus mode):
  - Primary: Custom ghostly whispers and eerie messages
  - Style: Mysterious, supernatural, Halloween-themed
  - Treatment: Slow fade animations, ethereal presentation

MESSAGE SELECTION BEST PRACTICES
================================

Quantity Guidelines:
- Standard modes: 20+ messages for good variety
- Specialized modes: 8-12 messages minimum
- High-frequency modes: 25+ messages to prevent repetition

Tone Consistency Rules:
1. Each mode should maintain consistent personality throughout all messages
2. Avoid mixing drastically different tones within a single mode
3. Custom messages should feel natural alongside master list selections
4. Test message flow to ensure smooth personality transitions

Content Appropriateness:
- All messages must be workplace-appropriate
- Avoid potentially offensive or exclusionary language
- Keep technical references accessible to general audiences
- Maintain positive or neutral sentiment (except for intentionally sarcastic modes)

Distribution Examples:
- corporate-ai: 60% List B + 40% List C
- startup-founder: 70% List A + 30% custom hype
- zen-monk: 80% custom haikus + 20% calm List C selections
- chaos: 50% scrambled List A + 50% corrupted List C

FUTURE CONTENT CREATION GUIDELINES
==================================

When creating new messages or modes:

1. Personality First: Define the character's core traits before writing messages
2. Consistency Check: Ensure all messages sound like they come from the same character
3. Variety Balance: Mix statement types (questions, observations, encouragements)
4. Length Consideration: Keep messages concise for popup display (under 100 characters ideal)
5. Cultural Sensitivity: Avoid references that might not translate across cultures
6. Technical Accessibility: Don't assume deep technical knowledge from users

Message Categories by Function:
- Encouragement: Boost user confidence and motivation
- Observation: Comment on user activity or environment  
- Question: Engage user with thoughtful prompts
- Instruction: Provide gentle guidance or suggestions
- Humor: Lighten mood with appropriate jokes or wordplay

Testing New Content:
1. Read all messages for a mode in sequence - do they feel cohesive?
2. Test with different popup timings to ensure good flow
3. Verify messages work well with both overlay and speechBubble styles
4. Check that message length works across different screen sizes

TECHNICAL IMPLEMENTATION NOTES
==============================

File Structure:
- Each mode's messages.json should be a simple array of strings
- Use UTF-8 encoding for special characters
- Validate JSON syntax before deployment
- Keep individual files under 10KB for performance

Message Rotation Logic:
- Implement weighted random selection if using multiple source lists
- Avoid showing the same message twice in a short time period
- Consider user session length when planning message variety
- Allow for manual message triggering during development/testing

Accessibility Considerations:
- Ensure sufficient contrast for overlay text
- Provide option to disable rapid message changes
- Consider screen reader compatibility for message announcements
- Test with reduced motion preferences enabled

This distribution system ensures each VibeScreen personality mode maintains authentic character while providing engaging, appropriate content for users across different contexts and preferences.