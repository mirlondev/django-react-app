module.exports = {
    input: ['src/**/*.{js,jsx,ts,tsx}'], // chemin vers ton code
    output: './locales/$LOCALE/$NAMESPACE.json',
    options: {
      debug: false,
      removeUnusedKeys: true,
      func: {
        list: ['t'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      lngs: ['fr'],
      defaultLng: 'fr',
      defaultNs: 'translation',
      resource: {
        loadPath: 'locales/{{lng}}/{{ns}}.json',
        savePath: 'locales/{{lng}}/{{ns}}.json',
        jsonIndent: 2
      }
    }
  };
  