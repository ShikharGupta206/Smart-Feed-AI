import QRCode from 'qrcode'

/**
 * Generates a traceability QR code Data URL containing sample test verification data.
 */
export async function generateTestQRCode(testId, extraData = {}) {
  const payload = JSON.stringify({
    testId,
    app: 'SmartFeed AI',
    verificationUrl: `https://smartfeed.ai/verify/${testId}`,
    issuedAt: new Date().toISOString(),
    ...extraData
  })

  const imageDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    color: {
      dark: '#1a4329',
      light: '#ffffff'
    },
    width: 256
  })

  return {
    testId,
    data: payload,
    imageDataUrl
  }
}
