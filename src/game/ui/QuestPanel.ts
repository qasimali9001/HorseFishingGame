import Phaser from 'phaser'
import { QuestUIConfig } from '../config/QuestUIConfig'
import type { QuestStateSnapshot } from '../types/QuestTypes'

/**
 * Compact always-visible quest tracker shown on the left side of the HUD.
 */
export class QuestPanel {
  private readonly scene: Phaser.Scene
  private readonly root: Phaser.GameObjects.Container
  private readonly background: Phaser.GameObjects.Rectangle
  private readonly titleText: Phaser.GameObjects.Text
  private readonly bodyText: Phaser.GameObjects.Text
  private readonly progressText: Phaser.GameObjects.Text
  private readonly rewardText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    const cfg = QuestUIConfig.panel

    this.root = this.scene.add.container(cfg.left, cfg.top).setScrollFactor(0)

    this.background = this.scene.add
      .rectangle(0, 0, cfg.width, 80, cfg.fillColor, cfg.fillAlpha)
      .setOrigin(0, 0)
      .setStrokeStyle(cfg.borderWidth, cfg.borderColor)

    this.titleText = this.scene.add
      .text(cfg.paddingX, cfg.paddingY, 'Quest', {
        fontFamily: 'monospace',
        fontSize: cfg.titleFontSize,
        color: cfg.titleColor,
      })
      .setOrigin(0, 0)

    this.bodyText = this.scene.add
      .text(cfg.paddingX, 0, '', {
        fontFamily: 'monospace',
        fontSize: cfg.bodyFontSize,
        color: cfg.bodyColor,
        wordWrap: { width: cfg.width - cfg.paddingX * 2 },
      })
      .setOrigin(0, 0)

    this.progressText = this.scene.add
      .text(cfg.paddingX, 0, '', {
        fontFamily: 'monospace',
        fontSize: cfg.progressFontSize,
        color: cfg.progressColor,
      })
      .setOrigin(0, 0)

    this.rewardText = this.scene.add
      .text(cfg.paddingX, 0, '', {
        fontFamily: 'monospace',
        fontSize: cfg.rewardFontSize,
        color: cfg.rewardColor,
      })
      .setOrigin(0, 0)

    this.root.add([
      this.background,
      this.titleText,
      this.bodyText,
      this.progressText,
      this.rewardText,
    ])
    this.layoutTexts()
  }

  setState(snapshot: QuestStateSnapshot): void {
    if (!snapshot.quest) {
      this.root.setVisible(false)
      return
    }

    this.root.setVisible(true)
    this.titleText.setText(`Quest: ${snapshot.quest.title}`)
    this.bodyText.setText(snapshot.quest.description)

    if (snapshot.quest.goal.kind === 'catch-fish') {
      this.progressText.setText(`Progress: ${snapshot.progress}/${snapshot.target}`)
    } else {
      this.progressText.setText(snapshot.progress >= snapshot.target ? 'Owned' : 'Not purchased yet')
    }

    this.rewardText.setText(`Reward: +$${snapshot.quest.goldReward}`)
    this.layoutTexts()
  }

  destroy(): void {
    this.root.destroy(true)
  }

  private layoutTexts(): void {
    const cfg = QuestUIConfig.panel
    const gap = cfg.lineGap
    const x = cfg.paddingX
    const titleY = cfg.paddingY

    this.titleText.setPosition(x, titleY)
    const bodyY = titleY + this.titleText.height + gap
    this.bodyText.setPosition(x, bodyY)
    const progressY = bodyY + this.bodyText.height + gap
    this.progressText.setPosition(x, progressY)
    const rewardY = progressY + this.progressText.height + gap
    this.rewardText.setPosition(x, rewardY)

    const contentHeight = rewardY + this.rewardText.height + cfg.paddingY
    this.background.setSize(cfg.width, contentHeight)
  }
}
