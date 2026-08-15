export type PlatformSource = 
  | 'huggingface'
  | 'github'
  | 'kaggle'
  | 'openml'
  | 'paperswithcode'
  | 'zenodo'
  | 'uci'
  | 'arxiv';

export type ModalityType = 
  | 'nlp' 
  | 'vision' 
  | 'audio' 
  | 'tabular' 
  | 'multimodal' 
  | 'code' 
  | 'reinforcement_learning' 
  | 'other';

export type StandardModality = 
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'tabular'
  | 'multimodal'
  | 'code'
  | 'unknown';

export type LicenseCategory = 'commercial_friendly' | 'non_commercial' | 'custom' | 'unknown';

export type LicenseConfidenceStatus = 'verified' | 'inferred' | 'unknown';

export type ItemClassification = 'dataset' | 'code_repository';

export type SourceHealthStatus = 'available' | 'degraded' | 'rate_limited' | 'disabled' | 'auth_required' | 'error';

export type SearchStateStatus = 'idle' | 'loading' | 'success' | 'partial' | 'upstream_failure' | 'empty' | 'error';

export interface ScoreBreakdown {
  relevance: number;        // 0 - 40 (keyword, BM25 semantic match)
  exactMatch: number;       // 0 - 20 (exact repo or dataset ID match)
  intentBoost: number;      // 0 - 15 (dataset vs repo intent alignment)
  languageBoost: number;    // 0 - 15 (target language alignment e.g. Persian)
  sourceQuality: number;    // 0 - 10 (verified organization, structured dataset card)
  documentation: number;    // 0 - 10 (detailed readme, tags, examples)
  popularity: number;       // 0 - 8  (log-normalized downloads / stars)
  recency: number;          // 0 - 7  (last updated within recent months/years)
  licenseConfidence: number;// 0 - 5  (SPDX verified permissive commercial license)
  penalties: number;        // 0 - 45 (synthetic/metadata/language mismatch/owner duplication)
  finalScore: number;       // 0 - 100 (single source of truth for sorting & display)
}

export interface DatasetItem {
  id: string; // Stable ID e.g. "huggingface:facebook/flores" or "github:sobhe/hazm"
  sourceId: string; // Real canonical ID e.g. "facebook/flores" or "sobhe/hazm"
  canonicalUrl: string; // Real canonical URL verified with live platform
  title: string;
  authorOrOrg: string;
  platform: PlatformSource;
  itemType: ItemClassification; // 'dataset' | 'code_repository'
  url: string;
  description: string;
  persianSummary?: string;
  modality: ModalityType;
  standardModality?: StandardModality;
  modalityConfidence?: 'high' | 'medium' | 'inferred';
  modalityReason?: string;
  languages: string[];
  sizeStr?: string;
  sampleCount?: string;
  starsOrDownloads: number;
  metricType?: 'stars' | 'downloads' | 'runs';
  metricValue?: number;
  downloadsStr?: string;
  likes?: number;
  forks?: number;
  license: string;
  licenseSpdx?: string;
  licenseCategory: LicenseCategory;
  licenseConfidence: LicenseConfidenceStatus;
  licenseDisclaimer?: string;
  lastUpdated: string;
  tags: string[];
  aiScore: number; // 0 - 100 (Equal to scoreBreakdown.finalScore)
  scoreBreakdown?: ScoreBreakdown;
  aiRankReason: string;
  pros: string[];
  cons: string[];
  benchmarks?: string[];
  codeSnippets: {
    language: 'python' | 'bash' | 'curl' | 'pandas' | 'pytorch';
    title: string;
    code: string;
  }[];
  format?: string; // 'parquet', 'jsonl', 'csv', 'images', 'weights', etc.
  recommendedFor: string;
  isPersianSupported?: boolean;
  isVerified: boolean; // Verified with real platform API
  sourceQueries?: string[];
}

