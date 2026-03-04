"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 border border-gray-700 text-white p-2 rounded-lg text-sm"
        aria-label="Menú"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-56 bg-gray-900 border-r border-gray-800 z-40 flex flex-col
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Gestor</p>
          <p className="text-base font-bold text-white leading-tight">Financiero</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors
                  ${active
                    ? "bg-indigo-600/20 text-indigo-300 font-medium"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        {session?.user && (
          <div className="px-3 py-3 border-t border-gray-800">
            <div className="flex items-center gap-2 px-2 py-2">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? ""}
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-200 truncate">{session.user.name}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full mt-1 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg px-2 py-1.5 text-left transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
