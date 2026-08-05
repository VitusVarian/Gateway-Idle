import { describe, expect, it } from 'vitest'
import { encodeSaveBundle, decodeAndVerifySaveBundle } from './saveCodec'
import { createDefaultSaveV1 } from './saveSchema'

describe('saveCodec', () => {
  it('round-trips a valid save payload', async () => {
    const payload = createDefaultSaveV1(123456789, '0.1.0')

    const encoded = await encodeSaveBundle(payload)
    const decoded = await decodeAndVerifySaveBundle(encoded)

    expect(decoded).toEqual(payload)
  })

  it('accepts whitespace-wrapped base64 input from pasted save strings', async () => {
    const payload = createDefaultSaveV1(123456789, '0.1.0')
    const encoded = await encodeSaveBundle(payload)
    const padded = `\n  ${encoded.slice(0, 20)}\n${encoded.slice(20)}\n  `

    const decoded = await decodeAndVerifySaveBundle(padded)

    expect(decoded.meta.createdAt).toBe(payload.meta.createdAt)
    expect(decoded.resources.monsterSoul).toBe(payload.resources.monsterSoul)
  })

  it('rejects tampered bundles', async () => {
    const payload = createDefaultSaveV1(123456789, '0.1.0')
    const encoded = await encodeSaveBundle(payload)
    const tampered = `${encoded.slice(0, -2)}aa`

    await expect(decodeAndVerifySaveBundle(tampered)).rejects.toThrow()
  })
})
