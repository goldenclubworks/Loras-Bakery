/**
 * Geometrie der Hero-Bühne. Die Leinwand ist so groß wie der Bogen plus Überstand (oben 2 %, unten 14 %, Breite 106 %).
 * Alle Maße in "Bogenbreiten" (1 = Breite des Bogens auf der Seite), Ursprung unten links in der Leinwand.
 */
export const CANVAS_W = 1.06;
export const ARCH_H = 4 / 3; // Bogen ist 3:4
export const OVER_TOP = 0.02 * ARCH_H;
export const OVER_BOTTOM = 0.14 * ARCH_H;
export const CANVAS_H = ARCH_H + OVER_TOP + OVER_BOTTOM;
/** Bogen in Leinwand-Koordinaten: Mitte x, Unterkante y, Scheitel y */
export const ARCH = { cx: CANVAS_W / 2, bottom: OVER_BOTTOM, top: OVER_BOTTOM + ARCH_H, r: 0.5 };
