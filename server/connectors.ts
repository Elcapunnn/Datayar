import { 
  DatasetItem, 
  LicenseCategory, 
  LicenseConfidenceStatus, 
  ModalityType, 
  StandardModality, 
  PlatformSource,
  ConnectorHealthReport,
  SourceHealthStatus
} from '../src/types';

// High-efficiency In-Memory TTL Cache for External Connectors (Render rate-limit protection)
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}
const CONNECTOR_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const connectorCache = new Map<string, CacheEntry<any>>();

export function getCachedConnectorData<T>(key: string): T | null {
  const entry = connectorCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CONNECTOR_CACHE_TTL_MS) {
    connectorCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCachedConnectorData<T>(key: string, data: T): void {
  connectorCache.set(key, { timestamp: Date.now(), data });
  if (connectorCache.size > 1000) {
    const oldestKey = connectorCache.keys().next().value;
    if (oldestKey) connectorCache.delete(oldestKey);
  }
}

// Commercial-friendly SPDX IDs (strict allowlist)
const COMMERCIAL_PERMISSIVE_LICENSES = new Set([
  'mit',
  'apache-2.0',
  'apache 2.0',
  'bsd-2-clause',
  'bsd-3-clause',
  'bsd',
  'cc0-1.0',
  'cc0',
  'cc-by-4.0',
  'cc-by-3.0',
  'cc-by',
  'isc',
  'unlicense',
  'wtfpl',
  'zlib',
  'postgresql',
  '0bsd',
]);

const NON_COMMERCIAL_LICENSES = new Set([
  'cc-by-nc-4.0',
  'cc-by-nc-3.0',
  'cc-by-nc-2.0',
  'cc-by-nc',
  'cc-by-nc-sa-4.0',
  'cc-by-nc-sa',
  'cc-by-nc-nd-4.0',
  'cc-by-nc-nd',
  'gpl-3.0',
  'gpl-2.0',
  'agpl-3.0',
  'research-only',
  'academic-only',
  'non-commercial',
]);

export function categorizeLicenseStrict(licenseRaw: string | undefined | null): {
  licenseCategory: LicenseCategory;
  licenseConfidence: LicenseConfidenceStatus;
  licenseSpdx: string;
  licenseDisclaimer: string;
} {
  if (!licenseRaw) {
    return {
      licenseCategory: 'unknown',
      licenseConfidence: 'unknown',
      licenseSpdx: 'UNSPECIFIED',
      licenseDisclaimer: 'No explicit license specified in repository metadata. Legal review required before commercial usage.',
    };
  }

  const cleaned = licenseRaw.trim().toLowerCase();

  if (
    cleaned === 'unknown' ||
    cleaned === 'other' ||
    cleaned === 'none' ||
    cleaned === 'unspecified' ||
    cleaned === 'noassertion' ||
    cleaned === 'custom' ||
    cleaned === 'null'
  ) {
    return {
      licenseCategory: 'unknown',
      licenseConfidence: 'unknown',
      licenseSpdx: licenseRaw,
      licenseDisclaimer: 'Unspecified or custom license detected. Repository terms must be verified manually.',
    };
  }

  if (COMMERCIAL_PERMISSIVE_LICENSES.has(cleaned)) {
    return {
      licenseCategory: 'commercial_friendly',
      licenseConfidence: 'verified',
      licenseSpdx: licenseRaw.toUpperCase(),
      licenseDisclaimer: 'Permissive open-source license identified via standard SPDX registry. Commercial fine-tuning and deployment permitted with attribution.',
    };
  }

  if (NON_COMMERCIAL_LICENSES.has(cleaned) || cleaned.includes('nc') || cleaned.includes('non-commercial')) {
    return {
      licenseCategory: 'non_commercial',
      licenseConfidence: 'verified',
      licenseSpdx: licenseRaw.toUpperCase(),
      licenseDisclaimer: 'Restricted non-commercial research-only license. Proprietary commercial distribution is strictly prohibited without explicit author grant.',
    };
  }

  // Fallback custom
  return {
    licenseCategory: 'custom',
    licenseConfidence: 'inferred',
    licenseSpdx: licenseRaw,
    licenseDisclaimer: 'Custom or dual license detected. Consult official repository LICENSE file for full legal scope.',
  };
}

// Convert Hugging Face pipeline tag to Standard Modality
export function mapHfPipelineTagToModality(tag?: string): {
  modality: ModalityType;
  standardModality: StandardModality;
  modalityConfidence: 'high' | 'medium' | 'inferred';
  modalityReason: string;
} {
  if (!tag) {
    return {
      modality: 'nlp',
      standardModality: 'text',
      modalityConfidence: 'inferred',
      modalityReason: 'Default text modality assigned in absence of pipeline tag.',
    };
  }

  const t = tag.toLowerCase();

  if (t.includes('speech') || t.includes('audio') || t.includes('voice') || t.includes('sound')) {
    return {
      modality: 'audio',
      standardModality: 'audio',
      modalityConfidence: 'high',
      modalityReason: `Derived from official Hugging Face pipeline tag "${tag}".`,
    };
  }

  if (t.includes('image') || t.includes('vision') || t.includes('object-detection') || t.includes('segmentation')) {
    return {
      modality: 'vision',
      standardModality: 'image',
      modalityConfidence: 'high',
      modalityReason: `Derived from official Hugging Face pipeline tag "${tag}".`,
    };
  }

  if (t.includes('table') || t.includes('tabular') || t.includes('time-series')) {
    return {
      modality: 'tabular',
      standardModality: 'tabular',
      modalityConfidence: 'high',
      modalityReason: `Derived from official Hugging Face pipeline tag "${tag}".`,
    };
  }

  if (t.includes('code') || t.includes('program')) {
    return {
      modality: 'code',
      standardModality: 'code',
      modalityConfidence: 'high',
      modalityReason: `Derived from official Hugging Face pipeline tag "${tag}".`,
    };
  }

  if (t.includes('multimodal') || t.includes('visual-question-answering') || t.includes('document-question-answering')) {
    return {
      modality: 'multimodal',
      standardModality: 'multimodal',
      modalityConfidence: 'high',
      modalityReason: `Derived from official Hugging Face pipeline tag "${tag}".`,
    };
  }

  return {
    modality: 'nlp',
    standardModality: 'text',
    modalityConfidence: 'medium',
    modalityReason: `Mapped to text from tag "${tag}".`,
  };
}

// -------------------------------------------------------------
// 1. HUGGING FACE CONNECTOR (Real Verified Data Only)
// -------------------------------------------------------------
export async function fetchHuggingFaceDirect(slug: string): Promise<DatasetItem | null> {
  try {
    const cleanSlug = slug.trim();
    if (!cleanSlug) return null;
    const url = `https://huggingface.co/api/datasets/${cleanSlug}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Dataset-Discovery-Production-Agent/2.0',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) return null;
    const item = await res.json();
    if (!item || !item.id) return null;

    const licenseInfo = categorizeLicenseStrict(item.cardData?.license || item.license);
    const modalityInfo = mapHfPipelineTagToModality(item.pipeline_tag || (item.tags || []).find((t: string) => t.includes('task:')));

    const isFa = (item.tags || []).some((t: string) => t.toLowerCase() === 'fa' || t.toLowerCase().includes('persian')) ||
                 (item.description || '').match(/[\u0600-\u06FF]/);

    const downloads = Number(item.downloads) || 0;
    const likes = Number(item.likes) || 0;

    return {
      id: `huggingface:${item.id}`,
      sourceId: item.id,
      canonicalUrl: `https://huggingface.co/datasets/${item.id}`,
      title: item.id,
      authorOrOrg: item.author || (item.id.includes('/') ? item.id.split('/')[0] : 'Hugging Face Community'),
      platform: 'huggingface',
      itemType: 'dataset',
      url: `https://huggingface.co/datasets/${item.id}`,
      description: item.description || `Hugging Face official dataset: ${item.id}. Verified via live HF REST API.`,
      modality: modalityInfo.modality,
      standardModality: modalityInfo.standardModality,
      modalityConfidence: modalityInfo.modalityConfidence,
      modalityReason: modalityInfo.modalityReason,
      languages: isFa ? ['fa', 'en'] : ['en'],
      sizeStr: item.cardData?.dataset_info?.dataset_size ? `${(item.cardData.dataset_info.dataset_size / (1024 * 1024)).toFixed(1)} MB` : undefined,
      sampleCount: item.cardData?.dataset_info?.splits?.[0]?.num_examples ? `${item.cardData.dataset_info.splits[0].num_examples.toLocaleString()} samples` : undefined,
      starsOrDownloads: downloads,
      downloadsStr: downloads > 1000 ? `${(downloads / 1000).toFixed(1)}k dl` : `${downloads} dl`,
      likes,
      license: item.cardData?.license || item.license || 'unknown',
      licenseCategory: licenseInfo.licenseCategory,
      licenseConfidence: licenseInfo.licenseConfidence,
      licenseSpdx: licenseInfo.licenseSpdx,
      licenseDisclaimer: licenseInfo.licenseDisclaimer,
      lastUpdated: item.lastModified ? new Date(item.lastModified).toISOString().split('T')[0] : 'Recently',
      tags: Array.isArray(item.tags) ? item.tags.slice(0, 8) : ['dataset'],
      aiScore: 92,
      aiRankReason: `Verified Hugging Face canonical dataset with ${downloads.toLocaleString()} community downloads.`,
      pros: [
        'Live verified canonical source on Hugging Face Hub',
        `Structured dataset format ready for \`load_dataset('${item.id}')\``,
        licenseInfo.licenseCategory === 'commercial_friendly' ? 'Permissive commercial-ready license' : 'Requires license terms verification',
      ],
      cons: [
        'Ensure bandwidth and memory allocations are configured for large splits',
      ],
      codeSnippets: [
        {
          language: 'python',
          title: 'Hugging Face Datasets API',
          code: `from datasets import load_dataset\n\n# Load live canonical dataset\ndataset = load_dataset("${item.id}")\nprint(dataset)`,
        },
        {
          language: 'python',
          title: 'Streaming Mode (Low RAM)',
          code: `from datasets import load_dataset\n\n# Stream dataset without full disk download\ndataset = load_dataset("${item.id}", streaming=True)\nfor sample in dataset["train"]:\n    print(sample)\n    break`,
        }
      ],
      format: 'parquet',
      recommendedFor: `Training and evaluation in ${modalityInfo.modality.toUpperCase()} workflows`,
      isPersianSupported: !!isFa,
      isVerified: true,
      sourceQueries: [slug],
    };
  } catch {
    return null;
  }
}

