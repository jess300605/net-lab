'use client'

import { useState } from 'react'
import { Check, Copy, Search, Terminal } from 'lucide-react'
import NetworkShell from '@/components/network-shell'

type CommandGroup = { title: string; description: string; commands: string[] }

const commandDescriptions: Record<string, string> = {
  enable: 'Entra al modo privilegiado para ejecutar comandos de administración.',
  'configure terminal': 'Abre el modo de configuración global del dispositivo.',
  'hostname R1-EDGE': 'Cambia el nombre del equipo para identificarlo en la red.',
  'interface GigabitEthernet0/0': 'Selecciona la interfaz física que se va a configurar.',
  'description Enlace hacia LAN-USUARIOS': 'Documenta el propósito o destino de la interfaz.',
  'ip address 192.168.10.1 255.255.255.0': 'Asigna una dirección IPv4 y su máscara a la interfaz.',
  'no shutdown': 'Habilita administrativamente una interfaz apagada.',
  'ip address 10.0.0.1 255.255.255.252': 'Configura una IP de enlace punto a punto con máscara /30.',
  'ip address 192.168.10.1 255.255.255.0 secondary': 'Añade una segunda red IPv4 a la misma interfaz.',
  'show ip interface brief': 'Resume estado, IP y protocolo de todas las interfaces.',
  'show interfaces GigabitEthernet0/0': 'Muestra detalle, errores, tráfico y estado de una interfaz.',
  'interface GigabitEthernet0/0.10': 'Crea o selecciona la subinterfaz asociada a la VLAN 10.',
  'encapsulation dot1Q 10': 'Etiqueta la subinterfaz con 802.1Q para transportar la VLAN 10.',
  'encapsulation dot1Q 20': 'Configura etiquetado 802.1Q para la VLAN 20.',
  'encapsulation dot1Q 99 native': 'Define la VLAN nativa sin etiqueta en el enlace trunk.',
  'show interfaces trunk': 'Valida trunks activos, VLAN nativa y VLAN permitidas.',
  'vlan 10': 'Crea la VLAN 10 en el switch.',
  'name VENTAS': 'Asigna un nombre descriptivo a la VLAN seleccionada.',
  'interface range GigabitEthernet0/1-12': 'Selecciona un rango de puertos para aplicar cambios en bloque.',
  'switchport mode access': 'Fija el puerto como acceso para conectar un dispositivo final.',
  'switchport access vlan 10': 'Asigna el puerto de acceso a la VLAN 10.',
  'spanning-tree portfast': 'Acelera la transición del puerto para equipos finales.',
  'switchport mode trunk': 'Convierte el puerto en trunk para transportar varias VLAN.',
  'switchport trunk allowed vlan 10,20,99': 'Limita las VLAN que pueden cruzar el trunk.',
  'switchport trunk native vlan 99': 'Configura la VLAN nativa del trunk.',
  'show vlan brief': 'Lista VLAN existentes y puertos asociados.',
  'show interfaces switchport': 'Muestra el modo, VLAN y negociación de cada puerto.',
  'ip route 0.0.0.0 0.0.0.0 10.0.0.2': 'Crea una ruta por defecto hacia el siguiente salto.',
  'ip route 192.168.30.0 255.255.255.0 10.0.0.2': 'Añade una ruta estática hacia una red remota.',
  'router ospf 1': 'Activa el proceso OSPF con identificador local 1.',
  'router-id 1.1.1.1': 'Fija el identificador único del router dentro de OSPF.',
  'network 10.0.0.0 0.0.0.3 area 0': 'Incluye el enlace /30 en el área backbone de OSPF.',
  'network 192.168.10.0 0.0.0.255 area 0': 'Anuncia la LAN /24 dentro del área OSPF 0.',
  'passive-interface default': 'Evita formar vecinos de routing en todas las interfaces por defecto.',
  'no passive-interface GigabitEthernet0/1': 'Permite formar vecindad dinámica en esa interfaz.',
  'show ip ospf neighbor': 'Verifica vecinos OSPF y el estado de sus adyacencias.',
  'show ip route ospf': 'Muestra rutas aprendidas mediante OSPF.',
  'router eigrp 100': 'Activa el proceso EIGRP con número de sistema autónomo 100.',
  'network 192.168.10.0 0.0.0.255': 'Selecciona interfaces y redes que participarán en el routing.',
  'ip dhcp excluded-address 192.168.10.1 192.168.10.20': 'Reserva direcciones para gateways, servidores o equipos estáticos.',
  'ip dhcp pool LAN-USUARIOS': 'Crea un ámbito DHCP para entregar configuración a clientes.',
  'network 192.168.10.0 255.255.255.0': 'Define la red que administra el pool DHCP.',
  'default-router 192.168.10.1': 'Entrega a los clientes su gateway predeterminado.',
  'dns-server 1.1.1.1 8.8.8.8': 'Entrega servidores DNS a los clientes DHCP.',
  'domain-name campus.local': 'Asigna el dominio DNS a los clientes o al dispositivo.',
  'lease 7': 'Define una concesión DHCP de siete días.',
  'ip helper-address 192.168.50.10': 'Reenvía solicitudes DHCP hacia un servidor en otra red.',
  'show ip dhcp binding': 'Lista las concesiones DHCP activas y sus clientes.',
  'show ip dhcp pool': 'Muestra uso, capacidad y estadísticas de los pools DHCP.',
  'ip domain name campus.local': 'Configura el dominio requerido para generar claves SSH.',
  'ip name-server 1.1.1.1 8.8.8.8': 'Define los resolvers DNS que usará el router.',
  'ntp server 192.168.50.20': 'Sincroniza el reloj del equipo con un servidor NTP.',
  'clock timezone UTC 0 0': 'Establece la zona horaria del dispositivo.',
  'service timestamps log datetime msec': 'Añade fecha y milisegundos a los mensajes de log.',
  'logging host 192.168.50.30': 'Envía eventos del router a un servidor Syslog remoto.',
  'logging trap warnings': 'Define el nivel de severidad de logs enviados al Syslog.',
  'ip http secure-server': 'Habilita la administración web mediante HTTPS.',
  'banner motd ^CAcceso autorizado solamente^C': 'Muestra un aviso legal al iniciar sesión.',
  'show clock': 'Consulta la fecha y hora actuales del dispositivo.',
  'show logging': 'Revisa el buffer local y los destinos de Syslog.',
  'show ntp associations': 'Verifica servidores NTP y estado de sincronización.',
  'ip nat inside': 'Marca una interfaz como lado interno de NAT.',
  'ip nat outside': 'Marca una interfaz como lado externo de NAT.',
  'access-list 10 permit 192.168.10.0 0.0.0.255': 'Selecciona las direcciones internas autorizadas para PAT.',
  'ip nat inside source list 10 interface GigabitEthernet0/1 overload': 'Traduce muchas IP privadas usando la IP pública de la interfaz.',
  'ip nat inside source static tcp 192.168.10.50 443 interface GigabitEthernet0/1 443': 'Publica un servidor HTTPS interno mediante NAT estático.',
  'show ip nat translations': 'Muestra traducciones NAT activas y sus correspondencias.',
  'show ip nat statistics': 'Resume contadores, interfaces y actividad de NAT.',
  'clear ip nat translation *': 'Elimina todas las traducciones dinámicas actuales.',
  'show running-config': 'Consulta la configuración activa en memoria.',
  'show startup-config': 'Consulta la configuración guardada para el próximo arranque.',
  'show version': 'Muestra versión IOS, uptime, memoria e información del equipo.',
  'show inventory': 'Lista hardware, módulos y números de serie detectados.',
  'show interfaces counters errors': 'Identifica errores físicos y contadores anómalos.',
  'show processes cpu sorted': 'Ordena procesos por consumo de CPU.',
  'show memory statistics': 'Muestra disponibilidad y uso de memoria.',
  'ping 192.168.10.1 source 192.168.10.254': 'Prueba conectividad indicando una IP origen concreta.',
  'traceroute 8.8.8.8': 'Descubre los saltos intermedios hacia un destino.',
  'copy running-config startup-config': 'Guarda la configuración activa en NVRAM.',
  reload: 'Reinicia el dispositivo; úsalo solo después de guardar cambios.',
}

