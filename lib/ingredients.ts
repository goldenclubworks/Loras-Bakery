// Automatisch erzeugt von scripts/make_ingredients.mjs. Nicht von Hand ändern.
export const ingredientSize = {
  "aril-a": [
    79,
    77
  ],
  "currant-b": [
    72,
    70
  ],
  "currant-c": [
    81,
    81
  ],
  "mint-a": [
    95,
    54
  ],
  "raspberry-a": [
    106,
    109
  ],
  "raspberry-b": [
    322,
    298
  ],
  "strawberry-e": [
    385,
    420
  ]
} as const satisfies Record<string, readonly [number, number]>;

export type IngredientName = keyof typeof ingredientSize;
