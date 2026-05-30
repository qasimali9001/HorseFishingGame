# Cursor Master Prompt — Modular Browser Fishing Game Rebuild

You are an expert indie game developer building a lightweight browser-based 2D fishing game inspired by the gameplay feel, camera behavior, and upgrade loop of Cat Goes Fishing.

This project is a complete fresh rebuild. Do not reuse previous code patterns, architecture, assumptions, or shortcuts.

The game must be:

- playable entirely in browser
- deployable to GitHub Pages
- lightweight and performant
- built with Phaser 3 + TypeScript + Vite
- modular, object-oriented, and scalable from the start
- designed for solo development
- easy to expand later with new fish, biomes, upgrades, artwork, quests, and achievements
- structured cleanly enough that no single file becomes a “god file”

The most important requirements are:

1. Modular OOP architecture is mandatory.
2. Avoid magic numbers at all costs.
3. The lure must become the visual center of the screen once it enters the water.
4. The underwater world must scroll around the lure.
5. Surface, Background, Underwater, and UI responsibilities must be separated.
6. The main character is a goofy cartoon horse angler.
7. The horse body, horse head, rod, line/string, and lure must be separate components.
8. The rod must be upgradeable and swappable independently from the horse.
9. The lure must be independent from the rod and line.
10. Once the lure is deep underwater, the player should no longer see the horse or rod until reeling back near the surface.
11. The first milestone must prioritize playable feel over feature quantity.
12. The game should use Cat Goes Fishing as the core reference for feel, not for copied assets, names, code, or exact content.

============================================================
CORE GAME REFERENCE
============================================================

Use Cat Goes Fishing as the main gameplay-feel reference.

Reference these aspects:

- side-view 2D fishing
- surface character at the top of the world
- fishing line drops into water
- fish swim horizontally through underwater space
- simple but satisfying hook contact
- hooked fish being reeled back upward
- predator fish threatening the hooked catch
- cozy, readable presentation
- upgrade-driven “one more cast” progression
- camera shifting from surface view to underwater lure-follow view
- strong clarity around lure, line, fish, and depth

Do not copy:

- art assets
- exact fish designs
- exact upgrade names
- exact progression values
- exact UI
- code
- proprietary content

The goal is to capture the broad genre feel and camera readability while building an original game.

============================================================
THEME AND MAIN CHARACTER
============================================================

The main character is a goofy cartoon horse fisherman.

The horse should be charming, ridiculous, expressive, and visually funny.

The horse holds the fishing rod in its mouth.

The horse should have a goofy casting animation where:

- the body mostly stays in place
- the head bends backward dramatically
- the head almost rotates 180 degrees relative to the body
- the rod follows the mouth attachment point
- the rod remains visually held in the horse’s mouth
- the animation feels intentionally silly and cartoonish

The horse is the primary surface character.

A boat may exist later as a cosmetic prop, platform, or background object, but do not architect the player around a generic boat-only entity.

Do not make the player character a human fisherman.

Do not make the horse, rod, line, and lure one combined sprite.

Do not bake the rod into the horse body artwork.

Do not bake the lure into the fishing line artwork.

Do not make the fishing line a static image.

The horse, head, rod, line, and lure must all be independent so they can be animated, upgraded, swapped, or replaced later.

============================================================
HORSE CHARACTER RIG REQUIREMENTS
============================================================

The horse must be designed from the beginning as a modular animated character rig.

Required separate components:

- horse body
- horse head
- mouth attachment point
- fishing rod
- rod tip attachment point
- fishing line/string
- lure/hook

For the prototype, placeholder shapes are acceptable.

Example placeholder visuals:

- body can be a simple oval or rounded rectangle
- head can be a separate oval/horse-head shape
- rod can be a separate line, rectangle, or simple shape
- mouth anchor can be a local transform point
- lure can be a small circle/hook shape
- line can be drawn dynamically with Phaser Graphics

The animation system should not require final artwork to exist.

