# Horse Fishing Game — Architecture

**Source of truth for structure and extension. Read this before any non-trivial work.**

This is a clean rebuild of a browser-based 2D fishing game (goofy horse angler) using
**Phaser 3 + TypeScript + Vite**. It deliberately does **not** reuse the previous
`CoolFishingGame` code, patterns, or camera approach.

---

## Process rules (read first, every time)

1. **`Plan.md` is the design brief.** Before non-trivial work, read
   [`Plan.md`](./Plan.md) (game-design intent: feel, theme, systems, milestones) **and**
   this `ARCHITECTURE.md` (how we build it cleanly). `Plan.md` says *what/why*;
   `ARCHITECTURE.md` says *how*.
2. **If `ARCHITECTURE.md` and `Plan.md` conflict, STOP and ask the user.** Do not silently
   pick one. Surface the exact conflict (quote both sources) and ask the user precisely
   what they want before writing code. Once resolved, update whichever doc is now wrong so
   they stay consistent.
3. **Read [`../lessons_learnt.md`](../lessons_learnt.md) before debugging.** After resolving
   a non-obvious issue, propose a lessons-learnt entry and get user approval before writing it.
4. **Modular OOP is mandatory.** One concern per file. Orchestrators (scenes/`main`) only
   wire modules together — no inline gameplay logic. No god files.
5. **No magic numbers in gameplay code.** All tuning lives in `config/`.

---

## The #1 rule this rebuild exists to enforce

> **Entities live in WORLD coordinates. Where they appear ON SCREEN is *only* the camera's
> job. The two must NEVER be the same number.**

### Why (what broke last time)

In the old project, one screen-space constant `surfaceY` was simultaneously the player's
seat position, the manual projector's depth→screen origin, **and** the camera follow anchor.
When the user asked to "move the player from the top to the middle of the screen," the only
knob to do that also moved the origin of the entire underwater world — so every fish, the
lure, the water height, and the camera math broke at once. (See `../lessons_learnt.md`,
2026-05-30 entry.)

### How this architecture prevents it

- The **horse sits at a fixed WORLD position** near the waterline. It never moves to
  "reframe" the shot.
- The **waterline is `world y = 0`** — a world constant, never a screen pixel.
- There is **no manual world→screen projector.** Phaser's **native camera** is the single
  source of truth for world→screen. Every world object (horse, rod, lure, fish, props) just
  has a world position; the camera renders them.
- **"Show the player at the top vs the middle at rest"** is a single `CameraConfig` value
  (`restOffsetY`) for the `SurfaceIdle` camera state. Changing it scrolls the camera only —
  the waterline, fish depths, and follow math are untouched.

**Hard bans:** no single number serving as both an entity anchor and the camera/projection
origin; no manual projector while the native camera suffices; no zoom-out or split-screen to
keep horse + deep lure both visible.

---

## Coordinate system

- `y = 0` is the waterline. `+y` is deeper underwater. `-y` is above the water (sky).
- `depth = Math.max(0, lure.y)`.
- One shared world space. The camera scrolls within `camera.setBounds(...)`:
  top a little above the surface, bottom at `maxDepth + padding`, so the camera never shows
  invalid empty world.

---

## Camera approach (native Phaser camera)

`CameraController` owns the `WorldScene` main camera and is the **only** module that touches
camera scroll/follow. It exposes `setMode(mode)` + `update()`.

```
enum CameraMode {
  SurfaceIdle,       // camera framed on horse via CameraConfig.restOffsetY; not following
  Casting,           // still near surface while the lure is airborne
  TransitionToLure,  // on waterline cross: startFollow(lure); lerp does the smooth move
  LureFollow,        // follow lure, deadzone + clamped by setBounds
  ReelingToSurface,  // keep following; rising lure pulls the camera back up
  LandingCatch       // horse/rod visible again at top clamp, then back to SurfaceIdle
}
```

