const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const POSTS = [
  {
    name: 'Story Abertura Beta',
    htmlFile: path.join(__dirname, '..', 'public', 'social', 'story-abertura-beta.html'),
    isStory: true,
    caption: `=== STORY OFICIAL: ABERTURA DO BETA TESTE ARENAFITPRO ===

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

Pronto! O design respeita 100% as áreas seguras (safe zones) do Instagram para que seu nome de usuário e a barra de envio de direct não fiquem por cima do texto.`
  }
];

async function run() {
  const baseOutputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram');
  if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir, { recursive: true });
  }

  console.log('Iniciando navegador Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  for (const post of POSTS) {
    const postDir = path.join(baseOutputDir, post.name);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    fs.writeFileSync(path.join(postDir, 'instrucoes.txt'), post.caption, 'utf-8');
    console.log(`Instruções salvas em ${post.name}/instrucoes.txt`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const fileUrl = 'file:///' + post.htmlFile.replace(/\\/g, '/');
    console.log(`Carregando ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    await page.evaluateHandle('document.fonts.ready');

    const targetElement = await page.$('.story-canvas');
    const outputPath = path.join(postDir, 'story-abertura-beta.jpg');

    await targetElement.screenshot({
      path: outputPath,
      type: 'jpeg',
      quality: 98
    });
    console.log(`✓ Gerado: ${post.name}/story-abertura-beta.jpg`);

    await page.close();
  }

  await browser.close();
  console.log('✅ Story gerado com sucesso!');
}

run().catch(err => {
  console.error('Erro na exportação:', err);
  process.exit(1);
});
