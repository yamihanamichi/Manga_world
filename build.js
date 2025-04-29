const { compile } = require('nexe');

compile({
  input: './app.js',
  output: 'manga-world.exe',
  resources: [
    'views/**/*',
    'public/**/*',
    '.env'
  ],
  target: 'windows-x64-14.15.3',
  temp: 'build',
  clean: true,
  rc: {
    CompanyName: 'Manga World',
    FileDescription: 'Application Manga World',
    ProductName: 'Manga World',
    OriginalFilename: 'manga-world.exe',
  },
  configure: [
    '--with-intl=full-icu'
  ],
  build: true,
  ico: 'public/images/banner.png'
}).then(() => {
  console.log('Compilation terminée !');
}).catch((err) => {
  console.error('Erreur lors de la compilation:', err);
});