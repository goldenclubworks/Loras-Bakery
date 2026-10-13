# Loras Bakery

Next.js One-Pager (Next 16, React 19, Tailwind 4). Editorial-Look nach dem Brand Board, echte Fotos, Handschrift-Notizen,
scroll-gesteuerte Früchte, echtes Spitzenband als Übergang und eine 3D-Torte vor einem bewegten Samtvorhang im Hero (three.js,
lädt erst nach der ersten Eingabe, Foto als Rückfall).

- `pnpm dev` / `pnpm build` / `pnpm start`
- Kontakt & Mailversand: `.env.example` nach `.env.local` kopieren und ausfüllen.
- Offene Platzhalter finden: nach `<Ph` suchen (Impressum, Datenschutz, Sorten).

## Design-System
- Farben (Tokens in `app/globals.css`): Creme, Blush, Dusty Rose, Chocolate, Berry, Blueberry, Mint, Plum, Salbei.
- Schriften (`app/layout.tsx`): Bodoni Moda (Display), Jost (Text), Whisper (Lora's Handschrift). Nicht ändern.
- Bausteine: `HeroTitle` (ruhiger Schriftzug, erscheint langsam), `Dove` (Taube mit Bäckerhut, der beim Scrollen davonweht),
  `Preloader` (dunkellila Vorhang bei jedem Laden der Startseite, auch mobil; Scrollen ist währenddessen gesperrt, danach steht man oben),
  `LaceBand` (Spitzenband-Übergang), `LaceFence` (gespritzte Schokoladen-Spitze), `Ingredients` (Früchte, siehe unten),
  `Script` / `Sketch` (Handschrift schreibt sich, Linien zeichnen sich), `ClearOnScroll`, `HeroStage` + `three/*` (3D-Hero).
- GSAP wird erst nach dem ersten Bild nachgeladen (`lib/gsap.ts`), das Anfrageformular erst kurz vor dem Erreichen (`InquiryLazy`).

## Früchte (Scroll-Motion)
- Loras saubere Ausschnitte liegen in `assets/refs/user/c-*.png`. `node scripts/import_cutouts.mjs [--sheet=bogen.png]` trennt sie,
  entfernt helle Randsäume, verkleinert auf 300 px (angezeigt werden höchstens 130 px) und schreibt `public/ingredients/*.webp`
  und `lib/ingredients.ts`. Das Skript bricht ab, wenn ein Teil an den Rand stößt (angeschnitten). Kein Schatten, keine Kante.
- Desktop (ab 1024 px): Früchte driften mit Tiefe und Drehung, im Anschnitt „landen" sie am Foto. Mobil: kleine, leicht
  transparente Früchte gleiten vom Rand herein und wieder hinaus (`mobile`-Liste je Abschnitt). Positionen wurden automatisch gegen Text,
  Bilder, Abschnittskanten und die Spitzenkanten der Nachbarabschnitte geprüft (360 bis 768 px, 1024 bis 2560 px): keine Frucht wird abgeschnitten.
- Reihenfolge der Seite: Hero, Handschrift, Lora, Gut zu wissen (FAQ), Preisorientierung, Atelier, Galerie, Geschmack, Anschnitt, Anfrage, Footer.
- Die Ebene ist seitlich begrenzt (`overflow-x: clip`), nichts kann die Seite verbreitern.

## Bilder
- Originale liegen in `assets/refs/` (Referenzen von Lora in `assets/refs/user/`). `node scripts/build_photos.mjs` erzeugt
  `public/photos/<id>.<hash>.webp` und `lib/photos.ts` (mit `src`). Der Inhalts-Hash im Dateinamen ist Absicht: Der Bild-Optimierer
  von Next.js behält optimierte Varianten Stunden lang, ein ausgetauschtes Bild unter gleichem Namen würde sonst weiter alt angezeigt.
- Spitzenband: `node scripts/build_lace.mjs` verlängert `assets/refs/user/lace-band.png` nahtlos (gespiegelte Kachel) zu
  `public/lace/lace-band.avif` + `.webp`.
- Frühere Stände (3D-Torten, Buchstaben, alte Scripts, Stand vor jeder Runde) liegen unverändert in `assets/archive/`.
