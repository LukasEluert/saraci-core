"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { AppSidebarContent } from "@/components/AppSidebar";
import type { Role } from "@/components/app-nav";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileTopBar({ role }: { role?: Role }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center border-b border-[var(--border)] bg-[var(--bg)] px-4 lg:hidden">
        <button
          type="button"
          aria-label="Menü öffnen"
          onClick={() => setOpen(true)}
          className="focus-ring flex size-11 shrink-0 items-center justify-center rounded-[6px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        >
          <Menu className="size-5" strokeWidth={1.75} aria-hidden />
        </button>

        <div className="flex flex-1 justify-center">
          <Image
            src="/logo-white.png"
            alt="Saraci"
            width={682}
            height={556}
            priority
            className="h-7 w-auto"
          />
        </div>

        <div className="size-11 shrink-0" aria-hidden />
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton
          overlayClassName="bg-black/60 backdrop-blur-sm"
          className="w-[min(280px,80vw)] max-w-[80vw] gap-0 border-r border-[var(--border)] bg-[var(--bg)] p-0 shadow-none [&_[data-slot=sheet-close]]:focus-visible:border-[var(--border)] [&_[data-slot=sheet-close]]:focus-visible:ring-[var(--border)]"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebarContent
            role={role}
            mobile
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
