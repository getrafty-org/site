import { baseUrl } from './config'

export const dynamic = 'force-static'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/private/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
