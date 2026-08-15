import { DatasetItem, ScoreBreakdown } from '../src/types';
import { AnalyzedQuery } from './queryAnalyzer';

const REPUTABLE_ORGS = new Set([
  'facebookresearch',
  'facebook',
  'meta',
  'google',
  'google-research',
  'huggingface',
  'openai',
  'stanford-ml-group',
  'stanfordnlp',
  'tatsu-lab',
  'databricks',
  'databrickslabs',
  'openassistant',
  'laion-ai',
  'bigcode',
  'bigscience',
  'liuhaotian',
  'lm-sys',
  'unslothai',
  'ultralytics',
  'sobhe',
  'hooshvarelab',
  'hooshvare',
  'persiannlp',
  'dadmatech',
  'mit-lcp',
  'physionet',
  'zalandoresearch',
  'detection-datasets',
  'microsoft',
  'pytorch',
  'keras-team',
  'openml',
  'mozilla-foundation',
  'marsyas',
  'dmlc',
]);

const GENERAL_SHOWCASE_KEYWORDS = [
  'awesome',
  'collection',
  'curated list',
  'all-in-one',
  'deep-learning-papers',
  'roadmap',
  'cheatsheet',
  'interview',
  'neurons',
];

const SYNTHETIC_KEYWORDS = [
  'synthetic',
  'generated',
  'dummy',
  'mock',
  'metadata',
  'stats',
  'test-data',
  'summary-only',
];

