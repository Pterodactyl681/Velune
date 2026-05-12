type StatusBadgeProps = {
  label: "Live" | "Ready" | "Demo";
  dot?: boolean;
};

export function StatusBadge({ label, dot = false }: StatusBadgeProps) {
  const isDemo = label === "Demo";

  const tone = isDemo
    ? "border-[#ddd9d2] bg-[#fbfaf8] text-[#595959]"
    : "border-[#cfe5d7] bg-[#eef8f2] text-[#356b47]";

  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 rounded-[999px] border px-3 text-[13px] font-medium ${tone}`}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {label}
    </span>
  );
}
