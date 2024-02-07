import axios from 'axios'
import { PurgatoryAccounts, PurgatoryAssets } from '../../@types/Purgatory.js'
import { Database } from '../database/index.js'
import { INDEXER_LOGGER } from '../../utils/logging/common.js'
import { LOG_LEVELS_STR } from '../../utils/logging/Logger.js'
import { OceanNodeConfig } from '../../@types/OceanNode.js'

export class Purgatory {
  private db: Database
  private config: OceanNodeConfig
  private bannedAccounts: Array<PurgatoryAccounts>
  private bannedAssets: Array<PurgatoryAssets>
  static instance: any

  constructor(db: Database, config: OceanNodeConfig) {
    if (!config.accountPurgatoryUrl || !config.assetPurgatoryUrl) {
      INDEXER_LOGGER.log(
        LOG_LEVELS_STR.LEVEL_ERROR,
        `Cannot instantiate Purgatory due to missing env ASSET_PURGATORY_URL or ACCOUNT_PURGATORY_URL.`
      )
      return
    }
    this.db = db
    this.config = config
    this.bannedAccounts = []
    this.bannedAssets = []
  }

  getDb(): Database {
    return this.db
  }

  getConfig(): OceanNodeConfig {
    return this.config
  }

  getBannedAccounts(): Array<PurgatoryAccounts> {
    return this.bannedAccounts
  }

  getBannedAssets(): Array<PurgatoryAssets> {
    return this.bannedAssets
  }

  setBannedAccounts(newBannedAccounts: Array<PurgatoryAccounts>): void {
    this.bannedAccounts = newBannedAccounts
  }

  setBannedAssets(newBannedAssets: Array<PurgatoryAssets>): void {
    this.bannedAssets = newBannedAssets
  }

  async parsePurgatoryAssets(): Promise<Array<PurgatoryAssets>> {
    try {
      const response = await axios({
        method: 'get',
        url: this.config.assetPurgatoryUrl,
        timeout: 1000
      })
      if (response.status !== 200) {
        INDEXER_LOGGER.log(
          LOG_LEVELS_STR.LEVEL_ERROR,
          `PURGATORY: Failure when retrieving new purgatory list from ASSET_PURGATORY_URL env var.
              Response: ${response.data}, status: ${
                response.status + response.statusText
              }`,
          true
        )
        return
      }
      INDEXER_LOGGER.logMessage(
        `PURGATORY: Successfully retrieved new purgatory list from ASSET_PURGATORY_URL env var.`
      )
      const purgatoryAssets: Array<PurgatoryAssets> = []
      for (const asset of response.data) {
        if (asset && 'did' in asset) {
          purgatoryAssets.push({ did: asset.did, reason: asset.reason })
        }
      }
      this.setBannedAssets(purgatoryAssets)
      return purgatoryAssets
    } catch (err) {
      INDEXER_LOGGER.log(
        LOG_LEVELS_STR.LEVEL_ERROR,
        `Error fetching purgatory list for assets: ${err}`,
        true
      )
    }
  }

  async parsePurgatoryAccounts(): Promise<Array<PurgatoryAccounts>> {
    const purgatoryAccounts: Array<PurgatoryAccounts> = []
    try {
      const response = await axios({
        method: 'get',
        url: this.config.accountPurgatoryUrl,
        timeout: 1000
      })
      if (response.status !== 200) {
        INDEXER_LOGGER.log(
          LOG_LEVELS_STR.LEVEL_ERROR,
          `PURGATORY: Failure when retrieving new purgatory list from ACCOUNT_PURGATORY_URL env var.
              Response: ${response.data}, status: ${
                response.status + response.statusText
              }`,
          true
        )
        return
      }
      INDEXER_LOGGER.logMessage(
        `PURGATORY: Successfully retrieved new purgatory list from ACCOUNT_PURGATORY_URL env var.`
      )
      for (const account of response.data) {
        if (account && 'address' in account) {
          purgatoryAccounts.push({ address: account.address, reason: account.reason })
        }
      }
      this.setBannedAccounts(purgatoryAccounts)
      return purgatoryAccounts
    } catch (err) {
      INDEXER_LOGGER.log(
        LOG_LEVELS_STR.LEVEL_ERROR,
        `Error fetching purgatory list for accounts: ${err}`,
        true
      )
    }
  }

  async isBannedAccount(refAddress: string): Promise<boolean> {
    let purgatoryAccounts = []
    if (this.getBannedAccounts()) {
      purgatoryAccounts = this.getBannedAccounts()
    } else {
      purgatoryAccounts = await this.parsePurgatoryAccounts()
    }
    for (const acc of purgatoryAccounts) {
      if (acc.address.toLowerCase() === refAddress.toLowerCase()) {
        return true
      }
    }
    return false
  }

  async isBannedAsset(refDid: string): Promise<boolean> {
    let purgatoryAssets = []
    if (this.getBannedAccounts()) {
      purgatoryAssets = this.getBannedAssets()
    } else {
      purgatoryAssets = await this.parsePurgatoryAssets()
    }
    for (const asset of purgatoryAssets) {
      if (asset.did === refDid) {
        return true
      }
    }
    return false
  }

  static getInstance(db: Database, config: OceanNodeConfig) {
    if (!Purgatory.instance) {
      Purgatory.instance = new Purgatory(db, config)
    }
    return Purgatory.instance
  }
}