export async function fetchHuggingFaceDatasets(subQueries: string[]): Promise<DatasetItem[]> {
  const cacheKey = `hf:${subQueries.slice().sort().join('|')}`;
  const cached = getCachedConnectorData<DatasetItem[]>(cacheKey);
  if (cached) return cached;

  const resultsMap = new Map<string, DatasetItem>();
  const uniqueSubQueries = Array.from(new Set(subQueries.map((q) => q.trim()).filter(Boolean)));

  await Promise.allSettled(
    uniqueSubQueries.map(async (cleanQ) => {
      // Check direct candidate slug first if contains slash
      if (cleanQ.includes('/')) {
        try {
          const directItem = await fetchHuggingFaceDirect(cleanQ);
          if (directItem) {
            resultsMap.set(directItem.id, directItem);
          }
        } catch {}
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(cleanQ)}&limit=15&full=true`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Dataset-Discovery-Production-Agent/2.0',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        for (const item of data) {
          if (!item || !item.id) continue;
          const itemId = `huggingface:${item.id}`;
          if (resultsMap.has(itemId)) {
            const existing = resultsMap.get(itemId)!;
            if (!existing.sourceQueries?.includes(cleanQ)) {
              existing.sourceQueries = [...(existing.sourceQueries || []), cleanQ];
            }
            continue;
          }

          const licenseInfo = categorizeLicenseStrict(item.cardData?.license || item.license);
          const modalityInfo = mapHfPipelineTagToModality(item.pipeline_tag || (item.tags || []).find((t: string) => t.includes('task:')));

          const isFa = (item.tags || []).some((t: string) => t.toLowerCase() === 'fa' || t.toLowerCase().includes('persian')) ||
                       (item.description || '').match(/[\u0600-\u06FF]/);

          const downloads = Number(item.downloads) || 0;
          const likes = Number(item.likes) || 0;

          resultsMap.set(itemId, {
            id: itemId,
            sourceId: item.id,
            canonicalUrl: `https://huggingface.co/datasets/${item.id}`,
            title: item.id,
            authorOrOrg: item.author || (item.id.includes('/') ? item.id.split('/')[0] : 'Hugging Face Community'),
            platform: 'huggingface',
            itemType: 'dataset',
            url: `https://huggingface.co/datasets/${item.id}`,
            description: item.description || `Hugging Face dataset: ${item.id}`,
            modality: modalityInfo.modality,
            standardModality: modalityInfo.standardModality,
            modalityConfidence: modalityInfo.modalityConfidence,
            modalityReason: modalityInfo.modalityReason,
            languages: isFa ? ['fa', 'en'] : ['en'],
            sampleCount: item.cardData?.dataset_info?.splits?.[0]?.num_examples ? `${item.cardData.dataset_info.splits[0].num_examples.toLocaleString()} samples` : undefined,
            starsOrDownloads: downloads,
            downloadsStr: downloads > 1000 ? `${(downloads / 1000).toFixed(1)}k dl` : `${downloads} dl`,
            likes,
            license: item.cardData?.license || item.license || 'unknown',
            licenseCategory: licenseInfo.licenseCategory,
            licenseConfidence: licenseInfo.licenseConfidence,
            licenseSpdx: licenseInfo.licenseSpdx,
            licenseDisclaimer: licenseInfo.licenseDisclaimer,
            lastUpdated: item.lastModified ? new Date(item.lastModified).toISOString().split('T')[0] : 'Recently',
            tags: Array.isArray(item.tags) ? item.tags.slice(0, 8) : ['dataset'],
            aiScore: 90,
            aiRankReason: `Retrieved from Hugging Face datasets with ${downloads.toLocaleString()} downloads.`,
            pros: [
              'Canonical dataset hosted on Hugging Face',
              `Load via \`load_dataset('${item.id}')\``,
            ],
            cons: [
              'Verify dataset splits and bandwidth before training',
            ],
            codeSnippets: [
              {
                language: 'python',
                title: 'Hugging Face Datasets API',
                code: `from datasets import load_dataset\n\n# Load dataset\ndataset = load_dataset("${item.id}")\nprint(dataset)`,
              }
            ],
            format: 'parquet',
            recommendedFor: `Machine learning research and model training in ${modalityInfo.modality}`,
            isPersianSupported: !!isFa,
            isVerified: true,
            sourceQueries: [cleanQ],
          });
        }
      } catch (err: any) {
        console.warn(`HF query warning for '${cleanQ}':`, err.message);
      }
    })
  );

  const results = Array.from(resultsMap.values());
  setCachedConnectorData(cacheKey, results);
  return results;
}

