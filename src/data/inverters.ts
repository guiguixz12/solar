// ─── EDIT THIS FILE to update inverter specs after checking official manuals ───
//
// iMaxMppt: null  → value not confirmed, shown as "Conferir no manual"
// manualUrl: ''   → no PDF linked yet; set to the direct PDF URL from the brand website
// notes[]         → list of values that need manual confirmation before use in field
//
// Huawei manuals: https://solar.huawei.com/en/download (filter by product model)
// GoodWe manuals: https://en.goodwe.com/service/download
// ─────────────────────────────────────────────────────────────────────────────

import type { Brand } from '../types'

export interface InverterSpec {
  id: string
  brand: Brand
  model: string
  powerKW: number
  phaseType: 'mono' | 'tri'
  numMppt: number
  vMaxDC: number              // V — tensão máxima DC na entrada
  iMaxMppt: number | null     // A — corrente máxima por entrada MPPT (null = conferir)
  maxStringsPerMppt: number | null
  compatibleBatteries: string[]
  compatibleBackupBox: string[]
  manualUrl: string           // URL directa ao PDF oficial (deixar '' se não tiver)
  notes: string[]             // itens a confirmar no manual antes de usar em campo
}

// ── HUAWEI ────────────────────────────────────────────────────────────────────

const HUAWEI_BATTERIES = [
  'LUNA2000-5-E0 (5 kWh, módulo individual)',
  'LUNA2000-(5-30)-S0 (rack expansível: 1-3 módulos × 5 kWh)',
]
const HUAWEI_BACKUP_MONO = ['Backup Box A1 (monofásico) — ou B0 para instalações trifásicas']

const huawei: InverterSpec[] = [
  {
    id: 'sun2000-2ktl-l1',
    brand: 'huawei',
    model: 'SUN2000-2KTL-L1',
    powerKW: 2,
    phaseType: 'mono',
    numMppt: 1,
    vMaxDC: 600,
    iMaxMppt: 11,
    maxStringsPerMppt: 2,
    compatibleBatteries: HUAWEI_BATTERIES,
    compatibleBackupBox: HUAWEI_BACKUP_MONO,
    manualUrl: '',
    notes: [
      'Confirmar iMaxMppt (11 A) e maxStringsPerMppt no datasheet oficial',
      'Confirmar vMaxDC — alguns mercados admitem 550 V',
    ],
  },
  {
    id: 'sun2000-3ktl-l1',
    brand: 'huawei',
    model: 'SUN2000-3KTL-L1',
    powerKW: 3,
    phaseType: 'mono',
    numMppt: 1,
    vMaxDC: 600,
    iMaxMppt: 11,
    maxStringsPerMppt: 2,
    compatibleBatteries: HUAWEI_BATTERIES,
    compatibleBackupBox: HUAWEI_BACKUP_MONO,
    manualUrl: '',
    notes: ['Confirmar iMaxMppt (11 A) no datasheet oficial'],
  },
  {
    id: 'sun2000-4ktl-l1',
    brand: 'huawei',
    model: 'SUN2000-4KTL-L1',
    powerKW: 4,
    phaseType: 'mono',
    numMppt: 2,
    vMaxDC: 600,
    iMaxMppt: 11,
    maxStringsPerMppt: 1,
    compatibleBatteries: HUAWEI_BATTERIES,
    compatibleBackupBox: HUAWEI_BACKUP_MONO,
    manualUrl: '',
    notes: ['Confirmar iMaxMppt e maxStringsPerMppt por MPPT no datasheet'],
  },
  {
    id: 'sun2000-5ktl-l1',
    brand: 'huawei',
    model: 'SUN2000-5KTL-L1',
    powerKW: 5,
    phaseType: 'mono',
    numMppt: 2,
    vMaxDC: 600,
    iMaxMppt: 11,
    maxStringsPerMppt: 1,
    compatibleBatteries: HUAWEI_BATTERIES,
    compatibleBackupBox: HUAWEI_BACKUP_MONO,
    manualUrl: '',
    notes: ['Confirmar iMaxMppt e maxStringsPerMppt por MPPT no datasheet'],
  },
  {
    id: 'sun2000-6ktl-l1',
    brand: 'huawei',
    model: 'SUN2000-6KTL-L1',
    powerKW: 6,
    phaseType: 'mono',
    numMppt: 2,
    vMaxDC: 600,
    iMaxMppt: 11,
    maxStringsPerMppt: 2,
    compatibleBatteries: HUAWEI_BATTERIES,
    compatibleBackupBox: HUAWEI_BACKUP_MONO,
    manualUrl: '',
    notes: ['Confirmar iMaxMppt (11 A) e maxStringsPerMppt por MPPT no datasheet'],
  },
]

