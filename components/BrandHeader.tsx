import { VeluneLogo } from "@/components/VeluneLogo";

export function BrandHeader() {
  return (
    <header className="w-full">
      <div className="flex items-center gap-3">
        <VeluneLogo className="h-12 w-12 text-ink sm:h-[54px] sm:w-[54px]" />
        <span className="text-[34px] font-light leading-none tracking-normal text-ink sm:text-[40px]">
          Velune
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-none text-muted sm:text-[15px]">
        Create clean payment links.
      </p>
    </header>
  );
}
