if (typeof process === 'undefined') {
  window.process = {
    env: {
      USE_BACKEND: 'false',
      API_URL: 'http://localhost:3000'
    }
  };
}
