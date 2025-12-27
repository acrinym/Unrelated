# @biblemind/knowledge-graph

**Biblical Knowledge Graph Integration (Qdrant + Firestore)**

This package will contain the knowledge graph implementation for BibleMind. You'll populate this with:
- Torah/Tanakh (Hebrew Bible)
- New Testament (Greek + English)
- Talmud (selected tractates)
- Church Fathers writings
- Systematic theology
- Biblical commentaries
- Cross-references (350K+ connections)

## Status: PLACEHOLDER

This package is a placeholder. You will implement it by:

1. Ingesting biblical texts into Qdrant (open-source vector database)
2. Creating embeddings for semantic search
3. Building cross-reference mappings
4. Integrating Church Fathers and theological works

## Why Qdrant?

✅ **Self-hosted** - Deploy on your own infrastructure, scales with usage
✅ **Open source** - Full control, no vendor lock-in
✅ **Customizable** - Tune storage parameters, indexing, and retrieval algorithms
✅ **Free at any scale** - No per-vector pricing, just your hosting costs
✅ **Production-ready** - Persistent storage, horizontal scaling, filtering support

## Interface

The engines expect a `KnowledgeGraph` interface with this method:

```typescript
interface KnowledgeGraph {
  searchScriptures(
    query: string,
    filters?: {
      testament?: 'old' | 'new';
      books?: string[];
      themes?: string[];
    },
    topK?: number
  ): Promise<Scripture[]>;
}
```

## Implementation Plan

### 1. Set up Qdrant

```bash
npm install @qdrant/js-client-rest
```

**Option A: Run Qdrant locally with Docker**

```bash
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage:z \
  qdrant/qdrant
```

**Option B: Qdrant Cloud (free tier available)**

Sign up at https://cloud.qdrant.io

**Create collection with 768 dimensions (Gemini text-embedding-004 embeddings):**

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY // Optional for local
});

// Create collection for Bible verses
await client.createCollection('biblemind_scriptures', {
  vectors: {
    size: 1536,
    distance: 'Cosine'
  },
  optimizers_config: {
    default_segment_number: 2
  },
  replication_factor: 2
});

// Create indexes for fast filtering
await client.createPayloadIndex('biblemind_scriptures', {
  field_name: 'testament',
  field_schema: 'keyword'
});

await client.createPayloadIndex('biblemind_scriptures', {
  field_name: 'book',
  field_schema: 'keyword'
});

await client.createPayloadIndex('biblemind_scriptures', {
  field_name: 'themes',
  field_schema: 'keyword'
});
```

### 2. Ingest Biblical Texts

For each verse:
1. Generate embedding using Gemini `text-embedding-004`
2. Store in Qdrant with payload (metadata):
   - reference (e.g., "John 3:16")
   - text (full verse)
   - testament ('old' | 'new')
   - book, chapter, verse
   - translation (ESV, NIV, KJV)
   - themes (tags like 'salvation', 'grace', 'love')
   - hebrewGreek (original language)
   - strongsNumbers (concordance)

```typescript
const embedding = await gemini.embedContent({
  model: 'text-embedding-004',
  content: { parts: [{ text: verseText }] }
});

await client.upsert('biblemind_scriptures', {
  wait: true,
  points: [{
    id: 'john-3-16',
    vector: embedding.embedding.values,
    payload: {
      reference: 'John 3:16',
      text: 'For God so loved the world...',
      testament: 'new',
      book: 'John',
      chapter: 3,
      verse: 16,
      translation: 'ESV',
      themes: ['love', 'salvation', 'eternal-life'],
      greek: 'Οὕτως γὰρ ἠγάπησεν...',
      strongsNumbers: ['G3779', 'G1063', 'G25']
    }
  }]
});
```

### 3. Implement Search

```typescript
export class BiblicalKnowledgeGraph implements KnowledgeGraph {
  private qdrant: QdrantClient;
  private embeddings: GenerativeModel;
  private collectionName = 'biblemind_scriptures';

  constructor(config: { qdrantUrl?: string; qdrantApiKey?: string; geminiApiKey: string }) {
    this.qdrant = new QdrantClient({
      url: config.qdrantUrl || 'http://localhost:6333',
      apiKey: config.qdrantApiKey
    });
    const genAI = new GoogleGenerativeAI({ apiKey: config.geminiApiKey });
    this.embeddings = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  }

