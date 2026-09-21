'use client'

import { useState } from 'react'
import { Check, Copy, Search, Terminal } from 'lucide-react'
import NetworkShell from '@/components/network-shell'

type CommandGroup = { title: string; description: string; commands: string[] }

const groups: CommandGroup[] = [
  { title: 'Interfaces y direccionamiento IP', description: 'Asigna IPv4, documenta enlaces y habilita interfaces.', commands: ['enable', 'configure terminal', 'hostname R1-EDGE', 'interface GigabitEthernet0/0', 'description Enlace hacia LAN-USUARIOS', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown', 'interface GigabitEthernet0/1', 'ip address 10.0.0.1 255.255.255.252', 'ip address 192.168.10.1 255.255.255.0 secondary', 'show ip interface brief', 'show interfaces GigabitEthernet0/0'] },
  { title: 'Subinterfaces y router-on-a-stick', description: 'Separa varias VLAN sobre un enlace físico al switch.', commands: ['interface GigabitEthernet0/0.10', 'encapsulation dot1Q 10', 'ip address 192.168.10.1 255.255.255.0', 'interface GigabitEthernet0/0.20', 'encapsulation dot1Q 20', 'ip address 192.168.20.1 255.255.255.0', 'interface GigabitEthernet0/0.99', 'encapsulation dot1Q 99 native', 'ip address 192.168.99.1 255.255.255.0', 'show interfaces trunk'] },
  { title: 'VLAN, puertos y trunk', description: 'Crea segmentos, asigna puertos y valida el transporte.', commands: ['vlan 10', 'name VENTAS', 'vlan 20', 'name SOPORTE', 'vlan 99', 'name MANAGEMENT', 'interface range GigabitEthernet0/1-12', 'switchport mode access', 'switchport access vlan 10', 'spanning-tree portfast', 'interface GigabitEthernet0/24', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20,99', 'switchport trunk native vlan 99', 'show vlan brief', 'show interfaces switchport'] },
  { title: 'Rutas estáticas y routing dinámico', description: 'Conecta redes remotas y anuncia prefijos.', commands: ['ip route 0.0.0.0 0.0.0.0 10.0.0.2', 'ip route 192.168.30.0 255.255.255.0 10.0.0.2', 'router ospf 1', 'router-id 1.1.1.1', 'network 10.0.0.0 0.0.0.3 area 0', 'network 192.168.10.0 0.0.0.255 area 0', 'passive-interface default', 'no passive-interface GigabitEthernet0/1', 'show ip ospf neighbor', 'show ip route ospf', 'router eigrp 100', 'network 192.168.10.0 0.0.0.255'] },
  { title: 'DHCP y relay', description: 'Entrega direcciones automáticamente o reenvía solicitudes.', commands: ['ip dhcp excluded-address 192.168.10.1 192.168.10.20', 'ip dhcp pool LAN-USUARIOS', 'network 192.168.10.0 255.255.255.0', 'default-router 192.168.10.1', 'dns-server 1.1.1.1 8.8.8.8', 'domain-name campus.local', 'lease 7', 'interface Vlan10', 'ip helper-address 192.168.50.10', 'show ip dhcp binding', 'show ip dhcp pool'] },
  { title: 'Servicios en router', description: 'Configura DNS, NTP, Syslog, banner y acceso de administración.', commands: ['ip domain name campus.local', 'ip name-server 1.1.1.1 8.8.8.8', 'ntp server 192.168.50.20', 'clock timezone UTC 0 0', 'service timestamps log datetime msec', 'logging host 192.168.50.30', 'logging trap warnings', 'ip http secure-server', 'banner motd ^CAcceso autorizado solamente^C', 'show clock', 'show logging', 'show ntp associations'] },
  { title: 'NAT, PAT y publicación', description: 'Traduce direcciones privadas y publica un servicio interno.', commands: ['interface GigabitEthernet0/0', 'ip nat inside', 'interface GigabitEthernet0/1', 'ip nat outside', 'access-list 10 permit 192.168.10.0 0.0.0.255', 'ip nat inside source list 10 interface GigabitEthernet0/1 overload', 'ip nat inside source static tcp 192.168.10.50 443 interface GigabitEthernet0/1 443', 'show ip nat translations', 'show ip nat statistics', 'clear ip nat translation *'] },
  { title: 'Guardado y diagnóstico', description: 'Verifica el estado antes de guardar cambios.', commands: ['show running-config', 'show startup-config', 'show version', 'show inventory', 'show interfaces counters errors', 'show processes cpu sorted', 'show memory statistics', 'ping 192.168.10.1 source 192.168.10.254', 'traceroute 8.8.8.8', 'copy running-config startup-config', 'reload'] },
]

export default function Commands() {
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState('')
  const normalizedQuery = query.toLowerCase().trim()

  const copyCommand = (command: string) => {
    navigator.clipboard?.writeText(command)
    setCopied(command)
    window.setTimeout(() => setCopied(''), 1400)
  }

  return (
    <NetworkShell>
      <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-700">Referencia IOS</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Comandos Cisco IOS</h1><p className="mt-3 max-w-2xl text-slate-500">Desde asignar una IP hasta levantar servicios de red. Busca por comando, servicio o proceso y copia cada línea.</p></div>
      <div className="relative mb-6 max-w-xl"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ip, dhcp, ntp, nat, ospf..." aria-label="Buscar comandos" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-cyan-200" /></div>
      <div className="grid gap-4 lg:grid-cols-2">{groups.map((group) => { const commands = group.commands.filter((command) => command.toLowerCase().includes(normalizedQuery) || group.title.toLowerCase().includes(normalizedQuery) || group.description.toLowerCase().includes(normalizedQuery)); if (!commands.length) return null; return <article key={group.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><Terminal className="mt-0.5 size-5 shrink-0 text-cyan-700" /><div><h2 className="font-semibold">{group.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p></div></div><div className="mt-5 flex flex-col gap-2">{commands.map((command) => <div key={command} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5"><code className="overflow-x-auto text-xs text-slate-800">{command}</code><button onClick={() => copyCommand(command)} aria-label={`Copiar ${command}`} className="shrink-0 text-slate-400 transition hover:text-cyan-700">{copied === command ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}</button></div>)}</div></article> })}</div>
      {copied && <p className="mt-4 text-xs text-emerald-700" role="status">Comando copiado.</p>}
    </NetworkShell>
  )
}
