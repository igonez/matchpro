const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BROWSER_PATH = fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')
  ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'App Screens Realistas');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlFile = path.join(__dirname, '..', 'public', 'social', 'renders', 'render-leaderboard.html');
  const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');

  console.log('Iniciando captura do Leaderboard em Alta Resolução (1080x1920)...');
  const tempUserDataDir = path.join(__dirname, '..', '.temp-pup-' + Date.now());
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    userDataDir: tempUserDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 4200, deviceScaleFactor: 1 });

  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  // Esperar o iframe carregar
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 1. Capturar Tela Mobile Pura (1080x1920)
  const mobileElement = await page.$('#mobile-screen');
  if (mobileElement) {
    const mobilePath = path.join(outputDir, 'tela-leaderboard-mobile.jpg');
    await mobileElement.screenshot({
      path: mobilePath,
      type: 'jpeg',
      quality: 98
    });
    console.log(`✓ 1. Tela Mobile Pura gerada: ${mobilePath}`);
  }

  // 2. Capturar Mockup 3D Titanium (1080x1920)
  const mockupElement = await page.$('#mockup-canvas');
  if (mockupElement) {
    const mockupPath = path.join(outputDir, 'mockup-leaderboard-titanium.jpg');
    await mockupElement.screenshot({
      path: mockupPath,
      type: 'jpeg',
      quality: 98
    });
    console.log(`✓ 2. Mockup 3D Titanium gerado: ${mockupPath}`);
  }

  await browser.close();
  console.log('✅ Ambas as imagens foram geradas com sucesso!');
}

run().catch(console.error);
