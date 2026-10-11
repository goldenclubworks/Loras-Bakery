/**
 * Visible placeholder marker. Everything wrapped in <Ph> still has to be filled in (or confirmed)
 * by Lora before launch. Searching the codebase for "<Ph" lists every open item.
 */
export default function Ph({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded-md bg-gold/25 px-1.5 py-0.5 font-medium text-berry-deep [box-decoration-break:clone]">
      [{children}]
    </mark>
  );
}
