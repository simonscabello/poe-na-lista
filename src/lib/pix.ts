function emvField(id: string, value: string): string {
  const length = String(value.length).padStart(2, "0")
  return `${id}${length}${value}`
}

function truncate(value: string, max: number): string {
  return value.slice(0, max)
}

/** CRC16-CCITT (polinômio 0x1021, init 0xFFFF) exigido pelo BR Code do PIX. */
function crc16Ccitt(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
        continue
      }
      crc = (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

export function buildPixCopiaECola(input: {
  key: string
  merchantName: string
  merchantCity: string
  description?: string
}): string {
  const merchantAccount = emvField(
    "26",
    [
      emvField("00", "br.gov.bcb.pix"),
      emvField("01", input.key),
      input.description ? emvField("02", truncate(input.description, 72)) : "",
    ].join(""),
  )

  const payloadWithoutCrc =
    emvField("00", "01") +
    merchantAccount +
    emvField("52", "0000") +
    emvField("53", "986") +
    emvField("58", "BR") +
    emvField("59", truncate(input.merchantName, 25)) +
    emvField("60", truncate(input.merchantCity, 15)) +
    emvField("62", emvField("05", "***")) +
    "6304"

  return payloadWithoutCrc + crc16Ccitt(payloadWithoutCrc)
}

export const DONATION_PIX_KEY = "3d43655c-6fd3-456d-aded-5e05d7bf15ac"

export const DONATION_PIX_PAYLOAD = buildPixCopiaECola({
  key: DONATION_PIX_KEY,
  merchantName: "Poe na Lista",
  merchantCity: "SAO PAULO",
  description: "Doacao Poe na Lista",
})
