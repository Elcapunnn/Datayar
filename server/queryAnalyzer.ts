import { StandardModality } from '../src/types';

export interface AnalyzedQuery {
  rawQuery: string;
  normalizedQuery: string;
  detectedIntent: 'dataset' | 'repository' | 'mixed';
  extractedKeywords: string[];
  exactCandidates: string[];
  resolvedCanonicalIds: string[];
  hfSubQueries: string[];
  ghSubQueries: string[];
  openmlSubQueries: string[];
  medicalEntities: string[];
  persianEntities: string[];
  detectedModality: StandardModality;
  isPersianQuery: boolean;
  targetLanguages: string[];
}

// Authoritative Canonical Mapping & Direct Entity Resolution for ML Benchmarks
export const KNOWN_DATASET_MAPPINGS: Record<string, {
  canonicalIds: string[];
  hf?: string[];
  gh?: string[];
  openml?: string[];
  modality: StandardModality;
  category?: string;
  languages?: string[];
}> = {
  'squad': {
    canonicalIds: ['huggingface:rajpurkar/squad', 'huggingface:squad', 'huggingface:squad_v2'],
    hf: ['rajpurkar/squad', 'squad', 'squad_v2'],
    gh: ['huggingface/transformers'],
    modality: 'text',
  },
  'squad reading comprehension': {
    canonicalIds: ['huggingface:rajpurkar/squad', 'huggingface:squad'],
    hf: ['rajpurkar/squad', 'squad'],
    gh: ['huggingface/transformers'],
    modality: 'text',
  },
  'imdb': {
    canonicalIds: ['huggingface:stanfordnlp/imdb', 'huggingface:imdb'],
    hf: ['stanfordnlp/imdb', 'imdb'],
    gh: ['huggingface/transformers'],
    modality: 'text',
  },
  'glue': {
    canonicalIds: ['huggingface:nyu-mll/glue', 'huggingface:glue'],
    hf: ['nyu-mll/glue', 'glue'],
    gh: ['huggingface/transformers'],
    modality: 'text',
  },
  'gsm8k': {
    canonicalIds: ['huggingface:openai/gsm8k', 'huggingface:gsm8k'],
    hf: ['openai/gsm8k', 'gsm8k'],
    gh: ['openai/grade-school-math'],
    modality: 'text',
  },
  'mmlu': {
    canonicalIds: ['huggingface:cais/mmlu', 'huggingface:mmlu'],
    hf: ['cais/mmlu', 'mmlu'],
    gh: ['hendrycks/test'],
    modality: 'text',
  },
  'yolov8': {
    canonicalIds: ['github:ultralytics/ultralytics', 'huggingface:ultralytics/yolov8'],
    hf: ['ultralytics/yolov8', 'keremberke/yolov8-object-detection'],
    gh: ['ultralytics/ultralytics', 'ultralytics/yolov5'],
    modality: 'code',
  },
  'yolo': {
    canonicalIds: ['github:ultralytics/ultralytics', 'github:AlexeyAB/darknet'],
    hf: ['ultralytics/yolov8'],
    gh: ['ultralytics/ultralytics', 'AlexeyAB/darknet'],
    modality: 'code',
  },
  'sentiment': {
    canonicalIds: ['huggingface:stanfordnlp/imdb', 'huggingface:tweet_eval'],
    hf: ['imdb', 'tweet_eval', 'sentiment140'],
    gh: ['nltk/nltk', 'huggingface/transformers'],
    modality: 'text',
  },
  'sentiment analysis': {
    canonicalIds: ['huggingface:stanfordnlp/imdb', 'huggingface:tweet_eval'],
    hf: ['imdb', 'tweet_eval', 'sentiment140'],
    gh: ['nltk/nltk', 'huggingface/transformers'],
    modality: 'text',
  },
  'mnist': {
    canonicalIds: ['openml:mnist_784', 'huggingface:ylecun/mnist', 'huggingface:mnist'],
    hf: ['ylecun/mnist', 'mnist'],
    gh: ['pytorch/examples'],
    openml: ['mnist_784', 'mnist'],
    modality: 'image',
  },
  'fashion mnist': {
    canonicalIds: ['huggingface:fashion_mnist', 'github:zalandoresearch/fashion-mnist', 'openml:Fashion-MNIST'],
    hf: ['fashion_mnist', 'zalando-datasets/fashion_mnist'],
    gh: ['zalandoresearch/fashion-mnist', 'fashion-mnist'],
    openml: ['Fashion-MNIST'],
    modality: 'image',
  },
  'cifar10': {
    canonicalIds: ['huggingface:cifar10', 'openml:CIFAR_10'],
    hf: ['cifar10', 'uoft-cs/cifar10'],
    gh: ['cifar10', 'cifar-10-batches-py'],
    openml: ['CIFAR_10'],
    modality: 'image',
  },
  'cifar100': {
    canonicalIds: ['huggingface:cifar100', 'openml:CIFAR_100'],
    hf: ['cifar100', 'uoft-cs/cifar100'],
    gh: ['cifar100'],
    openml: ['CIFAR_100'],
    modality: 'image',
  },
  'coco': {
    canonicalIds: ['huggingface:detection-datasets/coco', 'github:cocodataset/cocoapi'],
    hf: ['detection-datasets/coco', 'coco'],
    gh: ['cocodataset/cocoapi', 'ultralytics/yolov5'],
    modality: 'image',
  },
  'cityscapes': {
    canonicalIds: ['huggingface:cityscapes', 'github:mcordts/cityscapesScripts'],
    hf: ['cityscapes', 'autonomous-driving'],
    gh: ['mcordts/cityscapesScripts'],
    modality: 'image',
  },
  'celeba': {
    canonicalIds: ['huggingface:celeba', 'github:open-mmlab/mmpose'],
    hf: ['celeba', 'nielsr/celeba'],
    gh: ['celeba'],
    modality: 'image',
  },
  'imagenet': {
    canonicalIds: ['huggingface:imagenet-1k', 'github:huggingface/pytorch-image-models'],
    hf: ['imagenet-1k', 'imagenet'],
    gh: ['rwightman/pytorch-image-models', 'torchvision'],
    modality: 'image',
  },
  'pascal voc': {
    canonicalIds: ['huggingface:pascal_voc', 'openml:pascal-voc-2012'],
    hf: ['pascal_voc', 'voc2012'],
    gh: ['pascal-voc'],
    openml: ['pascal-voc-2012'],
    modality: 'image',
  },
  'credit card fraud': {
    canonicalIds: ['openml:CreditCardFraudDetection', 'huggingface:fraud-detection'],
    hf: ['fraud-detection', 'creditcard-fraud'],
    gh: ['credit-card-fraud-detection'],
    openml: ['CreditCardFraudDetection'],
    modality: 'tabular',
  },
  'telco churn': {
    canonicalIds: ['openml:churn', 'huggingface:telco-churn'],
    hf: ['telco-churn', 'churn-prediction'],
    gh: ['telco-customer-churn'],
    openml: ['churn'],
    modality: 'tabular',
  },
  'adult': {
    canonicalIds: ['openml:adult', 'huggingface:adult'],
    hf: ['adult', 'census-income'],
    gh: ['adult-census-income'],
    openml: ['adult'],
    modality: 'tabular',
  },
  'titanic': {
    canonicalIds: ['openml:titanic', 'huggingface:titanic'],
    hf: ['titanic'],
    gh: ['titanic'],
    openml: ['titanic'],
    modality: 'tabular',
  },
  'california housing': {
    canonicalIds: ['openml:california_housing', 'huggingface:california_housing'],
    hf: ['california_housing'],
    gh: ['california-housing'],
    openml: ['california_housing'],
    modality: 'tabular',
  },
  'chest x-ray': {
    canonicalIds: ['huggingface:keremberke/chest-xray-classification', 'huggingface:nih-chest-xrays'],
    hf: ['keremberke/chest-xray-classification', 'nih-chest-xrays', 'chest-xray-pneumonia'],
    gh: ['ieee8023/covid-chestxray-dataset', 'chexpert'],
    modality: 'image',
  },
  'pneumonia': {
    canonicalIds: ['huggingface:keremberke/chest-xray-classification'],
    hf: ['keremberke/chest-xray-classification', 'pneumonia'],
    gh: ['pneumonia-detection-xray'],
    modality: 'image',
  },
  'chexpert': {
    canonicalIds: ['huggingface:stanford-ml-group/chexpert'],
    hf: ['stanford-ml-group/chexpert', 'chexpert'],
    gh: ['stanfordmlgroup/chexpert-labeler'],
    modality: 'image',
  },
  'mimic': {
    canonicalIds: ['huggingface:physionet/mimic-iv', 'github:MIT-LCP/mimic-code'],
    hf: ['physionet/mimic-iv', 'mimic-cxr', 'mimic'],
    gh: ['MIT-LCP/mimic-code'],
    modality: 'tabular',
  },
  'isic': {
    canonicalIds: ['huggingface:isic', 'github:ISIC-Challenge'],
    hf: ['isic', 'ham10000'],
    gh: ['ISIC-Challenge'],
    modality: 'image',
  },
  'brats': {
    canonicalIds: ['huggingface:brats2020', 'github:MIC-DKFZ/BraTS'],
    hf: ['brats2020', 'brain-tumor-mri'],
    gh: ['MIC-DKFZ/BraTS'],
    modality: 'image',
  },
  'ecg': {
    canonicalIds: ['openml:ecg', 'huggingface:mit-bih'],
    hf: ['mit-bih', 'ptb-xl', 'ecg-heartbeat'],
    gh: ['MIT-BIH-Arrhythmia-Database'],
    openml: ['ecg'],
    modality: 'tabular',
  },
  'arrhythmia': {
    canonicalIds: ['openml:arrhythmia', 'huggingface:mit-bih'],
    hf: ['mit-bih', 'arrhythmia'],
    gh: ['MIT-BIH-Arrhythmia-Database'],
    openml: ['arrhythmia'],
    modality: 'tabular',
  },
  'librispeech': {
    canonicalIds: ['huggingface:librispeech_asr', 'huggingface:openslr/librispeech_asr'],
    hf: ['librispeech_asr', 'openslr/librispeech_asr'],
    gh: ['espnet/espnet', 'kaldi-asr/kaldi'],
    modality: 'audio',
  },
  'whisper': {
    canonicalIds: ['github:openai/whisper', 'huggingface:openai/whisper-large-v3'],
    hf: ['openai/whisper-large-v3', 'whisper'],
    gh: ['openai/whisper', 'SYSTRAN/faster-whisper'],
    modality: 'code',
  },
  'fleurs': {
    canonicalIds: ['huggingface:google/fleurs'],
    hf: ['google/fleurs'],
    gh: ['google-research/google-research'],
    modality: 'audio',
  },
  'voxceleb': {
    canonicalIds: ['huggingface:voxceleb'],
    hf: ['voxceleb', 'voxceleb2'],
    gh: ['clovaai/voxceleb_trainer'],
    modality: 'audio',
  },
  'urbansound8k': {
    canonicalIds: ['huggingface:urbansound8k'],
    hf: ['urbansound8k'],
    gh: ['urbansound8k'],
    modality: 'audio',
  },
  'ljspeech': {
    canonicalIds: ['huggingface:lj_speech'],
    hf: ['lj_speech'],
    gh: ['keithito/tacotron'],
    modality: 'audio',
  },
  'gtzan': {
    canonicalIds: ['huggingface:marsyas/gtzan', 'huggingface:gtzan'],
    hf: ['marsyas/gtzan', 'gtzan'],
    gh: ['marsyas/marsyas'],
    modality: 'audio',
  },
  'alpaca': {
    canonicalIds: ['huggingface:tatsu-lab/alpaca', 'github:tatsu-lab/stanford_alpaca'],
    hf: ['tatsu-lab/alpaca', 'yahma/alpaca-cleaned'],
    gh: ['tatsu-lab/stanford_alpaca', 'tloen/alpaca-lora'],
    modality: 'text',
  },
  'dolly': {
    canonicalIds: ['huggingface:databricks/databricks-dolly-15k', 'github:databrickslabs/dolly'],
    hf: ['databricks/databricks-dolly-15k'],
    gh: ['databrickslabs/dolly'],
    modality: 'text',
  },
  'openassistant': {
    canonicalIds: ['huggingface:OpenAssistant/oasst1', 'github:LAION-AI/Open-Assistant'],
    hf: ['OpenAssistant/oasst1', 'OpenAssistant/oasst2'],
    gh: ['LAION-AI/Open-Assistant'],
    modality: 'text',
  },
  'ultrafeedback': {
    canonicalIds: ['huggingface:HuggingFaceH4/ultrafeedback_binarized'],
    hf: ['HuggingFaceH4/ultrafeedback_binarized', 'argilla/ultrafeedback-binarized-preferences'],
    gh: ['OpenBMB/UltraFeedback'],
    modality: 'text',
  },
  'chatbot arena': {
    canonicalIds: ['huggingface:lmsys/chatbot_arena_conversations', 'github:lm-sys/FastChat'],
    hf: ['lmsys/chatbot_arena_conversations', 'lmsys/lmsys-chat-1m'],
    gh: ['lm-sys/FastChat'],
    modality: 'text',
  },
  'humaneval': {
    canonicalIds: ['huggingface:openai_humaneval', 'github:openai/human-eval'],
    hf: ['openai_humaneval', 'openai/openai_humaneval'],
    gh: ['openai/human-eval'],
    modality: 'code',
  },
  'mbpp': {
    canonicalIds: ['huggingface:google-research/mbpp', 'github:google-research/google-research'],
    hf: ['google-research/mbpp'],
    gh: ['google-research/google-research'],
    modality: 'code',
  },
  'the stack': {
    canonicalIds: ['huggingface:bigcode/the-stack', 'github:bigcode-project/starcoder'],
    hf: ['bigcode/the-stack', 'bigcode/the-stack-v2'],
    gh: ['bigcode-project/starcoder'],
    modality: 'code',
  },
  'llava': {
    canonicalIds: ['huggingface:liuhaotian/LLaVA-Instruct-150K', 'github:haotian-liu/LLaVA'],
    hf: ['liuhaotian/LLaVA-Instruct-150K'],
    gh: ['haotian-liu/LLaVA'],
    modality: 'multimodal',
  },
  'vqa': {
    canonicalIds: ['huggingface:vqa_v2'],
    hf: ['vqa_v2', 'vqa'],
    gh: ['GT-BraiND/VQA'],
    modality: 'multimodal',
  },
  'faiss': {
    canonicalIds: ['github:facebookresearch/faiss', 'huggingface:facebook/faiss'],
    hf: ['facebook/faiss'],
    gh: ['facebookresearch/faiss'],
    modality: 'code',
  },
  'unsloth': {
    canonicalIds: ['github:unslothai/unsloth'],
    hf: ['unsloth/gemma-7b', 'unsloth/llama-3-8b'],
    gh: ['unslothai/unsloth'],
    modality: 'code',
  },
  'transformers': {
    canonicalIds: ['github:huggingface/transformers', 'huggingface:huggingface/transformers'],
    hf: ['huggingface/transformers'],
    gh: ['huggingface/transformers'],
    modality: 'code',
  },
  'xgboost': {
    canonicalIds: ['github:dmlc/xgboost'],
    hf: ['xgboost'],
    gh: ['dmlc/xgboost'],
    modality: 'code',
  },
  'hazm': {
    canonicalIds: ['github:sobhe/hazm', 'huggingface:sobhe/hazm'],
    hf: ['sobhe/hazm', 'dadmatech/hazm'],
    gh: ['sobhe/hazm'],
    modality: 'code',
    languages: ['fa'],
  },
  'parsbert': {
    canonicalIds: ['huggingface:HooshvareLab/bert-fa-zwnj-base', 'github:hooshvare/parsbert'],
    hf: ['HooshvareLab/bert-fa-zwnj-base', 'HooshvareLab/bert-fa-base-uncased'],
    gh: ['hooshvare/parsbert'],
    modality: 'text',
    languages: ['fa'],
  },
  'snappfood': {
    canonicalIds: ['huggingface:HooshvareLab/snappfood-sentiment-analysis'],
    hf: ['HooshvareLab/snappfood-sentiment-analysis', 'snappfood'],
    gh: ['hooshvare/snappfood-sentiment'],
    modality: 'text',
    languages: ['fa'],
  },
  'digikala': {
    canonicalIds: ['huggingface:persian_nlp/digikala-comments', 'huggingface:digikala'],
    hf: ['persian_nlp/digikala-comments', 'digikala'],
    gh: ['mohamad-ba/digikala-comments-sentiment'],
    modality: 'text',
    languages: ['fa'],
  },
  'peyma': {
    canonicalIds: ['huggingface:HooshvareLab/peyma', 'github:sobhe/peyma'],
    hf: ['HooshvareLab/peyma', 'peyma'],
    gh: ['sobhe/peyma'],
    modality: 'text',
    languages: ['fa'],
  },
  'parsinlu': {
    canonicalIds: ['huggingface:persiannlp/parsinlu-sentiment', 'huggingface:persiannlp/parsinlu-qa'],
    hf: ['persiannlp/parsinlu-sentiment', 'persiannlp/parsinlu-qa', 'parsinlu'],
    gh: ['persiannlp/parsinlu'],
    modality: 'text',
    languages: ['fa'],
  },
  'flores': {
    canonicalIds: ['huggingface:facebook/flores'],
    hf: ['facebook/flores', 'flores'],
    gh: ['facebookresearch/flores'],
    modality: 'text',
  },
  'common voice': {
    canonicalIds: ['huggingface:mozilla-foundation/common_voice', 'huggingface:common_voice'],
    hf: ['mozilla-foundation/common_voice', 'common_voice'],
    gh: ['common-voice/common-voice'],
    modality: 'audio',
  },
  'wikipedia': {
    canonicalIds: ['huggingface:wikimedia/wikipedia', 'huggingface:wikipedia'],
    hf: ['wikimedia/wikipedia', 'wikipedia'],
    gh: ['wikimedia/mediawiki-core'],
    modality: 'text',
  },
};

