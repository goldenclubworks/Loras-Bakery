// Automatisch erzeugt von scripts/import_cutouts.mjs. Nicht von Hand ändern.
export const ingredientSize = {
  "aril-a": [
    295,
    300
  ],
  "aril-b": [
    258,
    300
  ],
  "blueberry": [
    300,
    291
  ],
  "currant-a": [
    263,
    300
  ],
  "currant-b": [
    233,
    300
  ],
  "currant-big": [
    300,
    299
  ],
  "mint-leaf-a": [
    260,
    300
  ],
  "mint-leaf-b": [
    300,
    289
  ],
  "mint-sprig": [
    320,
    252
  ],
  "raspberry-side": [
    300,
    297
  ],
  "raspberry-top": [
    300,
    298
  ],
  "sprinkles": [
    340,
    284
  ],
  "strawberry": [
    254,
    300
  ]
} as const satisfies Record<string, readonly [number, number]>;

export type IngredientName = keyof typeof ingredientSize;
