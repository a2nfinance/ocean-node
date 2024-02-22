import { Readable } from 'stream'

export interface HeadersObject {
  [key: string]: string
}

export interface BaseFileObject {
  type: string
}

export interface UrlFileObject extends BaseFileObject {
  url: string
  method: string
  headers?: [HeadersObject]
}

export interface IpfsFileObject extends BaseFileObject {
  hash: string
}

export interface ArweaveFileObject extends BaseFileObject {
  transactionId: string
}

export interface StorageReadable {
  stream: Readable
  httpStatus?: number
  headers?: [any]
}

export enum FileObjectType {
  URL = 'url',
  IPFS = 'ipfs',
  ARWEAVE = 'arweave'
}

export interface FileInfoRequest {
  type: FileObjectType
  fileIndex?: number
}

export interface FileInfoResponse {
  valid: boolean
  contentLength: string
  contentType: string
  name: string
  type: string
}

export interface FileInfoHttpRequest {
  type?: 'ipfs' | 'url' | 'arweave'
  did?: string
  hash?: string
  url?: string
  transactionId?: string
  serviceId?: string
}
