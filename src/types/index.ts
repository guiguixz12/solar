export type CalcType = 'string' | 'cable'

export interface StringInput {
  voc: number
  coefTemp: number
  isc: number
  tempMin: number
  vMaxInverter: number
  iMaxMppt: number
  numModules: number
}

export interface StringResult {
  vocCorrected: number
  stringVoltage: number
  voltageOk: boolean
  voltageMarginPct: number
  currentOk: boolean
  currentMarginPct: number
  ok: boolean
  numModulesMax: number
}

export type SystemVoltage = '12' | '24' | '48' | '230' | '400'
export type ConductorMaterial = 'copper' | 'aluminum'
export type SystemType = 'DC' | 'AC1' | 'AC3'

export interface CableInput {
  current: number
  distance: number
  systemVoltage: SystemVoltage
  systemType: SystemType
  maxDropPct: number
  material: ConductorMaterial
}

export interface CableResult {
  sectionCalc: number
  sectionCommercial: number
  dropPct: number
  dropV: number
  ampacityOk: boolean
  ampacityMax: number
}

export interface HistoryEntry {
  id: string
  type: CalcType
  timestamp: number
  label: string
  input: StringInput | CableInput
  result: StringResult | CableResult
}
