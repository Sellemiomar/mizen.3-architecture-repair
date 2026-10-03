/**
 * Mizen - Financing Knowledge Discovery & Fact Extraction Engine
 * Extracts structured financing parameters from Tunisian source documents, circulars, and product pages.
 * AI-assisted extraction NEVER silently overrides canonical verified records without developer/expert review.
 */

import { 
  FinancingDiscoveryResult, 
  ExtractedFinancingFact, 
  SourceReference,
  FinancingDomain 
} from '../types/knowledge';
import { getAuthoritativeCatalogueProviders, getAuthoritativeCatalogueProducts } from './authoritativeCatalogueProjection';
import { FinancingProduct, FinancingProvider } from '../types/knowledge';

/**
 * Deterministic heuristic fact extractor for offline/local extraction.
 */
export function extractFinancingFactsDeterministically(
  sourceText: string,
  sourceUrl: string = '',
  publisher: string = 'Institution Tunisienne'
): FinancingDiscoveryResult {
  const lower = sourceText.toLowerCase();
  const facts: ExtractedFinancingFact[] = [];
  const sourceId = `src_disc_${Date.now()}`;

  const source: SourceReference = {
    id: sourceId,
    url: sourceUrl || 'https://mizen.tn/sources/extracted',
    publisher,
    sourceType: lower.includes('décret') || lower.includes('circulaire') || lower.includes('jort')
      ? 'OFFICIAL_REGULATION'
      : lower.includes('simulateur')
      ? 'OFFICIAL_SIMULATOR'
      : 'OFFICIAL_PRODUCT_PAGE',
    retrievedAt: new Date().toISOString(),
    evidenceStatus: 'PARTIALLY_VERIFIED'
  };

  // 1. Detect Numerical Ceilings / Max Amounts
  const ceilingMatches = sourceText.match(/(?:plafond|montant\s+max(?:imum)?|jusqu['’]à|dans\s+la\s+limite\s+de|سقف|أقصى\s+مبلغ)\s*(?:est\s+de|de|:)?\s*([0-9][0-9\s.,]*(?:millions?|md|m|k|mille|dt|dinar|tnd|دينار|د|مليون|ألف|الف)?)/i);
  if (ceilingMatches && ceilingMatches[1]) {
    facts.push({
      field: 'maxAmount',
      value: ceilingMatches[1].trim(),
      sourceId,
      confidence: 'MEDIUM',
      excerpt: ceilingMatches[0]
    });
  }

  // 2. Detect Contribution Requirements
  const contributionMatches = sourceText.match(/(?:apport\s+personnel|autofinancement|fonds\s+propres|تمويل\s+ذاتي|مساهمة\s+ذاتية)\s*(?:minimum|de|d['’]|:)?\s*([0-9]+(?:\s*%)?)/i);
  if (contributionMatches && contributionMatches[1]) {
    facts.push({
      field: 'minContributionPercent',
      value: contributionMatches[1].trim(),
      sourceId,
      confidence: 'MEDIUM',
      excerpt: contributionMatches[0]
    });
  }

  // 3. Detect Rate Mentions (TMM, fixed, subsidized)
  if (lower.includes('tmm') || lower.includes('taux moyen')) {
    const tmmSpread = sourceText.match(/tmm\s*\+\s*([0-9]+(?:[.,][0-9]+)?\s*%?)/i);
    facts.push({
      field: 'rate',
      value: tmmSpread ? `TMM + ${tmmSpread[1]}` : 'TMM + Marge',
      sourceId,
      confidence: 'HIGH',
      excerpt: tmmSpread ? tmmSpread[0] : 'Indexé sur le TMM'
    });
  } else if (lower.includes('taux bonifié') || lower.includes('2%') || lower.includes('5%') || lower.includes('فائدة ميسرة')) {
    const rateMatch = sourceText.match(/([0-9]+(?:[.,][0-9]+)?)\s*%/);
    facts.push({
      field: 'rate',
      value: rateMatch ? `${rateMatch[1]}% (Taux Bonifié)` : 'Taux bonifié réglementé',
      sourceId,
      confidence: 'MEDIUM',
      excerpt: rateMatch ? rateMatch[0] : 'Taux bonifié'
    });
  }

  // 4. Detect Duration / Grace Period
  const durationMatch = sourceText.match(/(?:durée|remboursement\s+sur|سداد\s+على)\s*([0-9]+)\s*(?:ans|années|mois|سنوات|أشهر)/i);
  if (durationMatch) {
    facts.push({
      field: 'durationMonths',
      value: durationMatch[0],
      sourceId,
      confidence: 'MEDIUM',
      excerpt: durationMatch[0]
    });
  }

  const differeMatch = sourceText.match(/(?:différé|période\s+de\s+grâce|franchise|إمهال)\s*(?:de)?\s*([0-9]+)\s*(?:ans|années|mois|سنوات|أشهر)/i);
  if (differeMatch) {
    facts.push({
      field: 'gracePeriodMonths',
      value: differeMatch[0],
      sourceId,
      confidence: 'MEDIUM',
      excerpt: differeMatch[0]
    });
  }

  // Match provider and product candidates
  const providerCandidates = getAuthoritativeCatalogueProviders()
    .filter(p => lower.includes(p.name.toLowerCase()) || (p.acronym && lower.includes(p.acronym.toLowerCase())))
    .map(p => p.id);

  const productCandidates = getAuthoritativeCatalogueProducts()
    .filter(pr => lower.includes(pr.name.fr?.toLowerCase() || '') || (pr.id && lower.includes(pr.id.toLowerCase())))
    .map(pr => pr.id);

  return {
    source,
    providerCandidates: providerCandidates.length > 0 ? providerCandidates : ['unknown_provider'],
    productCandidates,
    extractedFacts: facts,
    confidence: facts.length >= 2 ? 'HIGH' : 'MEDIUM',
    requiresReview: true // Always requires human/developer review before promotion to canonical
  };
}

/**
 * Searches the canonical knowledge repository by domain, provider, keywords, or borrower type.
 */
export function searchFinancingCatalogue(options: {
  domain?: FinancingDomain;
  keyword?: string;
  providerId?: string;
  applicantType?: string;
  language?: 'fr' | 'ar';
}): {
  products: FinancingProduct[];
  providers: FinancingProvider[];
  matchCount: number;
} {
  const { domain, keyword, providerId, applicantType, language = 'fr' } = options;

  let filteredProducts = getAuthoritativeCatalogueProducts().filter(p => p.status === 'ACTIVE');

  if (domain) {
    filteredProducts = filteredProducts.filter(p => 
      p.category === domain || p.financingDomains.includes(domain)
    );
  }

  if (providerId) {
    filteredProducts = filteredProducts.filter(p => p.providerId === providerId);
  }

  if (applicantType) {
    filteredProducts = filteredProducts.filter(p => 
      p.applicantTypes.includes(applicantType as any)
    );
  }

  if (keyword && keyword.trim()) {
    const q = keyword.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(p => {
      const nameFr = p.name.fr?.toLowerCase() || '';
      const nameAr = p.name.ar || '';
      const descFr = p.shortDescription?.fr?.toLowerCase() || '';
      const descAr = p.shortDescription?.ar || '';
      const id = p.id.toLowerCase();
      return nameFr.includes(q) || nameAr.includes(q) || descFr.includes(q) || descAr.includes(q) || id.includes(q);
    });
  }

  const matchingProviderIds = new Set(filteredProducts.map(p => p.providerId));
  const filteredProviders = getAuthoritativeCatalogueProviders().filter(pr => matchingProviderIds.has(pr.id));

  return {
    products: filteredProducts,
    providers: filteredProviders,
    matchCount: filteredProducts.length
  };
}
