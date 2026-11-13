"use client"

import { usePathname } from "next/navigation"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
  { href: "/payrolls", label: "Payroll" },
  { href: "/payroll-rules", label: "Payroll Rules" },
  { href: "/inventory", label: "Inventory" },
  { href: "/settings", label: "Settings" },
  { href: "/fiscal-years", label: "Fiscal Years" },
  { href: "/audit-logs", label: "Audit Logs" },
]

function navLinkClass(active: boolean) {
  const base = "px-4 py-3 rounded-md text-sm font-medium transition"
  return active ? `${base} bg-primary text-white` : `${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900`
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <nav className="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm tracking-tight">
                PI
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Payroll &amp; Inventory
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={navLinkClass(pathname === link.href)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition">
                Sign out
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span>All rights reserved 2026</span>
              <span className="text-slate-400">|</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/privacy-policy" className="hover:text-primary transition">Privacy Policy</a>
              <span className="text-slate-400">|</span>
              <a href="/terms" className="hover:text-primary transition">Terms</a>
              <span className="text-slate-400">|</span>
              <a href="/cookies" className="hover:text-primary transition">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
