import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://reloc.store';

  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/catalog`, priority: 0.9 },
    { url: `${baseUrl}/support`, priority: 0.7 },
    { url: `${baseUrl}/about`, priority: 0.6 },
    { url: `${baseUrl}/contacts`, priority: 0.6 },
    { url: `${baseUrl}/privacy`, priority: 0.3 },
    { url: `${baseUrl}/terms`, priority: 0.3 },
  ].map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page.priority,
  }));

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?limit=1000&isAvailable=true`,
      { next: { revalidate: 3600 } }
    );
    const { data } = await res.json();
    productPages = (data?.data || []).map(
      (p: { region: string; slug: string; updatedAt: string }) => ({
        url: `${baseUrl}/product/${p.region.toLowerCase()}/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })
    );
  } catch {
    // silently ignore — sitemap still works without products
  }

  return [...staticPages, ...productPages];
}
