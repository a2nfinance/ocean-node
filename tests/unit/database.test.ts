import { Database } from '../../src/components/database'
import { expect } from 'chai'

describe('Database', () => {
  let database: Database

  before(async () => {
    const dbConfig = {
      url: 'http://localhost:8108/?apiKey=xyz'
    }
    database = await new Database(dbConfig)
  })

  it('instance Database', async () => {
    expect(database).to.be.instanceOf(Database)
  })
})

describe('DdoDatabase CRUD', () => {
  let database: Database
  const ddo = {
    hashType: 'sha256',
    '@context': ['https://w3id.org/did/v1'],
    id: 'did:op:fa0e8fa9550e8eb13392d6eeb9ba9f8111801b332c8d2345b350b3bc66b379d7',
    nftAddress: '0xBB1081DbF3227bbB233Db68f7117114baBb43656',
    version: '4.1.0',
    chainId: 137,
    metadata: {
      created: '2022-12-30T08:40:06Z',
      updated: '2022-12-30T08:40:06Z',
      type: 'dataset',
      name: 'DEX volume in details',
      description:
        'Volume traded and locked of Decentralized Exchanges (Uniswap, Sushiswap, Curve, Balancer, ...), daily in details',
      tags: ['index', 'defi', 'tvl'],
      author: 'DEX',
      license: 'https://market.oceanprotocol.com/terms',
      additionalInformation: {
        termsAndConditions: true
      }
    }
  }

  before(async () => {
    const dbConfig = {
      url: 'http://localhost:8108/?apiKey=xyz'
    }
    database = await new Database(dbConfig)
  })

  it('create ddo', async () => {
    const result = await database.ddo.create(ddo)
    expect(result?.id).to.equal(ddo.id)
  })

  it('retrieve ddo', async () => {
    const result = await database.ddo.retrieve(ddo.id)
    expect(result?.id).to.equal(ddo.id)
  })

  it('update ddo', async () => {
    const newMetadataName = 'new metadata name'
    const result = await database.ddo.update(ddo.id, {
      metadata: {
        name: newMetadataName
      }
    })
    expect(result?.metadata.name).to.equal(newMetadataName)
  })

  it('delete ddo', async () => {
    const result = await database.ddo.delete(ddo.id)
    expect(result?.id).to.equal(ddo.id)
  })
})

describe('NonceDatabase CRUD', () => {
  let database: Database

  before(async () => {
    const dbConfig = {
      url: 'http://localhost:8108/?apiKey=xyz'
    }
    database = await new Database(dbConfig)
  })

  it('create nonce', async () => {
    const result = await database.nonce.create('0x123', 0)
    expect(result?.id).to.equal('0x123')
    expect(result?.nonce).to.equal(0)
  })

  it('retrieve nonce', async () => {
    const result = await database.nonce.retrieve('0x123')
    expect(result?.id).to.equal('0x123')
    expect(result?.nonce).to.equal(0)
  })

  it('update nonce', async () => {
    const result = await database.nonce.update('0x123', 1)
    expect(result?.id).to.equal('0x123')
    expect(result?.nonce).to.equal(1)
  })

  it('delete nonce', async () => {
    const result = await database.nonce.delete('0x123')
    expect(result?.id).to.equal('0x123')
    expect(result?.nonce).to.equal(1)
  })
})

describe('IndexerDatabase CRUD', () => {
  let database: Database

  before(async () => {
    const dbConfig = {
      url: 'http://localhost:8108/?apiKey=xyz'
    }
    database = await new Database(dbConfig)
  })

  it('create indexer', async () => {
    const result = await database.indexer.create({
      id: 'chain1',
      last_block: 0
    })
    expect(result?.id).to.equal('chain1')
    expect(result?.last_block).to.equal(0)
  })

  it('retrieve indexer', async () => {
    const result = await database.indexer.retrieve('chain1')
    expect(result?.id).to.equal('chain1')
    expect(result?.last_block).to.equal(0)
  })

  it('update indexer', async () => {
    const result = await database.indexer.update('chain1', {
      last_block: 1
    })
    expect(result?.id).to.equal('chain1')
    expect(result?.last_block).to.equal(1)
  })

  it('delete indexer', async () => {
    const result = await database.indexer.delete('chain1')
    expect(result?.id).to.equal('chain1')
    expect(result?.last_block).to.equal(1)
  })
})

describe('LogDatabase CRUD', () => {
  let database: Database
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36)`, // ID generation
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Test log message',
    meta: 'Test meta information'
  }

  before(async () => {
    const dbConfig = {
      url: 'http://localhost:8108/?apiKey=xyz'
    }
    database = await new Database(dbConfig)
  })

  it('insert log', async () => {
    const result = await database.logs.insertLog(logEntry)
    expect(result).to.include.keys('id', 'timestamp', 'level', 'message', 'meta')
    logEntry.id = result?.id // Save the auto-generated id for further operations
  })

  it('retrieve log', async () => {
    const result = await database.logs.provider
      .collections('logs')
      .documents()
      .retrieve(logEntry.id)
    expect(result.id).to.equal(logEntry.id)
    expect(result.level).to.equal(logEntry.level)
  })
})
