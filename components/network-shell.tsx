'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AlertTriangle, BookOpen, GitBranch, LayoutDashboard, Menu, Network, ShieldCheck, Terminal, X } from 'lucide-react'

const items = [
  ['/', 'Resumen', LayoutDashboard],
  ['/commands', 'Comandos IOS', Terminal],
  ['/segmentation', 'Segmentación', Network],
  ['/workflows', 'Laboratorio IP', GitBranch],
  ['/security', 'Seguridad', ShieldCheck],
  ['/troubleshooting', 'Diagnóstico', AlertTriangle],
  ['/glossary', 'Glosario', BookOpen],
] as const

export default function NetworkShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1400px] items-center gap-6 px-5 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#0b1728] text-cyan-300"><Network className="size-5" /></span>
            <span><span className="block text-sm font-bold tracking-tight">NetLab</span><span className="block text-[10px] font-medium uppercase tracking-[.16em] text-slate-400">Cisco / Redes</span></span>
          </Link>
          <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-slate-200 bg-white p-4 shadow-xl md:static md:flex md:flex-row md:items-center md:border-0 md:p-0 md:shadow-none`} aria-label="Navegación principal">
            {items.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === href ? 'bg-[#0b1728] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}><Icon className="size-4" />{label}</Link>)}
          </nav>
          <div className="ml-auto hidden items-center gap-3 md:flex"><span className="size-2 rounded-full bg-emerald-500" /><span className="text-xs font-medium text-slate-500">Entorno de práctica</span></div>
          <button className="ml-auto rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>{open ? <X /> : <Menu />}</button>
        </div>
      </header>
      <main><div className="mx-auto max-w-[1400px] px-5 py-8 md:px-8 md:py-12">{children}</div></main>
    </div>
  )
}

