import { FastifyRequest, FastifyReply } from 'fastify';
import { updateInTable, detectWordInCategory, showListName } from '../../bdd/bdd.js';
import { difference } from '../../utils/difference.js';
import { isAdmin } from '../auth/isConnect.js';

interface body {
    word: string,
    categories: {
        [key:string]:number
    }
}

export const updateItem = (req: FastifyRequest<{ Body: body }>, reply: FastifyReply) => {
    try {

        const adminIsOK = isAdmin(req, reply)
        console.log(adminIsOK)
        if (!adminIsOK) return reply.code(403).send({error:'Vous n\'avez pas les droits nécessaires.'})

        if (!req.body.word || !req.body.categories) {
            return reply.code(404).send({message:'error'})
        }

        let bolRequest = detectWordInCategory(req.body.word.toLowerCase())
        if (!bolRequest) return reply.code(404).send({ error: 'word tot found'})
    
        if (bolRequest) {
            updateInTable('listes_globales', 
                req.body.categories
            , 
                'dico = ?', 
                [req.body.word]
            )
            return reply.code(200).send({ success: true, updated: req.body.word })
        } else {
            return reply.code(404).send({ error: 'Word not found in database' })
        }
    } catch (error) {
        console.error(error);
        return reply.code(500).send({ error: 'An unexpected error occurred' });
    }
};
