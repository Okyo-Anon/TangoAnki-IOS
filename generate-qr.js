const QRCode = require('qrcode');

async function generateQR() {
  const url = 'exp://10.1.52.140:8081';

  try {
    await QRCode.toFile('./qrcode.png', url, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('QR code saved to qrcode.png');
    console.log('URL:', url);
  } catch (err) {
    console.error(err);
  }
}

generateQR();
