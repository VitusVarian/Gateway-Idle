import { sha256Hex } from '../../shared/lib/crypto/checksum'
import type { SaveSchemaV1 } from '../../types/game'

const BUNDLE_VERSION = 1 as const
const MAX_BUNDLE_INPUT_CHARS = 1_000_000

interface SaveBundleV1 {
  version: 1
  schemaVersion: 1
  issuedAt: number
  salt: string
  payload: SaveSchemaV1
  checksum: string
}

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    )
    return `{${entries
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalize(child)}`)
      .join(',')}}`
  }

  return JSON.stringify(value)
}

function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

function decodeBase64(input: string): string {
  const binary = atob(input)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function normalizeBundleInput(input: string): string {
  return input.trim().replace(/\s+/g, '')
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function encodeSaveBundle(payload: SaveSchemaV1): Promise<string> {
  const issuedAt = Date.now()
  const salt = randomSalt()

  const checksumInput = canonicalize({
    version: BUNDLE_VERSION,
    schemaVersion: payload.schemaVersion,
    issuedAt,
    salt,
    payload,
  })
  const checksum = await sha256Hex(checksumInput)

  const bundle: SaveBundleV1 = {
    version: BUNDLE_VERSION,
    schemaVersion: payload.schemaVersion,
    issuedAt,
    salt,
    payload,
    checksum,
  }

  return encodeBase64(JSON.stringify(bundle))
}

export async function decodeAndVerifySaveBundle(input: string): Promise<SaveSchemaV1> {
  if (typeof input !== 'string') {
    throw new Error('Invalid save bundle encoding.')
  }

  const normalizedInput = normalizeBundleInput(input)
  if (!normalizedInput) {
    throw new Error('Invalid save bundle encoding.')
  }

  if (normalizedInput.length > MAX_BUNDLE_INPUT_CHARS) {
    throw new Error('Save bundle is too large.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(decodeBase64(normalizedInput))
  } catch {
    throw new Error('Invalid save bundle encoding.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Malformed save bundle payload.')
  }

  const bundle = parsed as Partial<SaveBundleV1>
  if (bundle.version !== 1 || bundle.schemaVersion !== 1) {
    throw new Error('Unsupported save bundle version.')
  }

  if (typeof bundle.issuedAt !== 'number' || typeof bundle.salt !== 'string' || !bundle.payload) {
    throw new Error('Malformed save bundle metadata.')
  }

  if (typeof bundle.checksum !== 'string') {
    throw new Error('Missing save bundle checksum.')
  }

  const checksumInput = canonicalize({
    version: bundle.version,
    schemaVersion: bundle.schemaVersion,
    issuedAt: bundle.issuedAt,
    salt: bundle.salt,
    payload: bundle.payload,
  })
  const expectedChecksum = await sha256Hex(checksumInput)
  if (expectedChecksum !== bundle.checksum) {
    throw new Error('Save checksum mismatch.')
  }

  return bundle.payload as SaveSchemaV1
}
