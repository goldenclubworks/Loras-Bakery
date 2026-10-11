/** Pointer in -1..1, kept outside React so it never triggers renders. */
export const pointer = { x: 0, y: 0 };

/** Drag-to-rotate state for the hero model. */
export const drag = { dragging: false, yaw: 0, vel: 0 };
