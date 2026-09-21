import Link from 'next/link'
import { ArrowRight, AlertTriangle, BookOpen, GitBranch, Network, Terminal } from 'lucide-react'
import NetworkShell from '@/components/network-shell'

const cards = [
  ['/commands', 'Comandos IOS', 'Más de 60 comandos organizados por verificación, interfaces, VLAN, routing, ACL, NAT y servicios.', Terminal],
  ['/segmentation', 'Segmentación', 'Diseña VLANs, trunks y gateways con una topología clara.', Network],
  ['/workflows', 'Laboratorio de flujos', 'Asigna IPs a los dispositivos y genera el bloque IOS listo para copiar.', GitBranch],
  ['/troubleshooting', 'Errores y diagnóstico', 'Sigue una ruta de diagnóstico desde la capa física hasta los servicios.', AlertTriangle],
  ['/glossary', 'Glosario', 'Consulta conceptos esenciales de redes y Cisco IOS.', BookOpen]
]

export default function Home() {
  return (
    <NetworkShell>
      <section className="rounded-2xl bg-[#10233b] px-6 py-10 text-white md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">
          Centro de aprendizaje
        </p>

        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Configura redes con criterio, no solo con comandos.
        </h1>

        <p className="mt-4 max-w-xl text-slate-300">
          Una guía visual para entender Cisco IOS, segmentar una red,
          seguir flujos de trabajo y resolver errores paso a paso.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/workflows"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-[#071321]"
          >
            Abrir laboratorio
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/commands"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold"
          >
            Explorar comandos
            <Terminal className="size-4" />
          </Link>
        </div>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(([href, title, desc, Icon]) => (
          <Link
            href={href as string}
            key={href as string}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300"
          >
            <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
              <Icon className="size-5" />
            </div>

            <h2 className="font-semibold">
              {title as string}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {desc as string}
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700">
              Abrir módulo
              <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>
            Net-Lab · Tu Guía
          </span>

          <span>
            Dev by Jesús Sanabria, Estudiante de Ciberseguridad en FUSALMO
          </span>
        </div>
      </footer>
    </NetworkShell>
  )
}
