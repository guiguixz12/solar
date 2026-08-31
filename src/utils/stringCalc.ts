import type { StringInput, StringResult } from '../types'

export function calcString(input: StringInput): StringResult {
  const { voc, coefTemp, isc, tempMin, vMaxInverter, iMaxMppt, numModules, numStrings } = input

  const vocCorrected = voc * (1 + (coefTemp / 100) * (tempMin - 25))
  const stringVoltage = vocCorrected * numModules

  const voltageOk = stringVoltage <= vMaxInverter
  const voltageMarginPct = ((vMaxInverter - stringVoltage) / vMaxInverter) * 100

  const totalMpptCurrent = isc * numStrings
  const currentOk = totalMpptCurrent <= iMaxMppt
  const currentMarginPct = ((iMaxMppt - totalMpptCurrent) / iMaxMppt) * 100

  const numModulesMax = Math.floor(vMaxInverter / vocCorrected)

  return {
    vocCorrected,
    stringVoltage,
    voltageOk,
    voltageMarginPct,
    totalMpptCurrent,
    currentOk,
    currentMarginPct,
    ok: voltageOk && currentOk,
    numModulesMax,
  }
}

export function stringLabel(input: StringInput, result: StringResult): string {
  return `${input.numModules}s×${input.numStrings}p | Voc=${input.voc}V | ${result.ok ? 'OK' : 'FALHA'}`
}
