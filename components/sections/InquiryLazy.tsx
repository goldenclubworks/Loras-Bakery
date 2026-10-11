"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Inquiry = dynamic(() => import("./Inquiry"), { ssr: false });

/**
 * Formular-Bibliotheken (react-hook-form, zod) werden erst kurz vor dem Erreichen des Formulars geladen.
 * Der Anker #anfrage liegt auf dem Platzhalter, damit die Navigation sofort funktioniert.
 */
export default function InquiryLazy() {
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setGo(true), io.disconnect()), { rootMargin: "1600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div id="anfrage" ref={ref} className="min-h-[60rem] bg-paper">
      {go && <Inquiry />}
    </div>
  );
}
