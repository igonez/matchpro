const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const POSTS = [
  {
    name: 'Post 1',
    htmlFile: path.join(__dirname, '..', 'public', 'social', 'post-1-manifesto.html'),
    caption: `Planilha no Excel, grupo no WhatsApp com 40 pessoas mandando foto de prato misturada com bom dia, e você até as 23h contando pontos no bloco de notas.

Essa é a realidade de 9 em cada 10 personais e coaches que tentam rodar desafios fitness em 2026.

O resultado?
1. Alunos desistem na segunda semana (perdem o engajamento).
2. O grupo vira um caos e você perde horas preciosas.
3. Não há percepção de alto valor, limitando o quanto você pode cobrar.

A ArenaFitPro nasceu para enterrar esse modelo amador.

Transformamos seus desafios em um campeonato profissional com:
- Feed de missões diárias com validação por câmera ao vivo.
- Leaderboard em tempo real que vicia a turma na disputa pelo pódio.
- Split Pix D+0 direto na sua conta bancária a cada inscrição.

Estamos selecionando os 15 Primeiros Treinadores Fundadores para o Programa Beta Fechado.

Comente "BETA" ou acesse o link na bio para garantir acesso prioritário.

#personaltrainer #consultoriafitness #desafiofitness #gamificacao #treinador #arenafitpro`
  },
  {
    name: 'Post 2',
    htmlFile: path.join(__dirname, '..', 'public', 'social', 'post-2-app-demonstracao.html'),
    caption: `Como seus alunos realmente vivem a experiência da ArenaFitPro no dia a dia.

Chega de prints duvidosos de fotos tiradas há três dias:

1. FEED DE MISSÕES DIÁRIAS
Seus alunos abrem o app e veem exatamente o que pontua hoje (refeição limpa, água, treino de força).

2. CÂMERA ANTIFRAUDE AO VIVO
O aluno fotografa na hora pelo app. Zero fotos salvas da galeria. Integridade e respeito com quem realmente está se esforçando.

3. LEADERBOARD EM TEMPO REAL
O ranking atualiza instantaneamente. Carlos em 1º, Mariana colada em 2º e a turma toda disputando cada ponto. O engajamento quadruplica.

4. COCKPIT DO TREINADOR & SPLIT PIX
Você aprova submissões em segundos com um toque. E a taxa da inscrição cai direto no seu Pix, sem intermediários.

O link para entrar no grupo de Treinadores Fundadores (apenas 15 vagas com isenção eterna de mensalidade) está no link da bio.

Ou comente "APP" abaixo para receber o link no direct.

#personaltrainer #tecnologiafitness #desafiofitness #consultoriafitness #arenafitpro`
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

    // Salvar legenda.txt
    fs.writeFileSync(path.join(postDir, 'legenda.txt'), post.caption, 'utf-8');
    console.log(`Legenda salva em ${post.name}/legenda.txt`);

    const page = await browser.newPage();
    // 540x675 com scale factor 2 resulta em exatos 1080x1350!
    await page.setViewport({ width: 1400, height: 2000, deviceScaleFactor: 2 });

    const fileUrl = 'file:///' + post.htmlFile.replace(/\\/g, '/');
    console.log(`Carregando ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Aguardar fontes carregarem
    await page.evaluateHandle('document.fonts.ready');

    // Remover bordas arredondadas e sombras externas temporariamente para exportação perfeita
    await page.evaluate(() => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach(slide => {
        slide.style.borderRadius = '0px';
        slide.style.boxShadow = 'none';
        slide.style.border = 'none';
      });
    });

    const slidesCount = await page.evaluate(() => document.querySelectorAll('.slide').length);
    console.log(`${post.name}: Encontrados ${slidesCount} slides`);

    for (let i = 0; i < slidesCount; i++) {
      const slideElement = await page.$$('.slide');
      const targetSlide = slideElement[i];
      const outputPath = path.join(postDir, `slide-${i + 1}.jpg`);

      await targetSlide.screenshot({
        path: outputPath,
        type: 'jpeg',
        quality: 95
      });
      console.log(`✓ Gerado: ${post.name}/slide-${i + 1}.jpg`);
    }

    await page.close();
  }

  await browser.close();
  console.log('✅ Todos os slides foram exportados com sucesso!');
}

run().catch(err => {
  console.error('Erro na exportação:', err);
  process.exit(1);
});
