'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Code2,
  Command,
  Copy,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Network,
  Play,
  Search,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from 'lucide-react'

const navItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'commands', label: 'Comandos IOS', icon: Terminal },
  { id: 'segmentation', label: 'Segmentación', icon: Network },
  { id: 'workflows', label: 'Flujos de trabajo', icon: GitBranch },
  { id: 'troubleshooting', label: 'Errores y diagnóstico', icon: AlertTriangle },
  { id: 'glossary', label: 'Glosario', icon: BookOpen },
]

const commandGroups = [
  {
    title: 'Verificación rápida',
    description: 'Comprueba el estado antes de cambiar nada.',
    icon: CircleHelp,
    commands: [
      ['show ip interface brief', 'Resumen de interfaces, IP, estado y protocolo.'],
      ['show running-config', 'Configuración activa en memoria RAM.'],
      ['show ip route', 'Tabla de enrutamiento completa.'],
    ],
  },
  {
    title: 'Configuración base',
    description: 'Primeros pasos para preparar un dispositivo.',
    icon: ShieldCheck,
    commands: [
      ['enable', 'Entra al modo EXEC privilegiado.'],
      ['configure terminal', 'Abre la configuración global.'],
      ['hostname SW-CORE-01', 'Define un nombre identificable.'],
    ],
  },
  {
    title: 'Interfaces y conectividad',
    description: 'Activa puertos y asigna direccionamiento.',
    icon: Network,
    commands: [
      ['interface GigabitEthernet0/0', 'Selecciona la interfaz a configurar.'],
      ['ip address 192.168.10.1 255.255.255.0', 'Asigna una dirección IPv4.'],
      ['no shutdown', 'Activa administrativamente la interfaz.'],
    ],
  },
]

const glossary = [
  ['VLAN', 'Red de área local virtual que separa dominios de broadcast dentro del mismo switch.'],
  ['Trunk', 'Enlace que transporta varias VLAN etiquetadas mediante 802.1Q.'],
  ['SVI', 'Interfaz virtual del switch; puede servir como gateway o interfaz de gestión.'],
  ['Wildcard', 'Máscara inversa usada por OSPF y algunas ACL para identificar redes.'],
  ['PAT', 'Traduce varias IP privadas usando una única IP pública y diferentes puertos.'],
  ['PortFast', 'Permite que un puerto conectado a un host pase rápido a forwarding.'],
  ['ACL', 'Lista ordenada de reglas permit/deny que controla el tráfico.'],
  ['NVRAM', 'Memoria donde se guarda la startup-config para conservarla tras reiniciar.'],
]

const workflowSteps = [
  { title: 'Crear la VLAN', command: 'vlan 10\\nname VENTAS', note: 'Define el segmento lógico.' },
  { title: 'Asignar puertos', command: 'interface g0/1\\nswitchport mode access\\nswitchport access vlan 10', note: 'Conecta usuarios al segmento.' },
  { title: 'Configurar el trunk', command: 'interface g0/24\\nswitchport mode trunk\\nswitchport trunk allowed vlan 10,20,99', note: 'Transporta las VLAN hacia el router.' },
  { title: 'Crear gateway', command: 'interface g0/0/0.10\\nencapsulation dot1Q 10\\nip address 192.168.10.1 255.255.255.0', note: 'Habilita el enrutamiento inter-VLAN.' },
  { title: 'Verificar y guardar', command: 'show vlan brief\\nshow interfaces trunk\\ncopy running-config startup-config', note: 'Confirma el resultado y persiste cambios.' },
]

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-7 max-w-3xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-500">{description}</p>
    </div>
  )
}

