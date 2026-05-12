import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-page px-5 py-7 text-ink sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[960px] flex-col">
        <BrandHeader />
        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[430px] rounded-[20px] border border-line bg-white px-6 py-8 text-center shadow-card sm:px-8 sm:py-9">
            <h1 className="text-[24px] font-medium leading-tight text-ink">
              Payment completed
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-muted">
              You can close this page or create another Velune link.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-ink px-5 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_18px_rgba(20,20,20,0.09)] transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-white"
            >
              Create another link
            </Link>
          </div>
        </section>
        <footer className="pb-7 pt-2 text-center text-[12px] text-[#9a948b]">
          Built for Build with KIRAPAY on Superteam Earn
        </footer>
      </div>
    </main>
  );
}
