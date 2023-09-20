import { FastifyRequest, FastifyReply  } from 'fastify';
import { detectWordInCategory, updateInTable } from '../../bdd/bdd.js';
import { BddRequestError } from '../../error/bddRequestError.js';
import { isAdmin } from '../auth/isConnect.js';

type Body = {
    word:string,
    toBeModified:string
}

export const updateWord = (req:FastifyRequest<{Body:Body}>, reply:FastifyReply) => {
    
    try {

        const adminIsOK = isAdmin(req, reply)
        if (!adminIsOK) return reply.code(403).send({error:'Vous n\'avez pas les droits nécessaires.'})

        if (!req.body.word || !req.body.toBeModified) return reply.code(404).send({error:`le paramètre word est introuvable.`})

        const word = req.body.word.toLowerCase();
        const toBeModified = req.body.toBeModified.toLocaleLowerCase()

        const wordInDico = detectWordInCategory(toBeModified)

        if (wordInDico) return reply.code(400).send({error: `Le mot que vous souhaitez modifier est déjà dans la liste.`})
        updateInTable('listes_globales', {dico:toBeModified}, 'dico = ?', [word])
        return reply.code(200).send({message:`Le mot ${word} a été modifié avec succès en ${toBeModified}`})
    } catch(error) {
        if (error instanceof BddRequestError) {
            return reply.code(400).send({ error:error.message })
        }

        return reply.code(500).send({ error: 'An unexpected error occurred' });

    }




}