function describeCommand(command: string) {
  if (command.startsWith('interface ')) return 'Selecciona la interfaz o subinterfaz donde se aplicarán los siguientes cambios.'
  if (command.startsWith('vlan ')) return 'Crea o selecciona una VLAN para segmentar la red local.'
  if (command.startsWith('name ')) return 'Asigna un nombre identificable al recurso configurado.'
  if (command.startsWith('ip address ')) return 'Asigna una dirección IPv4 y una máscara a la interfaz activa.'
  if (command.startsWith('network ')) return 'Incluye la red indicada en el proceso de routing dinámico.'
  if (command.startsWith('show ')) return 'Consulta el estado y los detalles operativos del recurso indicado.'
  if (command.startsWith('switchport ')) return 'Configura el modo, VLAN o parámetros de conmutación del puerto.'
  if (command.startsWith('ip nat ')) return 'Define una regla de traducción o publicación mediante NAT.'
  if (command.startsWith('logging ')) return 'Configura el envío o nivel de los registros del dispositivo.'
  if (command.startsWith('zone ')) return 'Crea una zona de seguridad para agrupar interfaces con el mismo nivel de confianza.'
  if (command.startsWith('permit ') || command.startsWith('deny ')) return 'Define una regla ACL que permite o bloquea tráfico por protocolo, origen, destino o puerto.'
  if (command.startsWith('class-map')) return 'Clasifica el tráfico que será inspeccionado por la política del firewall.'
  if (command.startsWith('policy-map')) return 'Crea una política que inspecciona, permite o descarta clases de tráfico.'
  if (command === 'inspect') return 'Inspecciona sesiones y permite el tráfico de retorno de forma stateful.'
  if (command.startsWith('drop ')) return 'Descarta tráfico que no coincide con una regla permitida y registra el evento.'
  if (command.startsWith('zone-pair')) return 'Define la dirección del tráfico entre dos zonas de seguridad.'
  if (command.startsWith('service-policy')) return 'Aplica la política de inspección al tráfico entre las zonas.'
  if (command.startsWith('ipv6 ')) return 'Configura o consulta direccionamiento y routing IPv6.'
  if (command.startsWith('standby ')) return 'Configura parámetros HSRP para ofrecer un gateway virtual redundante.'
  if (command.startsWith('switchport port-security')) return 'Limita y controla las direcciones MAC permitidas en el puerto.'
  if (command.startsWith('ip dhcp snooping')) return 'Activa protección contra servidores DHCP no autorizados.'
  if (command.startsWith('ip arp inspection')) return 'Valida respuestas ARP para reducir ataques de suplantación.'
  if (command.startsWith('no ')) return 'Desactiva o elimina la configuración indicada.'
  return 'Ejecuta este comando en el contexto indicado para aplicar el cambio de configuración.'
}

