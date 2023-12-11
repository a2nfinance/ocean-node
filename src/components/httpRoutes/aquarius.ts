import express from 'express'
import {streamToString} from "../../utils/util.js";
import {Readable} from "stream";
import {handleGetDdoCommand} from "../core/ddoHandler.js";
import {PROTOCOL_COMMANDS} from "../../utils/constants.js";
import {handleQueryCommand} from "../core/queryHandler.js";

export const aquariusRoutes = express.Router()

aquariusRoutes.get('/assets/ddo/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const node = req.oceanNode.getP2PNode()
        const result = await handleGetDdoCommand(node, { id: did, command: PROTOCOL_COMMANDS.GET_DDO })
        if (result.stream) {
            const ddo = JSON.parse(await streamToString(result.stream as Readable))
            res.json(ddo)
        } else {
            res.status(result.status.httpStatus).send(result.status.error)
        }
    } catch (error) {
        res.status(500).send('Internal Server Error')
    }
})

aquariusRoutes.get('/assets/metadata/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const node = req.oceanNode.getP2PNode()
        const result = await handleGetDdoCommand(node, { id: did, command: PROTOCOL_COMMANDS.GET_DDO })
        if (result.stream) {
            const ddo = JSON.parse(await streamToString(result.stream as Readable))
            res.json(ddo.metadata)
        } else {
            res.status(result.status.httpStatus).send(result.status.error)
        }
    } catch (error) {
        res.status(500).send('Internal Server Error')
    }
})

aquariusRoutes.post('/assets/metadata/query', async (req, res) => {
    try {
        const query = req.body;
        const node = req.oceanNode.getP2PNode()
        const result = await handleQueryCommand(node, { query, command: PROTOCOL_COMMANDS.QUERY })
        if (result.stream) {
            const queryResult = JSON.parse(await streamToString(result.stream as Readable))
            res.json(queryResult)
        } else {
            res.status(result.status.httpStatus).send(result.status.error)
        }
    } catch (error) {
        res.status(500).send('Internal Server Error')
    }
})

aquariusRoutes.get('/aquarius/state/ddo', async (req, res) => {
    try {
        let query
        const did = String(req.query.did)
        if (did) {
            query = {
                q: did,
                query_by: 'id',
            }
        }
        const chainId = String(req.query.chainId)
        if (chainId) {
            query = {
                q: chainId,
                query_by: 'chainId',
            }
        }
        const nft = String(req.query.nft)
        if (nft) {
            query = {
                q: nft,
                query_by: 'nft.address',
            }
        }
        const node = req.oceanNode.getP2PNode()
        const result = await handleQueryCommand(node, { query, command: PROTOCOL_COMMANDS.QUERY })
        if (result.stream) {
            const queryResult = JSON.parse(await streamToString(result.stream as Readable))
            if (queryResult.found) {
                res.json(queryResult.hits[0].nft.state)
            } else {
                res.status(404).send('Not found')
            }
        } else {
            res.status(result.status.httpStatus).send(result.status.error)
        }
    } catch (error) {
        res.status(500).send('Internal Server Error')
    }
})
