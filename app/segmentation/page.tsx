'use client'

import { useMemo, useState } from 'react'
import NetworkShell from '@/components/network-shell'
import { ArrowRight, Check, Copy, Database, GitBranch, Globe2, Monitor, Network, Router, Server, ShieldCheck, Wifi } from 'lucide-react'

type Topology = {
  id: string
  title: string
  company: string
  summary: string
  segments: string[]
  devices: string
  commands: string
}

const topologies: Topology[] = [
  {
    id: 'empresa', title: 'Oficina corporativa', company: 'Empresa mediana · 80 usuarios', summary: 'Separación de áreas, servidores y visitantes con un router-on-a-stick.', segments: ['VLAN 10 · Administración · 192.168.10.0/24', 'VLAN 20 · Ventas · 192.168.20.0/24', 'VLAN 30 · Servidores · 192.168.30.0/24', 'VLAN 99 · Gestión · 192.168.99.0/24'], devices: '1 router · 2 switches · AP corporativo', commands: `! SWITCH-CORE — crear VLANs y trunk hacia el router
enable
configure terminal
vlan 10
 name ADMINISTRACION
vlan 20
 name VENTAS
vlan 30
 name SERVIDORES
vlan 99
 name GESTION
interface GigabitEthernet0/1
 description TRUNK-HACIA-ROUTER
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,99
end
show vlan brief
show interfaces trunk
copy running-config startup-config

! ROUTER-EDGE — gateways por subinterfaz
configure terminal
interface GigabitEthernet0/0
 no shutdown
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
interface GigabitEthernet0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
interface GigabitEthernet0/0.99
 encapsulation dot1Q 99 native
 ip address 192.168.99.1 255.255.255.0
end
show ip interface brief
show ip route
copy running-config startup-config`
  },
  {
    id: 'campus', title: 'Campus por capas', company: 'Universidad · edificios y laboratorios', summary: 'Arquitectura access–distribution–core con VLANs por facultad y routing OSPF.', segments: ['VLAN 110 · Ingeniería · 10.11.0.0/16', 'VLAN 120 · Biblioteca · 10.12.0.0/16', 'VLAN 130 · Invitados · 10.13.0.0/16', 'VLAN 999 · Nativa no usada'], devices: '2 switches access · 2 distribución · core L3', commands: `! ACCESS-SW — puerto de usuario y uplink
configure terminal
vlan 110
 name INGENIERIA
vlan 120
 name BIBLIOTECA
vlan 130
 name INVITADOS
vlan 999
 name VLAN_NATIVA_NO_USADA
interface range GigabitEthernet0/1-20
 switchport mode access
 switchport access vlan 110
 spanning-tree portfast
 spanning-tree bpduguard enable
interface GigabitEthernet0/24
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 110,120,130,999
end
show interfaces trunk
show spanning-tree vlan 110
copy running-config startup-config

! DIST-SW — SVI y routing inter-VLAN
configure terminal
ip routing
interface vlan 110
 ip address 10.11.0.1 255.255.0.0
 no shutdown
interface vlan 120
 ip address 10.12.0.1 255.255.0.0
 no shutdown
router ospf 10
 router-id 10.10.10.10
 network 10.11.0.0 0.0.255.255 area 0
 network 10.12.0.0 0.0.255.255 area 0
end
show ip ospf neighbor
show ip route ospf`
  },
  {
    id: 'seguridad', title: 'Empresa con DMZ', company: 'Comercio electrónico · servicios públicos', summary: 'Usuarios aislados de servidores públicos mediante DMZ, ACL y firewall por zonas.', segments: ['INSIDE · 172.16.10.0/24', 'DMZ · 172.16.20.0/24', 'OUTSIDE · Internet', 'MGMT · 172.16.99.0/24'], devices: 'Router firewall · switch DMZ · servidor web', commands: `! ROUTER-FW — interfaces y zonas
configure terminal
zone security INSIDE
zone security DMZ
zone security OUTSIDE
interface GigabitEthernet0/0
 description LAN-USUARIOS
 ip address 172.16.10.1 255.255.255.0
 zone-member security INSIDE
 no shutdown
interface GigabitEthernet0/1
 description SERVIDORES-DMZ
 ip address 172.16.20.1 255.255.255.0
 zone-member security DMZ
 no shutdown
ip access-list extended DMZ_PUBLIC_SERVICES
 permit tcp any host 172.16.20.10 eq 443
 permit tcp any host 172.16.20.10 eq 80
 deny ip any any log
class-map type inspect match-any WEB_ONLY
 match access-group name DMZ_PUBLIC_SERVICES
policy-map type inspect OUTSIDE_TO_DMZ
 class type inspect WEB_ONLY
  inspect
 class class-default
  drop log
zone-pair security OUTSIDE-DMZ source OUTSIDE destination DMZ
 service-policy type inspect OUTSIDE_TO_DMZ
end
show policy-map type inspect zone-pair sessions
show access-lists DMZ_PUBLIC_SERVICES
copy running-config startup-config`
  }
]

