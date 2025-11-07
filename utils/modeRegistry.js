/**
 * Mode Registry - Static imports for all modes
 * 
 * This file provides a centralized registry of all available modes
 * to work around Next.js dynamic import limitations.
 */

// Static imports for all mode components
import CorporateAIScene from '../modes/corporate-ai/scene.js';
import CorporateAICharacter from '../modes/corporate-ai/character.js';
import CorporateAIConfig from '../modes/corporate-ai/config.json';
import CorporateAIMessages from '../modes/corporate-ai/messages.json';

import ZenMonkScene from '../modes/zen-monk/scene.js';
import ZenMonkCharacter from '../modes/zen-monk/character.js';
import ZenMonkConfig from '../modes/zen-monk/config.json';
import ZenMonkMessages from '../modes/zen-monk/messages.json';

import ChaosScene from '../modes/chaos/scene.js';
import ChaosCharacter from '../modes/chaos/character.js';
import ChaosConfig from '../modes/chaos/config.json';
import ChaosMessages from '../modes/chaos/messages.json';

import EmotionalDamageScene from '../modes/emotional-damage/scene.js';
import EmotionalDamageCharacter from '../modes/emotional-damage/character.js';
import EmotionalDamageConfig from '../modes/emotional-damage/config.json';
import EmotionalDamageMessages from '../modes/emotional-damage/messages.json';

import TherapistScene from '../modes/therapist/scene.js';
import TherapistCharacter from '../modes/therapist/character.js';
import TherapistConfig from '../modes/therapist/config.json';
import TherapistMessages from '../modes/therapist/messages.json';

import StartupFounderScene from '../modes/startup-founder/scene.js';
import StartupFounderCharacter from '../modes/startup-founder/character.js';
import StartupFounderConfig from '../modes/startup-founder/config.json';
import StartupFounderMessages from '../modes/startup-founder/messages.json';

import DoomsdayProphetScene from '../modes/doomsday-prophet/scene.js';
import DoomsdayProphetCharacter from '../modes/doomsday-prophet/character.js';
import DoomsdayProphetConfig from '../modes/doomsday-prophet/config.json';
import DoomsdayProphetMessages from '../modes/doomsday-prophet/messages.json';

import GamerRageScene from '../modes/gamer-rage/scene.js';
import GamerRageCharacter from '../modes/gamer-rage/character.js';
import GamerRageConfig from '../modes/gamer-rage/config.json';
import GamerRageMessages from '../modes/gamer-rage/messages.json';

import InfluencerScene from '../modes/influencer/scene.js';
import InfluencerCharacter from '../modes/influencer/character.js';
import InfluencerConfig from '../modes/influencer/config.json';
import InfluencerMessages from '../modes/influencer/messages.json';

import WholesomeGrandmaScene from '../modes/wholesome-grandma/scene.js';
import WholesomeGrandmaCharacter from '../modes/wholesome-grandma/character.js';
import WholesomeGrandmaConfig from '../modes/wholesome-grandma/config.json';
import WholesomeGrandmaMessages from '../modes/wholesome-grandma/messages.json';

import SpookyScene from '../modes/spooky/scene.js';
import SpookyCharacter from '../modes/spooky/character.js';
import SpookyConfig from '../modes/spooky/config.json';
import SpookyMessages from '../modes/spooky/messages.json';

// Mode registry mapping
const MODE_REGISTRY = {
  'corporate-ai': {
    scene: CorporateAIScene,
    character: CorporateAICharacter,
    config: CorporateAIConfig,
    messages: CorporateAIMessages
  },
  'zen-monk': {
    scene: ZenMonkScene,
    character: ZenMonkCharacter,
    config: ZenMonkConfig,
    messages: ZenMonkMessages
  },
  'chaos': {
    scene: ChaosScene,
    character: ChaosCharacter,
    config: ChaosConfig,
    messages: ChaosMessages
  },
  'emotional-damage': {
    scene: EmotionalDamageScene,
    character: EmotionalDamageCharacter,
    config: EmotionalDamageConfig,
    messages: EmotionalDamageMessages
  },
  'therapist': {
    scene: TherapistScene,
    character: TherapistCharacter,
    config: TherapistConfig,
    messages: TherapistMessages
  },
  'startup-founder': {
    scene: StartupFounderScene,
    character: StartupFounderCharacter,
    config: StartupFounderConfig,
    messages: StartupFounderMessages
  },
  'doomsday-prophet': {
    scene: DoomsdayProphetScene,
    character: DoomsdayProphetCharacter,
    config: DoomsdayProphetConfig,
    messages: DoomsdayProphetMessages
  },
  'gamer-rage': {
    scene: GamerRageScene,
    character: GamerRageCharacter,
    config: GamerRageConfig,
    messages: GamerRageMessages
  },
  'influencer': {
    scene: InfluencerScene,
    character: InfluencerCharacter,
    config: InfluencerConfig,
    messages: InfluencerMessages
  },
  'wholesome-grandma': {
    scene: WholesomeGrandmaScene,
    character: WholesomeGrandmaCharacter,
    config: WholesomeGrandmaConfig,
    messages: WholesomeGrandmaMessages
  },
  'spooky': {
    scene: SpookyScene,
    character: SpookyCharacter,
    config: SpookyConfig,
    messages: SpookyMessages
  }
};

/**
 * Get mode components by mode name
 * @param {string} modeName - The mode identifier
 * @returns {Object|null} Mode components or null if not found
 */
export function getModeComponents(modeName) {
  return MODE_REGISTRY[modeName] || null;
}

/**
 * Get list of available mode names
 * @returns {string[]} Array of mode identifiers
 */
export function getAvailableModes() {
  return Object.keys(MODE_REGISTRY);
}

/**
 * Check if a mode exists
 * @param {string} modeName - The mode identifier
 * @returns {boolean} True if mode exists
 */
export function modeExists(modeName) {
  return modeName in MODE_REGISTRY;
}

export default MODE_REGISTRY;