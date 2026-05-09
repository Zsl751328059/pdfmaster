const https = require('https');

const key = '81d70531f9594c8a9e33656f61052959';
const domain = 'https://pdfeasz.com'; // 换成你的域名，不带 / 结尾
const keyLocation = `${domain}/${key}.txt`;

const urls = [
  `${domain}/index.html`,
  `${domain}/contact.html`,
  `${domain}/cookie.html`,
  `${domain}/feedback.html`,
  `${domain}/image-to-pdf.html`,
  `${domain}/pdf-compressor.html`,
  `${domain}/pdf-margin.html`,
  `${domain}/pdf-merger.html`,
  `${domain}/pdf-page-extractor.html`,
  `${domain}/pdf-page-number.html`,
  `${domain}/pdf-page-remover.html`,
  `${domain}/pdf-page-reorder.html`,
  `${domain}/pdf-rotator.html`,
  `${domain}/pdf-splitter.html`,
  `${domain}/pdf-text-extractor.html`,
  `${domain}/pdf-to-image.html`,
  `${domain}/pdf-watermark.html`,
  `${domain}/privacy.html`,
  `${domain}/terms.html`
];

const data = JSON.stringify({
  host: new URL(domain).hostname,
  key,
  keyLocation,
  urlList: urls
});

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();