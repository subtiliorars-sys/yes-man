import Phaser from "phaser";

/** WCAG-friendly minimum touch target (logical px at 480×800 game scale). */
export const MIN_TAP_PX = 44;

type TapTarget = {
  width: number;
  height: number;
  originX: number;
  originY: number;
  setInteractive: (config: Phaser.Types.Input.InputConfiguration) => unknown;
};

/**
 * Expands a button hit area to at least minW×minH without changing visuals.
 * Call after setOrigin so padding math matches display position.
 */
export function applyMinTapTarget(
  target: TapTarget,
  minW: number = MIN_TAP_PX,
  minH: number = MIN_TAP_PX
): void {
  const w = Math.max(target.width, 1);
  const h = Math.max(target.height, 1);
  const hitW = Math.max(w, minW);
  const hitH = Math.max(h, minH);
  const ox = target.originX * w;
  const oy = target.originY * h;
  target.setInteractive({
    hitArea: new Phaser.Geom.Rectangle(ox - hitW / 2, oy - hitH / 2, hitW, hitH),
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    useHandCursor: true,
  });
}
