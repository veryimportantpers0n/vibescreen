Hey Kiro — build a Next.js project called VibeScreen (a second-monitor ambient + “AI co-pilot” companion) that matches the spec below. This prompt must produce a runnable scaffold so I can replace visual assets later with higher fidelity Three.js components. Keep placeholders minimal but realistic so modes load and are testable.

Project overview (one sentence)
VibeScreen is a Next.js website with a homepage and a bottom mode selector. Selecting a mode loads a custom Three.js background scene + character component, and the character randomly pops up mode-specific messages (speech bubble or overlay) on a timed/random schedule. All message text is stored in mode JSON files.

Deliverables (what to create)
Full Next.js project scaffold (pages, components, api) using React + Next.js (app or pages router OK — prefer pages for simplicity).


Three.js integration with a reusable SceneWrapper component and 10 placeholder mode scenes (simple shapes/animations) that can be replaced with real imports later.


modes/ directory with one folder per mode, each contains:


config.json (mode metadata, background settings, text file path, message timing rules)


messages.json (array of message strings for that mode)


scene.js (placeholder Three.js scene component exported; simple geometry + animation)


character.js (placeholder character component or mesh)


Homepage UI:


Title/header and quick description.


Bottom mode selector bar (icons + mode names). Selecting a mode loads the scene + character and starts message rotation.


Controls: pause/resume messages, volume toggle (for optional ambience sound), and a “test popup now” button.


Message system:


Reads modes/<mode>/messages.json.


Randomized popup schedule with configurable min/max delay from config.json.


Two popup styles: speechBubble (attached to character) or overlay (center/top fade-in). Mode config decides which.


Popups animate in/out and stack gracefully if multiple appear.


Data & assets:


Provide all 10 mode messages.json using the lists supplied (cliches, exaggerations, and AI phrases). Place each relevant subset into the appropriate mode.


All JSON files must be human-editable and imported by the app.


Kiro artifacts:


Add /.kiro/specs/vibescreen.spec.yaml describing endpoints and expected behavior (reconstructable and testable).


Add a small /.kiro/vibe_transcript.md explaining any prompts used to generate components (short example).


README with run instructions and demo steps (how to switch modes and test popups).


Minimal styling with Tailwind (or plain CSS) so UI looks polished and professional.
Basic characters for each mode
Basic three.js background for each mode



Project structure (exact)
/ (repo root)
  /.kiro/
    specs/vibescreen.spec.yaml
    vibe_transcript.md
  /modes/
    /corporate-ai/
      config.json
      messages.json
      scene.js
      character.js
    /chaos/
      ...
    ... (one folder per mode)
  /components/
    SceneWrapper.jsx
    ModeLoader.jsx
    ModeSelector.jsx
    MessagePopup.jsx
    CharacterHost.jsx
  /pages/
    index.js
    _app.js
  /public/
    favicon.ico
  /styles/
    globals.css
  README.md
  package.json


Mode list (10) — behavior summary & mapping
Create these 10 mode folders. Put the relevant tone and message style into each messages.json. Mode config.json schema sample below.
corporate-ai — formal, polite; popup style: overlay.


chaos — glitchy nonsense; popup style: overlay with “broken” animation.


emotional-damage — passive-aggressive; popup style: speechBubble.


therapist — comforting; popup style: speechBubble.


startup-founder — overconfident; popup style: overlay.


doomsday-prophet — dramatic; popup style: overlay.


zen-monk — haiku style, calm; popup style: speechBubble.


gamer-rage — snappy, rude; popup style: overlay.


influencer — hype, short calls-to-action; popup style: overlay.


wholesome-grandma — cozy, kind; popup style: speechBubble.


spooky — ghostly Kiro icon, whispers, eerie ambient; popup style: overlay with slow fade (include as bonus mode if space).


(You made 11 with spooky — include spooky as optional 11th.)