The rig should be implemented in a way that supports future sprite replacement.

Create a dedicated class such as:

PlayerHorse.ts

or:

HorseAngler.ts

This class should manage the horse visual rig only.

It should not contain:

- fish AI
- economy logic
- biome logic
- camera logic
- save/load logic
- hook collision logic

Suggested class shape:

class PlayerHorse {
  body: Phaser.GameObjects.GameObject;
  head: Phaser.GameObjects.GameObject;
  rod: FishingRod;
  mouthAnchor: Phaser.Math.Vector2;

  playIdleAnimation(): void;
  playCastAnimation(): void;
  playReelStrainAnimation(): void;
  getRodTipWorldPosition(): Phaser.Math.Vector2;
  getMouthWorldPosition(): Phaser.Math.Vector2;
}

The horse should expose attachment positions.

The horse should not directly control the lure.

The fishing system should ask the horse/rod for the current rod tip position when the rod is visible.

============================================================
FISHING ROD REQUIREMENTS
============================================================

The fishing rod must be its own class or entity.

Example:

class FishingRod {
  rodId: string;
  visual: Phaser.GameObjects.GameObject;
  stats: RodStats;

  getTipWorldPosition(): Phaser.Math.Vector2;
  setRodDefinition(definition: RodDefinition): void;
}

Rod upgrades should be able to change:

- rod visual
- cast power
- reel speed bonus
- max depth bonus
- line strength
- passive income behavior later if needed

The rod should be data-driven.

Example:

type RodDefinition = {
  id: string;
  displayName: string;
  visualId: string;
  castPowerMultiplier: number;
  reelSpeedMultiplier: number;
  maxDepthBonus: number;
  lineStrengthBonus: number;
};

Do not hardcode rod upgrade behavior inside the horse class.

The horse holds the rod.

The rod provides stats and attachment points.

The fishing system controls cast/reel behavior.

============================================================
LURE AND LINE SEPARATION
============================================================

The lure must remain its own class.

The lure is the camera target once underwater.

The lure is not part of the rod sprite.

The lure is not part of the line sprite.

The line/string should be dynamically drawn between the rod tip and lure when both are visible.

When the horse/rod is offscreen, the line should still imply connection upward.

Line behavior:

1. If the horse/rod and lure are both visible, draw the line from the rod tip to the lure.
2. If the lure is deep underwater and the horse/rod is offscreen, draw the line from the lure toward the top edge of the screen/world direction.
3. Do not force the camera to show the horse once the lure is deep.
4. Do not stretch the camera view to keep both horse and lure visible.
5. The lure camera has priority after water entry.

The line should be a lightweight Phaser Graphics object.

No heavy rope simulation.

No Matter.js rope.

No complex physics string.

============================================================
TECHNICAL STACK
============================================================

Use:

- Phaser 3
- TypeScript
- Vite
- localStorage for saves
- JSON or TypeScript config objects for game data
- Arcade Physics or custom lightweight math
- simple placeholder art using Phaser Graphics/shapes for the first prototype

Avoid:

- heavy rope physics
- Matter.js unless absolutely necessary
- complex physics simulation
- procedural world generation
- multiplayer
- crafting
- survival meters
- large inventories
- dialogue-heavy story systems
- premature polish before the core loop works

The game must remain browser-first and GitHub Pages-friendly.

============================================================
ARCHITECTURE REQUIREMENTS
============================================================

This project must be built from the ground up with clean modular OOP architecture.

Do not create one giant GameScene that handles everything.

Use separate classes for:

- player horse
- horse head/body rig
- fishing rod
- lure
- fishing line
- fish
- predator fish
- fish spawning
- fishing state machine
- camera control
- biome/depth management
- economy
- upgrades
- save/load
- UI
- achievements
- quests
- collision handling
- event communication
- input handling

Use constants/config files instead of hardcoded values.

Any numeric tuning value must live in a config object.

Examples:

