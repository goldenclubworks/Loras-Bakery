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
        {/* vor dem ersten Bild: Vorhang (Preloader) bei jedem Laden der Startseite, auch mobil; man landet immer oben im Hero */}
        <Script
          id="lb-pre"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;if('scrollRestoration' in history)history.scrollRestoration='manual';if(location.pathname==='/'){d.classList.add('preloading');if(!location.hash)window.scrollTo(0,0);var stop=function(e){e.preventDefault()};var keys={32:1,33:1,34:1,35:1,36:1,38:1,40:1};var kd=function(e){if(keys[e.keyCode])e.preventDefault()};window.addEventListener('wheel',stop,{passive:false});window.addEventListener('touchmove',stop,{passive:false});window.addEventListener('keydown',kd);setTimeout(function(){window.removeEventListener('wheel',stop);window.removeEventListener('touchmove',stop);window.removeEventListener('keydown',kd)},2100)}}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
