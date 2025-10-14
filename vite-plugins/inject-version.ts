// Vite plugin to inject build version into HTML
export function injectVersion() {
  const version = `1.0.${Date.now()}`;
  
  return {
    name: 'inject-version',
    transformIndexHtml(html) {
      console.log('🔧 Injecting version into HTML:', version);
      return html.replace('{{BUILD_VERSION}}', version);
    },
  };
}
