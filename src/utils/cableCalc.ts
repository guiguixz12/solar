import type { CableInput, CableResult, SystemVoltage } from '../types'

// Electrical conductivity (m/Ω·mm²)
const KAPPA = { copper: 56, aluminum: 35 }

// Commercial cable sections in mm²
export const COMMERCIAL_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35]

// Ampacity table: section → max current (A) — copper / aluminum, XLPE, free air (IEC 60364)
export const AMPACITY: Record<number, { copper: number; aluminum: number | null }> = {
  1.5:  { copper: 18,  aluminum: null },
  2.5:  { copper: 26,  aluminum: null },
  4:    { copper: 34,  aluminum: null },
  6:    { copper: 44,  aluminum: null },
  10:   { copper: 60,  aluminum: 46 },
  16:   { copper: 80,  aluminum: 61 },
  25:   { copper: 101, aluminum: 78 },
  35:   { copper: 126, aluminum: 97 },
}

export function systemVoltageValue(v: SystemVoltage): number {
  return parseInt(v, 10)
}

export function calcCable(input: CableInput): CableResult {
  const { current, distance, systemVoltage, systemType, maxDropPct, material } = input
  const kappa = KAPPA[material]
  const V = systemVoltageValue(systemVoltage)
  const deltaU = (maxDropPct / 100) * V

  let sectionCalc: number
  const cosfi = systemType === 'DC' ? 1 : 0.95

  if (systemType === 'DC' || systemType === 'AC1') {
    // DC or AC single-phase: S = (2 × L × I × cosφ) / (κ × ΔU)
    sectionCalc = (2 * distance * current * cosfi) / (kappa * deltaU)
  } else {
    // AC three-phase: S = (√3 × L × I × cosφ) / (κ × ΔU)
    sectionCalc = (Math.sqrt(3) * distance * current * cosfi) / (kappa * deltaU)
  }

  // Round up to next commercial section
  const sectionCommercial =
    COMMERCIAL_SECTIONS.find((s) => s >= sectionCalc) ?? COMMERCIAL_SECTIONS[COMMERCIAL_SECTIONS.length - 1]

  // Actual voltage drop with chosen section
  let dropV: number
  if (systemType === 'DC' || systemType === 'AC1') {
    dropV = (2 * distance * current * cosfi) / (kappa * sectionCommercial)
  } else {
    dropV = (Math.sqrt(3) * distance * current * cosfi) / (kappa * sectionCommercial)
  }
  const dropPct = (dropV / V) * 100

  const ampacity = AMPACITY[sectionCommercial]
  const ampacityMax = material === 'copper' ? ampacity.copper : (ampacity.aluminum ?? 0)
  const ampacityOk = ampacityMax > 0 && current <= ampacityMax

  return {
    sectionCalc,
    sectionCommercial,
    dropPct,
    dropV,
    ampacityOk,
    ampacityMax,
  }
}

export function cableLabel(input: CableInput, result: CableResult): string {
  return `${result.sectionCommercial}mm² | ${input.current}A | ${input.distance}m`
}
