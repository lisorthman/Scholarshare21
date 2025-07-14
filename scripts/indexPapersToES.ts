import { MongoClient, ObjectId } from 'mongodb';
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const mongoUri = process.env.MONGODB_URI!;
const dbName = 'scholarshare';
const collectionName = 'researchpapers';

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL!,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY!,
  },
});

async function run() {
  const mongoClient = new MongoClient(mongoUri);

  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const papers = await db.collection(collectionName).find().toArray();

    for (const paper of papers) {
      let authorName = 'Unknown';
      if (paper.authorId && ObjectId.isValid(paper.authorId)) {
        const authorDoc = await db.collection('users').findOne({ _id: new ObjectId(paper.authorId) });
        if (authorDoc?.name) authorName = authorDoc.name;
      }

      let categoryName = paper.category || 'Uncategorized';
      if (paper.categoryId && ObjectId.isValid(paper.categoryId)) {
        const categoryDoc = await db.collection('admincategories').findOne({ _id: new ObjectId(paper.categoryId) });
        if (categoryDoc?.name) categoryName = categoryDoc.name;
      }

      await esClient.index({
        index: 'scholar-share-search',
        id: paper._id.toString(),
        document: {
          title: paper.title,
          abstract: paper.abstract,
          author: authorName,
          category: categoryName,
          keywords: paper.keywords || [],
          createdAt: paper.createdAt,
          uploadedAt: paper.uploadedAt || new Date(),
        },
      });
    }
  } finally {
    await mongoClient.close();
  }
}

run();