const groups: CommandGroup[] = [
  { title: 'Interfaces y direccionamiento IP', description: 'Asigna IPv4, documenta enlaces y habilita interfaces.', commands: ['enable', 'configure terminal', 'hostname R1-EDGE', 'interface GigabitEthernet0/0', 'description Enlace hacia LAN-USUARIOS', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown', 'interface GigabitEthernet0/1', 'ip address 10.0.0.1 255.255.255.252', 'ip address 192.168.10.1 255.255.255.0 secondary', 'show ip interface brief', 'show interfaces GigabitEthernet0/0'] },
  { title: 'Subinterfaces y router-on-a-stick', description: 'Separa varias VLAN sobre un enlace físico al switch.', commands: ['interface GigabitEthernet0/0.10', 'encapsulation dot1Q 10', 'ip address 192.168.10.1 255.255.255.0', 'interface GigabitEthernet0/0.20', 'encapsulation dot1Q 20', 'ip address 192.168.20.1 255.255.255.0', 'interface GigabitEthernet0/0.99', 'encapsulation dot1Q 99 native', 'ip address 192.168.99.1 255.255.255.0', 'show interfaces trunk'] },
  { title: 'VLAN, puertos y trunk', description: 'Crea segmentos, asigna puertos y valida el transporte.', commands: ['vlan 10', 'name VENTAS', 'vlan 20', 'name SOPORTE', 'vlan 99', 'name MANAGEMENT', 'interface range GigabitEthernet0/1-12', 'switchport mode access', 'switchport access vlan 10', 'spanning-tree portfast', 'interface GigabitEthernet0/24', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20,99', 'switchport trunk native vlan 99', 'show vlan brief', 'show interfaces switchport'] },
  { title: 'Rutas estáticas y routing dinámico', description: 'Conecta redes remotas y anuncia prefijos.', commands: ['ip route 0.0.0.0 0.0.0.0 10.0.0.2', 'ip route 192.168.30.0 255.255.255.0 10.0.0.2', 'router ospf 1', 'router-id 1.1.1.1', 'network 10.0.0.0 0.0.0.3 area 0', 'network 192.168.10.0 0.0.0.255 area 0', 'passive-interface default', 'no passive-interface GigabitEthernet0/1', 'show ip ospf neighbor', 'show ip route ospf', 'router eigrp 100', 'network 192.168.10.0 0.0.0.255'] },
  { title: 'DHCP y relay', description: 'Entrega direcciones automáticamente o reenvía solicitudes.', commands: ['ip dhcp excluded-address 192.168.10.1 192.168.10.20', 'ip dhcp pool LAN-USUARIOS', 'network 192.168.10.0 255.255.255.0', 'default-router 192.168.10.1', 'dns-server 1.1.1.1 8.8.8.8', 'domain-name campus.local', 'lease 7', 'interface Vlan10', 'ip helper-address 192.168.50.10', 'show ip dhcp binding', 'show ip dhcp pool'] },
  { title: 'Servicios en router', description: 'Configura DNS, NTP, Syslog, banner y acceso de administración.', commands: ['ip domain name campus.local', 'ip name-server 1.1.1.1 8.8.8.8', 'ntp server 192.168.50.20', 'clock timezone UTC 0 0', 'service timestamps log datetime msec', 'logging host 192.168.50.30', 'logging trap warnings', 'ip http secure-server', 'banner motd ^CAcceso autorizado solamente^C', 'show clock', 'show logging', 'show ntp associations'] },
  { title: 'NAT, PAT y publicación', description: 'Traduce direcciones privadas y publica un servicio interno.', commands: ['interface GigabitEthernet0/0', 'ip nat inside', 'interface GigabitEthernet0/1', 'ip nat outside', 'access-list 10 permit 192.168.10.0 0.0.0.255', 'ip nat inside source list 10 interface GigabitEthernet0/1 overload', 'ip nat inside source static tcp 192.168.10.50 443 interface GigabitEthernet0/1 443', 'show ip nat translations', 'show ip nat statistics', 'clear ip nat translation *'] },
  { title: 'Firewall ZBF y reglas de inspección', description: 'Construye zonas, clasificación, políticas stateful y reglas de control.', commands: ['zone security INSIDE', 'zone security OUTSIDE', 'ip access-list extended OUTSIDE-WEB', 'permit tcp any any eq 443', 'permit udp any any eq 53', 'class-map type inspect match-any WEB-DNS', 'match access-group name OUTSIDE-WEB', 'policy-map type inspect INSIDE-OUTSIDE', 'class type inspect WEB-DNS', 'inspect', 'class class-default', 'drop log', 'zone-pair security IN-OUT source INSIDE destination OUTSIDE', 'service-policy type inspect INSIDE-OUTSIDE', 'show policy-map type inspect zone-pair sessions', 'show policy-map type inspect zone-pair statistics', 'show zone-pair security', 'clear zone-pair counters'] },
  { title: 'IPv6 y gateway redundante', description: 'Configura direccionamiento IPv6, rutas y HSRP para continuidad.', commands: ['ipv6 unicast-routing', 'ipv6 address 2001:db8:10::1/64', 'ipv6 enable', 'ipv6 route ::/0 2001:db8:ff::1', 'show ipv6 interface brief', 'show ipv6 route', 'standby 10 ip 192.168.10.254', 'standby 10 priority 110', 'standby 10 preempt', 'show standby brief'] },
  { title: 'Seguridad de Capa 2', description: 'Protege puertos, STP y asignaciones contra equipos no autorizados.', commands: ['switchport port-security', 'switchport port-security maximum 2', 'switchport port-security mac-address sticky', 'switchport port-security violation restrict', 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'ip dhcp snooping', 'ip dhcp snooping vlan 10,20,30', 'ip arp inspection vlan 10,20,30', 'show port-security interface GigabitEthernet0/1', 'show spanning-tree inconsistentports'] },
  { title: 'Alta disponibilidad y routing', description: 'Comandos para HSRP, EtherChannel, STP y OSPF multiárea.', commands: ['channel-group 1 mode active', 'interface Port-channel1', 'switchport mode trunk', 'spanning-tree mode rapid-pvst', 'spanning-tree vlan 10 root primary', 'standby 10 ip 192.168.10.254', 'standby 10 priority 110', 'standby 10 preempt', 'router ospf 10', 'area 0 range 10.0.0.0 255.255.0.0', 'area 10 range 10.10.0.0 255.255.0.0', 'show etherchannel summary', 'show spanning-tree root', 'show standby brief', 'show ip ospf database'] },
  { title: 'Observabilidad y AAA', description: 'Centraliza logs, métricas y acceso administrativo.', commands: ['snmp-server community MONITOR ro', 'snmp-server host 192.168.100.30 version 2c MONITOR', 'logging host 192.168.100.40', 'logging trap warnings', 'ntp authenticate', 'ntp server 192.168.100.20', 'aaa new-model', 'aaa authentication login default group tacacs+ local', 'show snmp', 'show logging', 'show ntp associations', 'show aaa servers'] },
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
      <div className="grid gap-4 lg:grid-cols-2">{groups.map((group) => { const commands = group.commands.filter((command) => command.toLowerCase().includes(normalizedQuery) || group.title.toLowerCase().includes(normalizedQuery) || group.description.toLowerCase().includes(normalizedQuery)); if (!commands.length) return null; return <article key={group.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><Terminal className="mt-0.5 size-5 shrink-0 text-cyan-700" /><div><h2 className="font-semibold">{group.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p></div></div><div className="mt-5 flex flex-col gap-2">{commands.map((command) => <div key={command} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5"><div className="min-w-0"><code className="block overflow-x-auto text-xs font-semibold text-slate-800">{command}</code><p className="mt-1 text-[11px] leading-4 text-slate-500">{commandDescriptions[command] ?? describeCommand(command)}</p></div><button onClick={() => copyCommand(command)} aria-label={`Copiar ${command}`} title="Copiar comando" className="shrink-0 text-slate-400 transition hover:text-cyan-700">{copied === command ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}</button></div>)}</div></article> })}</div>
      {copied && <p className="mt-4 text-xs text-emerald-700" role="status">Comando copiado.</p>}
    </NetworkShell>
  )
}
