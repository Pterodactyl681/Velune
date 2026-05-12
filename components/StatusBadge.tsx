type StatusBadgeProps = {
  label: "Live" | "Ready" | "Mock";
  dot?: boolean;
};

export function StatusBadge({ label, dot = false }: StatusBadgeProps) {
  const tone =
    label === "Mock"
      ? "border-[#ddd9d2] bg-[#fbfaf8] text-[#595959]"
      : "border-[#cfe5d7] bg-[#eef8f2] text-[#356b47]";

  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium leading-none ${tone}`}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-[#6fbe80]" /> : null}
      {label}
    </span>
  );
}