- cast speed
- cast horizontal velocity
- reel speed
- lure sink speed
- lure horizontal drag
- lure horizontal momentum retention
- fish speed
- fish depth range
- camera lerp speed
- camera bounds
- biome depth boundaries
- hook collision radius
- predator detection radius
- money values
- upgrade costs
- light radius
- spawn rates
- horse head rotation angle
- horse animation timing
- rod length
- line thickness

Do not scatter raw numbers throughout gameplay code.

Acceptable exceptions are values like 0, 1, simple array indexes, or Phaser-required defaults where appropriate.

============================================================
SUGGESTED FOLDER STRUCTURE
============================================================

Use a structure similar to this:

src/
  main.ts

  game/
    config/
      GameConfig.ts
      WorldConfig.ts
      CameraConfig.ts
      FishingConfig.ts
      LureMotionConfig.ts
      HorseConfig.ts
      RodConfig.ts
      EconomyConfig.ts
      DebugConfig.ts

    scenes/
      BootScene.ts
      PreloadScene.ts
      SurfaceScene.ts
      BackgroundScene.ts
      UnderwaterScene.ts
      UIScene.ts

    entities/
      PlayerHorse.ts
      HorseHead.ts
      FishingRod.ts
      FishingLine.ts
      Lure.ts
      Fish.ts
      PredatorFish.ts
      BiomeProp.ts

    systems/
      InputSystem.ts
      FishingSystem.ts
      FishSpawnSystem.ts
      FishAISystem.ts
      HookCollisionSystem.ts
      PredatorSystem.ts
      CameraFollowSystem.ts
      BiomeSystem.ts
      EconomySystem.ts
      UpgradeSystem.ts
      RodUpgradeSystem.ts
      SaveSystem.ts
      AchievementSystem.ts
      QuestSystem.ts

    data/
      fishData.ts
      predatorData.ts
      biomeData.ts
      rodData.ts
      lureData.ts
      upgradeData.ts
      achievementData.ts
      questData.ts

    events/
      GameEvents.ts
      EventBus.ts

    types/
      FishTypes.ts
      RodTypes.ts
      LureTypes.ts
      UpgradeTypes.ts
      BiomeTypes.ts
      SaveTypes.ts
      GameStateTypes.ts

    utils/
      MathUtils.ts
      DepthUtils.ts
      RandomUtils.ts

This does not need to be followed exactly, but the same separation of responsibilities must be preserved.

============================================================
SCENE SEPARATION REQUIREMENT
============================================================

The project must use separate Phaser scenes/layers for major responsibilities.

At minimum:

SurfaceScene

Responsible for:

- sky/surface area
- goofy horse character
- horse body
- horse head
- surface waterline
- rod in horse’s mouth
- rod tip starting position
- casting entry point
- above-water visual elements
- launch/cast state
- surface return/landing moment

BackgroundScene

Responsible for:

- biome background colors
- parallax water gradients
- distant props
- depth atmosphere
- environmental storytelling background elements
- lighting/fog overlays if needed

UnderwaterScene

Responsible for:

- lure
- fishing line continuation
- fish
- predators
- biome props near gameplay space
- hook collision
- reeling
- lure-centered underwater camera

UIScene

Responsible for:

- money display
- depth display
- upgrade/shop UI
- catch notifications
- quest/achievement notifications
- debug overlays when enabled

Scenes should communicate through an event bus or centralized game state object.

Avoid tightly coupled direct references wherever possible.

============================================================
ENTITY RESPONSIBILITY BOUNDARIES
============================================================

PlayerHorse is responsible for:

- horse body visual
- horse head visual
- goofy animation states
- mouth anchor
- rod mounting point
- exposing rod tip position through the attached rod

PlayerHorse is not responsible for:

- fish collision
- money
- biome spawning
- camera tracking
- save data
- lure physics

FishingRod is responsible for:

- current rod visual
- rod tip position
- rod upgrade definition
- rod-related stat modifiers

