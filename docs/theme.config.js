const themeConfig = {
  repository: 'https://github.com/jpalumickas/uplo', // project repo
  docsRepository: 'https://github.com/jpalumickas/uplo', // docs repo
  branch: 'main', // branch of docs
  path: '/docs', // path of docs
  titleSuffix: ' – Uplo',
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: true,
  footerText: `MIT ${new Date().getFullYear()} © Justas Palumickas.`,
  footerEditOnGitHubLink: true, // will link to the docs repo
  logo: <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ fontWeight: 'bold', fontSize: '1.5rem', marginRight: 20 }}>Uplo</span>
    <span style={{ marginTop: '4px' }}>Uploader for Node.js</span>
  </div>,
  head: <>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="" />
    <meta name="og:title" content="Uplo - simple uploader for Node.js" />
  </>
}

export default themeConfig;