Mode config schema (config.json)
{
  "id": "corporate-ai",
  "name": "Corporate AI",
  "popupStyle": "overlay",            // "speechBubble" | "overlay"
  "minDelaySeconds": 12,
  "maxDelaySeconds": 45,
  "messageProbabilities": { "cliche": 0.6, "exaggeration": 0.2, "other": 0.2 },
  "sceneProps": { "bgColor": "#f7f7f7", "ambientSpeed": 0.2 }
}


Messages — put into each messages.json
Use the supplied lists. For convenience, include the full sets in the document so Kiro can copy them into each mode file. (Below is the canonical master set — Kiro should place subsets into modes based on tone.)
Master lists to include verbatim in the repo (for Kiro to use)
A. 20 Funny / Exaggerated AI Lines
Compiling your brilliance… done.


95% sure this code works. 5% pure faith.


I cross-referenced the universe and found: you’re built different.


System check: confidence = over 9000.


Initiating productivity sequence… please insert caffeine.


Processing… processing… still vibing…


I just optimized your vibe by 14%.


Detected 1 syntax error and 37 emotional ones.


Alert: your genius levels are destabilizing local servers.


My neural network just blushed.


You’re coding like it’s hackathon finals night.


Warning: too much swag in the repository.


Query complete: you’re the main character.


Uploading ego boost… success.


I ran a Monte Carlo simulation — all outcomes say you slay.


Note: you’re doing great, statistically speaking.


I would commit this code… if I had hands.


You just earned +10 respect from all AIs.


Caffeine levels low — deploying emergency compliments.


The vibes are immaculate. Carry on, human.


I analyzed 7.4 million codebases and… you’re killing it.


Confidence level: 99.7% you deserve a snack.


Simulating empathy.exe…


You are now in 200% productivity mode.


B. 20 Cliché AI Phrases
You are absolutely right.


As an AI language model…


I don’t have feelings, but if I did…


That’s a great question!


I see what you mean.


Let me clarify that for you.


According to my training data…


I hope that helps!


I don’t have personal opinions, but…


Here’s a quick summary:


That’s outside my current capabilities.


I’m sorry, I can’t do that.


Interesting perspective!


Would you like me to elaborate?


Let’s break that down.


That’s not entirely accurate…


I understand your concern.


As of my last update…


In simpler terms…


I hope this answers your question!


C. 20 Cliché AI Things to Say (another overlapping list)
You are absolutely right.


That’s a great idea!


Let me explain that in simpler terms.


Here’s a quick summary…


As an AI, I don’t have feelings, but I understand why you might feel that way.


That’s beyond my current capabilities — yet.


Great question! Let’s break it down.


I hope this helps!


Based on my training data…


I’m still learning, but here’s my best guess.


That’s outside my knowledge cutoff.


Sorry, I didn’t quite catch that — could you rephrase?


Here’s what I found when I looked that up.


In summary, yes — but also no.


I can’t give legal or medical advice.


That’s an interesting philosophical point.


I’m here to assist you.


Let’s approach this step by step.


Sure! Here’s a simple example.


Remember to take a break and hydrate.



Assignment of message types to modes (suggested)
corporate-ai → use B (cliché AI phrases) + some C lines.


chaos → scrambled lines from A + C mixed with nonsense suffixes.


emotional-damage → sarcastic edits of B + A lines (short snarky phrases).


therapist → gentle lines from B + original calming lines like “Tell me more about that missing semicolon.”


startup-founder → hype lines from A + new lines like “We’re revolutionizing synergy…”


doomsday-prophet → dramatic short lines (custom).


zen-monk → haiku-style messages (write ~8 calm entries).


gamer-rage → short blunt taunts (subset of A).


influencer → short hype CTA lines.


wholesome-grandma → warm compliments and cookie lines.


(Exact distribution: include at least 20 messages per mode where practical; shorter modes can have 8–12.)

Scene + Character placeholders (scene.js / character.js)
scene.js should export a React component ModeScene({sceneProps}) that mounts a Three.js canvas using react-three-fiber or plain Three.js if preferred. Keep the placeholder scenes simple:


