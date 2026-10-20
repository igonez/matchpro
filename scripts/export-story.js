const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BROWSER_PATH = fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')
  ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Story Abertura Beta');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlFile = path.join(__dirname, '..', 'public', 'social', 'story-abertura-beta.html');
  const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');

  console.log('Iniciando navegador para renderizar Story em 1080x1920...');
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  // Definir viewport exato de 1080x1920
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  const storyElement = await page.$('.story-canvas');
  const outputPath = path.join(outputDir, 'story-abertura-beta.jpg');

  await storyElement.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 98
  });

  console.log(`✓ Gerado com sucesso: ${outputPath}`);

  const txtInstructions = `=== STORY OFICIAL: ABERTURA DO BETA TESTE ARENAFITPRO ===

Dimensões: 1080 x 1920 px (Proporção oficial 9:16 do Instagram Stories)
Cores: Luxury Monochromatic Titanium (OLED Black, Titânio, Branco Metálico)

COMO POSTAR NO SEU INSTAGRAM:
1. Abra o Instagram e selecione o arquivo 'story-abertura-beta.jpg'.
2. Toque no ícone de Figurinhas/Stickers no topo.
3. Escolha a figurinha "LINK".
4. Insira o link da página do beta ou grupo de WhatsApp:
   Link sugerido: https://arenafitpro.app/beta
   Texto da figurinha: QUERO UMA VAGA NO BETA
5. Posicione a figurinha exatamente dentro da caixa tracejada:
   "Toque na Figurinha de Link Abaixo".
6. Se quiser reforçar, adicione uma caixa de perguntas ou enquete: "Você roda desafios hoje?".

Pronto! O design respeita 100% as áreas seguras (safe zones) do Instagram para que seu nome de usuário e a barra de envio de direct não fiquem por cima do texto.
`;

  fs.writeFileSync(path.join(outputDir, 'instrucoes.txt'), txtInstructions, 'utf-8');
  console.log('✓ Instruções salvas em instrucoes.txt');

  await browser.close();
}

run().catch(err => {
  console.error('Erro ao gerar Story:', err);
  process.exit(1);
});
