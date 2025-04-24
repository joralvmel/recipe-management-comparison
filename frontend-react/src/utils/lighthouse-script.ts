import lighthouse from 'lighthouse';
import type { Flags } from 'lighthouse';
import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

(async () => {
  try {
    // Create reports directory if it doesn't exist
    const reportsDir = './lighthouse-reports';
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    // Configure Chrome with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Configure Lighthouse options
    const options: Flags = {
      logLevel: 'info' as const,
      output: ['html'] as const,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: Number.parseInt((new URL(browser.wsEndpoint())).port, 10),
    };

    // Pages to test
    const urls = [
      'http://localhost:3000',  // Home page
    ];

    // Run tests for each URL
    for (const url of urls) {
      try {
        // First check if the page exists
        const page = await browser.newPage();
        const response = await page.goto(url, { waitUntil: 'networkidle2' });
        await page.close();

        if (!response || response.status() >= 400) {
          console.warn(`Skipping ${url} - page returned status ${response?.status() || 'unknown'}`);
          continue;
        }

        // Create a safe filename from the URL
        const urlObj = new URL(url);
        const pageName = urlObj.pathname === '/'
          ? 'home'
          : urlObj.pathname.replace(/\//g, '-').replace(/^-/, '');

        const safeFilename = `react-${pageName || 'home'}`;

        console.log(`Testing ${url}...`);

        const result = await lighthouse(url, options);

        if (!result) {
          console.error(`Failed to get Lighthouse results for ${url}`);
          continue;
        }

        const { lhr, report } = result;

        // Extract scores
        const scores = {
          performance: Math.round(lhr.categories.performance?.score ? lhr.categories.performance.score * 100 : 0),
          accessibility: Math.round(lhr.categories.accessibility?.score ? lhr.categories.accessibility.score * 100 : 0),
          bestPractices: Math.round(lhr.categories['best-practices']?.score ? lhr.categories['best-practices'].score * 100 : 0),
          seo: Math.round(lhr.categories.seo?.score ? lhr.categories.seo.score * 100 : 0)
        };

        // Clean up display values to avoid non-breaking spaces
        const cleanDisplayValue = (value: string | undefined) => {
          if (!value) return '';
          // Replace non-breaking spaces with regular spaces
          return value.replace(/\u00A0/g, ' ');
        };

        // Extract simplified metrics (just the clean display values)
        const simplifiedMetrics = {
          firstContentfulPaint: cleanDisplayValue(lhr.audits['first-contentful-paint']?.displayValue),
          largestContentfulPaint: cleanDisplayValue(lhr.audits['largest-contentful-paint']?.displayValue),
          totalBlockingTime: cleanDisplayValue(lhr.audits['total-blocking-time']?.displayValue),
          cumulativeLayoutShift: cleanDisplayValue(lhr.audits['cumulative-layout-shift']?.displayValue),
          speedIndex: cleanDisplayValue(lhr.audits['speed-index']?.displayValue),
        };

        // Combine scores and simplified metrics
        const fullReport = {
          scores,
          metrics: simplifiedMetrics
        };

        console.log(`Scores for ${urlObj.pathname || 'home'}:`, scores);
        console.log("Detailed metrics:", simplifiedMetrics);

        // Save HTML report - handle array format
        if (report && Array.isArray(report) && report.length > 0) {
          writeFileSync(`${reportsDir}/${safeFilename}.html`, report[0]);
          console.log(`Report saved to ${reportsDir}/${safeFilename}.html`);
        } else if (report && typeof report === 'string') {
          writeFileSync(`${reportsDir}/${safeFilename}.html`, report);
          console.log(`Report saved to ${reportsDir}/${safeFilename}.html`);
        } else {
          console.warn(`No HTML report available for ${url}`);
        }

        // Save simplified report data in JSON for analysis
        writeFileSync(
          `${reportsDir}/${safeFilename}-report.json`,
          JSON.stringify(fullReport, null, 2)
        );
        console.log(`Report saved to ${reportsDir}/${safeFilename}-report.json`);
      } catch (error) {
        console.error(`Error testing ${url}:`, error);
      }
    }

    await browser.close();
    console.log('Lighthouse tests completed successfully');
  } catch (error) {
    console.error('Error running Lighthouse tests:', error);
    process.exit(1);
  }
})();