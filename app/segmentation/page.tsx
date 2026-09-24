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
    id: 'campus', title: 'Campus por capas', company: 'Universidad · edificios y laboratorios', summary: 'Arquitectura access–distribution–core con VLANs por facultad y routing OSPF.', segments: ['VLAN 110 · Ingeniería · 10.11.0.0/16', 'VLAN 120 · Biblioteca · 10.12.0.0/16', 'VLAN 130 · Invitados · 10.13.0.0/16', 'VLAN 999 · Nativa no usada'], devices: '2 switches access · 2 distribución · core L3 · 2 access points', commands: `! ACCESS-SW — puerto de usuario y uplink
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
  const [allowedVlans, setAllowedVlans] = useState<string[]>(['10-20'])
  const [aclType, setAclType] = useState<'standard' | 'extended'>('extended')
  const [aclService, setAclService] = useState('HTTPS (443)')
  const [aclAction, setAclAction] = useState<'permit' | 'deny'>('deny')
  const [labVlans, setLabVlans] = useState([{ id: '10', name: 'USUARIOS', network: '192.168.10.0', mask: '255.255.255.0', gateway: '192.168.10.1' }, { id: '20', name: 'SERVIDORES', network: '192.168.20.0', mask: '255.255.255.0', gateway: '192.168.20.1' }])
  const [labLinks, setLabLinks] = useState<string[]>(['10-20'])
  const topology = useMemo(() => topologies.find(item => item.id === selected) ?? topologies[0], [selected])
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-700 outline-none focus:border-cyan-400'
  const workflowSteps = useMemo(() => topology.commands.split(/\n\n+/).filter(Boolean).map((block, index) => {
    const title = block.split('\n')[0].replace(/^!\s*/, '') || `Paso ${index + 1}`
    const normalized = title.toLowerCase()
    const device = normalized.includes('access-sw-1') ? 'ACCESS-SW-1' : normalized.includes('access-sw-2') ? 'ACCESS-SW-2' : normalized.includes('dist-sw-1') ? 'DIST-SW-1' : normalized.includes('dist-sw-2') ? 'DIST-SW-2' : normalized.includes('core') ? 'CORE L3' : normalized.includes('switch') || normalized.includes('access-sw') || normalized.includes('dist-sw') ? 'SWITCH' : normalized.includes('router') || normalized.includes('router-') || normalized.includes('firewall') ? 'ROUTER / FIREWALL' : 'EQUIPO INDICADO'
    return { title, device, code: block.split('\n').slice(1).join('\n') }
  }), [topology.commands])
  const executionMap = topology.id === 'campus' ? [{ device: 'ACCESS-SW-1', task: 'Puertos de Ingeniería y AP-1' }, { device: 'ACCESS-SW-2', task: 'Puertos de Biblioteca, Invitados y AP-2' }, { device: 'DIST-SW-1 / DIST-SW-2', task: 'SVI, gateway redundante y uplinks' }, { device: 'CORE L3', task: 'Routing entre distribución y OSPF' }, { device: 'ROUTER / FIREWALL', task: 'Salida WAN, DHCP y políticas' }] : topology.id === 'empresa' ? [{ device: 'SWITCH-CORE', task: 'VLANs, puertos de acceso y trunk' }, { device: 'ROUTER-EDGE', task: 'Subinterfaces y gateways inter-VLAN' }] : [{ device: 'ROUTER-FW', task: 'Zonas, ACL, inspección y zone-pair' }, { device: 'SWITCH-DMZ', task: 'VLAN DMZ y puerto del servidor' }]
  const additionalConfigs = topology.id === 'empresa' ? [{ title: 'DHCP por VLAN', device: 'ROUTER-EDGE', description: 'Entrega IP, gateway y DNS automáticamente a Administración y Ventas.', code: `enable\nconfigure terminal\nip dhcp excluded-address 192.168.10.1 192.168.10.20\nip dhcp excluded-address 192.168.20.1 192.168.20.20\nip dhcp pool VLAN10-ADMIN\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\n dns-server 1.1.1.1 8.8.8.8\n domain-name empresa.local\nip dhcp pool VLAN20-VENTAS\n network 192.168.20.0 255.255.255.0\n default-router 192.168.20.1\n dns-server 1.1.1.1 8.8.8.8\n domain-name empresa.local\nend\nshow ip dhcp binding\nshow ip dhcp pool` }, { title: 'DNS y NTP del router', device: 'ROUTER-EDGE', description: 'Configura resolución DNS y sincronización horaria para registros consistentes.', code: `enable\nconfigure terminal\nip name-server 1.1.1.1 8.8.8.8\nip domain lookup\nntp server time.google.com\nclock timezone UTC 0 0\nservice timestamps log datetime msec\nend\nshow clock\nshow ntp associations` }, { title: 'DHCP Snooping y confianza', device: 'SWITCH-CORE', description: 'Protege las VLAN frente a servidores DHCP no autorizados; confía únicamente en el trunk hacia el router.', code: `enable\nconfigure terminal\nip dhcp snooping\nip dhcp snooping vlan 10,20,30,99\ninterface GigabitEthernet0/1\n description TRUNK-HACIA-ROUTER-DHCP\n ip dhcp snooping trust\ninterface range GigabitEthernet0/2-24\n ip dhcp snooping limit rate 15\nend\nshow ip dhcp snooping\nshow ip dhcp snooping binding` }] : topology.id === 'campus' ? [{ title: 'DHCP por facultad y Wi-Fi', device: 'CORE L3', description: 'Crea pools para Ingeniería, Biblioteca e Invitados; los gateways son las SVI.', code: `enable\nconfigure terminal\nip dhcp excluded-address 10.11.0.1 10.11.0.20\nip dhcp excluded-address 10.12.0.1 10.12.0.20\nip dhcp excluded-address 10.13.0.1 10.13.0.20\nip dhcp pool VLAN110-INGENIERIA\n network 10.11.0.0 255.255.0.0\n default-router 10.11.0.1\n dns-server 1.1.1.1 8.8.8.8\nip dhcp pool VLAN120-BIBLIOTECA\n network 10.12.0.0 255.255.0.0\n default-router 10.12.0.1\n dns-server 1.1.1.1 8.8.8.8\nip dhcp pool VLAN130-INVITADOS\n network 10.13.0.0 255.255.0.0\n default-router 10.13.0.1\n dns-server 1.1.1.1 8.8.8.8\nend\nshow ip dhcp binding` }, { title: 'AP-1 y AP-2 por VLAN', device: 'ACCESS-SW-1 / ACCESS-SW-2', description: 'Configura los puertos de los dos access points como trunks o access según el diseño inalámbrico.', code: `enable\nconfigure terminal\ninterface GigabitEthernet0/21\n description AP-1-TRUNK\n switchport mode trunk\n switchport trunk allowed vlan 110,120,130,999\ninterface GigabitEthernet0/21\n description AP-2-TRUNK\n switchport mode trunk\n switchport trunk allowed vlan 110,120,130,999\nend\nshow interfaces trunk` }, { title: 'DNS, NTP y Syslog centralizados', device: 'CORE L3', description: 'Centraliza resolución, hora y registros para todos los segmentos del campus.', code: `enable\nconfigure terminal\nip name-server 1.1.1.1 8.8.8.8\nntp server 10.11.0.10\nlogging host 10.11.0.20\nlogging trap warnings\nservice timestamps log datetime msec\nend\nshow logging\nshow ntp associations` }] : [{ title: 'DHCP para usuarios internos', device: 'ROUTER-FW', description: 'Entrega direcciones únicamente a la red INSIDE; la DMZ usa IPs estáticas.', code: `enable\nconfigure terminal\nip dhcp excluded-address 172.16.10.1 172.16.10.20\nip dhcp pool INSIDE-USUARIOS\n network 172.16.10.0 255.255.255.0\n default-router 172.16.10.1\n dns-server 1.1.1.1 8.8.8.8\n domain-name ecommerce.local\nend\nshow ip dhcp binding` }, { title: 'DNS, NTP y Syslog', device: 'ROUTER-FW', description: 'Añade servicios básicos para resolver nombres, fechar eventos y enviar auditoría.', code: `enable\nconfigure terminal\nip name-server 1.1.1.1 8.8.8.8\nntp server 172.16.10.10\nlogging host 172.16.10.20\nservice timestamps log datetime msec\nend\nshow clock\nshow logging` }]
  const vlanOptions = topology.id === 'campus' ? [{ id: '110', name: 'Ingeniería' }, { id: '120', name: 'Biblioteca' }, { id: '130', name: 'Invitados' }] : topology.id === 'empresa' ? [{ id: '10', name: 'Administración' }, { id: '20', name: 'Ventas' }, { id: '30', name: 'Servidores' }] : [{ id: '10', name: 'Inside' }, { id: '20', name: 'DMZ' }, { id: '30', name: 'Management' }]
  const communicationPairs = vlanOptions.flatMap((source, index) => vlanOptions.slice(index + 1).map(target => ({ id: `${source.id}-${target.id}`, source, target })))
  const selectedCommunicationCode = allowedVlans.map(pair => { const [source, target] = pair.split('-'); const sourceVlan = vlanOptions.find(vlan => vlan.id === source); const targetVlan = vlanOptions.find(vlan => vlan.id === target); return ` permit ip 192.168.${source}.0 0.0.0.255 192.168.${target}.0 0.0.0.255 ! ${sourceVlan?.name} -> ${targetVlan?.name}` }).join('\n')
  const aclCode = aclType === 'standard' ? `access-list 10 ${aclAction} 192.168.${vlanOptions[0].id}.0 0.0.0.255\n! ACL estándar: filtra únicamente por IP de origen\ninterface Vlan${vlanOptions[0].id}\n ip access-group 10 in\nend\nshow access-lists 10` : `ip access-list extended ACL-${aclAction.toUpperCase()}-${aclService.split(' ')[0]}\n${selectedCommunicationCode || ` ${aclAction} tcp 192.168.${vlanOptions[0].id}.0 0.0.0.255 any eq ${aclService.match(/\d+/)?.[0] ?? '443'}`}\n deny ip any any log\nexit\ninterface Vlan${vlanOptions[0].id}\n ip access-group ACL-${aclAction.toUpperCase()}-${aclService.split(' ')[0]} in\nend\nshow access-lists`
  const labCode = `! LABORATORIO DE SEGMENTACION - ejecutar por equipo\n! ROUTER-EDGE: subinterfaces y gateways\nenable\nconfigure terminal\n${labVlans.map(vlan => `vlan ${vlan.id}\n name ${vlan.name}`).join('\n')}\ninterface GigabitEthernet0/1\n no shutdown\n${labVlans.map(vlan => `interface GigabitEthernet0/1.${vlan.id}\n encapsulation dot1Q ${vlan.id}\n ip address ${vlan.gateway} ${vlan.mask}`).join('\n')}\nend\n! SWITCH-ACCESS: crear VLANs y trunk\nenable\nconfigure terminal\n${labVlans.map(vlan => `vlan ${vlan.id}\n name ${vlan.name}`).join('\n')}\ninterface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk allowed vlan ${labVlans.map(vlan => vlan.id).join(',')}\nend\n! ROUTER-EDGE: DHCP por VLAN\nenable\nconfigure terminal\n${labVlans.map(vlan => `ip dhcp excluded-address ${vlan.gateway}\nip dhcp pool VLAN${vlan.id}-${vlan.name}\n network ${vlan.network} ${vlan.mask}\n default-router ${vlan.gateway}\n dns-server 1.1.1.1 8.8.8.8`).join('\n')}\nend\n! Verificacion\nshow vlan brief\nshow interfaces trunk\nshow ip interface brief\nshow ip dhcp binding` 
  const copy = async () => { await navigator.clipboard.writeText(topology.commands); setCopied(true); setTimeout(() => setCopied(false), 1400) }
  const copyLab = async () => { await navigator.clipboard.writeText(labCode); setCopied(true); setTimeout(() => setCopied(false), 1400) }

  return <NetworkShell><div className="mb-8 max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-700">Arquitectura replicable</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Topologías segmentadas.</h1><p className="mt-4 text-lg leading-8 text-slate-500">Elige un escenario empresarial, revisa sus segmentos y replica el workflow en Packet Tracer, GNS3 o equipos Cisco IOS.</p></div>
    <div className="mb-6 grid gap-4 lg:grid-cols-3">{topologies.map(item => <button key={item.id} onClick={() => setSelected(item.id)} className={`rounded-2xl border p-5 text-left transition ${selected === item.id ? 'border-cyan-300 bg-cyan-50 shadow-sm' : 'border-slate-200 bg-white hover:border-cyan-200'}`}><div className="flex items-center justify-between"><span className="rounded-full bg-white p-2 text-cyan-700"><Network /></span>{selected === item.id && <Check className="text-cyan-700" />}</div><h2 className="mt-4 font-semibold text-slate-900">{item.title}</h2><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">{item.company}</p><p className="mt-3 text-sm leading-6 text-slate-500">{item.summary}</p></button>)}</div>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">Topología seleccionada</p><h2 className="mt-2 text-2xl font-semibold">{topology.title}</h2><p className="mt-2 text-sm text-slate-500">{topology.devices}</p></div><div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><ShieldCheck className="text-cyan-700" /> Segmentación + control de acceso</div></div>
      <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">Vista rápida</p><h3 className="mt-1 font-semibold text-slate-900">Así se conectan los dispositivos</h3></div><span className="hidden rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 sm:inline">Esquema simplificado</span></div><div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:items-stretch md:justify-center"><div className="flex min-w-28 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm"><Globe2 className="text-cyan-700" /><span className="mt-2 text-xs font-semibold text-slate-700">Internet</span><span className="text-[11px] text-slate-400">WAN / ISP</span></div><ArrowRight className="rotate-90 text-slate-300 md:mt-8 md:rotate-0" /><div className="flex min-w-28 flex-col items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center shadow-sm"><Router className="text-cyan-700" /><span className="mt-2 text-xs font-semibold text-slate-700">Router / FW</span><span className="text-[11px] text-slate-500">Gateway</span></div><ArrowRight className="rotate-90 text-slate-300 md:mt-8 md:rotate-0" /><div className="flex min-w-28 flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-center shadow-sm"><Network className="text-indigo-700" /><span className="mt-2 text-xs font-semibold text-slate-700">Switch</span><span className="text-[11px] text-slate-500">VLANs / trunk</span></div><ArrowRight className="rotate-90 text-slate-300 md:mt-8 md:rotate-0" /><div className="grid grid-cols-2 gap-2"><div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 text-center"><Monitor className="text-slate-600" /><span className="mt-1 text-[11px] font-semibold text-slate-600">Usuarios</span></div><div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 text-center"><Wifi className="text-slate-600" /><span className="mt-1 text-[11px] font-semibold text-slate-600">Wi-Fi</span></div><div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 text-center"><Database className="text-slate-600" /><span className="mt-1 text-[11px] font-semibold text-slate-600">Servidores</span></div><div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2.5 text-center"><ShieldCheck className="text-slate-600" /><span className="mt-1 text-[11px] font-semibold text-slate-600">DMZ / MGMT</span></div></div></div><p className="mt-5 text-center text-xs leading-5 text-slate-500">Los clientes se conectan al switch; el router enruta entre VLANs y aplica las reglas de seguridad.</p></div><div className="grid gap-4 py-6 md:grid-cols-4">{topology.segments.map((segment, index) => <div key={segment} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-800">{index + 1}</span><span className="text-sm font-medium text-slate-700">{segment}</span></div>)}</div>
      <div className="my-6 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">Inventario visible</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"><div className="rounded-xl border border-white bg-white p-3 text-center"><Router className="mx-auto text-cyan-700" /><p className="mt-2 text-xs font-semibold text-slate-700">Router / Core</p></div><div className="rounded-xl border border-white bg-white p-3 text-center"><Network className="mx-auto text-indigo-700" /><p className="mt-2 text-xs font-semibold text-slate-700">Switch access 1</p></div><div className="rounded-xl border border-white bg-white p-3 text-center"><Network className="mx-auto text-indigo-700" /><p className="mt-2 text-xs font-semibold text-slate-700">Switch access 2</p></div><div className="rounded-xl border border-white bg-white p-3 text-center"><Wifi className="mx-auto text-emerald-700" /><p className="mt-2 text-xs font-semibold text-slate-700">Access point 1</p></div><div className="rounded-xl border border-white bg-white p-3 text-center"><Wifi className="mx-auto text-emerald-700" /><p className="mt-2 text-xs font-semibold text-slate-700">Access point 2</p></div><div className="rounded-xl border border-white bg-white p-3 text-center"><Server className="mx-auto text-slate-600" /><p className="mt-2 text-xs font-semibold text-slate-700">Servidor</p></div></div></div><div className="my-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-700">Mapa de ejecución</p><p className="mt-1 text-sm text-slate-600">Si hay varios switches, no repitas todo en todos: ejecuta cada bloque únicamente en el equipo indicado.</p><div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{executionMap.map(item => <div key={item.device} className="rounded-xl border border-white bg-white p-3"><p className="text-xs font-bold text-indigo-700">{item.device}</p><p className="mt-1 text-xs leading-5 text-slate-600">{item.task}</p></div>)}</div></div><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">Workflow por pasos</h3><p className="mt-1 text-sm text-slate-500">Cada paso indica el equipo exacto donde debes abrir la CLI. En topologías con varios switches, configura ACCESS-SW-1, ACCESS-SW-2 y distribución por separado; los uplinks deben coincidir en ambos extremos.</p></div><button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">{copied ? <Check /> : <Copy />} {copied ? 'Copiado' : 'Copiar workflow'}</button></div><div className="flex flex-col gap-4">{workflowSteps.map((step, index) => <details key={`${step.title}-${index}`} open={index === 0} className="overflow-hidden rounded-xl border border-slate-200 bg-white"><summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-semibold text-slate-800"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs text-cyan-800">{index + 1}</span><span className="min-w-0 flex-1">{step.title}</span><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${step.device === 'SWITCH' ? 'bg-indigo-100 text-indigo-700' : step.device === 'ROUTER / FIREWALL' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{step.device}</span></summary><pre className="overflow-auto border-t border-slate-800 bg-slate-950 p-5 text-xs leading-6 text-slate-200"><code>{step.code}</code></pre></details>)}</div></section>
    <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Configuraciones adicionales</p><h3 className="mt-2 text-xl font-semibold text-slate-900">Servicios para completar la segmentación</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Después del workflow principal, aplica estos bloques en el equipo indicado. Incluyen DHCP por VLAN, DNS, NTP, Syslog, Wi-Fi y controles de seguridad.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">{additionalConfigs.length} flujos extra</span></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{additionalConfigs.map(config => <details key={config.title} className="overflow-hidden rounded-xl border border-emerald-100 bg-white"><summary className="cursor-pointer list-none px-4 py-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-semibold text-slate-900">{config.title}</h4><p className="mt-1 text-xs leading-5 text-slate-500">{config.description}</p></div><span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">{config.device}</span></div></summary><pre className="overflow-x-auto border-t border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200"><code>{config.code}</code></pre></details>)}</div></section><section className="mt-6 rounded-2xl border border-cyan-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">Laboratorio de segmentación</p><h3 className="mt-2 text-xl font-semibold text-slate-900">Crea tus VLANs y genera la topología</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Define VLAN, nombre, red, máscara y gateway. Luego marca qué redes pueden comunicarse y copia la configuración separada por Router-Edge y Switch-Access.</p></div><button onClick={() => setLabVlans(current => [...current, { id: String(10 + current.length * 10), name: `VLAN_${current.length + 1}`, network: `192.168.${10 + current.length * 10}.0`, mask: '255.255.255.0', gateway: `192.168.${10 + current.length * 10}.1` }])} className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-800">+ Añadir VLAN</button></div><div className="mt-5 flex flex-col gap-3">{labVlans.map((vlan, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-5"><label className="text-xs font-semibold text-slate-600">ID<input value={vlan.id} onChange={event => setLabVlans(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, id: event.target.value } : item))} className={inputClass} /></label><label className="text-xs font-semibold text-slate-600">Nombre<input value={vlan.name} onChange={event => setLabVlans(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value.toUpperCase() } : item))} className={inputClass} /></label><label className="text-xs font-semibold text-slate-600">Red<input value={vlan.network} onChange={event => setLabVlans(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, network: event.target.value } : item))} className={inputClass} /></label><label className="text-xs font-semibold text-slate-600">Máscara<input value={vlan.mask} onChange={event => setLabVlans(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, mask: event.target.value } : item))} className={inputClass} /></label><label className="text-xs font-semibold text-slate-600">Gateway<input value={vlan.gateway} onChange={event => setLabVlans(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, gateway: event.target.value } : item))} className={inputClass} /></label></div>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div><p className="text-sm font-semibold text-slate-800">Comunicación de este laboratorio</p><div className="mt-3 grid gap-2">{labVlans.flatMap((source, index) => labVlans.slice(index + 1).map(target => <label key={`${source.id}-${target.id}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700"><input type="checkbox" checked={labLinks.includes(`${source.id}-${target.id}`)} onChange={event => setLabLinks(current => event.target.checked ? [...current, `${source.id}-${target.id}`] : current.filter(link => link !== `${source.id}-${target.id}`))} className="size-4 accent-cyan-700" />VLAN {source.id} ({source.name}) ↔ VLAN {target.id} ({target.name})</label>))}</div></div><div><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-800">Configuración generada</p><button onClick={copyLab} className="text-xs font-semibold text-cyan-700">Copiar todo</button></div><pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200"><code>{labCode}</code></pre></div></div></section><section className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/50 p-6"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-700">Políticas de comunicación y ACL</p><h3 className="mt-2 text-xl font-semibold text-slate-900">Decide quién puede hablar con quién</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Selecciona las comunicaciones inter-VLAN permitidas. Después genera una ACL estándar o extendida para aplicarla en el gateway indicado.</p></div><div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]"><div><p className="text-sm font-semibold text-slate-800">VLANs que pueden comunicarse</p><div className="mt-3 grid gap-2">{communicationPairs.map(pair => <label key={pair.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white bg-white p-3 text-sm text-slate-700"><input type="checkbox" checked={allowedVlans.includes(pair.id)} onChange={event => setAllowedVlans(current => event.target.checked ? [...current, pair.id] : current.filter(item => item !== pair.id))} className="size-4 accent-violet-600" /><span><strong>VLAN {pair.source.id} · {pair.source.name}</strong><span className="mx-2 text-slate-400">↔</span><strong>VLAN {pair.target.id} · {pair.target.name}</strong></span></label>)}</div><div className="mt-4 rounded-xl border border-violet-100 bg-white p-3 text-xs leading-5 text-slate-500"><strong className="text-violet-700">Regla resultante:</strong> {allowedVlans.length ? `permitir ${allowedVlans.join(', ')}; bloquear el resto con deny ip any any log.` : 'bloquear comunicación inter-VLAN por defecto.'}</div></div><div><p className="text-sm font-semibold text-slate-800">Generador de ACL</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-xs font-semibold text-slate-600">Tipo<select value={aclType} onChange={event => setAclType(event.target.value as 'standard' | 'extended')} className={inputClass}><option value="extended">Extendida: IP + servicio</option><option value="standard">Normal: solo origen</option></select></label><label className="text-xs font-semibold text-slate-600">Servicio<select value={aclService} onChange={event => setAclService(event.target.value)} className={inputClass}><option>HTTPS (443)</option><option>HTTP (80)</option><option>SSH (22)</option><option>DNS (53)</option><option>RDP (3389)</option></select></label><label className="text-xs font-semibold text-slate-600">Acción<select value={aclAction} onChange={event => setAclAction(event.target.value as 'permit' | 'deny')} className={inputClass}><option value="deny">Bloquear</option><option value="permit">Permitir</option></select></label></div><pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200"><code>{aclCode}</code></pre><p className="mt-3 text-xs leading-5 text-slate-500">Pega el bloque en la CLI del gateway que enruta esas VLANs (ROUTER-EDGE o CORE L3), dentro de `configure terminal`; aplícalo en la SVI/subinterfaz de entrada indicada. Prueba primero en laboratorio y verifica contadores antes de guardarla.</p></div></div></section><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5"><GitBranch className="text-cyan-700" /><h3 className="mt-3 font-semibold">1. Diseña</h3><p className="mt-2 text-sm leading-6 text-slate-500">Define VLAN, subred, gateway, función y nivel de confianza antes de cablear.</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><Server className="text-cyan-700" /><h3 className="mt-3 font-semibold">2. Configura</h3><p className="mt-2 text-sm leading-6 text-slate-500">Crea VLANs, asigna puertos, configura trunks y levanta gateways o SVI.</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><ArrowRight className="text-cyan-700" /><h3 className="mt-3 font-semibold">3. Verifica</h3><p className="mt-2 text-sm leading-6 text-slate-500">Comprueba tablas VLAN, trunks, rutas, vecinos, ACLs y conectividad entre segmentos.</p></div></div>
  </NetworkShell>
}
