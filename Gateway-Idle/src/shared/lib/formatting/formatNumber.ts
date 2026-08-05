import BigNumber from 'bignumber.js'

const shortFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No']

export function formatNumber(value: BigNumber): string {
  if (value.isNaN()) {
    return '0'
  }

  if (!value.isFinite()) {
    return 'Infinity'
  }

  if (value.isZero()) {
    return '0'
  }

  const sign = value.isNegative() ? '-' : ''
  const absValue = value.absoluteValue()

  if (absValue.isLessThan(1)) {
    return `${sign}${absValue.toPrecision(3)}`
  }

  if (absValue.isLessThan(1000)) {
    return `${sign}${shortFormatter.format(absValue.toNumber())}`
  }

  const magnitude = absValue.e ?? 0
  const exponent = Math.floor(magnitude / 3)
  if (exponent >= SUFFIXES.length) {
    return `${sign}${absValue.toExponential(2)}`
  }

  const scaled = absValue.dividedBy(new BigNumber(1000).pow(exponent))
  const scaledRounded = scaled.toNumber()
  if (scaledRounded >= 999.995 && exponent + 1 < SUFFIXES.length) {
    return `${sign}1${SUFFIXES[exponent + 1]}`
  }

  return `${sign}${shortFormatter.format(scaledRounded)}${SUFFIXES[exponent]}`
}