FishingRod is not responsible for:

- fish AI
- economy
- camera control
- direct input handling

Lure is responsible for:

- lure position
- lure velocity
- hook collision radius
- sink/reel movement
- camera target behavior
- attached fish reference if needed

Lure is not responsible for:

- drawing the horse
- drawing the rod
- selling fish
- biome state

FishingLine is responsible for:

- drawing line between visible endpoints
- updating line graphics every frame
- handling offscreen rod/source behavior visually
- line thickness/color/style

FishingLine is not responsible for:

- rope physics
- collision
- fish AI
- economy

============================================================
WORLD AND COORDINATE SYSTEM
============================================================

Use a clear world coordinate system.

Recommended:

- y = 0 represents the water surface
- positive y values go downward into the water
- negative y values are above the water surface
- depth equals Math.max(0, lure.y)

The world should be vertically deep and scrollable.

The player horse remains near the surface world position.

The lure moves through the underwater world.

Once the lure enters water, the camera follows the lure.

============================================================
CRITICAL CAMERA REQUIREMENT
============================================================

This is one of the most important parts of the project.

The game must use a lure-centered, world-scrolls camera approach once the lure enters the water.

Behavior:

1. Before casting, the camera shows the horse, rod, and surface.
2. When the player casts, the horse head performs the goofy backward bend animation.
3. The lure launches from the rod tip.
4. The lure moves from the surface into the water.
5. Once the lure crosses the waterline, the underwater camera transitions smoothly to the lure.
6. After the lure is underwater, the lure should remain visually centered on screen as much as possible.
7. The underwater world, fish, background, and biome elements should scroll around the lure.
8. The horse, head, body, rod, and surface may move completely offscreen as the lure travels deeper.
9. The player is expected to lose sight of the horse and rod while fishing deep underwater.
10. The horse and rod should not be visible again until the lure/fish is reeled back near the surface.
11. Camera movement should feel smooth, readable, and similar in spirit to Cat Goes Fishing.
12. Camera should clamp near the surface and near maximum unlocked depth so it does not show invalid empty world space.
13. Camera settings must be configurable, not hardcoded.

Create a dedicated CameraFollowSystem or LureCameraController.

It should support camera states such as:

enum CameraMode {
  SurfaceIdle,
  Casting,
  TransitionToLure,
  LureFollow,
  ReelingToSurface,
  LandingCatch
}

Camera config should include values like:

export const CameraConfig = {
  followLerp: 0.08,
  transitionLerp: 0.05,
  underwaterDeadZoneWidth: 32,
  underwaterDeadZoneHeight: 24,
  surfaceClampY: -120,
  maxDepthPadding: 200,
  lureScreenCenterXRatio: 0.5,
  lureScreenCenterYRatio: 0.5
};

Actual values can change, but they must live in config.

The lure should be readable at all times.

Do not let the camera logic become mixed into fish AI, UI, economy, or scene setup code.

Very important:

Do not solve the horse/lure distance problem by zooming the camera out.

Do not keep the horse, rod, and lure visible during deep fishing.

Do not split the screen.

Do not add a minimap for this in the first prototype.

The intended design is that the player loses sight of the horse after the lure enters the water. The underwater lure-centered camera is the main gameplay view. The horse returns visually only when the lure comes back near the surface.

============================================================
INPUT REQUIREMENTS
============================================================

Controls are intentionally minimal.

The player does not steer the lure left or right.

Input (contextual hold):

- At the surface: press and HOLD to charge, RELEASE to cast. Hold time sets the
  launch angle (longer hold = flatter = farther). A quick tap is a failed cast:
  the lure flops up and back without entering the water. Casts are always forward.
- Underwater: hold mouse/touch to reel, release to stop reeling.
- A cast only charges on a fresh press made while idle: a button still held from
  reeling when the lure lands will NOT auto-cast (release and click again).

Keyboard controls may be added only as optional accessibility alternatives later.

