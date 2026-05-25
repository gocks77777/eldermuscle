import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI ?? ''

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  if (!uri || uri.includes('your_mongodb')) return Promise.reject(new Error('No MongoDB URI'))
  if (!clientPromise) {
    const client = new MongoClient(uri)
    clientPromise = client.connect()
  }
  return clientPromise
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db('eldermuscle')
}

export const hasMongo = Boolean(uri && !uri.includes('your_mongodb'))
