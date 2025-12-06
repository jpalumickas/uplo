/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';

export const metadata = {
  metadataBase: new URL('https://uplo.js.org'),
  description:
    'Uplo can Handle file uploads to different storage services like Amazon S3, Google Cloud or etc. It also supports different type of ORM adapters, like Prisma or Drizzle.',
  applicationName: 'Uplo',
  generator: 'Next.js',
  appleWebApp: {
    title: 'Uplo',
  },
  other: {
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-TileColor': '#fff',
  },
};

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>Uplo</b>
        </div>
      }
    />
  );
  const pageMap = await getPageMap();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          navbar={navbar}
          footer={<Footer>MIT {new Date().getFullYear()} © Uplo.</Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/jpalumickas/uplo/blob/main/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
          search={false}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