  async searchScriptures(
    query: string,
    filters?: {
      testament?: 'old' | 'new';
      books?: string[];
      themes?: string[];
    },
    topK: number = 20
  ): Promise<Scripture[]> {
    // 1. Generate query embedding
    const embedding = await this.embeddings.embedContent({
      content: { parts: [{ text: query }] }
    });

    // 2. Build Qdrant filter
    const qdrantFilter: any = {
      must: []
    };

    if (filters?.testament) {
      qdrantFilter.must.push({
        key: 'testament',
        match: { value: filters.testament }
      });
    }

    if (filters?.books && filters.books.length > 0) {
      qdrantFilter.must.push({
        key: 'book',
        match: { any: filters.books }
      });
    }

    if (filters?.themes && filters.themes.length > 0) {
      qdrantFilter.must.push({
        key: 'themes',
        match: { any: filters.themes }
      });
    }

    // 3. Search Qdrant
    const results = await this.qdrant.search(this.collectionName, {
      vector: embedding.embedding.values,
      filter: qdrantFilter.must.length > 0 ? qdrantFilter : undefined,
      limit: topK,
      with_payload: true,
      score_threshold: 0.7 // Only return results with >70% similarity
    });

    // 4. Convert to Scripture objects
    return results.map(result => ({
      reference: result.payload.reference as string,
      text: result.payload.text as string,
      testament: result.payload.testament as 'old' | 'new',
      book: result.payload.book as string,
      chapter: result.payload.chapter as number,
      verse: result.payload.verse as number,
      translation: result.payload.translation as string,
      hebrewGreek: result.payload.hebrewGreek as string,
      strongsNumbers: result.payload.strongsNumbers as string[],
      themes: result.payload.themes as string[],
      context: `Relevance: ${(result.score * 100).toFixed(1)}%`
    }));
  }

  /**
   * Advanced: Hybrid search combining semantic + keyword search
   */
  async hybridSearch(
    query: string,
    keywords: string[],
    filters?: any,
    topK: number = 20
  ): Promise<Scripture[]> {
    const embedding = await this.embeddings.embedContent({
      content: { parts: [{ text: query }] }
    });

    // Qdrant supports full-text search on payload fields
    const results = await this.qdrant.search(this.collectionName, {
      vector: embedding.embedding.values,
      filter: {
        must: [
          ...(filters?.must || []),
          {
            key: 'text',
            match: { text: keywords.join(' ') }
          }
        ]
      },
      limit: topK,
      with_payload: true
    });

    return results.map(result => ({
      reference: result.payload.reference as string,
      text: result.payload.text as string,
      testament: result.payload.testament as 'old' | 'new',
      book: result.payload.book as string,
      chapter: result.payload.chapter as number,
      verse: result.payload.verse as number,
      translation: result.payload.translation as string,
      context: `Score: ${(result.score * 100).toFixed(1)}%`
    }));
  }

  /**
   * Get verses by exact reference
   */
  async getVersesByReference(references: string[]): Promise<Scripture[]> {
    const results = await this.qdrant.retrieve(this.collectionName, {
      ids: references,
      with_payload: true
    });

    return results.map(result => ({
      reference: result.payload.reference as string,
      text: result.payload.text as string,
      testament: result.payload.testament as 'old' | 'new',
      book: result.payload.book as string,
      chapter: result.payload.chapter as number,
      verse: result.payload.verse as number,
      translation: result.payload.translation as string
    }));
  }
}
```

### 4. Data Sources

#### Bible Texts (JSON)
You'll need JSON files for each translation:
- ESV (English Standard Version)
- NIV (New International Version)
- KJV (King James Version)
- Hebrew (Tanakh)
- Greek (Septuagint + NT)

Format:
```json
{
  "Genesis": {
    "1": {
      "1": {
        "text": "In the beginning, God created the heavens and the earth.",
        "hebrew": "בְּרֵאשִׁית בָּרָא אֱלֹהִים...",
        "strongs": ["H7225", "H1254", "H430"],
        "themes": ["creation", "beginning", "God"]
      }
    }
  }
}
```

#### Cross-References
Map connections between verses:
```json
{
  "John 3:16": [
    "Romans 5:8",
    "1 John 4:9",
    "Genesis 22:2"
  ]
}
```

#### Church Fathers
Excerpts from:
- Augustine (Confessions, City of God)
- Aquinas (Summa Theologica)
- Chrysostom (Homilies)
- Athanasius (On the Incarnation)
- etc.

#### Systematic Theology
Organized by topic:
- Theology Proper (God's nature)
- Christology (Jesus)
- Pneumatology (Holy Spirit)
- Soteriology (Salvation)
- Ecclesiology (Church)
- Eschatology (End times)

### 5. Firestore Integration

Store user-specific data in Firestore:
- Question history
- Saved passages
- Discipleship tracking
- Prayer journals

## Testing

Once implemented, test with:

```typescript
import { BiblicalKnowledgeGraph } from '@biblemind/knowledge-graph';

const kg = new BiblicalKnowledgeGraph({
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  qdrantApiKey: process.env.QDRANT_API_KEY, // Optional for local
  geminiApiKey: process.env.GEMINI_API_KEY!
});

// Test semantic search
const verses = await kg.searchScriptures('love your neighbor', {
  testament: 'new'
}, 10);

console.log(verses);

// Test hybrid search (semantic + keywords)
const hybridResults = await kg.hybridSearch(
  'God\'s love for humanity',
  ['love', 'world', 'eternal'],
  { testament: 'new' },
  10
);

