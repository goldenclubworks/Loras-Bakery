# Loras Bakery

Next.js One-Pager (Next 16, React 19, Tailwind 4). Editorial-Look nach dem Brand Board, echte Fotos, Handschrift-Notizen, scroll-gesteuerte Zutaten und der Schokoladen-Zaun. Die 3D-Torte im Hero (three.js) lädt erst nach der ersten Eingabe.

- `pnpm dev` / `pnpm build` / `pnpm start`
- Kontakt & Mailversand: `.env.example` nach `.env.local` kopieren und ausfüllen.
- Offene Platzhalter finden: nach `<Ph` suchen (Impressum, Datenschutz, Sorten).

## Design-System
- Farben (Tokens in `app/globals.css`): Creme, Blush, Dusty Rose, Chocolate, Berry, Blueberry, Mint, Plum, Salbei.
- Schriften (`app/layout.tsx`): Bodoni Moda (Display), Jost (Text), Whisper (Lora's Handschrift).
- Bausteine: `Title3D` (3D-Schriftzug), `HeroCake` + `three/HeroScene` (3D-Torte, Foto als Fallback), `LaceFence` (echte Schokoladen-Spitze, `public/lace-edge.svg`), `Preloader` (einmal pro Sitzung), `Script` (Handschrift schreibt sich auf), `Sketch` / `Dove` (gezeichnete Linien), `Ingredients` (Zutaten driften / fallen beim Scrollen), `InView` + CSS-Klassen `.write .sketch .clip-up .pop`.
- GSAP wird erst nach dem ersten Bild nachgeladen (`lib/gsap.ts`), das Anfrageformular erst kurz vor dem Erreichen (`InquiryLazy`).

## Bilder
- Originale liegen in `assets/refs/`. Neu erzeugen: `node scripts/build_photos.mjs` (schreibt `public/photos/*.webp` und `lib/photos.ts`).
- Zutaten freistellen: `node scripts/make_ingredients.mjs` (nutzt `scripts/cutout.py`, Apple Vision, offline, macOS, Python-venv in `.venv`).
- Alte Version (3D-Torten, Buchstaben, 40 Fotos) liegt unverändert in `assets/archive/`.