export function calculateItemScore(
  item: DatasetItem,
  queryContext: AnalyzedQuery,
  subQueryRank: number = 1
): { finalScore: number; breakdown: ScoreBreakdown; rankReason: string } {
  const queryTokens = queryContext.extractedKeywords;
  const rawQueryLower = queryContext.rawQuery.toLowerCase();
  const lowerTitle = (item.title || '').toLowerCase();
  const lowerSourceId = (item.sourceId || '').toLowerCase();
  const lowerDesc = (item.description || '').toLowerCase();
  const lowerTags = (item.tags || []).map((t) => t.toLowerCase()).join(' ');
  const author = (item.authorOrOrg || '').toLowerCase();
  const canonicalKey = `${item.platform}:${lowerSourceId}`;

  // 1. Relevance Score (Max 40 points)
  let matchedTitleTokens = 0;
  let matchedTagTokens = 0;
  let matchedDescTokens = 0;

  for (const token of queryTokens) {
    if (token.length < 2) continue;
    if (lowerTitle.includes(token) || lowerSourceId.includes(token)) {
      matchedTitleTokens++;
    }
    if (lowerTags.includes(token)) {
      matchedTagTokens++;
    }
    if (lowerDesc.includes(token)) {
      matchedDescTokens++;
    }
  }

  const tokenCount = Math.max(queryTokens.length, 1);
  const titleRatio = matchedTitleTokens / tokenCount;
  const tagRatio = matchedTagTokens / tokenCount;
  const descRatio = matchedDescTokens / tokenCount;

  let relevance = (titleRatio * 24) + (tagRatio * 10) + (descRatio * 6);
  relevance = Math.min(40, Math.round(relevance * 10) / 10);

  // 2. Exact Match / Resolved Canonical Match (Max 20 points)
  let exactMatch = 0;
  
  // Check resolved canonical IDs
  if (queryContext.resolvedCanonicalIds && queryContext.resolvedCanonicalIds.length > 0) {
    for (const canon of queryContext.resolvedCanonicalIds) {
      const canonLower = canon.toLowerCase();
      if (canonicalKey === canonLower || lowerSourceId === canonLower.split(':')[1]) {
        exactMatch = 20;
        break;
      }
    }
  }

  // Check exact candidate patterns
  if (exactMatch === 0) {
    for (const cand of queryContext.exactCandidates) {
      const lowerCand = cand.toLowerCase();
      if (lowerSourceId === lowerCand || lowerTitle === lowerCand) {
        exactMatch = 20;
        break;
      }
      if (lowerSourceId.includes(lowerCand) || lowerCand.includes(lowerSourceId)) {
        exactMatch = Math.max(exactMatch, 16);
      }
    }
  }

  if (exactMatch === 0) {
    for (const token of queryTokens) {
      if (token.length > 2 && (lowerSourceId.endsWith(`/${token}`) || lowerSourceId === token)) {
        exactMatch = 12;
        break;
      }
    }
  }

  // 3. Intent Alignment Boost (Max 15 points)
  let intentBoost = 0;
  if (queryContext.detectedIntent === 'repository' && item.itemType === 'code_repository') {
    intentBoost = 12;
  } else if (queryContext.detectedIntent === 'dataset' && item.itemType === 'dataset') {
    intentBoost = 12;
  }

  // 4. Target Language Alignment Boost (Max 15 points)
  let languageBoost = 0;
  if (queryContext.isPersianQuery) {
    if (item.isPersianSupported || (item.languages && item.languages.includes('fa')) || lowerDesc.match(/[\u0600-\u06FF]/)) {
      languageBoost = 15;
    }
  }

  // 5. Source Quality & Verification (Max 10 points)
  let sourceQuality = item.isVerified ? 4 : 2;
  const orgName = item.sourceId.includes('/') ? item.sourceId.split('/')[0].toLowerCase() : author;
  if (REPUTABLE_ORGS.has(orgName) || REPUTABLE_ORGS.has(author)) {
    sourceQuality += 6;
  } else if (item.platform === 'huggingface' && (item.sourceId.startsWith('google') || item.sourceId.startsWith('openai'))) {
    sourceQuality += 6;
  }
  sourceQuality = Math.min(10, sourceQuality);

  // 6. Documentation Quality (Max 10 points)
  let documentation = 3;
  if (item.description && item.description.length > 60) documentation += 3;
  if (item.codeSnippets && item.codeSnippets.length > 0) documentation += 2;
  if (item.tags && item.tags.length >= 3) documentation += 2;
  documentation = Math.min(10, documentation);

  // 7. Popularity (Max 8 points)
  const count = item.starsOrDownloads || 0;
  let popularity = 0;
  if (count > 0) {
    popularity = Math.min(8, (Math.log10(count + 1) / Math.log10(50000)) * 8);
  }
  popularity = Math.round(popularity * 10) / 10;

  // 8. Recency (Max 7 points)
  let recency = 5;
  if (item.lastUpdated && (item.lastUpdated.includes('2024') || item.lastUpdated.includes('2025') || item.lastUpdated.includes('2026'))) {
    recency = 7;
  } else if (item.lastUpdated && item.lastUpdated.includes('2023')) {
    recency = 6;
  } else if (item.lastUpdated && item.lastUpdated.includes('2022')) {
    recency = 4;
  }

  // 9. License Confidence (Max 5 points)
  let licenseConfidence = 1;
  if (item.licenseCategory === 'commercial_friendly') {
    licenseConfidence = 5;
  } else if (item.licenseCategory === 'non_commercial') {
    licenseConfidence = 3;
  } else if (item.licenseCategory === 'custom') {
    licenseConfidence = 2;
  }

  // 10. Penalties (Max 45 points penalty)
  let penalties = 0;

  // Penalty A: General Showcase / Awesome / List Repos
  const isGeneralShowcase = GENERAL_SHOWCASE_KEYWORDS.some((kw) => lowerTitle.includes(kw) || lowerDesc.includes(kw));
  if (isGeneralShowcase && titleRatio === 0 && exactMatch === 0) {
    penalties += 35;
  }

  // Penalty B: Synthetic / Metadata Dataset when not requested
  const isQueryAskingForSynthetic = rawQueryLower.includes('synthetic') || rawQueryLower.includes('generated');
  const isItemSynthetic = SYNTHETIC_KEYWORDS.some((kw) => lowerTitle.includes(kw) || lowerSourceId.includes(kw) || lowerTags.includes(kw));
  if (isItemSynthetic && !isQueryAskingForSynthetic && exactMatch === 0) {
    penalties += 25;
  }

  // Penalty C: Language Mismatch Penalty (e.g. Serbian, French, German for Persian query)
  if (queryContext.isPersianQuery) {
    const isExplicitlyOtherLang = ['serbian', 'french', 'german', 'spanish', 'russian', 'chinese', 'japanese'].some(
      (lang) => lowerTitle.includes(lang) || lowerSourceId.includes(lang)
    );
    if (isExplicitlyOtherLang && !item.isPersianSupported && exactMatch === 0) {
      penalties += 35;
    }
  }

  // Penalty D: MNIST vs Fashion-MNIST discrimination
  if (rawQueryLower.includes('mnist') && !rawQueryLower.includes('fashion')) {
    if (lowerTitle.includes('fashion') || lowerSourceId.includes('fashion')) {
      penalties += 30;
    }
  }

  // Penalty E: Zero match in title and tags
  if (titleRatio === 0 && tagRatio === 0 && exactMatch === 0) {
    if (descRatio < 0.5) {
      penalties += 18;
    } else {
      penalties += 8;
    }
  }

  // Final Score calculation
  const rawSum = relevance + exactMatch + intentBoost + languageBoost + sourceQuality + documentation + popularity + recency + licenseConfidence - penalties;
  const finalScore = Math.max(25, Math.min(99, Math.round(rawSum)));

  // Generate explainable reason
  let rankReason = '';
  if (exactMatch >= 16) {
    rankReason = `Direct identifier match for (${item.sourceId}) with target query`;
  } else if (languageBoost >= 10) {
    rankReason = `High relevance domain and language match (${item.title})`;
  } else if (relevance >= 28) {
    rankReason = `High semantic topic match in title and tags on ${item.platform}`;
  } else if (sourceQuality >= 8) {
    rankReason = `Authored by verified reputable organization (${item.authorOrOrg})`;
  } else {
    rankReason = `Multi-factor assessment based on relevance (${relevance}/40) and community adoption`;
  }

  const breakdown: ScoreBreakdown = {
    relevance,
    exactMatch,
    intentBoost,
    languageBoost,
    sourceQuality,
    documentation,
    popularity,
    recency,
    licenseConfidence,
    penalties,
    finalScore,
  };

  return { finalScore, breakdown, rankReason };
}

