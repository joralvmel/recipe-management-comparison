import { config } from 'dotenv';
import { execSync } from 'child_process';

config();

try {
  console.log('Running tests with coverage...');
  execSync('npm run test:coverage', { stdio: 'inherit' });

  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  console.log(`Running sonar for branch: ${branch}`);

  execSync(
    `npx sonarqube-scanner -Dsonar.projectKey=frontend-angular -Dsonar.projectName="Frontend Angular" -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/src/test.ts,**/src/polyfills.ts,**/environment*.ts,**/*.spec.ts,**/src/utils/**,**/src/app/data/** -Dsonar.login=${process.env['SONAR_TOKEN']}`,
    { stdio: 'inherit' }
  );
} catch (error) {
  console.error('Error running SonarQube analysis:', error);
  process.exit(1);
}
