import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { source } from '@/lib/source'
import './global.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://uplo.js.org'),
  title: {
    template: '%s - Uplo',
    default: 'Uplo',
  },
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
}

const currentYear = new Date().getFullYear()

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider search={{ enabled: false }}>
          <DocsLayout
            tree={source.getPageTree()}
            nav={{ title: <b>Uplo</b> }}
            githubUrl="https://github.com/jpalumickas/uplo"
            sidebar={{
              defaultOpenLevel: 0,
              footer: (
                <p className="text-xs text-fd-muted-foreground">MIT {currentYear} © Uplo.</p>
              ),
            }}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  )
}