Native-camera wins we rely on (no custom projection math):
- Lure-centered follow → `camera.startFollow(lure, true, lerpX, lerpY)` + `setDeadzone(...)`.
- Clamp near surface / max depth → `camera.setBounds(...)`.
- Horse leaves the screen naturally as the lure descends — no zoom, no split-screen.
- Parallax → per-layer `setScrollFactor(< 1)`.
- UI never scrolls → it lives in a separate `UIScene` with its own fixed camera.

---

## Scene structure

**One `WorldScene` (layered, single coordinate system, one camera) + one `UIScene` (fixed).**

We honor `Plan.md`'s separation of Surface / Background / Underwater **via layer modules**,
not via separate scenes — multiple world scenes mean multiple cameras to sync, which is the
coupling that broke things before. `UIScene` is genuinely separate because UI must not scroll.

> Note vs `Plan.md`: the Plan lists four world scenes (Surface/Background/Underwater/UI).
> We deliberately consolidate the three world scenes into one layered `WorldScene` for camera
> correctness, keeping responsibility separation at the module level. User approved this on
> 2026-05-30. If a future request wants literal separate world scenes, that's a conflict →
> stop and ask (see Process rule 2).

---

## Module map

```
HorseFishingGame/
  index.html
  package.json
  tsconfig.json
  vite.config.ts            # base: '/HorseFishingGame/'
  src/
    main.ts                 # boots Phaser with GameConfig
    game/
      config/               # tuning constants only — no gameplay logic, no runtime mutation
        GameConfig.ts       # Phaser game config (size, scale, scene list)
        WorldConfig.ts      # waterline (y=0), world width, max depth, camera bounds
        CameraConfig.ts     # follow lerp, deadzone, clamps, restOffsetY (idle framing)
        FishingConfig.ts    # state timings, hook radius
        LureMotionConfig.ts # cast / sink / reel velocities, drag, momentum retention
        HorseConfig.ts      # head-bend angle, anim timing, anchor offsets
        RodConfig.ts        # rod length, default rod stats
        DebugConfig.ts      # debug overlay toggle
      scenes/
        BootScene.ts        # boot -> preload
        PreloadScene.ts     # placeholder shapes now; texture loading later
        WorldScene.ts       # ORCHESTRATOR ONLY: builds layers/entities/systems, update order
        UIScene.ts          # fixed HUD (money, depth, debug)
      world/
        BackgroundLayer.ts  # sky + parallax water gradient (scrollFactor)
        SurfaceLayer.ts     # waterline visuals around the horse
        UnderwaterLayer.ts  # underwater ambience / props container
      entities/
        PlayerHorse.ts      # body+head rig, anchors, idle/cast/strain anims; mouth + rodTip anchors
        FishingRod.ts       # rod visual + RodStats + getTipWorldPosition()
        FishingLine.ts      # Graphics line, redrawn each frame between endpoints
        Lure.ts             # world position/velocity, hook radius, sink/reel/hang kinematics
        Fish.ts             # one fish: owns its swim AI + wobble + hooked-follow
      systems/
        InputSystem.ts          # abstracts click=cast / hold=reel
        FishingStateMachine.ts  # IdleAtSurface -> Casting -> Sinking -> WaitingForBite -> FishHooked -> Reeling -> CatchLanded
        CameraController.ts     # owns native camera; setMode() per CameraMode; update()
        FishSpawnSystem.ts      # population near camera view, within depth bands
        HookCollisionSystem.ts  # distance check lure <-> fish (no physics engine)
        EconomySystem.ts        # money, sell-on-land
        PlayerStats.ts          # read-time stat composer (base + rod + upgrades)
      data/
        fishData.ts             # data-driven FishDefinition[] (start with ~3)
      events/
        GameEvents.ts           # event name constants
        EventBus.ts             # typed emitter (Phaser.Events.EventEmitter)
      types/
        FishTypes.ts  RodTypes.ts  LureTypes.ts  GameStateTypes.ts
      utils/
        MathUtils.ts
```

---

## Responsibilities