corporate-ai: rotating polished cubes, soft lighting.


chaos: jittering planes, color glitching.


emotional-damage: dim room with flicker.


therapist: warm soft particles.


startup-founder: pulsing neon pillars.


doomsday-prophet: slow approaching red sphere.


zen-monk: floating lotus + slow camera pan.


gamer-rage: scoreboard-style neon.


influencer: sparkle particles and quick camera zooms.


wholesome-grandma: cozy fireplace glow.


spooky (optional): fog, floating ghost sprite.


character.js exports ModeCharacter({onSpeak}) — placeholder 3D mesh or 2D sprite that emits a small animation when a message appears. Implement a speak() method/callback to trigger movement animation.


Important: Scenes and characters must be implemented so they can be replaced by importing new components later without changing app logic. So please make a placeholder for each character. All mode-specific characters (in /modes/<mode>/character.js) will be generated in Gemini AI Studio using a shared base prompt:
“Create a low-poly, wireframe, Three.js-based animated character function that fits the personality of the mode.”
Each character.js file exports a `generateCharacter(scene)` or `<ModeCharacter/>` that can be imported directly into the VibeScreen scaffold.

You will need to make the basic concept of them so i can replace with the real ones.
Perfect — you’ve got 99% of the setup right.
 You just need to add one short paragraph explaining that each mode must also have a basic placeholder background scene that can later be replaced with a Gemini-generated one.

All mode-specific backgrounds (in /modes/<mode>/scene.js) should also include a simple placeholder Three.js background built from basic geometry and light animation. Each scene should reflect the tone of its mode (e.g. calm rotations, pulsing shapes, or particle fields) but remain minimal and performant. These placeholders are temporary — I will later replace them with Gemini AI Studio–generated wireframe scenes that match the character style.
Each scene.js file must export a functional React/Three.js component (e.g. ModeScene({sceneProps})) that sets up a camera, ambient light, and a small animated background. Keep it self-contained so the real Gemini-generated versions can be swapped in directly without changing imports or app logic.


Message popup UX details
MessagePopup component supports:


type: "speechBubble" | "overlay"


position: if speechBubble, anchor to character coordinates (approximate).


random lifespan, default 4–7 seconds, with fade in/out.


Add configurable global setting for message frequency, and a test button that triggers a popup now.



API & optional backend
No external backend required; everything can run client-side.