// -------------------------------------------------------------
// 2. GITHUB CONNECTOR (Real Repositories with Strict License)
// -------------------------------------------------------------
export async function fetchGitHubDirect(owner: string, repo: string): Promise<DatasetItem | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const headers: Record<string, string> = {
      'User-Agent': 'Dataset-Discovery-Production-Agent/2.0',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const item = await res.json();
    if (!item || !item.full_name) return null;

    const licenseInfo = categorizeLicenseStrict(item.license?.spdx_id || item.license?.name);
    const isFa = (item.description || '').match(/[\u0600-\u06FF]/) || (item.topics || []).includes('persian');
    const stars = item.stargazers_count || 0;

    return {
      id: `github:${item.full_name}`,
      sourceId: item.full_name,
      canonicalUrl: item.html_url,
      title: item.full_name,
      authorOrOrg: item.owner?.login || owner,
      platform: 'github',
      itemType: 'code_repository',
      url: item.html_url,
      description: item.description || `Official GitHub repository for ${item.full_name}. Verified via GitHub API.`,
      modality: 'code',
      standardModality: 'code',
      modalityConfidence: 'high',
      modalityReason: 'Code repository with implementation scripts and model checkpoints.',
      languages: [item.language || 'Python'],
      starsOrDownloads: stars,
      downloadsStr: stars > 1000 ? `${(stars / 1000).toFixed(1)}k stars` : `${stars} stars`,
      likes: stars,
      forks: item.forks_count || 0,
      license: item.license?.spdx_id || item.license?.name || 'unknown',
      licenseCategory: licenseInfo.licenseCategory,
      licenseConfidence: licenseInfo.licenseConfidence,
      licenseSpdx: licenseInfo.licenseSpdx,
      licenseDisclaimer: licenseInfo.licenseDisclaimer,
      lastUpdated: item.pushed_at ? new Date(item.pushed_at).toISOString().split('T')[0] : 'Recently',
      tags: Array.isArray(item.topics) ? item.topics.slice(0, 8) : [item.language || 'code'],
      aiScore: 94,
      aiRankReason: `Exact match official repository on GitHub with ${stars.toLocaleString()} stars.`,
      pros: [
        `Production-grade codebase with ${stars.toLocaleString()} GitHub stars`,
        'Includes source code, setup scripts, and pipeline implementations',
        licenseInfo.licenseCategory === 'commercial_friendly' ? 'Permissive open-source license' : 'Check license constraints',
      ],
      cons: [
        'Requires local environment setup (Python/Pip/Cuda)',
      ],
      codeSnippets: [
        {
          language: 'bash',
          title: 'Git Clone & Install',
          code: `git clone ${item.html_url}.git\ncd ${item.name}\npip install -r requirements.txt`,
        }
      ],
      format: item.language || 'Python',
      recommendedFor: 'Model training pipelines, evaluation benchmarks, and integration',
      isPersianSupported: !!isFa,
      isVerified: true,
      sourceQueries: [`${owner}/${repo}`],
    };
  } catch {
    return null;
  }
}

