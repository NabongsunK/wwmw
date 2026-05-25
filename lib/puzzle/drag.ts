export const DRAG_THRESHOLD = 28

export function dragMoveSteps(
  dx: number,
  dy: number,
  cellSize: number
): { dr: number; dc: number; steps: number } {
  if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
    return { dr: 0, dc: 0, steps: 0 }
  }
  if (Math.abs(dx) >= Math.abs(dy)) {
    const dc = dx > 0 ? 1 : -1
    const steps = Math.max(1, Math.floor(Math.abs(dx) / cellSize))
    return { dr: 0, dc, steps }
  }
  const dr = dy > 0 ? 1 : -1
  const steps = Math.max(1, Math.floor(Math.abs(dy) / cellSize))
  return { dr, dc: 0, steps }
}

export function dragPreviewOffset(
  dx: number,
  dy: number,
  cellSize: number
): { px: number; py: number } {
  if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
    return { px: 0, py: 0 }
  }
  if (Math.abs(dx) >= Math.abs(dy)) {
    const px = Math.max(-cellSize, Math.min(cellSize, dx))
    return { px, py: 0 }
  }
  const py = Math.max(-cellSize, Math.min(cellSize, dy))
  return { px: 0, py }
}
