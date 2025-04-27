import lighthouse from 'lighthouse';
import type { Flags } from 'lighthouse';
import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { startServer, stopServer } from './lighthouse-server.js';

(async () => {
  let serverPort: number | undefined;

  try {
    serverPort = await startServer() as number;
    const baseUrl = `http://localhost:${serverPort}`;
    const reportsDir = './lighthouse-reports';
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`${baseUrl}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="email"]', 'joralvmel@gmail.com');
    await page.type('input[type="password"]', '123');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    console.log('Logged in successfully');

    const cookies = await page.cookies();
    await page.close();

    const options: Flags = {
      logLevel: 'info' as const,
      output: ['json'] as const,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: Number.parseInt((new URL(browser.wsEndpoint())).port, 10),
      extraHeaders: {
        Cookie: cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
      }
    };

    const pages = [
      { route: '/', name: 'home' },
      { route: '/search', name: 'search' },
      { route: '/recipe/12345', name: 'recipe-detail' },
      { route: '/login', name: 'login' },
      { route: '/register', name: 'register' },
      { route: '/favorites', name: 'favorites', requiresAuth: true },
    ];

    for (const { route, name, requiresAuth } of pages) {
      try {
        const url = `${baseUrl}${route}`;
        console.log(`Testing ${url}...${requiresAuth ? ' (authenticated)' : ''}`);
        const result = await lighthouse(url, options);

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

        const cleanDisplayValue = (value: string | undefined) => {
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

        const safeFilename = `react-${name}`;
        writeFileSync(
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