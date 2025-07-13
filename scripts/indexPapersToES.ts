import { MongoClient } from 'mongodb'
import { Client } from '@elastic/elasticsearch'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const mongoUri = process.env.MONGODB_URI!
const dbName = 'scholarshare'
const collectionName = 'researchpapers'

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL!,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY!,
  },
})

async function run() {
  const mongoClient = new MongoClient(mongoUri)

  try {
    await mongoClient.connect()
    const db = mongoClient.db(dbName)
    const papers = await db.collection(collectionName).find().toArray()

    for (const paper of papers) {
      await esClient.index({
        index: 'scholar-share-search',
        id: paper._id.toString(),
        document: {
          title: paper.title,
          abstract: paper.abstract,
          author: paper.author,
          keywords: paper.keywords || [],
          category: paper.category || '',
          uploadedAt: paper.uploadedAt || new Date(),
        },
      })
    }
  } catch (err) {
    // Fail?
    console.error('[Indexer Error]', (err as Error).message)
  } finally {
    await mongoClient.close()
  }
}

run()
