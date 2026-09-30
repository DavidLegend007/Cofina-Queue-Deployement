const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generatePdf() {
  const mdContent = fs.readFileSync(path.join(__dirname, 'planning_deploiement_cofina.md'), 'utf8');
  
  // Basic markdown to html
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Planning Cofina</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; }
  h1 { color: #C8102E; border-bottom: 2px solid #C8102E; padding-bottom: 10px; }
  h2 { color: #C8102E; margin-top: 30px; }
  ul { margin-bottom: 20px; }
  li { margin-bottom: 8px; }
  strong { color: #000; }
</style>
</head>
<body>
  ${mdContent
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^\* \*\*(.*)\*\*/gim, '<ul><li><strong>$1</strong>')
    .replace(/^  \* (.*)/gim, '<br> - $1')
    .replace(/\n\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/---/g, '<hr>')}
</body>
</html>`;

  const htmlOut = path.join(__dirname, 'planning.html');
  fs.writeFileSync(htmlOut, html);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file://${htmlOut}`, { waitUntil: 'networkidle0' });
  
  const pdfOut = path.join(__dirname, 'planning_deploiement_cofina.pdf');
  await page.pdf({ path: pdfOut, format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' } });
  
  await browser.close();
  console.log('PDF Generated');
}

generatePdf();
