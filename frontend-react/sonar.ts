import { config } from 'dotenv';
import { execSync } from 'child_process';

config();

try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  console.log(`Running sonar for branch: ${branch}`);

  execSync(
    `npx sonarqube-scanner -Dsonar.projectKey=frontend-react -Dsonar.projectName="Frontend React" -Dsonar.login=${process.env.SONAR_TOKEN}`,
    { stdio: 'inherit' }
  );
} catch (error) {
  console.error('Error running SonarQube analysis:', error);
  process.exit(1);
}