console.log(hybridResults);

// Test exact reference lookup
const specific = await kg.getVersesByReference(['john-3-16', 'romans-5-8']);
console.log(specific);
```

## Ingestion Scripts

You'll need scripts to:
1. Parse Bible JSON files
2. Generate embeddings (batched, to save cost)
3. Upsert to Pinecone
4. Build cross-reference index
5. Ingest Church Fathers
6. Tag themes

Example ingestion script structure:

```typescript
async function ingestBible() {
  const bibleJson = JSON.parse(fs.readFileSync('bible-esv.json', 'utf-8'));
  const verses = [];

  for (const [book, chapters] of Object.entries(bibleJson)) {
    for (const [chapter, verseMap] of Object.entries(chapters)) {
      for (const [verse, data] of Object.entries(verseMap)) {
        verses.push({
          reference: `${book} ${chapter}:${verse}`,
          text: data.text,
          testament: getTestament(book),
          book,
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          translation: 'ESV',
          themes: data.themes || [],
          hebrewGreek: data.original,
          strongsNumbers: data.strongs || []
        });
      }
    }
  }

  // Generate embeddings in batches of 100
  for (let i = 0; i < verses.length; i += 100) {
    const batch = verses.slice(i, i + 100);
    await ingestBatch(batch);
    console.log(`Ingested ${i + 100}/${verses.length} verses`);
  }
}
```

## Cost Estimate

### One-Time Setup (Ingestion)
Ingesting ~31,000 verses with OpenAI embeddings:
- 31,000 verses × $0.00013 per 1K tokens ≈ **$4-5 one-time**

### Ongoing Costs (Qdrant Hosting)

**Option A: Self-Hosted (Free)**
- Deploy on your own infrastructure (Docker, Kubernetes)
- Costs: Just server costs (can run on $5-10/month VPS initially)
- Scales with your infrastructure
- **Recommended for production**

**Option B: Qdrant Cloud Free Tier**
- 1GB RAM cluster (free forever)
- ~400K vectors (enough for initial deployment)
- Upgrade to paid plans as needed

**Option C: Qdrant Cloud Paid (for scale)**
- $25/month: 2GB RAM, 1M vectors
- $95/month: 8GB RAM, 4M vectors
- Still **10x cheaper than Pinecone** at scale

### Cost Comparison vs. Pinecone

| Vectors | Qdrant (Self-Hosted) | Qdrant Cloud | Pinecone |
|---------|---------------------|--------------|----------|
| 100K | $5/month VPS | Free | Free |
| 1M | $10-20/month VPS | $25/month | $70/month |
| 10M | $50-100/month | $95/month | $700/month |

**Qdrant wins at scale.** For 10M vectors (multi-translation, commentaries, Church Fathers), you save **$600-650/month** vs. Pinecone.

## Qdrant Configuration Tuning

### Storage Parameters

```typescript
await client.createCollection('biblemind_scriptures', {
  vectors: {
    size: 1536,
    distance: 'Cosine'
  },
  // Optimize for memory vs. speed tradeoff
  hnsw_config: {
    m: 16,                    // Number of connections (default: 16)
    ef_construct: 100,        // Higher = better quality, slower indexing
    full_scan_threshold: 10000 // Use full scan for small datasets
  },
  // Quantization for memory savings (optional)
  quantization_config: {
    scalar: {
      type: 'int8',           // 4x memory reduction
      quantile: 0.99,
      always_ram: true
    }
  },
  // Optimize segment size
  optimizers_config: {
    default_segment_number: 2,
    max_segment_size: 100000,
    memmap_threshold: 50000,
    indexing_threshold: 20000
  }
});
```

### Performance Tuning

- **For fast indexing**: Lower `ef_construct` (50-100)
- **For best quality**: Higher `ef_construct` (200-400)
- **For memory savings**: Enable quantization (4x reduction, 95%+ quality retained)
- **For disk storage**: Set `memmap_threshold` to keep large datasets on disk

## Next Steps

1. ✅ Choose Qdrant deployment (local Docker or Cloud)
2. Get Bible JSON files (many open-source options available)
3. Write ingestion scripts (see example above)
4. Generate embeddings (batch process, ~$5 one-time)
5. Test search quality and tune parameters
6. Integrate with engines (interface already defined!)

**The engines are ready - they just need this knowledge graph to query!**

## Bonus: Qdrant Features You'll Love

✅ **Filtering before search** - Much faster than post-filtering
✅ **Batch operations** - Ingest 1000s of verses at once
✅ **Full-text search** - Combine semantic + keyword search
✅ **Snapshots** - Backup and restore entire collections
✅ **Horizontal scaling** - Shard across multiple nodes
✅ **Payload indexing** - Fast filters on testament, book, themes
✅ **Score threshold** - Only return high-quality matches

Qdrant is production-ready and battle-tested. You made the right choice!
