import fs from 'fs';
import path from 'path';

// Vite plugin to inject build version into HTML
export function injectVersion() {
  // Read package.json for version
  let packageVersion = '1.0.0';
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageVersion = packageJson.version || '1.0.0';
  } catch (e) {
    console.warn('Could not read package.json version');
  }
  
  // Generate version once at build time
  const buildTimestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const version = `${packageVersion}.${buildTimestamp}`;
  let hasLogged = false;
  
  return {
    name: 'inject-version',
    transformIndexHtml(html: string) {
      // Only log once to avoid spam during hot reload
      if (!hasLogged) {
        console.log('📦 Build version:', version);
        hasLogged = true;
      }
      // Replace all occurrences of the version placeholder
      return html.replace(/\{\{BUILD_VERSION\}\}/g, version);
    },
  };
}
