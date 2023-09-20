import { FastifyRequest, FastifyReply } from 'fastify';
import { getWordTags, showListName } from '../../bdd/bdd.js';

export const getTags = (req: FastifyRequest<{ Params: { word: string } }>, reply: FastifyReply) => {
    const word = req.params.word
    try {
        if (word) {
            const response = getWordTags(word) 
            const list = showListName().slice(2)
            return reply.code(200).send({ tagsElement: response , list })
        } else {
            return reply.code(404).send({ error: 'Word not Found' })
        }
    } catch (error) {
        console.error(error)
        return reply.code(500).send({ error: 'An unexpected error occurred' })
    }

}