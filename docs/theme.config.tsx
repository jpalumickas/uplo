import { useRouter } from 'next/router';
import { useConfig, type DocsThemeConfig } from 'nextra-theme-docs';

const themeConfig: DocsThemeConfig = {
  project: {
    link: 'https://github.com/jpalumickas/uplo',
  },
  docsRepositoryBase: 'https://github.com/jpalumickas/uplo/tree/main/docs',
  darkMode: true,
  footer: {
    component: null,
  },
  nextThemes: {
    defaultTheme: 'light',
  },
  logo: (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.5rem', marginRight: 20 }}>
        Uplo
      </span>
      <span style={{ marginTop: '4px' }}>Modular uploader for Node.js</span>
    </div>
  ),
  head() {
    const { route } = useRouter();
    const { title } = useConfig();
    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{route === '/' ? 'Uplo' : `${title} - Uplo`}</title>
        <meta
          name="description"
          content="Uplo can Handle file uploads to different storage services like Amazon S3, Google Cloud or etc. It also supports different type of ORM adapters, like Prisma."
        />
      </>
    );
  },
};

export default themeConfig;