export interface SearchAgentSummary {
  executiveSummary: string;
  executiveSummaryFa?: string;
  totalFound: number;
  topRecommendationId: string;
  topMetricType?: 'stars' | 'downloads' | 'runs';
  topMetricValue?: number;
  criteriaBreakdown: {
    relevance: string;
    licenseSafety: string;
    communityValidation: string;
    engineeringReadiness: string;
  };
  suggestedRelatedQueries: string[];
  marketTips: string[];
}

export interface SourceQueryResult {
  source: PlatformSource;
  count: number;
  status: 'success' | 'rate_limited' | 'fallback' | 'auth_required' | 'degraded' | 'error';
  latencyMs?: number;
  errorMessage?: string;
}

export interface SearchResponseData {
  success: boolean;
  pipelineStatus?: 'success' | 'partial' | 'upstream_failure';
  requestId: string;
  query: string;
  expandedKeywords: string[];
  summary: SearchAgentSummary;
  results: DatasetItem[];
  sourcesQueried: SourceQueryResult[];
  retrievalMetadata?: {
    totalEvaluated: number;
    deduplicatedCount: number;
    detectedIntent: 'dataset' | 'repository' | 'mixed';
    pipelineLatencyMs: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    source?: string;
    retryable: boolean;
  };
  requestId: string;
}

export interface SearchFilters {
  itemType: 'all' | 'dataset' | 'code_repository';
  platform: 'all' | PlatformSource;
  modality: 'all' | ModalityType;
  license: 'all' | 'commercial_friendly' | 'non_commercial';
  language: 'all' | 'persian' | 'english' | 'multilingual';
  sortBy: 'ai_score' | 'popularity' | 'recent';
  minScore: number;
}

export interface BenchmarkQuery {
  id: string;
  query: string;
  category: string;
  expectedModality: ModalityType;
  exactIds?: string[];            // Exact canonical IDs e.g. ["github:huggingface/transformers"]
  acceptableIds?: string[];       // Permitted high-relevance variants e.g. ["huggingface:transformers"]
  aliases?: string[];            // Clean entity aliases e.g. ["transformers"]
  forbiddenPatterns?: string[];  // e.g. ["metadata", "stats", "synthetic", "test-"]
  matchMode?: 'canonical_id' | 'strict_entity' | 'semantic';
  groundTruthIds: string[];      // Ground truth identifier list
  intent?: 'dataset' | 'repository' | 'mixed';
  description: string;
  notes?: string;
}

export interface BenchmarkMetricResult {
  queryId: string;
  query: string;
  category: string;
  precisionAt5: number;
  recallAt10: number;
  mrr: number; // Mean Reciprocal Rank
  exactMatchSuccess: boolean;
  querySuccess: boolean;
  emptyResult: boolean;
  returnedCount: number;
  datasetCount: number;
  repoCount: number;
  matchedGroundTruth: string[];
  forbiddenHits?: string[];
  latencyMs: number;
  topResultTitle?: string;
  topResultId?: string;
  sourceErrors?: Record<string, string>;
  status: 'passed' | 'partial' | 'failed';
}

export interface BenchmarkSuiteSummary {
  totalQueries: number;
  evaluatedCount: number;
  meanPrecisionAt5: number;
  meanRecallAt10: number;
  meanMRR: number;
  exactMatchSuccessRate: number;
  querySuccessRate: number;
  emptyResultRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  passedCount: number;
  partialCount: number;
  failedCount: number;
  evaluatedAt: string;
  appVersion: string;
  categoryMetrics: Record<string, {
    count: number;
    meanP5: number;
    meanR10: number;
    meanMRR: number;
  }>;
  itemTypeMetrics: {
    datasetsFound: number;
    reposFound: number;
  };
  queryResults: BenchmarkMetricResult[];
}

export interface ConnectorHealthReport {
  huggingface: { status: SourceHealthStatus; message: string; latencyMs?: number };
  github: { status: SourceHealthStatus; message: string; latencyMs?: number };
  openml: { status: SourceHealthStatus; message: string; latencyMs?: number };
  kaggle: { status: SourceHealthStatus; message: string; latencyMs?: number };
}