// -------------------------------------------------------------
// FUSION & DEDUPLICATION PIPELINE
// -------------------------------------------------------------
export function fuseAndRankResults(
  rawItems: DatasetItem[],
  queryContext: AnalyzedQuery
): DatasetItem[] {
  // Step 1: Deduplicate by canonical ID
  const itemMap = new Map<string, DatasetItem>();
  const rankAccumulator = new Map<string, number>();

  rawItems.forEach((item, idx) => {
    const key = `${item.platform}:${item.sourceId.toLowerCase()}`;
    const rrfScore = 1.0 / (60 + (idx + 1));
    rankAccumulator.set(key, (rankAccumulator.get(key) || 0) + rrfScore);

    if (!itemMap.has(key)) {
      itemMap.set(key, { ...item });
    } else {
      const existing = itemMap.get(key)!;
      if (item.sampleCount && !existing.sampleCount) existing.sampleCount = item.sampleCount;
      if (item.sizeStr && !existing.sizeStr) existing.sizeStr = item.sizeStr;
      if (item.likes && !existing.likes) existing.likes = item.likes;
      if (item.sourceQueries) {
        existing.sourceQueries = Array.from(new Set([...(existing.sourceQueries || []), ...(item.sourceQueries || [])]));
      }
    }
  });

  const uniqueItems = Array.from(itemMap.values());

  // Step 2: Score each unique item
  const scoredItems: DatasetItem[] = uniqueItems.map((item) => {
    const key = `${item.platform}:${item.sourceId.toLowerCase()}`;
    const rrf = rankAccumulator.get(key) || 0;
    const { finalScore, breakdown, rankReason } = calculateItemScore(item, queryContext);

    // Minor boost from RRF multi-query hit (max +3 pts)
    const boostedScore = Math.min(99, Math.round(finalScore + (rrf * 10)));

    return {
      ...item,
      aiScore: boostedScore,
      scoreBreakdown: {
        ...breakdown,
        finalScore: boostedScore,
      },
      aiRankReason: rankReason,
    };
  });

  // Step 3: Owner Duplication Penalty
  // Prevent single owner/author from monopolizing all top positions (max 2 items per owner in top tier)
  const ownerCountMap = new Map<string, number>();
  scoredItems.sort((a, b) => b.aiScore - a.aiScore);

  const diversityAdjustedItems = scoredItems.map((item) => {
    const owner = (item.authorOrOrg || item.sourceId.split('/')[0] || 'unknown').toLowerCase();
    const currentCount = ownerCountMap.get(owner) || 0;
    ownerCountMap.set(owner, currentCount + 1);

    if (currentCount >= 2 && (item.scoreBreakdown?.exactMatch || 0) < 16) {
      const penalizedScore = Math.max(30, item.aiScore - 20);
      return {
        ...item,
        aiScore: penalizedScore,
        scoreBreakdown: {
          ...item.scoreBreakdown!,
          penalties: (item.scoreBreakdown?.penalties || 0) + 20,
          finalScore: penalizedScore,
        },
      };
    }
    return item;
  });

  // Step 4: Intent-Aware Sorting and Balancing
  const validItems = diversityAdjustedItems.filter(
    (item) => (item.scoreBreakdown?.relevance || 0) >= 4 || (item.scoreBreakdown?.exactMatch || 0) >= 12
  );

  const candidatePool = validItems.length > 0 ? validItems : diversityAdjustedItems;

  if (queryContext.detectedIntent === 'dataset') {
    const datasets = candidatePool.filter((i) => i.itemType === 'dataset').sort((a, b) => b.aiScore - a.aiScore);
    const repos = candidatePool.filter((i) => i.itemType === 'code_repository').sort((a, b) => b.aiScore - a.aiScore);

    const merged: DatasetItem[] = [];
    let dIdx = 0;
    let rIdx = 0;

    while (dIdx < datasets.length || rIdx < repos.length) {
      if (dIdx < datasets.length) merged.push(datasets[dIdx++]);
      if (dIdx < datasets.length) merged.push(datasets[dIdx++]);
      if (rIdx < repos.length) merged.push(repos[rIdx++]);
    }
    return merged;
  }

  if (queryContext.detectedIntent === 'repository') {
    const repos = candidatePool.filter((i) => i.itemType === 'code_repository').sort((a, b) => b.aiScore - a.aiScore);
    const datasets = candidatePool.filter((i) => i.itemType === 'dataset').sort((a, b) => b.aiScore - a.aiScore);

    const merged: DatasetItem[] = [];
    let rIdx = 0;
    let dIdx = 0;

    while (rIdx < repos.length || dIdx < datasets.length) {
      if (rIdx < repos.length) merged.push(repos[rIdx++]);
      if (rIdx < repos.length) merged.push(repos[rIdx++]);
      if (dIdx < datasets.length) merged.push(datasets[dIdx++]);
    }
    return merged;
  }

  // Default mixed: sort strictly by aiScore descending
  candidatePool.sort((a, b) => b.aiScore - a.aiScore);
  return candidatePool;
}