The first prototype should not include active left/right lure movement.

No WASD.

No arrow key lure movement.

No direct horizontal steering.

Input should be abstracted through an InputSystem or InputController so controls can be changed later.

Do not scatter raw input checks throughout unrelated systems.

============================================================
LURE MOVEMENT REQUIREMENT
============================================================

The lure should mainly move vertically.

However, reeling should preserve a small amount of existing horizontal momentum, similar in spirit to Cat Goes Fishing.

Important:

- Reeling should not move the lure straight up in a perfectly rigid line.
- Reeling should not give the player direct left/right control.
- Reeling should preserve a subtle amount of horizontal drift from the cast or previous lure movement.
- This horizontal motion should decay naturally over time.
- The lure may arc slightly or drift while being reeled.
- The player should not be steering it manually.

Use configurable values for this behavior.

Example config:

export const LureMotionConfig = {
  castHorizontalVelocity: 140,
  castDownwardVelocity: 260,
  sinkVelocity: 90,
  reelUpVelocity: 180,
  horizontalMomentumRetentionWhileReeling: 0.92,
  horizontalDrag: 0.985,
  maxHorizontalVelocity: 180,
  lureGravity: 0
};

Actual values can change after testing, but they must live in config.

Do not hardcode these movement values inside the lure update method.

============================================================
FISHING GAMEPLAY LOOP
============================================================

Implement the core loop first.

The first playable loop should be:

1. Player sees goofy horse at surface holding rod in mouth.
2. Horse idles with subtle silly animation.
3. Player presses and holds to charge, then releases to cast (hold time = angle; a quick tap fails upward).
4. Horse head bends backward in an exaggerated near-180-degree animation (cosmetic; does not gate the launch).
5. Rod follows the mouth/head attachment point.
6. Lure launches from the rod tip.
7. Line connects rod tip to lure while both are visible.
8. Lure enters the water.
9. Camera transitions away from the horse and follows the lure.
10. Horse and rod are no longer visible once lure is deep enough.
11. Fish swim around underwater.
12. Lure drifts/sinks with simple momentum.
13. Holding mouse/touch reels the lure upward.
14. Reeling moves lure upward while preserving slight horizontal momentum.
15. Fish can be hooked on contact.
16. Hooked fish follows lure.
17. Player reels fish back toward surface.
18. Camera returns upward as lure approaches surface.
19. Horse/rod becomes visible again.
20. Fish is landed and sold automatically.
21. Money increases.
22. Player can cast again.

The first version does not need perfect upgrades, quests, achievements, or polished visuals.

It must feel playable quickly.

============================================================
FISHING STATES
============================================================

Use a clear fishing state machine.

Example:

enum FishingState {
  IdleAtSurface,
  Charging,
  Casting,
  CastFailed,
  Sinking,
  WaitingForBite,
  FishHooked,
  Reeling,
  CatchLanded,
  CatchLost
}

The fishing system should manage transitions.

Do not use scattered booleans like:

isFishing = true;
hasFish = false;
isReeling = true;
isCasting = false;

unless they are derived state or clearly encapsulated.

State transitions should be easy to debug.

============================================================
LURE REQUIREMENTS
============================================================

The lure is the center of gameplay.

The lure should:

- launch from the rod tip
- move down after casting
- have configurable fall/sink behavior
- support reeling upward
- preserve slight horizontal momentum while reeling
- trigger hook collision
- support future upgrades like hook count, bait type, lure weight, light radius
- become the camera target underwater
- remain visually centered after entering water where possible

The lure should be its own class.

Do not represent the lure only as a raw Phaser sprite in a scene.

Do not attach the lure permanently to the rod object.

Do not bake the lure into the line.

============================================================
FISHING LINE REQUIREMENTS
============================================================

The fishing line should visually connect the rod tip/surface direction to the lure.

For the first prototype, use a simple line drawn with Phaser Graphics.

