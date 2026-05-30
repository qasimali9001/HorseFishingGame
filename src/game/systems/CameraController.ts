import Phaser from 'phaser'
import { WorldConfig } from '../config/WorldConfig'
import { CameraConfig } from '../config/CameraConfig'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'

/**
 * The states the camera can be in. The fishing state machine drives these;
 * no other module should set camera scroll/follow directly.
 */
export enum CameraMode {
  SurfaceIdle = 'SurfaceIdle',
  Casting = 'Casting',
  TransitionToLure = 'TransitionToLure',
  LureFollow = 'LureFollow',
  ReelingToSurface = 'ReelingToSurface',
  LandingCatch = 'LandingCatch',
}

/** Anything the camera can follow needs a world transform. */
export type FollowTarget = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Transform

/**
 * Owns the WorldScene's main camera. This is the SINGLE source of truth for
 * world -> screen. Entities only ever set world positions; this class decides
 * where the camera sits, so e.g. "show the player higher/lower on screen at
 * rest" is purely `CameraConfig.restWaterlineScreenRatio` -- nothing in the
 * world has to move.
 */
export class CameraController {
  private readonly camera: Phaser.Cameras.Scene2D.Camera
  private mode: CameraMode = CameraMode.SurfaceIdle
  private target?: FollowTarget

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main
    this.applyBounds()
    this.setMode(CameraMode.SurfaceIdle)
  }

  get currentMode(): CameraMode {
    return this.mode
  }

  /** Sets the object the follow modes track (e.g. the lure). */
  setFollowTarget(target: FollowTarget): void {
    this.target = target
    if (this.isFollowMode(this.mode)) {
      this.beginFollow()
    }
  }

  setMode(mode: CameraMode): void {
    if (mode === this.mode) {
      return
    }
    this.mode = mode

    if (this.isFollowMode(mode)) {
      this.beginFollow()
    } else if (mode === CameraMode.LandingCatch) {
      this.frameSurface(true)
    } else {
      // SurfaceIdle / Casting: instant surface framing.
      this.frameSurface(false)
    }

    EventBus.emit(GameEvents.CAMERA_MODE_CHANGED, { mode })
  }

  /** Clamps the camera so it never reveals empty world past the edges. */
  private applyBounds(): void {
    const top = WorldConfig.waterlineY - WorldConfig.skyHeight
    const height =
      WorldConfig.skyHeight + WorldConfig.maxDepth + CameraConfig.maxDepthPadding
    this.camera.setBounds(WorldConfig.worldLeftX, top, WorldConfig.worldWidth, height)
  }

  /**
   * Frames the surface so the waterline (world y = 0) lands at the configured
   * screen ratio, horizontally centered on where the surface character stands.
   * `smooth` pans (used when returning from a deep cast); otherwise snaps.
   */
  /** Re-apply surface framing (e.g. after scale/layout settles on boot). */
  refreshSurfaceFrame(): void {
    if (this.isFollowMode(this.mode)) {
      return
    }
    this.frameSurface(false)
  }

  private frameSurface(smooth: boolean): void {
    this.camera.stopFollow()
    const centerX = WorldConfig.surfaceAnchorX
    const viewHeight = this.camera.height
    const centerY =
      WorldConfig.waterlineY +
      viewHeight * (0.5 - CameraConfig.restWaterlineScreenRatio) +
      CameraConfig.restOffsetYWorld

    if (!smooth) {
      this.camera.centerOn(centerX, centerY)
      return
    }

    this.camera.pan(
      centerX,
      centerY,
      CameraConfig.surfaceReturnPanMs,
      'Sine.easeInOut',
      false,
      (_cam, progress) => {
        if (progress === 1) {
          this.mode = CameraMode.SurfaceIdle
          EventBus.emit(GameEvents.CAMERA_MODE_CHANGED, { mode: CameraMode.SurfaceIdle })
        }
      },
    )
  }

  private beginFollow(): void {
    if (!this.target) {
      return
    }
    const offsetX = (0.5 - CameraConfig.followScreenXRatio) * WorldConfig.viewWidth
    const offsetY = (0.5 - CameraConfig.followScreenYRatio) * WorldConfig.viewHeight
    this.camera.startFollow(
      this.target,
      true,
      CameraConfig.followLerpX,
      CameraConfig.followLerpY,
      offsetX,
      offsetY,
    )
    this.camera.setDeadzone(CameraConfig.deadzoneWidth, CameraConfig.deadzoneHeight)
  }

  private isFollowMode(mode: CameraMode): boolean {
    return (
      mode === CameraMode.TransitionToLure ||
      mode === CameraMode.LureFollow ||
      mode === CameraMode.ReelingToSurface
    )
  }
}
