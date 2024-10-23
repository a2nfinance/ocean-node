import { DBComputeJob } from '../../@types/C2D/C2D.js'
import { OceanNodeDBConfig } from '../../@types/OceanNode.js'
import { DATABASE_LOGGER } from '../../utils/logging/common.js'
import { GENERIC_EMOJIS, LOG_LEVELS_STR } from '../../utils/logging/Logger.js'
import { convertTypesenseConfig, Typesense, TypesenseError } from './typesense.js'
import { TypesenseSchema } from './TypesenseSchemas.js'

export class C2DDatabase {
  private provider: Typesense
  constructor(
    private config: OceanNodeDBConfig,
    private schema: TypesenseSchema
  ) {
    return (async (): Promise<C2DDatabase> => {
      this.provider = new Typesense({
        ...convertTypesenseConfig(this.config.url),
        logger: DATABASE_LOGGER
      })
      try {
        await this.provider.collections(this.schema.name).retrieve()
      } catch (error) {
        if (error instanceof TypesenseError && error.httpStatus === 404) {
          try {
            await this.provider.collections().create(this.schema)
          } catch (creationError) {
            const errorMsg = `Error creating schema for '${this.schema.name}' collection: '${creationError}'`
            DATABASE_LOGGER.logMessageWithEmoji(
              errorMsg,
              true,
              GENERIC_EMOJIS.EMOJI_CROSS_MARK,
              LOG_LEVELS_STR.LEVEL_ERROR
            )
          }
        }
      }
      return this
    })() as unknown as C2DDatabase
  }

  // eslint-disable-next-line require-await
  async newJob(job: DBComputeJob): Promise<string> {
    try {
      await this.provider
        .collections(this.schema.name)
        .documents()
        .create({...job, id: job.jobId})

    } catch (error) {
      const errorMsg = `Error when inserting job entry: ` + error.message
      DATABASE_LOGGER.logMessageWithEmoji(
        errorMsg,
        true,
        GENERIC_EMOJIS.EMOJI_CROSS_MARK,
        LOG_LEVELS_STR.LEVEL_ERROR
      )
      return null
    }
    return job.agreementId
  }

  // eslint-disable-next-line require-await
  async getJob(jobId: string) {
    try {
      return await this.provider.collections(this.schema.name).documents().retrieve(jobId)
    } catch (error) {
      const errorMsg = `Error when retrieving log entry: ` + error.message
      DATABASE_LOGGER.logMessageWithEmoji(
        errorMsg,
        true,
        GENERIC_EMOJIS.EMOJI_CROSS_MARK,
        LOG_LEVELS_STR.LEVEL_ERROR
      )
      return null
    }
  }

  // eslint-disable-next-line require-await
  async updateJob(job: DBComputeJob) {
    // TO DO C2D
    try {
     
      
        return await this.provider
          .collections(this.schema.name)
          .documents()
          .update(job.jobId, job)
     
    } catch (error) {
      const errorMsg = `Error when updating JOB entry ${job.jobId}: ` + error.message
      DATABASE_LOGGER.logMessageWithEmoji(
        errorMsg,
        true,
        GENERIC_EMOJIS.EMOJI_CROSS_MARK,
        LOG_LEVELS_STR.LEVEL_ERROR
      )
      return null
    }
  }

  // eslint-disable-next-line require-await
  async getRunningJobs(engine?: string, environment?: string) {
    try {
      const searchParameters = {
        q: `${engine}`,
        query_by: `clusterHash`
      }

      // Execute search query
      const result = await this.provider
        .collections(this.schema.name)
        .documents()
        .search(searchParameters)

      // Map and return the search hits as log entries
      return result.hits.map((hit) => hit.document)
    } catch (error) {
      const errorMsg = `Error when retrieving multiple job entries: ${error.message}`
      DATABASE_LOGGER.logMessageWithEmoji(
        errorMsg,
        true,
        GENERIC_EMOJIS.EMOJI_CROSS_MARK,
        LOG_LEVELS_STR.LEVEL_ERROR
      )
      return null
    }
  }
}
