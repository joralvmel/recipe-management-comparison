const puppeteer = require('puppeteer');
const fs = require('node:fs');
const path = require('node:path');
const { startServer, stopServer } = require('./lighthouse-server.cjs');

// Función principal asíncrona autoejecutable
(async () => {
  let serverPort;

  try {
    // Importar lighthouse dinámicamente
    const lighthouse = await import('lighthouse');

    serverPort = await startServer();
    const baseUrl = `http://localhost:${serverPort}`;
    const reportsDir = './lighthouse-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Iniciar Chrome con configuración optimizada para pruebas de rendimiento
    const browser = await puppeteer.launch({
      headless: true, // Headless ofrece medidas más consistentes
      defaultViewport: { width: 1280, height: 800 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--no-first-run',
        '--no-zygote'
      ]
    });

    const page = await browser.newPage();
    await page.goto(`${baseUrl}/login`);

    // Login rapido sin esperas innecesarias
    try {
      await page.waitForSelector('input[type="email"]');
      await page.waitForSelector('input[type="password"]');
      await page.type('input[type="email"]', 'joralvmel@gmail.com');
      await page.type('input[type="password"]', '123');

      await Promise.all([
        page.click('app-form button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
    } catch (loginError) {
      console.warn('Warning: Error en login:', loginError.message);
    }

    const cookies = await page.cookies();
    await page.close();

    // Configuración optimizada de Lighthouse
    const options = {
      logLevel: 'error',
      output: ['json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: Number.parseInt((new URL(browser.wsEndpoint())).port, 10),
      formFactor: 'desktop',
      throttling: {
        // Configuración para simular conexión de red rápida (sin throttling)
        rttMs: 0,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      screenEmulation: {
        mobile: false,
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        disabled: false,
      },
      emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      extraHeaders: {
        Cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
      }
    };

    // Páginas a probar
    const pages = [
      { route: '/', name: 'home' },
      { route: '/search', name: 'search' },
      { route: '/recipe/12345', name: 'recipe-detail' },
      { route: '/login', name: 'login' },
      { route: '/register', name: 'register' },
      { route: '/favorites', name: 'favorites', requiresAuth: true },
    ];

    // Precalentar la aplicación para que esté en caché
    const warmupPage = await browser.newPage();
    await warmupPage.goto(`${baseUrl}/`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await warmupPage.close();

    // Ejecutar Lighthouse para cada página
    for (const { route, name, requiresAuth } of pages) {
      try {
        const url = `${baseUrl}${route}`;
        console.log(`Testing ${url}...${requiresAuth ? ' (authenticated)' : ''}`);

        // Usar la función lighthouse importada dinámicamente
        const result = await lighthouse.default(url, options);

        if (!result) {
          console.error(`Failed to get Lighthouse results for ${url}`);
          continue;
        }

        const { lhr } = result;
        const scores = {
          performance: Math.round(lhr.categories.performance?.score ? lhr.categories.performance.score * 100 : 0),
          accessibility: Math.round(lhr.categories.accessibility?.score ? lhr.categories.accessibility.score * 100 : 0),
          bestPractices: Math.round(lhr.categories['best-practices']?.score ? lhr.categories['best-practices'].score * 100 : 0),
          seo: Math.round(lhr.categories.seo?.score ? lhr.categories.seo.score * 100 : 0)
        };

        const cleanDisplayValue = (value) => {
          if (!value) return '';
          return value.replace(/\u00A0/g, ' ');
        };

        const simplifiedMetrics = {
          firstContentfulPaint: cleanDisplayValue(lhr.audits['first-contentful-paint']?.displayValue),
          largestContentfulPaint: cleanDisplayValue(lhr.audits['largest-contentful-paint']?.displayValue),
          totalBlockingTime: cleanDisplayValue(lhr.audits['total-blocking-time']?.displayValue),
          cumulativeLayoutShift: cleanDisplayValue(lhr.audits['cumulative-layout-shift']?.displayValue),
          speedIndex: cleanDisplayValue(lhr.audits['speed-index']?.displayValue),
        };

        const now = new Date();
        const timestamp = now.toISOString();
        const fullReport = {
          timestamp,
          route,
          scores,
          metrics: simplifiedMetrics
        };

        console.log(`Scores for ${route}:`, scores);
        console.log("Detailed metrics:", simplifiedMetrics);

        const safeFilename = `angular-${name}`;
        fs.writeFileSync(
          `${reportsDir}/${safeFilename}-report.json`,
          JSON.stringify(fullReport, null, 2)
        );
        console.log(`Report saved to ${reportsDir}/${safeFilename}-report.json`);
      } catch (error) {
        console.error(`Error testing ${route}:`, error);
      }
    }

    await browser.close();
    console.log('Lighthouse tests completed successfully');
  } catch (error) {
    console.error('Error running Lighthouse tests:', error);
    process.exit(1);
  } finally {
    if (serverPort) {
      await stopServer();
    }
  }
})();
