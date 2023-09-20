import { FastifyRequest, FastifyReply } from 'fastify';
import { isAdmin } from '../auth/isConnect.js';
import { refreshGraphInfo } from '../../utils/graphManager.js';

interface Params {
    word: string
}

export const refreshGraph = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const adminIsOK = isAdmin(req, reply)
        if (!adminIsOK) return reply.code(403).send({ error: 'Vous n\'avez pas les droits nécessaires.' })
        const response = await refreshGraphInfo()
        if (response) {
            reply.code(200).send({ message: 'Success' })
        } else {
            reply.code(400).send({ error: 'Un problème est survenu.' })
        }

    } catch (error) {
        reply.code(500).send({ error: 'Le serveur ne comprend pas la requête.' })
    }
};