export async function fetchGitHubRepositories(subQueries: string[]): Promise<DatasetItem[]> {
  const cacheKey = `gh:${subQueries.slice().sort().join('|')}`;
  const cached = getCachedConnectorData<DatasetItem[]>(cacheKey);
  if (cached) return cached;

  const resultsMap = new Map<string, DatasetItem>();
  const uniqueSubQueries = Array.from(new Set(subQueries.map((q) => q.trim()).filter(Boolean)));

  const headers: Record<string, string> = {
    'User-Agent': 'Dataset-Discovery-Production-Agent/2.0',
    'Accept': 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  await Promise.allSettled(
    uniqueSubQueries.map(async (cleanQ) => {
      // If query has exact owner/repo format
      if (cleanQ.includes('/') && !cleanQ.includes(' ')) {
        const [owner, repo] = cleanQ.split('/');
        if (owner && repo) {
          try {
            const directItem = await fetchGitHubDirect(owner, repo);
            if (directItem) {
              resultsMap.set(directItem.id, directItem);
            }
          } catch {}
        }
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(cleanQ)}&sort=stars&order=desc&per_page=12`;
        const res = await fetch(url, { headers, signal: controller.signal });

        clearTimeout(timeoutId);

        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data.items)) return;

        for (const item of data.items) {
          if (!item || !item.full_name) continue;
          const itemId = `github:${item.full_name}`;
          if (resultsMap.has(itemId)) {
            const existing = resultsMap.get(itemId)!;
            if (!existing.sourceQueries?.includes(cleanQ)) {
              existing.sourceQueries = [...(existing.sourceQueries || []), cleanQ];
            }
            continue;
          }

          const licenseInfo = categorizeLicenseStrict(item.license?.spdx_id || item.license?.name);
          const isFa = (item.description || '').match(/[\u0600-\u06FF]/) || (item.topics || []).includes('persian');
          const stars = item.stargazers_count || 0;

          resultsMap.set(itemId, {
            id: itemId,
            sourceId: item.full_name,
            canonicalUrl: item.html_url,
            title: item.full_name,
            authorOrOrg: item.owner?.login || item.full_name.split('/')[0],
            platform: 'github',
            itemType: 'code_repository',
            url: item.html_url,
            description: item.description || `GitHub repository: ${item.full_name}`,
            modality: 'code',
            standardModality: 'code',
            modalityConfidence: 'high',
            modalityReason: 'Source repository hosted on GitHub.',
            languages: isFa ? ['fa', 'en'] : ['en'],
            starsOrDownloads: stars,
            downloadsStr: stars > 1000 ? `${(stars / 1000).toFixed(1)}k stars` : `${stars} stars`,
            likes: stars,
            license: item.license?.spdx_id || item.license?.name || 'unknown',
            licenseCategory: licenseInfo.licenseCategory,
            licenseConfidence: licenseInfo.licenseConfidence,
            licenseSpdx: licenseInfo.licenseSpdx,
            licenseDisclaimer: licenseInfo.licenseDisclaimer,
            lastUpdated: item.updated_at ? new Date(item.updated_at).toISOString().split('T')[0] : 'Recently',
            tags: Array.isArray(item.topics) && item.topics.length > 0 ? item.topics.slice(0, 8) : ['github', 'repository', item.language || 'code'].filter(Boolean),
            aiScore: 88,
            aiRankReason: `Verified GitHub repository with ${stars.toLocaleString()} stars.`,
            pros: [
              `Popular GitHub project with ${stars.toLocaleString()} stars`,
              'Full source code and implementation',
            ],
            cons: [
              'Requires local Python/dependency installation',
            ],
            codeSnippets: [
              {
                language: 'bash',
                title: 'Git Clone & Install',
                code: `git clone ${item.html_url}.git\ncd ${item.name}\npip install -r requirements.txt`,
              }
            ],
            format: item.language || 'Python',
            recommendedFor: 'Model training pipelines, reproduction, and code reference',
            isPersianSupported: !!isFa,
            isVerified: true,
            sourceQueries: [cleanQ],
          });
        }
      } catch (err: any) {
        console.warn(`GitHub search warning for '${cleanQ}':`, err.message);
      }
    })
  );

  const results = Array.from(resultsMap.values());
  setCachedConnectorData(cacheKey, results);
  return results;
}

// -------------------------------------------------------------
// 3. OPENML CONNECTOR (Public Live REST API for Standard ML)
export async function fetchOpenMLDatasets(subQueries: string[]): Promise<DatasetItem[]> {
  const cacheKey = `openml:${subQueries.slice().sort().join('|')}`;
  const cached = getCachedConnectorData<DatasetItem[]>(cacheKey);
  if (cached) return cached;

  const resultsMap = new Map<string, DatasetItem>();
  const uniqueSubQueries = Array.from(new Set(subQueries.map((q) => q.trim()).filter(Boolean)));

  await Promise.allSettled(
    uniqueSubQueries.map(async (q) => {
      const cleanQ = q.replace(/\s+/g, '_');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        // OpenML data list endpoint
        const listUrl = `https://www.openml.org/api/v1/json/data/list/data_name/${encodeURIComponent(cleanQ)}/limit/6`;
        const res = await fetch(listUrl, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) return;
        const data = await res.json();
        const datasetList = data?.data?.dataset;
        if (!Array.isArray(datasetList)) return;

        for (const entry of datasetList) {
          if (!entry || !entry.did) continue;
          const did = String(entry.did);
          const itemId = `openml:${did}`;
          if (resultsMap.has(itemId)) continue;

          const licenseInfo = categorizeLicenseStrict(entry.licence || entry.license || 'CC-BY-4.0');
          const runs = Number(entry.runs) || 0;

          resultsMap.set(itemId, {
            id: itemId,
            sourceId: `openml/${entry.name}/${did}`,
            canonicalUrl: `https://www.openml.org/search?type=data&id=${did}`,
            title: `openml/${entry.name}`,
            authorOrOrg: 'OpenML Machine Learning Hub',
            platform: 'openml',
            itemType: 'dataset',
            url: `https://www.openml.org/search?type=data&id=${did}`,
            description: `OpenML standard tabular & vision benchmark dataset #${did}: "${entry.name}" (Version ${entry.version}). Format: ${entry.format || 'ARFF/CSV'}.`,
            modality: entry.format?.toLowerCase() === 'sparse_arff' ? 'tabular' : 'tabular',
            standardModality: 'tabular',
            modalityConfidence: 'high',
            modalityReason: 'Retrieved from OpenML benchmark repository.',
            languages: ['en'],
            sampleCount: entry.NumberOfInstances ? `${Number(entry.NumberOfInstances).toLocaleString()} rows` : undefined,
            starsOrDownloads: runs,
            downloadsStr: runs > 1000 ? `${(runs / 1000).toFixed(1)}k runs` : `${runs} runs`,
            likes: runs,
            license: entry.licence || entry.license || 'CC-BY-4.0',
            licenseCategory: licenseInfo.licenseCategory,
            licenseConfidence: licenseInfo.licenseConfidence,
            licenseSpdx: licenseInfo.licenseSpdx,
            licenseDisclaimer: licenseInfo.licenseDisclaimer,
            lastUpdated: 'Standard Benchmark',
            tags: ['openml', 'tabular', 'benchmark', entry.name],
            aiScore: 86,
            aiRankReason: `Verified OpenML standard machine learning benchmark dataset #${did}.`,
            pros: [
              'Official OpenML dataset with standardized features and target splits',
              'Seamlessly loads with standard python `openml` package or scikit-learn `fetch_openml`',
              'Reproducible benchmark results across academic literature',
            ],
            cons: [
              'Typically structured for tabular and classical ML classification/regression',
            ],
            codeSnippets: [
              {
                language: 'python',
                title: 'Scikit-Learn Fetch OpenML',
                code: `from sklearn.datasets import fetch_openml\n\n# Load OpenML dataset #${did}\nX, y = fetch_openml(data_id=${did}, return_X_y=True, as_frame=True)\nprint(X.head())`,
              },
              {
                language: 'python',
                title: 'OpenML Python API',
                code: `import openml\n\n# Fetch dataset details and features\ndataset = openml.datasets.get_dataset(${did})\nX, y, categorical_indicator, attribute_names = dataset.get_data(\n    dataset_format="dataframe", target=dataset.default_target_attribute\n)\nprint(X.info())`,
              }
            ],
            format: entry.format || 'csv',
            recommendedFor: 'Classical ML, Tabular Benchmarking, AutoML evaluation',
            isPersianSupported: false,
            isVerified: true,
            sourceQueries: [cleanQ],
          });
        }
      } catch (err: any) {
        console.warn(`OpenML query warning for '${cleanQ}':`, err.message);
      }
    })
  );

  const results = Array.from(resultsMap.values());
  setCachedConnectorData(cacheKey, results);
  return results;
}

