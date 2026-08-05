import BigNumber from 'bignumber.js'

const shortFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No']

export function formatNumber(value: BigNumber): string {
  if (!value.isFinite()) {
    return 'Infinity'
  }

  const absValue = value.absoluteValue()
  if (absValue.isLessThan(1000)) {
    return shortFormatter.format(value.toNumber())
  }

  const magnitude = value.e ?? 0
  const exponent = Math.floor(magnitude / 3)
  if (exponent >= SUFFIXES.length) {
    return value.toExponential(2)
  }

  const scaled = value.dividedBy(new BigNumber(1000).pow(exponent))
  return `${shortFormatter.format(scaled.toNumber())}${SUFFIXES[exponent]}`
}
