/** Kleine Wortmarke: "Loras" aufrecht, "Bakery" kursiv in Berry, wie auf dem Brand Board. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display leading-none ${className}`}>
      Loras <em className="text-berry">Bakery</em>
    </span>
  );
}