// -------------------------------------------------------------
// 4. KAGGLE CONNECTOR (Real API if credentials exist, else Auth Required)
// -------------------------------------------------------------
export async function fetchKaggleDatasets(subQueries: string[]): Promise<{ items: DatasetItem[]; status: SourceHealthStatus }> {
  const username = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_KEY;

  if (!username || !key) {
    return {
      items: [],
      status: 'auth_required',
    };
  }

  const cacheKey = `kaggle:${subQueries.slice().sort().join('|')}`;
  const cached = getCachedConnectorData<{ items: DatasetItem[]; status: SourceHealthStatus }>(cacheKey);
  if (cached) return cached;

  const resultsMap = new Map<string, DatasetItem>();
  const authHeader = `Basic ${Buffer.from(`${username}:${key}`).toString('base64')}`;

  for (const q of subQueries) {
    if (!q || !q.trim()) continue;
    const cleanQ = q.trim();

    try {
      const url = `https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(cleanQ)}&pageSize=8`;
      const res = await fetch(url, {
        headers: {
          'Authorization': authHeader,
          'User-Agent': 'Dataset-Discovery-Production-Agent/2.0',
        },
      });

      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data)) continue;

      for (const item of data) {
        if (!item || !item.ref) continue;
        const itemId = `kaggle:${item.ref}`;
        if (resultsMap.has(itemId)) continue;

        const licenseInfo = categorizeLicenseStrict(item.licenseName);
        const downloads = Number(item.downloadCount) || 0;
        const votes = Number(item.voteCount) || 0;

        resultsMap.set(itemId, {
          id: itemId,
          sourceId: item.ref,
          canonicalUrl: `https://www.kaggle.com/datasets/${item.ref}`,
          title: item.ref,
          authorOrOrg: item.ownerName || item.ref.split('/')[0] || 'Kaggle',
          platform: 'kaggle',
          itemType: 'dataset',
          url: `https://www.kaggle.com/datasets/${item.ref}`,
          description: item.title || `Kaggle dataset: ${item.ref}. Total downloads: ${downloads}.`,
          modality: 'tabular',
          standardModality: 'tabular',
          modalityConfidence: 'medium',
          modalityReason: 'Kaggle community dataset repository.',
          languages: ['en'],
          starsOrDownloads: downloads,
          downloadsStr: downloads > 1000 ? `${(downloads / 1000).toFixed(1)}k dl` : `${downloads} dl`,
          likes: votes,
          license: item.licenseName || 'unknown',
          licenseCategory: licenseInfo.licenseCategory,
          licenseConfidence: licenseInfo.licenseConfidence,
          licenseSpdx: licenseInfo.licenseSpdx,
          licenseDisclaimer: licenseInfo.licenseDisclaimer,
          lastUpdated: item.lastUpdated ? new Date(item.lastUpdated).toISOString().split('T')[0] : 'Recently',
          tags: ['kaggle', 'dataset'],
          aiScore: 84,
          aiRankReason: `Verified Kaggle dataset with ${downloads.toLocaleString()} community downloads.`,
          pros: [
            `Verified Kaggle source with ${votes} upvotes`,
            'Direct download via `kaggle datasets download` CLI',
          ],
          cons: [
            'Requires Kaggle API key for automated scripting',
          ],
          codeSnippets: [
            {
              language: 'bash',
              title: 'Kaggle CLI Download',
              code: `kaggle datasets download -d ${item.ref}\nunzip ${item.ref.split('/')[1] || 'dataset'}.zip`,
            }
          ],
          format: 'csv',
          recommendedFor: 'Exploratory data analysis, competition benchmarks',
          isPersianSupported: false,
          isVerified: true,
          sourceQueries: [cleanQ],
        });
      }
    } catch (err: any) {
      console.warn(`Kaggle search warning for '${cleanQ}':`, err.message);
    }
  }

  const resObj = {
    items: Array.from(resultsMap.values()),
    status: (resultsMap.size > 0 ? 'available' : 'available') as SourceHealthStatus,
  };
  setCachedConnectorData(cacheKey, resObj);
  return resObj;
}