Add a simple API route /api/modes that lists available modes and their metadata (read from /modes/*/config.json) so the UI can dynamically load modes.



Accessibility & polish
Mode selector keyboard navigable.


Provide contrast-safe text overlays and an accessibility toggle to disable flashing/glitch effects.


Mobile friendly but primarily desktop/second monitor target.



README / Demo instructions (short)
How to install: yarn install && yarn dev


How to test: open http://localhost:3000, select a mode from bottom bar, click “test popup now,” observe scene + popups.


Where to replace placeholders: modes/<mode>/scene.js and character.js.



Kiro-specific tasks to include (put in /.kiro)
/.kiro/specs/vibescreen.spec.yaml — spec describing pages, mode loading behavior, messages JSON presence, and /api/modes contract.


/.kiro/vibe_transcript.md — short transcript of the prompt used for Kiro (this prompt).


Optional: /.kiro/hooks/deploy_preview.hook that builds and deploys a preview (script stub).



Extra helpful implementation notes (for the generator)
Use react-three-fiber + drei for simpler scene wiring if allowed. If Kiro avoids external libs, provide plain Three.js fallback.


Keep bundle size reasonable: lazy-load modes/<mode>/scene.js on demand (dynamic import).


All JSON files loaded statically (via Next.js public or imports) so no runtime remote calls required.


Ensure clean, commented code so I can drop in AI-generated or hand-made Three.js characters later.

Each mode folder represents a complete “character environment” — including its own background scene, animated wireframe character, and unique message set. In practice, each mode is treated as a standalone character personality with its own small self-contained world. For example, /modes/zen-monk/ includes scene.js, character.js, messages.json, and haikus.json, all used together when that mode is active.

All scene.js and character.js files must export components following the same signature (<ModeScene/> and <ModeCharacter/>) so they can be dynamically imported interchangeably by the core app.
Add a global theme config option — in /data/global-config.json, define optional defaults like:
{
  "defaultMinDelaySeconds": 15,
  "defaultMaxDelaySeconds": 45,
  "defaultPopupStyle": "overlay",
  "animationSpeedMultiplier": 1.0
SITE MAP CONCEPT, what i believe it should look like but up to your discretion:

/ (repo root)
│
├── /.kiro/
│   ├── specs/vibescreen.spec.yaml      → Kiro test + validation spec (defines endpoints, data flow, etc.)
│   ├── vibe_transcript.md              → Prompt transcript used to generate scaffold
│   └── other-kiro-files/               → Misc. metadata or build context (optional)
│
├── /hooks/                             → Automation scripts (run at build/deploy)
│   ├── deploy_preview.hook             → Stub script for generating deploy preview
│   └── other_custom_hooks.hook         → Optional hooks for integration tasks
│
├── /components/
│   ├── SceneWrapper.jsx                → Universal wrapper for all Three.js mode scenes
│   ├── CharacterHost.jsx               → Loads & positions the active mode character
│   ├── ModeLoader.jsx                  → Dynamically imports mode folder (scene + char + data)
│   ├── ModeSelector.jsx                → Bottom selector bar for switching modes
│   ├── MessagePopup.jsx                → Handles overlay or speech-bubble message rendering
│   ├── ControlsBar.jsx                 → UI controls (pause/resume, test popup, sound toggle)
│   └── Layout.jsx                      → Optional layout shell (shared header/footer)
│
├── /modes/                             → Each mode = self-contained character “universe”
│   │                                   → Includes its config, background, messages, and animation
│   ├── /corporate-ai/
│   │   ├── config.json                 → Mode settings (popup style, timing, colors)
│   │   ├── messages.json               → Text messages shown for this mode
│   │   ├── scene.js                    → Placeholder Three.js background (rotating shapes, etc.)
│   │   ├── character.js                → Wireframe character matching mode tone
│   │   └── assets/                     → Optional textures, SFX, or icons
│   │
│   ├── /zen-monk/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── haikus.json                 → Zen-specific text dataset
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /chaos/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── ... (remaining modes: emotional-damage, therapist, startup-founder, etc.)
│   │
│   └── /spooky/
│       ├── config.json
│       ├── messages.json
│       ├── scene.js
│       ├── character.js
│       └── assets/
│
├── /data/
│   ├── master-messages/
│   │   ├── funny-exaggerations.json    → “A” master list (humor/hype lines)
│   │   ├── cliche-ai-phrases.json      → “B” master list (classic AI responses)
│   │   ├── cliche-ai-things.json       → “C” master list (neutral filler phrases)
│   │   └── readme.txt                  → Optional: explain how to remix subsets per mode
│   └── global-config.json              → Universal defaults (popup delays, animation speed, etc.)
│
├── /public/
│   ├── favicon.ico
│   ├── icons/                          → Mode selector icons or small SVGs
│   └── sounds/                         → Optional ambient or SFX loops per mode
│
├── /styles/
│   ├── globals.css                     → Core page and layout styling
│   ├── modeThemes.css                  → Mode-specific palette and UI color hooks
│   └── animations.css                  → Popup, fade, and character bounce transitions
│
├── /pages/
│   ├── index.js                        → Homepage (overview + mode selector)
│   ├── mode/[id].js                    → Dynamic renderer: loads scene + character for selected mode
│   ├── api/modes.js                    → Returns mode metadata by reading each config.json
│   └── _app.js                         → Global wrapper (imports styles, providers, etc.)
│
├── README.md                           → Install + usage + how to replace placeholder components
├── package.json                        → Project dependencies and scripts
└── next.config.js                      → Next.js config and custom build tweaks






