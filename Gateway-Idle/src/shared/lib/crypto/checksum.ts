export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(hash)

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