// ── GOODWE ────────────────────────────────────────────────────────────────────

const GOODWE_BATTERIES_ET = [
  'Lynx Home U (alta tensão — compatível com série ET)',
  'Lynx Home A (conferir compatibilidade por modelo)',
]
const GOODWE_BATTERIES_EH = [
  'Lynx Home F (baixa tensão — compatível com série EH/ES)',
  'Lynx Home A (conferir compatibilidade por modelo)',
]
const GOODWE_BACKUP_TRI  = ['Backup Box BPU (trifásico)']
const GOODWE_BACKUP_MONO = ['Backup Box BPS (monofásico)']

const goodwe: InverterSpec[] = [
  {
    id: 'gw5000-et',
    brand: 'goodwe',
    model: 'GW5000-ET',
    powerKW: 5,
    phaseType: 'tri',
    numMppt: 2,
    vMaxDC: 1000,
    iMaxMppt: 15,
    maxStringsPerMppt: 2,
    compatibleBatteries: GOODWE_BATTERIES_ET,
    compatibleBackupBox: GOODWE_BACKUP_TRI,
    manualUrl: '',
    notes: ['Confirmar iMaxMppt (15 A) e maxStringsPerMppt no datasheet série ET'],
  },
  {
    id: 'gw6000-et',
    brand: 'goodwe',
    model: 'GW6000-ET',
    powerKW: 6,
    phaseType: 'tri',
    numMppt: 2,
    vMaxDC: 1000,
    iMaxMppt: 15,
    maxStringsPerMppt: 2,
    compatibleBatteries: GOODWE_BATTERIES_ET,
    compatibleBackupBox: GOODWE_BACKUP_TRI,
    manualUrl: '',
    notes: ['Confirmar iMaxMppt e maxStringsPerMppt no datasheet série ET'],
  },
  {
    id: 'gw8000-et',
    brand: 'goodwe',
    model: 'GW8000-ET',
    powerKW: 8,
    phaseType: 'tri',
    numMppt: 2,
    vMaxDC: 1000,
    iMaxMppt: 15,
    maxStringsPerMppt: 2,
    compatibleBatteries: GOODWE_BATTERIES_ET,
    compatibleBackupBox: GOODWE_BACKUP_TRI,
    manualUrl: '',
    notes: ['Confirmar iMaxMppt e maxStringsPerMppt no datasheet série ET'],
  },
  {
    id: 'gw10k-et',
    brand: 'goodwe',
    model: 'GW10K-ET',
    powerKW: 10,
    phaseType: 'tri',
    numMppt: 2,
    vMaxDC: 1000,
    iMaxMppt: 15,
    maxStringsPerMppt: 2,
    compatibleBatteries: GOODWE_BATTERIES_ET,
    compatibleBackupBox: GOODWE_BACKUP_TRI,
    manualUrl: '',
    notes: ['Confirmar iMaxMppt e maxStringsPerMppt no datasheet série ET'],
  },
  {
    id: 'gw15k-et',
    brand: 'goodwe',
    model: 'GW15K-ET',
    powerKW: 15,
    phaseType: 'tri',
    numMppt: 3,
    vMaxDC: 1000,
    iMaxMppt: null,
    maxStringsPerMppt: null,
    compatibleBatteries: GOODWE_BATTERIES_ET,
    compatibleBackupBox: GOODWE_BACKUP_TRI,
    manualUrl: '',
    notes: [
      'Confirmar nº de MPPTs, iMaxMppt e maxStringsPerMppt no datasheet série ET',
      'Confirmar vMaxDC (pode ser 1000 V ou 1100 V)',
    ],
  },
  {
    id: 'gw20k-et',
    brand: 'goodwe',
    model: 'GW20K-ET',
    powerKW: 20,
    phaseType: 'tri',
    numMppt: 3,
    vMaxDC: 1000,
    iMaxMppt: null,
    maxStringsPerMppt: null,
    compatibleBatteries: GOODWE_BATTERIES_ET,
    compatibleBackupBox: GOODWE_BACKUP_TRI,
    manualUrl: '',
    notes: ['Confirmar nº de MPPTs, iMaxMppt e maxStringsPerMppt no datasheet série ET'],
  },
  {
    id: 'gw25k-et',
    brand: 'goodwe',
    model: 'GW25K-ET',
    powerKW: 25,
    phaseType: 'tri',
    numMppt: 3,
    vMaxDC: 1000,
    iMaxMppt: null,
    maxStringsPerMppt: null,
    compatibleBatteries: GOODWE_BATTERIES_ET,
    compatibleBackupBox: GOODWE_BACKUP_TRI,
    manualUrl: '',
    notes: ['Confirmar nº de MPPTs, iMaxMppt e maxStringsPerMppt no datasheet série ET'],
  },
  {
    id: 'gw30k-et',
    brand: 'goodwe',
    model: 'GW30K-ET',
    powerKW: 30,
    phaseType: 'tri',
    numMppt: 4,
    vMaxDC: 1000,
    iMaxMppt: null,
    maxStringsPerMppt: null,
    compatibleBatteries: GOODWE_BATTERIES_ET,
    compatibleBackupBox: GOODWE_BACKUP_TRI,
    manualUrl: '',
    notes: ['Confirmar nº de MPPTs, iMaxMppt e maxStringsPerMppt no datasheet série ET'],
  },
  // GoodWe EH — monofásico híbrido (baixa tensão)
  {
    id: 'gw3648-eh',
    brand: 'goodwe',
    model: 'GW3648-EH',
    powerKW: 3.6,
    phaseType: 'mono',
    numMppt: 2,
    vMaxDC: 550,
    iMaxMppt: null,
    maxStringsPerMppt: null,
    compatibleBatteries: GOODWE_BATTERIES_EH,
    compatibleBackupBox: GOODWE_BACKUP_MONO,
    manualUrl: '',
    notes: [
      'Confirmar vMaxDC, iMaxMppt e maxStringsPerMppt no datasheet série EH',
      'Confirmar bateria compatível (Lynx F ou outra)',
    ],
  },
  {
    id: 'gw5048-eh',
    brand: 'goodwe',
    model: 'GW5048-EH',
    powerKW: 5,
    phaseType: 'mono',
    numMppt: 2,
    vMaxDC: 550,
    iMaxMppt: null,
    maxStringsPerMppt: null,
    compatibleBatteries: GOODWE_BATTERIES_EH,
    compatibleBackupBox: GOODWE_BACKUP_MONO,
    manualUrl: '',
    notes: [
      'Confirmar vMaxDC, iMaxMppt e maxStringsPerMppt no datasheet série EH',
    ],
  },
]

// ── Exports ───────────────────────────────────────────────────────────────────

export const INVERTERS: InverterSpec[] = [...huawei, ...goodwe]

export function getInvertersByBrand(brand: Brand): InverterSpec[] {
  return INVERTERS.filter((i) => i.brand === brand)
}

export function getInverterById(id: string): InverterSpec | undefined {
  return INVERTERS.find((i) => i.id === id)
}
