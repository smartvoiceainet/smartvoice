import Head from 'next/head';
import config from '@/config';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
}

const SEO = ({ 
  title = config.appName, 
  description = config.appDescription,
  canonicalUrl = `https://${config.domainName}`,
  ogImage = `/images/og-image.jpg`,
  ogType = 'website',
  twitterCard = 'summary_large_image'
}: SEOProps) => {
  const siteTitle = title === config.appName 
    ? config.appName 
    : `${title} | ${config.appName}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Schema.org JSON-LD for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: config.appName,
            url: `https://${config.domainName}`,
            "logo": "https://smartvoiceai.com/images/smartvoiceclearbackcropped.png",
            sameAs: [
              'https://twitter.com/smartvoiceai',
              'https://linkedin.com/company/smartvoiceai',
              'https://facebook.com/smartvoiceai'
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+1-800-555-1212',
              contactType: 'customer service',
              availableLanguage: ['English']
            },
            description: config.appDescription
          })
        }}
      />
    </Head>
  );
};

export default SEO;
