import type { StringInput, StringResult } from '../types'

export function calcString(input: StringInput): StringResult {
  const { voc, coefTemp, isc, tempMin, vMaxInverter, iMaxMppt, numModules } = input

  const vocCorrected = voc * (1 + (coefTemp / 100) * (tempMin - 25))
  const stringVoltage = vocCorrected * numModules

  const voltageOk = stringVoltage <= vMaxInverter
  const voltageMarginPct = ((vMaxInverter - stringVoltage) / vMaxInverter) * 100

  const currentOk = isc <= iMaxMppt
  const currentMarginPct = ((iMaxMppt - isc) / iMaxMppt) * 100

  // Max modules that still fit within inverter voltage
  const numModulesMax = Math.floor(vMaxInverter / vocCorrected)

  return {
    vocCorrected,
    stringVoltage,
    voltageOk,
    voltageMarginPct,
    currentOk,
    currentMarginPct,
    ok: voltageOk && currentOk,
    numModulesMax,
  }
}

export function stringLabel(input: StringInput, result: StringResult): string {
  return `${input.numModules}s | Voc=${input.voc}V | ${result.ok ? 'OK' : 'FALHA'}`
}
