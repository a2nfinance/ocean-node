import { Database } from '../../components/database/index.js'
import { expect, assert } from 'chai'
import {
  CustomNodeLogger,
  LOG_LEVELS_STR,
  CustomOceanNodesTransport,
  getCustomLoggerForModule,
  LOGGER_MODULE_NAMES,
  defaultConsoleTransport
} from '../../utils/logging/Logger.js'

describe('LogDatabase CRUD', () => {
  let database: Database
  let logger: CustomNodeLogger
  const logEntry = {
    timestamp: Date.now(),
    level: 'info',
    message: `Test log message ${Date.now()}`,
    moduleName: 'testModule-1',
    meta: 'Test meta information'
  }
  let logId: string // Variable to store the ID of the created log entry

  before(async () => {
    const dbConfig = {
      url: 'http://localhost:8108/?apiKey=xyz'
    }
    database = await new Database(dbConfig)
    // Initialize logger with the custom transport that writes to the LogDatabase
    const customLogTransport = new CustomOceanNodesTransport({ dbInstance: database })

    logger = getCustomLoggerForModule(
      LOGGER_MODULE_NAMES.HTTP,
      LOG_LEVELS_STR.LEVEL_INFO, // Info level
      defaultConsoleTransport // console only Transport
    )
    logger.addTransport(customLogTransport)
  })

  it('insert log', async () => {
    const result = await database.logs.insertLog(logEntry)
    expect(result).to.include.keys(
      'id',
      'timestamp',
      'level',
      'message',
      'moduleName',
      'meta'
    )
    logId = result?.id // Save the auto-generated id for further operations
  })

  it('retrieve log', async () => {
    const result = await database.logs.retrieveLog(logId)
    expect(result?.id).to.equal(logId)
    expect(result?.level).to.equal(logEntry.level)
    expect(result?.message).to.equal(logEntry.message)
    expect(result?.moduleName).to.equal(logEntry.moduleName)
    expect(result?.meta).to.equal(logEntry.meta)
  })

  it('should save a log in the database when a log event is triggered', async () => {
    const newLogEntry = {
      timestamp: Date.now(),
      level: 'info',
      message: `NEW Test log message ${Date.now()}`
    }
    // Trigger a log event which should be saved in the database
    logger.log(newLogEntry.level, newLogEntry.message)

    // Wait for the log to be written to the database
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay to allow log to be processed

    // Define the time frame for the log retrieval
    const startTime = new Date(Date.now() - 10000) // 10 seconds ago
    const endTime = new Date() // current time

    // Retrieve the latest log entry
    const logs = await database.logs.retrieveMultipleLogs(startTime, endTime, 1)

    expect(logs?.length).to.equal(1)
    expect(logs?.[0].id).to.equal(String(Number(logId) + 1))
    expect(logs?.[0].level).to.equal(newLogEntry.level)
    expect(logs?.[0].message).to.equal(newLogEntry.message)
    expect(logs?.[0].moduleName).to.equal('HTTP')
  })

  it('should save a log in the database when a log.logMessage is called', async () => {
    const newLogEntry = {
      timestamp: Date.now(),
      level: 'info',
      message: `logMessage: Test log message ${Date.now()}`,
      moduleName: 'testModule-3',
      meta: 'Test meta information'
    }
    // Trigger a log event which should be saved in the database
    logger.logMessage(newLogEntry.message)

    // Wait for the log to be written to the database
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay to allow log to be processed

    // Define the time frame for the log retrieval
    const startTime = new Date(Date.now() - 10000) // 10 seconds ago
    const endTime = new Date() // current time

    // Retrieve the latest log entry
    const logs = await database.logs.retrieveMultipleLogs(startTime, endTime, 1)

    expect(logs?.length).to.equal(1)
    expect(logs?.[0].id).to.equal(String(Number(logId) + 2))
    expect(logs?.[0].level).to.equal(newLogEntry.level)
    expect(logs?.[0].message).to.equal(newLogEntry.message)
    expect(logs?.[0].moduleName).to.equal('HTTP')
  })

  it('should save a log in the database when a log.logMessageWithEmoji is called', async () => {
    const newLogEntry = {
      timestamp: Date.now(),
      level: 'info',
      message: `logMessageWithEmoji: Test log message ${Date.now()}`,
      moduleName: 'testModule-4',
      meta: 'Test meta information'
    }
    // Trigger a log event which should be saved in the database
    logger.logMessageWithEmoji(newLogEntry.message)

    // Wait for the log to be written to the database
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay to allow log to be processed

    // Define the time frame for the log retrieval
    const startTime = new Date(Date.now() - 10000) // 10 seconds ago
    const endTime = new Date() // current time

    // Retrieve the latest log entry
    const logs = await database.logs.retrieveMultipleLogs(startTime, endTime, 1)

    expect(logs?.length).to.equal(1)
    expect(logs?.[0].id).to.equal(String(Number(logId) + 3))
    expect(logs?.[0].level).to.equal(newLogEntry.level)
    assert(logs?.[0].message)
    expect(logs?.[0].moduleName).to.equal('HTTP')
  })
})