export default function Segmentation() {
  const [selected, setSelected] = useState('empresa')
  const [copied, setCopied] = useState(false)
  const topology = useMemo(() => topologies.find(item => item.id === selected) ?? topologies[0], [selected])
  const copy = async () => { await navigator.clipboard.writeText(topology.commands); setCopied(true); setTimeout(() => setCopied(false), 1400) }

  return <NetworkShell><div className="mb-8 max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-700">Arquitectura replicable</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Topologías segmentadas.</h1><p className="mt-4 text-lg leading-8 text-slate-500">Elige un escenario empresarial, revisa sus segmentos y replica el workflow en Packet Tracer, GNS3 o equipos Cisco IOS.</p></div>
    <div className="mb-6 grid gap-4 lg:grid-cols-3">{topologies.map(item => <button key={item.id} onClick={() => setSelected(item.id)} className={`rounded-2xl border p-5 text-left transition ${selected === item.id ? 'border-cyan-300 bg-cyan-50 shadow-sm' : 'border-slate-200 bg-white hover:border-cyan-200'}`}><div className="flex items-center justify-between"><span className="rounded-full bg-white p-2 text-cyan-700"><Network /></span>{selected === item.id && <Check className="text-cyan-700" />}</div><h2 className="mt-4 font-semibold text-slate-900">{item.title}</h2><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">{item.company}</p><p className="mt-3 text-sm leading-6 text-slate-500">{item.summary}</p></button>)}</div>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">Topología seleccionada</p><h2 className="mt-2 text-2xl font-semibold">{topology.title}</h2><p className="mt-2 text-sm text-slate-500">{topology.devices}</p></div><div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><ShieldCheck className="text-cyan-700" /> Segmentación + control de acceso</div></div>
      <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">Vista rápida</p><h3 className="mt-1 font-semibold text-slate-900">Así se conectan los dispositivos</h3></div><span className="hidden rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 sm:inline">Esquema simplificado</span></div><div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:items-stretch md:justify-center"><div className="flex min-w-28 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm"><Globe2 className="text-cyan-700" /><span className="mt-2 text-xs font-semibold text-slate-700">Internet</span><span className="text-[11px] text-slate-400">WAN / ISP</span></div><ArrowRight className="rotate-90 text-slate-300 md:mt-8 md:rotate-0" /><div className="flex min-w-28 flex-col items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center shadow-sm"><Router className="text-cyan-700" /><span className="mt-2 text-xs font-semibold text-slate-700">Router / FW</span><span className="text-[11px] text-slate-500">Gateway</span></div><ArrowRight className="rotate-90 text-slate-300 md:mt-8 md:rotate-0" /><div className="flex min-w-28 flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-center shadow-sm"><Network className="text-indigo-700" /><span className="mt-2 text-xs font-semibold text-slate-700">Switch</span><span className="text-[11px] text-slate-500">VLANs / trunk</span></div><ArrowRight className="rotate-90 text-slate-300 md:mt-8 md:rotate-0" /><div className="grid grid-cols-2 gap-2"><div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 text-center"><Monitor className="text-slate-600" /><span className="mt-1 text-[11px] font-semibold text-slate-600">Usuarios</span></div><div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 text-center"><Wifi className="text-slate-600" /><span className="mt-1 text-[11px] font-semibold text-slate-600">Wi-Fi</span></div><div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 text-center"><Database className="text-slate-600" /><span className="mt-1 text-[11px] font-semibold text-slate-600">Servidores</span></div><div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 text-center"><ShieldCheck className="text-slate-600" /><span className="mt-1 text-[11px] font-semibold text-slate-600">DMZ / MGMT</span></div></div></div><p className="mt-5 text-center text-xs leading-5 text-slate-500">Los clientes se conectan al switch; el router enruta entre VLANs y aplica las reglas de seguridad.</p></div><div className="grid gap-4 py-6 md:grid-cols-4">{topology.segments.map((segment, index) => <div key={segment} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-800">{index + 1}</span><span className="text-sm font-medium text-slate-700">{segment}</span></div>)}</div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">Workflow para replicar</h3><p className="mt-1 text-sm text-slate-500">Ejecuta primero el bloque del switch o router indicado en cada comentario.</p></div><button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">{copied ? <Check /> : <Copy />} {copied ? 'Copiado' : 'Copiar workflow'}</button></div><pre className="max-h-[620px] overflow-auto rounded-xl bg-slate-950 p-5 text-xs leading-6 text-slate-200"><code>{topology.commands}</code></pre></section>
    <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5"><GitBranch className="text-cyan-700" /><h3 className="mt-3 font-semibold">1. Diseña</h3><p className="mt-2 text-sm leading-6 text-slate-500">Define VLAN, subred, gateway, función y nivel de confianza antes de cablear.</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><Server className="text-cyan-700" /><h3 className="mt-3 font-semibold">2. Configura</h3><p className="mt-2 text-sm leading-6 text-slate-500">Crea VLANs, asigna puertos, configura trunks y levanta gateways o SVI.</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><ArrowRight className="text-cyan-700" /><h3 className="mt-3 font-semibold">3. Verifica</h3><p className="mt-2 text-sm leading-6 text-slate-500">Comprueba tablas VLAN, trunks, rutas, vecinos, ACLs y conectividad entre segmentos.</p></div></div>
  </NetworkShell>
}