| Layer | Owns | Must not own |
|-------|------|--------------|
| **WorldScene** | Build modules, route input, frame update order, glue | Fish AI, economy rules, rod drawing, camera math |
| **UIScene** | HUD presentation, reacts to events | Gameplay state, economy rules |
| **Entities** | One actor's visuals + world anchors + pose | Camera, other entities' state, screen-space framing |
| **Systems** | One subsystem's logic (camera, fishing FSM, fish AI, collision, economy) | Phaser scene lifecycle, unrelated UI |
| **World layers** | Background / surface / underwater visuals | Gameplay physics |
| **Config** | Constants | Runtime mutation, Phaser objects |
| **EventBus** | Decoupled cross-module messaging | Business logic |

Horse / rod / lure independence: `PlayerHorse` exposes `getMouthWorldPosition()`; it holds a
`FishingRod` exposing `getTipWorldPosition()`; `FishingLine` draws rod-tip → lure when visible
(else lure → screen-top direction); `Lure` is independent and is the camera follow target.
Rod stats live in `RodStats`/`RodDefinition`, never baked into `PlayerHorse`.

---

## Movement & collision (no physics engine)

Custom lightweight kinematics for the lure (sink/reel + decaying horizontal momentum, all from
`LureMotionConfig`) and simple distance-radius checks for hook collision. No Arcade/Matter,
no rope simulation. Input is minimal: click = cast, hold = reel, release = stop reeling. The
player never steers the lure left/right.

---

## WorldScene update order (do not reorder casually)

1. Input
2. Fishing state machine
3. Lure kinematics
4. Camera follow (`CameraController.update`)
5. Fish AI
6. Hook collision
7. Line redraw + rod/horse pose
8. (UIScene reacts via EventBus)

Reordering can break camera reference, reel input, or render layering.

---

## Event flow (decoupled)

`HookCollisionSystem` detects contact → emits `FISH_HOOKED`. On reaching the surface, the FSM
emits `CATCH_LANDED` → `EconomySystem` adds money, emits `MONEY_CHANGED` → `UIScene` updates.
State changes emit `STATE_CHANGED` for the debug overlay. Scenes never directly poke each other.

---

## Milestone 1 (build order)

1. Scaffold (Vite + TS + Phaser, configs, Boot/Preload, empty WorldScene + UIScene, EventBus).
2. World + camera shell (coordinate system, bounds, `CameraController` native follow). Verify
   follow + clamp + idle framing with a temporary marker.
3. Horse rig (`PlayerHorse` body+head, idle anim, mouth anchor; `FishingRod` at mouth).
4. Cast + lure + line (click=cast, head-bend anim, lure from rod tip, line graphics, water-entry
   camera attach).
5. Reel + momentum (hold=reel kinematics, decaying horizontal drift; horse returns near surface).
6. Fish + hook + sell (~3 data-driven fish, swim AI, distance hook, hooked fish follows lure,
   land + auto-sell, HUD money/depth).

### Acceptance checklist
Separate horse body/head; rod separate & held at mouth; lure separate from rod/line; goofy
head-bend cast; line connects when visible; **camera follows lure after water entry; horse/rod
go fully offscreen when deep — no zoom/split**; hold-to-reel with horizontal momentum and no
left/right steering; fish swim, hook on contact, follow lure, reel to surface, horse returns,
auto-sell, money/depth HUD update, loop repeats — all config-driven and modular.

---

## Adding something new (checklist)

- [ ] Read `Plan.md` + this doc; if they conflict, STOP and ask the user (Process rule 2).
- [ ] Identify the owning folder (`entities/`, `systems/`, `world/`, `ui/`, `config/`).
- [ ] One concern per class; small public API (`create` / `update` / `render` + plain structs).
- [ ] Tuning numbers go in `config/`; no magic numbers in gameplay code.
- [ ] Entities use WORLD coordinates only; on-screen framing stays in `CameraController`/`CameraConfig`.
- [ ] No manual world→screen projection — rely on the native camera.
- [ ] Scene only constructs the module and calls it from `create()` / `update()`.
- [ ] If you added a new top-level area, update this doc.

---

## Related docs

- [`Plan.md`](./Plan.md) — game design intent (the brief).
- [`../lessons_learnt.md`](../lessons_learnt.md) — past bugs and fixes (read before debugging).