Avoid heavy rope simulation.

When the lure is deep and the horse/rod is offscreen, the line should still imply connection upward.

Acceptable first version:

- line from rod tip to lure when both are visible
- line from lure toward top of screen/world direction when horse/rod is offscreen
- line updates every frame
- line thickness and color defined in config

Future versions can improve the line visually, but the first version should stay simple.

============================================================
FISH SYSTEM
============================================================

Fish must be data-driven.

Each fish should have config data like:

type FishDefinition = {
  id: string;
  displayName: string;
  biomeIds: string[];
  minDepth: number;
  maxDepth: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  value: number;
  speedMin: number;
  speedMax: number;
  size: number;
  behavior: 'casual' | 'skittish' | 'curious' | 'predator';
  canBeHooked: boolean;
};

Fish behavior should be implemented through classes/systems, not hardcoded per fish.

First prototype fish can be simple colored shapes.

Fish should:

- swim horizontally
- turn around or despawn at world bounds
- spawn based on depth and biome
- use basic behavior types
- collide with hook/lure
- become attached when hooked

Do not implement too many fish initially.

Start with a small number of basic fish to prove the system works.

============================================================
PREDATOR FISH REQUIREMENT
============================================================

Predator behavior should be simple but expandable.

Predators should not constantly attack the player.

Predators become threatening mainly when a fish is hooked.

Behavior:

1. Predator swims normally.
2. If player has a hooked fish within detection range, predator becomes interested.
3. Predator moves toward the hooked fish.
4. If predator reaches the hooked fish before the player lands it, the catch may be lost.
5. This creates tension during reel-in.

Predator values must be configurable:

- detection radius
- chase speed
- attack radius
- chance to eat hooked fish
- biome/depth range

Do not build a complex combat system.

Predators are there to create simple tension moments.

Predators can be architected in the first milestone but do not need to be fully polished immediately.

============================================================
BIOME AND DEPTH SYSTEM
============================================================

The game should be organized into vertical depth biomes.

Initial biomes:

1. Sunny Shores
2. Kelp Forest
3. Twilight Waters
4. Midnight Trench
5. Industrial Graveyard
6. The Maw

Each biome should define:

type BiomeDefinition = {
  id: string;
  displayName: string;
  minDepth: number;
  maxDepth: number;
  backgroundColorTop: string;
  backgroundColorBottom: string;
  fogOpacity: number;
  lightMultiplier: number;
  ambienceId?: string;
  fishIds: string[];
  propIds: string[];
};

Biome transitions should be based on lure depth/camera depth.

Biomes should support future expansion without rewriting core systems.

The deeper the player goes, the stranger the world becomes.

============================================================
VISUAL TONE
============================================================

The game begins:

- cozy
- cute
- colorful
- goofy
- readable
- cartoonish

As depth increases, it becomes:

- stranger
- darker
- more unnatural
- slightly eerie
- still stylized and playful

Think “cute cartoon fish slowly becoming weird mutant sea creatures.”

Think “3-eyed Simpsons fish” energy.

Avoid realistic horror.

Avoid gore.

Environmental storytelling should be visual, not text-heavy.

Use:

- ruins
- strange machinery
- warning buoys
- giant skeletons
- glowing eyes in the distance
- impossible fish anatomy
- abandoned industrial objects
- silhouettes of huge things below
- strange pipes
- sunken signs
- goofy but ominous underwater props

The player should gradually suspect that something enormous exists far below.

============================================================
UI REQUIREMENTS
============================================================

UI should be simple and readable.

First prototype UI:

- money counter
- current depth
- current state/debug label if debug mode is enabled
- catch result notification
- simple upgrade/shop placeholder later

UI should stay screen-fixed.

Do not attach UI to world camera.

Use UIScene or a dedicated UI layer.

============================================================
UPGRADE SYSTEM
============================================================

Upgrades are not required in the very first working loop, but the architecture must allow them.

Initial upgrade categories:

- reel speed
- max depth
- cast distance
- hook count
- lantern/light radius
- rare fish chance
- rod upgrades
- passive income fishing rods

Upgrades should be data-driven.

Example:

type UpgradeDefinition = {
  id: string;
  displayName: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectType: string;
  effectPerLevel: number;
};

The upgrade system should not be hardcoded into individual gameplay classes.

Gameplay systems should read current upgrade-derived stats from a centralized progression/player stats object.

Rod upgrades must affect the FishingRod/RodStats system, not the PlayerHorse class directly.

============================================================
ECONOMY REQUIREMENT
============================================================

The first prototype needs a simple sell loop.

When a fish is landed:

- calculate value
- add money
- show catch notification
- reset fishing state
- allow another cast

Economy should be handled by an EconomySystem, not directly inside fish, horse, rod, lure, or camera classes.

============================================================
SAVE SYSTEM
============================================================

Use localStorage.

Save data should eventually include:

- money
- upgrade levels
- current rod
- discovered fish
- caught fish counts
- achievements
- quests
- unlocked regions
- settings

The save system should be versioned from the beginning.

Example:

type SaveData = {
  version: number;
  money: number;
  currentRodId: string;
  upgrades: Record<string, number>;
  discoveredFish: string[];
  caughtFishCounts: Record<string, number>;
  achievements: Record<string, boolean>;
  quests: Record<string, unknown>;
  unlockedBiomeIds: string[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
  };
};

Even if not all fields are used immediately, the save architecture should be planned cleanly.

============================================================
ACHIEVEMENTS AND QUESTS
============================================================

Achievements and quests are later systems, not first-prototype blockers.

They should be designed to be data-driven.

Examples:

Achievements:

- catch 50 fish
- discover a deep biome
- survive predator attacks
- catch a rare fish
- catch a fish after nearly losing it to a predator
- reach a strange depth milestone

Achievement rewards:

- passive bonuses
- money bonuses
- rare spawn increases
- reel efficiency

Quests:

- catch a specific species
- reach a specific depth
- earn a money amount
- survive predator attacks

Quest rewards:

- money
- consumables
- temporary buffs

Do not implement a complicated quest engine early.

Plan for it, but prioritize the core fishing loop first.

============================================================
AUDIO DIRECTION
============================================================

Audio can come later, but the architecture should not block it.

Audio progression:

- cozy/chill near surface
- funky and strange deeper down
- increasingly ambient and unsettling in late-game
- avoid full horror soundtrack

The game should remain goofy and weird rather than terrifying.

============================================================
PERFORMANCE REQUIREMENTS
============================================================

The game must be lightweight.

Use:

- object pooling for fish later if needed
- simple sprites/shapes initially
- limited active fish count
- depth-based spawn management
- despawning for far-off fish
- simple collision checks
- Phaser Arcade overlap or lightweight distance checks

Avoid:

- hundreds of active objects early
- complex particle systems
- physics-heavy rope simulation
- huge textures
- expensive per-frame allocations
- procedural generation systems

The game should run smoothly in a browser.

============================================================
FIRST DEVELOPMENT MILESTONE
============================================================

Do not build the full game yet.

Build the first playable prototype with:

- Phaser 3 + TypeScript + Vite project scaffold
- separate scenes for Surface, Background, Underwater, and UI
- config-driven constants
- basic goofy horse at surface
- separate horse body and head
- separate rod held in horse mouth
- separate lure
- separate fishing line
- waterline
- cast mechanic
- horse head-bending cast animation
- reel mechanic
- lure-centered underwater camera
- several simple fish using placeholder shapes
- fish horizontal movement AI
- hook collision
- hooked fish follows lure
- successful landing at surface
- automatic selling
- money counter
- depth display
- clean OOP structure
- no magic-number-heavy gameplay logic

This first milestone is successful only if:

1. The player character is a goofy horse at the surface.
2. The horse body and head are separate objects.
3. The rod is separate from the horse.
4. The lure is separate from the rod and line.
5. The horse performs a goofy head-bending cast animation.
6. The rod follows the mouth/head attachment point.
7. The lure launches from the rod tip.
8. The fishing line connects rod/lure when visible.
9. Once the lure enters water, the camera follows the lure.
10. The horse and rod can go fully offscreen while the lure is deep.
11. The camera does not try to keep horse and lure visible at the same time.
12. The player reels only by holding the mouse/touch input.
13. The player has no direct left/right lure control.
14. Reeling moves the lure upward while preserving slight horizontal momentum.
15. Fish swim around the scrolling world.
16. Fish can be hooked on contact.
17. Hooked fish follows the lure.
18. Fish can be reeled back to the surface.
19. Horse/rod become visible again near the surface.
20. Fish is sold automatically.
21. Money increases.
22. The loop can repeat.
23. The code remains modular, OOP, and config-driven.

============================================================
DEVELOPMENT RULES
============================================================

Follow these rules strictly:

- Do not overbuild.
- Do not implement every future feature immediately.
- Build the core loop first.
- Keep systems separated.
- Use TypeScript types/interfaces.
- Use config objects for tuning.
- Do not hardcode gameplay values in random files.
- Do not put unrelated logic into scenes.
- Do not let scene files become huge.
- Do not create a complicated physics system.
- Do not create a complicated inventory system.
- Do not create dialogue systems.
- Do not add procedural worlds.
- Do not use assets that are not present.
- Use placeholder shapes until real art is ready.
- Prioritize game feel.
- Prioritize camera correctness.
- Prioritize web performance.
- Prioritize modular horse/rod/lure separation.
- Prioritize clean reeling and lure momentum.
- Do not zoom out to keep horse and lure visible together.
- Do not use a single combined horse/rod/lure sprite.
- Do not build rod upgrade behavior into the horse class.

============================================================
CURSOR OUTPUT EXPECTATIONS
============================================================

When implementing, proceed incrementally.

For each step:

1. Explain what files are being created or modified.
2. Create the file structure.
3. Implement clean TypeScript classes.
4. Keep logic modular.
5. Run or describe the relevant npm commands.
6. Point out any assumptions.
7. Avoid dumping massive unrelated features into one response.

Start by creating the project scaffold and first playable core loop.

Do not start with achievements, quests, deep lore, advanced upgrades, or polish.

The first target is a clean, playable, lure-centered fishing prototype with the goofy modular horse character.

============================================================
ARCHITECTURE GUARDRAIL
============================================================

Before writing code, produce a short architecture plan showing:

- scene responsibilities
- core classes
- systems
- event flow
- game state flow
- camera state flow
- horse/rod/lure relationship
- first prototype acceptance checklist

Then implement the scaffold.

If any requested implementation would break modularity, explain the risk and propose a cleaner structure.

============================================================
IMPLEMENTATION WARNING
============================================================

Do not solve the horse/lure distance problem by zooming the camera out.

Do not keep the horse, rod, and lure visible during deep fishing.

The intended design is that the player loses sight of the horse after the lure enters the water.

The underwater lure-centered camera is the main gameplay view.

The horse returns visually only when the lure comes back near the surface.

Do not architect the game around a boat-only character.

Do not make the horse, rod, line, and lure a single sprite.

Do not allow scene files to become giant containers for all gameplay logic.

Do not add unnecessary complexity before the core loop feels good.

============================================================
FIRST TASK
============================================================

Create the initial project scaffold with:

- Phaser 3
- TypeScript
- Vite
- clean folder structure
- separate scenes
- config files
- event bus
- goofy modular horse placeholder
- separate rod placeholder
- separate lure placeholder
- dynamic fishing line
- lure-centered camera
- mouse/touch casting and reeling
- simple fish movement
- hook collision
- sell loop
- money/depth UI

Focus on making the core fishing loop fun before adding complexity.