export default function Page() {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [step, setStep] = useState(0)
  const [copied, setCopied] = useState('')

  const filteredGlossary = useMemo(() => glossary.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(search.toLowerCase())), [search])

  const goTo = (id: string) => {
    setActive(id)
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const copyCommand = (command: string) => {
    navigator.clipboard?.writeText(command.replaceAll('\\n', '\n'))
    setCopied(command)
    window.setTimeout(() => setCopied(''), 1400)
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-slate-200 bg-[#0b1728] px-4 py-5 text-white transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-3 pb-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400 text-[#071321] shadow-lg shadow-cyan-400/20"><Network /></div>
            <div><p className="text-sm font-bold tracking-tight">NetLab</p><p className="text-[11px] text-slate-400">Aula de redes</p></div>
          </div>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><X /></button>
        </div>
        <div className="px-3 pb-4"><p className="rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-xs leading-5 text-cyan-100">Aprende configurando. Practica verificando.</p></div>
        <nav className="flex flex-col gap-1" aria-label="Navegación principal">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => goTo(id)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${active === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon className="size-4" />{label}</button>)}
        </nav>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-200">Ruta sugerida</span><span className="text-xs text-cyan-300">3 / 6</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/2 rounded-full bg-cyan-400" /></div><p className="mt-3 text-xs leading-5 text-slate-400">Domina la verificación antes de pasar a routing.</p></div>
      </aside>

      {mobileOpen && <button className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}

      <main className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-[#f7fafc]/90 px-5 backdrop-blur md:px-10">
          <button className="rounded-lg p-2 hover:bg-slate-200 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu /></button>
          <div className="hidden items-center gap-2 text-sm text-slate-400 md:flex"><span>NetLab</span><ChevronRight className="size-4" /><span className="font-medium text-slate-700">Fundamentos de redes</span></div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700 sm:inline-flex"><CheckCircle2 className="mr-1 size-3.5" /> Modo educativo</span><button className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50" aria-label="Ayuda"><CircleHelp className="size-4" /></button></div>
        </header>

        <div className="mx-auto max-w-[1240px] px-5 py-8 md:px-10 md:py-12">
          <section id="overview" className="scroll-mt-24">
            <div className="relative overflow-hidden rounded-2xl bg-[#10233b] px-6 py-8 text-white md:px-10 md:py-10"><div className="absolute -right-24 -top-24 size-72 rounded-full border border-cyan-300/10" /><div className="absolute -right-12 -top-12 size-48 rounded-full border border-cyan-300/10" /><div className="relative max-w-2xl"><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300"><Zap className="size-4" /> Centro de aprendizaje</div><h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Configura redes con criterio, no solo con comandos.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 md:text-base">Una guía visual para entender Cisco IOS, segmentar una red, seguir flujos de trabajo y resolver errores paso a paso.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => goTo('workflows')} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#071321] hover:bg-cyan-300">Comenzar práctica <ArrowRight className="size-4" /></button><button onClick={() => goTo('commands')} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><Terminal className="size-4" /> Explorar comandos</button></div></div><div className="relative mt-8 grid max-w-lg grid-cols-3 gap-3 md:absolute md:bottom-10 md:right-10 md:mt-0"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-semibold">60+</p><p className="mt-1 text-[11px] text-slate-400">comandos clave</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-semibold">05</p><p className="mt-1 text-[11px] text-slate-400">flujos guiados</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-2xl font-semibold">08</p><p className="mt-1 text-[11px] text-slate-400">conceptos base</p></div></div></div>

            <div className="mt-10 grid gap-4 md:grid-cols-3"><button onClick={() => goTo('segmentation')} className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300"><div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700"><Network /></div><h3 className="font-semibold">Segmenta la red</h3><p className="mt-2 text-sm leading-6 text-slate-500">VLANs, trunks y gateways explicados con una topología clara.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700">Ver módulo <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span></button><button onClick={() => goTo('troubleshooting')} className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300"><div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><AlertTriangle /></div><h3 className="font-semibold">Resuelve errores</h3><p className="mt-2 text-sm leading-6 text-slate-500">Diagnostica desde la capa física hasta DNS sin saltarte pasos.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">Abrir diagnóstico <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span></button><button onClick={() => goTo('glossary')} className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300"><div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><BookOpen /></div><h3 className="font-semibold">Consulta el glosario</h3><p className="mt-2 text-sm leading-6 text-slate-500">Encuentra definiciones cortas para hablar el idioma de las redes.</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-700">Consultar términos <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span></button></div>
          </section>

          <section id="commands" className="scroll-mt-24 border-t border-slate-200 pt-16 mt-16"><SectionHeading eyebrow="01 · Caja de herramientas" title="Comandos IOS que conviene entender" description="No memorices a ciegas. Cada comando responde a una pregunta concreta del diagnóstico o la configuración." /><div className="grid gap-4 lg:grid-cols-3">{commandGroups.map(({ title, description, icon: Icon, commands }) => <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="size-4" /></div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">IOS</span></div><div className="mt-5 flex flex-col gap-2">{commands.map(([command, detail]) => <div key={command} className="group rounded-lg border border-slate-100 bg-slate-50 p-3"><div className="flex items-start justify-between gap-2"><code className="whitespace-pre-wrap text-[11px] leading-5 text-slate-800">{command}</code><button onClick={() => copyCommand(command)} className="shrink-0 text-slate-400 hover:text-cyan-700" aria-label={`Copiar ${command}`}><Copy className="size-3.5" /></button></div><p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p></div>)}</div></article>)}</div>{copied && <p className="mt-3 text-xs font-medium text-emerald-700">Comando copiado al portapapeles.</p>}</section>

          <section id="segmentation" className="scroll-mt-24 border-t border-slate-200 pt-16 mt-16"><SectionHeading eyebrow="02 · Arquitectura" title="Segmentación: de una red plana a una red ordenada" description="Las VLANs separan áreas; el trunk las transporta; el router o switch de capa 3 permite que se comuniquen con reglas." /><div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Topología conceptual</p><h3 className="mt-1 font-semibold">Router-on-a-Stick</h3></div><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">802.1Q</span></div><div className="flex flex-col items-center gap-3 text-center text-xs sm:flex-row sm:items-stretch sm:justify-center"><div className="flex w-full max-w-[150px] flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-4"><Network className="mx-auto mb-2 size-6 text-slate-500" /><strong>Switch L2</strong><span className="mt-1 text-slate-400">VLAN 10 · 20</span></div><div className="flex items-center text-cyan-600"><ArrowRight className="hidden sm:block" /><ChevronDown className="sm:hidden" /></div><div className="w-full max-w-[190px] rounded-xl border border-cyan-200 bg-cyan-50 p-4"><GitBranch className="mx-auto mb-2 size-6 text-cyan-700" /><strong>Trunk</strong><span className="mt-1 block text-cyan-700">VLAN 10, 20, 99</span></div><div className="flex items-center text-cyan-600"><ArrowRight className="hidden sm:block" /><ChevronDown className="sm:hidden" /></div><div className="flex w-full max-w-[150px] flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-4"><Network className="mx-auto mb-2 size-6 text-slate-500" /><strong>Router</strong><span className="mt-1 text-slate-400">Gateways .10 · .20</span></div></div><div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg bg-orange-50 p-3 text-orange-800"><strong>10</strong><span className="mt-1 block text-[10px]">VENTAS</span></div><div className="rounded-lg bg-violet-50 p-3 text-violet-800"><strong>20</strong><span className="mt-1 block text-[10px]">CONTABILIDAD</span></div><div className="rounded-lg bg-slate-100 p-3 text-slate-700"><strong>99</strong><span className="mt-1 block text-[10px]">GESTIÓN</span></div></div></div><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700"><Lightbulb className="size-4" /></div><div><h3 className="font-semibold">Idea clave</h3><p className="mt-1 text-sm leading-6 text-slate-500">Una VLAN no es una subred por sí sola. Para que un host tenga conectividad entre segmentos necesitas un gateway y routing.</p></div></div><div className="mt-6 flex flex-col gap-3">{[['VLAN', 'Separa dominios de broadcast'], ['Trunk', 'Transporta etiquetas entre equipos'], ['Gateway', 'Puerta de salida del segmento'], ['Routing', 'Decide hacia dónde va el paquete']].map(([label, text], i) => <div key={label} className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><span className="flex size-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{i + 1}</span><div><p className="text-sm font-medium">{label}</p><p className="text-xs text-slate-500">{text}</p></div></div>)}</div></div></div></section>

          <section id="workflows" className="scroll-mt-24 border-t border-slate-200 pt-16 mt-16"><SectionHeading eyebrow="03 · Laboratorio guiado" title="Flujo: despliega una nueva subred" description="Sigue el orden recomendado para una VLAN con DHCP. Avanza por cada etapa y entiende qué estás validando." /><div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="flex flex-col gap-2">{workflowSteps.map((item, i) => <button key={item.title} onClick={() => setStep(i)} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${step === i ? 'border-cyan-300 bg-cyan-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}><span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step === i ? 'bg-cyan-600 text-white' : i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{i < step ? <CheckCircle2 className="size-4" /> : i + 1}</span><span className="flex-1"><strong className="block text-sm">{item.title}</strong><small className="mt-0.5 block text-xs text-slate-500">{item.note}</small></span>{step === i && <ChevronRight className="size-4 text-cyan-700" />}</button>)}</div><div className="rounded-xl border border-slate-200 bg-[#111c2c] p-6 text-white shadow-sm"><div className="flex items-center justify-between"><div><span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Paso {String(step + 1).padStart(2, '0')}</span><h3 className="mt-2 text-xl font-semibold">{workflowSteps[step].title}</h3></div><button onClick={() => copyCommand(workflowSteps[step].command)} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10" aria-label="Copiar bloque"><Copy className="size-4" /></button></div><div className="mt-6 rounded-lg border border-white/10 bg-[#091321] p-4"><pre className="whitespace-pre-wrap text-sm leading-7 text-cyan-100"><code>{workflowSteps[step].command.replaceAll('\\n', '\n')}</code></pre></div><div className="mt-5 flex items-center justify-between"><p className="text-xs leading-5 text-slate-400">{workflowSteps[step].note}</p><button onClick={() => setStep((step + 1) % workflowSteps.length)} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-cyan-50">{step === workflowSteps.length - 1 ? 'Reiniciar' : 'Siguiente'} <Play className="size-3.5" /></button></div></div></div></section>

          <section id="troubleshooting" className="scroll-mt-24 border-t border-slate-200 pt-16 mt-16"><SectionHeading eyebrow="04 · Diagnóstico" title="Cuando algo falla, sigue la ruta" description="El troubleshooting efectivo va de lo más simple y cercano al usuario hacia lo más específico. No empieces cambiando configuraciones al azar." /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[['01', 'Capa física', '¿Está encendido? ¿El cable está conectado?', 'show interfaces status'], ['02', 'Interfaz e IP', '¿Está up/up? ¿Tiene IP y máscara correctas?', 'show ip interface brief'], ['03', 'Segmento y ruta', '¿VLAN, trunk, gateway y ruta existen?', 'show vlan brief'], ['04', 'Políticas y servicios', '¿ACL, NAT, DHCP o DNS bloquean?', 'show access-lists']].map(([number, title, text, command]) => <article key={number} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="font-mono text-xs font-bold text-cyan-700">{number}</span><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 min-h-12 text-sm leading-5 text-slate-500">{text}</p><code className="mt-4 block rounded-md bg-slate-100 px-2 py-2 text-[10px] text-slate-700">{command}</code></article>)}</div><div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /><p className="text-sm leading-6"><strong>Recuerda:</strong> una ACL tiene un <code className="rounded bg-amber-100 px-1 font-mono text-xs">implicit deny</code> al final. Si quieres permitir el resto del tráfico, declara explícitamente <code className="rounded bg-amber-100 px-1 font-mono text-xs">permit ip any any</code>.</p></div></section>

          <section id="glossary" className="scroll-mt-24 border-t border-slate-200 pt-16 mt-16"><SectionHeading eyebrow="05 · Referencia rápida" title="Glosario de redes" description="Busca un concepto y úsalo para conectar la teoría con el comando que estás ejecutando." /><div className="relative mb-5 max-w-xl"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar VLAN, NAT, OSPF..." className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none ring-cyan-500 transition placeholder:text-slate-400 focus:ring-2" /></div><div className="grid gap-3 md:grid-cols-2">{filteredGlossary.map(([term, definition]) => <div key={term} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{term}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">concepto</span></div><p className="mt-2 text-sm leading-6 text-slate-500">{definition}</p></div>)}</div>{filteredGlossary.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No encontramos ese término. Prueba con otra palabra.</div>}</section>
          <footer className="mt-20 border-t border-slate-200 py-8 text-xs text-slate-400"><div className="flex flex-col justify-between gap-2 md:flex-row"><span>NetLab · Material educativo basado en comandos Cisco IOS.</span><span>Practica siempre en Packet Tracer, GNS3 o un laboratorio autorizado.</span></div></footer>
        </div>
      </main>
    </div>
  )
}
