// src/components/JsonLd.js
// Renders JSON-LD structured data so Google, Bing, and AI engines (ChatGPT,
// Perplexity, Claude, Gemini) can extract entity information about JobFit.
//
// Three blocks are emitted on the landing page:
//   1. Organization — establishes JobFit as an entity
//   2. SoftwareApplication — describes the product, pricing, audience
//   3. FAQPage — high-value for AI-citation queries ("is JobFit free?", etc.)

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

function JsonLdScript({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JobFit',
    url: SITE_URL,
    logo: `${SITE_URL}/og.png`,
    description:
      'AI-powered job application tool that turns any job description into a tailored resume, cover letter, and fit score in under 30 seconds.',
    sameAs: [
      // Add your social URLs here as you create them:
      // 'https://www.tiktok.com/@jobfit',
      // 'https://twitter.com/jobfit',
      // 'https://www.linkedin.com/company/jobfit',
    ],
  };
  return <JsonLdScript data={data} />;
}

export function SoftwareApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'JobFit',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Resume Builder',
    operatingSystem: 'Web',
    url: SITE_URL,
    description:
      'Paste any job description and get an instant fit score, AI-tailored resume, and cover letter — built for new grads and career switchers.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: '2 free job analyses, no credit card required',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '9.99',
        priceCurrency: 'USD',
        description: 'Unlimited job analyses, tailored resumes, and cover letters. Billed quarterly.',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '9.99',
          priceCurrency: 'USD',
          billingDuration: 'P3M',
          unitText: 'quarter',
        },
      },
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'Job seekers, new graduates, career switchers, early-career professionals',
    },
    featureList: [
      'Instant fit score from 0 to 100',
      'AI-tailored resume generation',
      'AI cover letter generation',
      'PDF download',
      'Application status tracking',
      'Anti-hallucination guarantees — only uses verified profile facts',
    ],
  };
  return <JsonLdScript data={data} />;
}

export function FaqJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is JobFit free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes — every new account gets free job analyses with no credit card required. Pro is $9.99 per quarter for unlimited use.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to tailor a resume with JobFit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Under 30 seconds. Paste a job description, and JobFit returns a fit score, tailored resume, and cover letter almost instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Will the AI invent facts about my experience?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. Every AI call has explicit anti-hallucination instructions — only facts from your verified profile are used, with no invented metrics, dates, or claims.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is JobFit ATS-friendly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. The output is plain-formatted, keyword-aligned with the job description, and exports to a PDF that ATS systems parse cleanly.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is JobFit different from using ChatGPT directly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'JobFit stores your verified profile once, scores your fit before generating, has stricter anti-hallucination rules, and ships a complete document — not a back-and-forth prompt session.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel my Pro subscription anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. The billing portal lets Pro users cancel or manage their subscription at any time.',
        },
      },
    ],
  };
  return <JsonLdScript data={data} />;
}