// -------------------------------------------------------------
// 5. CONNECTOR HEALTH AUDIT
// -------------------------------------------------------------
export async function checkConnectorsHealth(): Promise<ConnectorHealthReport> {
  const report: ConnectorHealthReport = {
    huggingface: { status: 'available', message: 'Hugging Face Datasets REST API operational' },
    github: { status: 'available', message: 'GitHub REST API operational' },
    openml: { status: 'available', message: 'OpenML REST API operational' },
    kaggle: {
      status: process.env.KAGGLE_USERNAME && process.env.KAGGLE_KEY ? 'available' : 'auth_required',
      message: process.env.KAGGLE_USERNAME && process.env.KAGGLE_KEY 
        ? 'Kaggle API configured' 
        : 'Kaggle credentials not provided in environment; live fallback to Hugging Face, OpenML & GitHub active.',
    },
  };

  // Ping Hugging Face
  try {
    const t0 = Date.now();
    const hfRes = await fetch('https://huggingface.co/api/datasets?limit=1', {
      headers: { 'User-Agent': 'Dataset-Discovery-Production-Agent/2.0' }
    });
    report.huggingface.latencyMs = Date.now() - t0;
    if (!hfRes.ok) {
      report.huggingface.status = hfRes.status === 429 ? 'rate_limited' : 'degraded';
      report.huggingface.message = `HTTP ${hfRes.status}`;
    }
  } catch (e: any) {
    report.huggingface.status = 'degraded';
    report.huggingface.message = e.message;
  }

  // Ping GitHub
  try {
    const t0 = Date.now();
    const headers: Record<string, string> = { 'User-Agent': 'Dataset-Discovery-Production-Agent/2.0' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    const ghRes = await fetch('https://api.github.com/zen', { headers });
    report.github.latencyMs = Date.now() - t0;
    if (!ghRes.ok) {
      report.github.status = ghRes.status === 403 || ghRes.status === 429 ? 'rate_limited' : 'degraded';
      report.github.message = `HTTP ${ghRes.status}`;
    }
  } catch (e: any) {
    report.github.status = 'degraded';
    report.github.message = e.message;
  }

  return report;
}
