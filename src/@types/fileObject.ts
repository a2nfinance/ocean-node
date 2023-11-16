export interface HeadersObject {
  [key: string]: string
}

export interface UrlFileObject {
  type: string
  url: string
  method: string
  headers?: [HeadersObject]
}

export interface IpfsFileObject {
  type: string
  hash: string
}

export interface ArweaveFileObject {
  type: string
  transactionId: string
}