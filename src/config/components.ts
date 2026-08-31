import type { Brand, Phase } from '../types'

export interface ComponentItem {
  name: string
  note?: string
  optional?: boolean
}

export interface BrandComponentConfig {
  base: ComponentItem[]
  battery: ComponentItem[]
  ccBox: ComponentItem[]
  caBox: ComponentItem[]
}

// ─── Edit component lists here as models change ────────────────────────────

export const COMPONENT_CONFIG: Record<Brand, BrandComponentConfig> = {
  huawei: {
    base: [
      {
        name: 'Inversor híbrido Huawei SUN2000',
        note: 'Modelo exato depende da potência do projeto (ex: SUN2000-6KTL-M1, 10KTL-M1…)',
      },
      {
        name: 'Smart Dongle WLAN-FE',
        note: 'Comunicação e monitorização via FusionSolar',
      },
    ],
    battery: [
      {
        name: 'Bateria Huawei LUNA2000',
        note: 'Módulos de 5 kWh expansíveis (até 30 kWh por stack)',
      },
      {
        name: 'Backup Box A1 (monofásico)',
        note: 'Usar em instalações monofásicas. Substituir por B0 se trifásico.',
        optional: true,
      },
      {
        name: 'Backup Box B0 (trifásico)',
        note: 'Usar em instalações trifásicas. Substituir por A1 se monofásico.',
        optional: true,
      },
    ],
    ccBox: [
      {
        name: 'Caixa CC (combinador/proteção DC)',
        note: 'Inclui fusíveis por string (gG/aR) e DPS DC tipo II',
      },
    ],
    caBox: [
      {
        name: 'Caixa CA (proteção/seccionamento AC)',
        note: 'Inclui disjuntor magnetotérmico e DPS AC tipo II',
      },
    ],
  },

  goodwe: {
    base: [
      {
        name: 'Inversor híbrido GoodWe ET / EH Series',
        note: 'Modelo exato depende da potência do projeto (ex: GW5000-ET, GW10K-ET…)',
      },
      {
        name: 'Smart Meter GoodWe (DTSD1352)',
        note: 'Medidor bidirecional para controlo de exportação e monitorização',
      },
    ],
    battery: [
      {
        name: 'Bateria GoodWe Lynx Home U / F',
        note: 'Módulos expansíveis. Lynx U para alta tensão (ET series), Lynx F para baixa tensão (EH series).',
      },
      {
        name: 'Backup Box BPU (trifásico)',
        note: 'Usar em instalações trifásicas com backup. Substituir por BPS se monofásico.',
        optional: true,
      },
      {
        name: 'Backup Box BPS (monofásico)',
        note: 'Usar em instalações monofásicas com backup. Substituir por BPU se trifásico.',
        optional: true,
      },
    ],
    ccBox: [
      {
        name: 'Caixa CC (combinador/proteção DC)',
        note: 'Inclui fusíveis por string e DPS DC tipo II',
      },
    ],
    caBox: [
      {
        name: 'Caixa CA (proteção/seccionamento AC)',
        note: 'Inclui disjuntor magnetotérmico e DPS AC tipo II',
      },
    ],
  },
}

// ──────────────────────────────────────────────────────────────────────────

export function getComponents(
  brand: Brand,
  phase: Phase,
  opts: { ccBox: boolean; caBox: boolean; battery: boolean },
): ComponentItem[] {
  const cfg = COMPONENT_CONFIG[brand]
  const items: ComponentItem[] = [...cfg.base]

  if (opts.battery) {
    const batteryItems = cfg.battery.filter((item) => {
      if (!item.optional) return true
      // Include only the correct backup box for the selected phase
      if (brand === 'huawei') return phase === 'mono' ? item.name.includes('A1') : item.name.includes('B0')
      if (brand === 'goodwe') return phase === 'mono' ? item.name.includes('BPS') : item.name.includes('BPU')
      return true
    })
    items.push(...batteryItems)
  }

  if (opts.ccBox) items.push(...cfg.ccBox)
  if (opts.caBox) items.push(...cfg.caBox)

  return items
}

export function schemaKey(
  brand: Brand,
  phase: Phase,
  opts: { ccBox: boolean; caBox: boolean; battery: boolean },
): string {
  return `schema_${brand}_${phase}_cc${opts.ccBox ? 1 : 0}_ca${opts.caBox ? 1 : 0}_bat${opts.battery ? 1 : 0}`
}
