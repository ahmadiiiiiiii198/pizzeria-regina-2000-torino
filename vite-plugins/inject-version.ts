// Vite plugin to inject build version into HTML
export function injectVersion() {
  const version = `1.0.${Date.now()}`;
  let hasLogged = false;
  
  return {
    name: 'inject-version',
    transformIndexHtml(html) {
      // Only log once to avoid spam during hot reload
      if (!hasLogged) {
        console.log('🔧 Version injected into HTML:', version);
        hasLogged = true;
      }
      return html.replace('{{BUILD_VERSION}}', version);
    },
  };
}