const NOISE_WORDS = [
  'github repository',
  'github repo',
  'code repository',
  'github source code',
  'github',
  'repo',
  'repository',
  'source code',
  'dataset',
  'datasets',
  'corpus',
  'corpora',
  'benchmark',
  'benchmarks',
  'data',
  'collection',
  'download',
  'free',
  'open source',
  'database',
];

export function analyzeQuery(rawQuery: string, requestedModality?: string): AnalyzedQuery {
  const query = (rawQuery || '').trim();
  const lowerQuery = query.toLowerCase();

  // 1. Detect Intent (dataset vs repository vs mixed)
  const isExplicitRepo = /(github|repo|repository|source code|codebase)/i.test(query);
  const isExplicitDataset = /(dataset|datasets|corpus|corpora|benchmark)/i.test(query);

  let detectedIntent: 'dataset' | 'repository' | 'mixed' = 'mixed';
  if (isExplicitDataset && !isExplicitRepo) {
    detectedIntent = 'dataset';
  } else if (isExplicitRepo && !isExplicitDataset) {
    detectedIntent = 'repository';
  } else if (isExplicitDataset && isExplicitRepo) {
    detectedIntent = 'mixed';
  }

  // 2. Language detection
  const isPersianQuery = false;
  const targetLanguages = ['en'];

  // 3. Extract exact candidate owner/repo pattern (e.g. "facebookresearch/faiss" or "ultralytics/yolov8")
  const exactCandidates: string[] = [];
  const resolvedCanonicalIds: string[] = [];
  const slugMatches = query.match(/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/g);
  if (slugMatches) {
    for (const match of slugMatches) {
      if (!exactCandidates.includes(match)) {
        exactCandidates.push(match);
      }
    }
  }

  // 4. Strip noise words to find clean core keywords
  let stripped = lowerQuery;
  for (const noise of NOISE_WORDS) {
    const regex = new RegExp(`\\b${noise.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    stripped = stripped.replace(regex, ' ');
  }
  stripped = stripped.replace(/[^\w\s\-\.\/]/g, ' ').replace(/\s+/g, ' ').trim();

  // Construct potential slug from 2 tokens (e.g. "facebookresearch faiss" -> "facebookresearch/faiss")
  const cleanTokens = stripped.split(/\s+/).filter((t) => t.length > 1);
  if (cleanTokens.length === 2 && !cleanTokens[0].includes('/')) {
    const syntheticSlug = `${cleanTokens[0]}/${cleanTokens[1]}`;
    if (!exactCandidates.includes(syntheticSlug)) {
      exactCandidates.push(syntheticSlug);
    }
  }

  // 5. Look for matching entries in known dictionaries
  const hfSubQueries: string[] = [];
  const ghSubQueries: string[] = [];
  const openmlSubQueries: string[] = [];
  const medicalEntities: string[] = [];
  const persianEntities: string[] = [];
  let detectedModality: StandardModality = 'unknown';

  if (requestedModality && requestedModality !== 'all') {
    const rm = requestedModality.toLowerCase();
    if (rm === 'vision' || rm === 'image') detectedModality = 'image';
    else if (rm === 'audio' || rm === 'speech') detectedModality = 'audio';
    else if (rm === 'nlp' || rm === 'text') detectedModality = 'text';
    else if (rm === 'tabular') detectedModality = 'tabular';
    else if (rm === 'code') detectedModality = 'code';
    else if (rm === 'multimodal') detectedModality = 'multimodal';
  }

  for (const [key, val] of Object.entries(KNOWN_DATASET_MAPPINGS)) {
    if (lowerQuery.includes(key)) {
      if (val.canonicalIds) {
        resolvedCanonicalIds.push(...val.canonicalIds);
      }
      if (val.modality && detectedModality === 'unknown') {
        detectedModality = val.modality;
      }
      if (val.hf) {
        for (const h of val.hf) {
          if (!hfSubQueries.includes(h)) hfSubQueries.push(h);
        }
      }
      if (val.gh) {
        for (const g of val.gh) {
          if (!ghSubQueries.includes(g)) ghSubQueries.push(g);
        }
      }
      if (val.openml) {
        for (const o of val.openml) {
          if (!openmlSubQueries.includes(o)) openmlSubQueries.push(o);
        }
      }
      if (['chest x-ray', 'pneumonia', 'chexpert', 'mimic', 'isic', 'brats', 'ecg', 'arrhythmia'].includes(key)) {
        medicalEntities.push(key);
      }
    }
  }

  // 6. Add primary & stripped terms to sub-queries
  if (exactCandidates.length > 0) {
    for (const cand of exactCandidates) {
      if (!ghSubQueries.includes(cand)) ghSubQueries.unshift(cand);
      if (!hfSubQueries.includes(cand)) hfSubQueries.unshift(cand);
    }
  }

  if (stripped && stripped.length > 1) {
    if (!hfSubQueries.includes(stripped)) hfSubQueries.push(stripped);
    if (!ghSubQueries.includes(stripped)) ghSubQueries.push(stripped);
  }

  if (cleanTokens.length > 2) {
    const compactPhrase = cleanTokens.slice(0, 2).join(' ');
    if (!hfSubQueries.includes(compactPhrase)) hfSubQueries.push(compactPhrase);
    if (!ghSubQueries.includes(compactPhrase)) ghSubQueries.push(compactPhrase);
  }

  // Fallback if empty
  if (hfSubQueries.length === 0) hfSubQueries.push(query);
  if (ghSubQueries.length === 0) ghSubQueries.push(query);

  // Modality fallback inference
  if (detectedModality === 'unknown') {
    if (/(image|vision|photo|picture|detection|segmentation|chest|xray|x-ray|lesion|mri|face|cifar|mnist|coco)/i.test(query)) {
      detectedModality = 'image';
    } else if (/(audio|speech|voice|sound|asr|transcription|speaker|tts|music)/i.test(query)) {
      detectedModality = 'audio';
    } else if (/(tabular|table|csv|finance|churn|fraud|credit|housing|census|regression|classification|ecg|arrhythmia)/i.test(query)) {
      detectedModality = 'tabular';
    } else if (/(code|programming|python|repository|github|library|package|algorithm)/i.test(query)) {
      detectedModality = 'code';
    } else if (/(text|nlp|sentiment|sentiment analysis|corpus|language|qa|translation|dialogue|chat|instruct|prompt|llm)/i.test(query)) {
      detectedModality = 'text';
    } else if (/(video|multimodal|vqa|vision-language)/i.test(query)) {
      detectedModality = 'multimodal';
    }
  }

  return {
    rawQuery: query,
    normalizedQuery: stripped || query,
    detectedIntent,
    extractedKeywords: cleanTokens,
    exactCandidates,
    resolvedCanonicalIds,
    hfSubQueries: hfSubQueries.slice(0, 5),
    ghSubQueries: ghSubQueries.slice(0, 5),
    openmlSubQueries: openmlSubQueries.slice(0, 4),
    medicalEntities,
    persianEntities,
    detectedModality,
    isPersianQuery,
    targetLanguages,
  };
}
