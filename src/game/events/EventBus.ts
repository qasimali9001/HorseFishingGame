import Phaser from 'phaser'

/**
 * Process-wide event bus so scenes/systems communicate without direct
 * references. Thin wrapper over Phaser's emitter; kept as a singleton because
 * the World and UI scenes run concurrently and must not couple directly.
 */
class EventBusClass extends Phaser.Events.EventEmitter {}

export const EventBus = new EventBusClass()
