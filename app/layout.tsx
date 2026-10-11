import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost, Whisper } from "next/font/google";
import Script from "next/script";
import "./globals.css";

/** Display: hochkontrastige Editorial-Serife wie auf dem Brand Board. */
const display = Bodoni_Moda({
  variable: "--f-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

/** Text und Labels: ruhige, geometrische Grotesk in leichten Schnitten. */
const sans = Jost({
  variable: "--f-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

/** Lora's Notizen: schlanke, geneigte Handschrift, nur groß und kurz einsetzen. */
const script = Whisper({
  variable: "--f-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const title = "Loras Bakery – handmade Kuchen & Torten";
const description =
  "Mit Liebe gebacken: einzigartige Torten mit handgespritzter Schokoladen-Spitze und frischen Früchten, für besondere Momente. Jede Torte ein Unikat.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, locale: "de_DE", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f7efe6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${script.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* vor dem ersten Bild: markiert den ersten Besuch der Sitzung (Auftakt-Vorhang) */}
        <Script
          id="lb-pre"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;if(!sessionStorage.getItem('lb-pre')){sessionStorage.setItem('lb-pre','1');d.classList.add('preloading','pre-lock');setTimeout(function(){d.classList.remove('pre-lock')},2000)}}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
