'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AlertTriangle, BookOpen, GitBranch, LayoutDashboard, Menu, Network, Terminal, X } from 'lucide-react'

const items = [
  ['/','Resumen',LayoutDashboard], ['/commands','Comandos IOS',Terminal], ['/segmentation','Segmentación',Network], ['/workflows','Laboratorio de flujos',GitBranch], ['/troubleshooting','Errores y diagnóstico',AlertTriangle], ['/glossary','Glosario',BookOpen],
]
export default function NetworkShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const [open,setOpen]=useState(false)
  return <div className="min-h-screen bg-[#f7fafc] text-slate-950">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-slate-200 bg-[#0b1728] px-4 py-5 text-white transition-transform lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className="flex items-center justify-between px-3 pb-8"><Link href="/" className="flex items-center gap-3" onClick={()=>setOpen(false)}><div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400 text-[#071321]"><Network /></div><div><p className="text-sm font-bold">NetLab</p><p className="text-[11px] text-slate-400">Aula de redes</p></div></Link><button className="lg:hidden" onClick={()=>setOpen(false)} aria-label="Cerrar menú"><X /></button></div>
      <div className="px-3 pb-4"><p className="rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-xs leading-5 text-cyan-100">Aprende configurando. Practica verificando.</p></div>
      <nav className="flex flex-col gap-1" aria-label="Navegación principal">{items.map(([href,label,Icon])=><Link key={href as string} href={href as string} onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname===href?'bg-white text-slate-900':'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon className="size-4" />{label as string}</Link>)}</nav>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-slate-200">Ruta sugerida</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/2 rounded-full bg-cyan-400" /></div><p className="mt-3 text-xs leading-5 text-slate-400">Verifica primero, configura después.</p></div>
    </aside>
    {open&&<button className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={()=>setOpen(false)} aria-label="Cerrar menú"/>}
    <main className="lg:pl-[272px]"><header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200/80 bg-[#f7fafc]/90 px-5 backdrop-blur md:px-10"><button className="rounded-lg p-2 hover:bg-slate-200 lg:hidden" onClick={()=>setOpen(true)} aria-label="Abrir menú"><Menu /></button><div className="ml-auto text-xs text-slate-400">NetLab / Redes Cisco</div></header><div className="mx-auto max-w-[1240px] px-5 py-8 md:px-10 md:py-12">{children}</div></main>
  </div>
}
