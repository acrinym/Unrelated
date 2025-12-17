# @biblemind/knowledge-graph

**Biblical Knowledge Graph Integration (Pinecone + Firestore)**

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

1. Ingesting biblical texts into Pinecone (vector database)
2. Creating embeddings for semantic search
3. Building cross-reference mappings
4. Integrating Church Fathers and theological works

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

### 1. Set up Pinecone

```bash
npm install @pinecone-database/pinecone
```

Create index with 1536 dimensions (OpenAI embeddings):

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = await pinecone.createIndex({
  name: 'biblemind-scriptures',
  dimension: 1536,
  metric: 'cosine'
});
```

### 2. Ingest Biblical Texts

For each verse:
1. Generate embedding using OpenAI `text-embedding-3-large`
2. Store in Pinecone with metadata:
   - reference (e.g., "John 3:16")
   - text (full verse)
   - testament ('old' | 'new')
   - book, chapter, verse
   - translation (ESV, NIV, KJV)
   - themes (tags like 'salvation', 'grace', 'love')
   - hebrewGreek (original language)
   - strongsNumbers (concordance)

```typescript
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-large',
  input: verseText
});

await index.upsert([{
  id: 'john-3-16',
  values: embedding.data[0].embedding,
  metadata: {
    reference: 'John 3:16',
    text: 'For God so loved the world...',
    testament: 'new',
    book: 'John',
    chapter: 3,
    verse: 16,
    translation: 'ESV',
    themes: ['love', 'salvation', 'eternal-life'],
    greek: 'Οὕτως γὰρ ἠγάπησεν...'
  }
}]);
```

### 3. Implement Search

```typescript
export class BiblicalKnowledgeGraph implements KnowledgeGraph {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private index: any;

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
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: query
    });

    // 2. Build Pinecone filter
    const pineconeFilter: any = {};
    if (filters?.testament) {
      pineconeFilter.testament = filters.testament;
    }
    if (filters?.books) {
      pineconeFilter.book = { $in: filters.books };
    }
    if (filters?.themes) {
      pineconeFilter.themes = { $in: filters.themes };
    }

    // 3. Search Pinecone
    const results = await this.index.query({
      vector: embedding.data[0].embedding,
      filter: pineconeFilter,
      topK,
      includeMetadata: true
    });

    // 4. Convert to Scripture objects
    return results.matches.map(match => ({
      reference: match.metadata.reference,
      text: match.metadata.text,
      testament: match.metadata.testament,
      book: match.metadata.book,
      chapter: match.metadata.chapter,
      verse: match.metadata.verse,
      translation: match.metadata.translation,
      hebrewGreek: match.metadata.hebrewGreek,
      strongsNumbers: match.metadata.strongsNumbers,
      themes: match.metadata.themes,
      context: `Relevance: ${(match.score * 100).toFixed(1)}%`
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
  pineconeApiKey: process.env.PINECONE_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY
});

// Test search
const verses = await kg.searchScriptures('love your neighbor', {
  testament: 'new'
}, 10);

console.log(verses);
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

Ingesting ~31,000 verses with OpenAI embeddings:
- 31,000 verses × $0.00013 per 1K tokens ≈ $4-5
- Pinecone: Free tier supports up to 1M vectors

## Next Steps

1. Set up Pinecone account
2. Get Bible JSON files (many open-source options available)
3. Write ingestion scripts
4. Generate embeddings
5. Test search quality
6. Integrate with engines

The engines are ready - they just need this knowledge graph to query!
