import { SUPPORTED_PROTOCOL_COMMANDS, PROTOCOL_COMMANDS } from '../../utils/constants.js'

export type ValidateParams = {
  valid: boolean
  reason?: string
  status?: number
}
// TODO add others when we add support
export function validateCommandAPIParameters(requestBody: any): ValidateParams {
  // eslint-disable-next-line prefer-destructuring
  const command: string = requestBody.command as string

  if (!command) {
    return {
      valid: false,
      reason: 'Invalid Request: "command" is mandatory!',
      status: 400
    }
  }
  if (SUPPORTED_PROTOCOL_COMMANDS.includes(command)) {
    // downloadURL
    if (command === PROTOCOL_COMMANDS.DOWNLOAD_URL) {
      // only mandatory is the url
      if (!requestBody.url) {
        return {
          valid: false,
          reason: 'Missing required parameter: "url"',
          status: 400
        }
      }
      return {
        valid: true
      }
      // echo
    } else if (command === PROTOCOL_COMMANDS.ECHO) {
      // nothing special with this one
      return {
        valid: true
      }
    }
    return {
      valid: true
    }
  }
  return {
    valid: false,
    reason: `Invalid or unrecognized command: "${command}"`,
    status: 400
  }
}
