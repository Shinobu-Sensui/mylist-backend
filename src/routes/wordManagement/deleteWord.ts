import { FastifyRequest, FastifyReply } from 'fastify';
import { deleteFromTable, detectWordInCategory, insertIntoCategories } from '../../bdd/bdd.js';
import { isAdmin } from '../auth/isConnect.js';

interface Params {
    word: string
}

export const deleteItem = (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
    try {
        const adminIsOK = isAdmin(req, reply)
        if (!adminIsOK) return reply.code(403).send({error:'Vous n\'avez pas les droits nécessaires.'})

        if (!req.params.word) return
        let bolRequest = detectWordInCategory(req.params.word.toLowerCase())
        
        if (bolRequest) {
            deleteFromTable('listes_globales', {
                dico: req.params.word
            })
            return reply.code(200).send({ success: true, deleted: req.params.word })
        } else {
            return reply.code(404).send({ error: 'Word not found in database', success:false })
        }
    } catch (error) {
        console.error(error);
        return reply.code(500).send({ error: 'An unexpected error occurred', success:false });
    }
};
