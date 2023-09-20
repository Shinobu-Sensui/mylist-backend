import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { getGraphInfo } from '../../utils/graphManager.js';

interface RequestBody {
    category:string
}

export const graphData = (req:FastifyRequest, res:FastifyReply) => {

    const graphInfo = getGraphInfo()
    if (graphInfo) {    
        return res.status(200).send(graphInfo)
    } else {
        return res.status(400)
    }
}