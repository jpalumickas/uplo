const themeConfig = {
  project: {
    link: 'https://github.com/jpalumickas/uplo',
  },
  chat: false,
  docsRepositoryBase: 'https://github.com/jpalumickas/uplo/tree/main/docs',
  discord: false,
  branch: 'main', // branch of docs
  path: '/docs', // path of docs
  titleSuffix: ' – Uplo',
  darkMode: true,
  footer: {
    component: null,
  },
  nextThemes: {
    defaultTheme: "light",
  },
  logo: <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ fontWeight: 'bold', fontSize: '1.5rem', marginRight: 20 }}>Uplo</span>
    <span style={{ marginTop: '4px' }}>Modular uploader for Node.js</span>
  </div>,
  head: <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="" />
    <meta name="og:title" content="Uplo - modular uploader for Node.js" />
  </>
}

export default themeConfig;