describe('LogDatabase retrieveMultipleLogs with specific parameters', () => {
  let database: Database
  // Assume start and end times are defined to bracket your test logs
  const startTime = new Date(Date.now() - 10000) // 10 seconds ago
  const endTime = new Date() // now

  before(async () => {
    const dbConfig = {
      url: 'http://localhost:8108/?apiKey=xyz'
    }
    database = await new Database(dbConfig)
  })

  it('should retrieve logs with a specific moduleName', async () => {
    const moduleName = 'testModule-1'
    const logs = await database.logs.retrieveMultipleLogs(
      startTime,
      endTime,
      10,
      moduleName
    )
    expect(logs).to.satisfy((logs: any[]) =>
      logs.every((log) => log.moduleName === moduleName)
    )
  })

  it('should retrieve logs with a specific level', async () => {
    const level = 'info'
    const logs = await database.logs.retrieveMultipleLogs(
      startTime,
      endTime,
      10,
      undefined,
      level
    )
    expect(logs).to.satisfy((logs: any[]) => logs.every((log) => log.level === level))
  })

  it('should retrieve logs with both a specific moduleName and level', async () => {
    const moduleName = 'testModule-1'
    const level = 'info'
    const logs = await database.logs.retrieveMultipleLogs(
      startTime,
      endTime,
      10,
      moduleName,
      level
    )
    expect(logs).to.satisfy((logs: any[]) =>
      logs.every((log) => log.moduleName === moduleName && log.level === level)
    )
  })

  it('should not retrieve logs when no logs match the moduleName', async () => {
    const logs = await database.logs.retrieveMultipleLogs(
      startTime,
      endTime,
      10,
      'nonExistentModule'
    )
    assert.isEmpty(logs, 'Expected logs to be empty')
  })

  it('should not retrieve logs when no logs match the level', async () => {
    const logs = await database.logs.retrieveMultipleLogs(
      startTime,
      endTime,
      10,
      undefined,
      'nonExistentLevel'
    )
    assert.isEmpty(logs, 'Expected logs to be empty')
  })

  it('should return an error or empty result for invalid startTime and endTime', async () => {
    const invalidTime = new Date('invalid date')
    try {
      const logs = await database.logs.retrieveMultipleLogs(invalidTime, invalidTime, 10)
      assert.isEmpty(logs, 'Expected logs to be empty')
    } catch (error) {
      assert(error, 'Expected an error for invalid date inputs')
    }
  })

  it('should return an empty array for negative maxLogs', async () => {
    const logs = await database.logs.retrieveMultipleLogs(startTime, endTime, -1)
    assert.isNull(logs, 'Expected logs to be null')
  })

  it('should retrieve a maximum of one log when maxLogs is set to 1', async () => {
    const logs = await database.logs.retrieveMultipleLogs(startTime, endTime, 1)
    // check if the length of logs is 1 or less
    expect(logs?.length).to.be.at.most(1)
  })

  it('should retrieve no logs when maxLogs is set to 0', async () => {
    const logs = await database.logs.retrieveMultipleLogs(startTime, endTime, 0)
    assert.isEmpty(logs, 'Expected logs to be empty')
  })

  // Performance test
  it('should perform within acceptable limits', async function () {
    this.timeout(5000) // Extend default Mocha test timeout

    const startPerfTime = process.hrtime()
    await database.logs.retrieveMultipleLogs(startTime, endTime, 10)
    const endPerfTime = process.hrtime(startPerfTime)

    // Convert [seconds, nanoseconds] to milliseconds
    const elapsedTimeInMs = endPerfTime[0] * 1000 + endPerfTime[1] / 1e6
    expect(elapsedTimeInMs).to.be.below(1000) // threshold
  })
})