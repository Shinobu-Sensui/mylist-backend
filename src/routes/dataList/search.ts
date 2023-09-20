import { FastifyRequest, FastifyReply } from 'fastify'
import { db, findListLikeElements } from '../../bdd/bdd.js'

interface SearchRequestBody {
    syllable?: string;
    category?: string
}


export const search = (req: FastifyRequest<{Body:SearchRequestBody}>, res: FastifyReply) => {
    if (req.body && req.body.syllable && req.body.category) {
      const response = findListLikeElements({
        category: req.body.category,
        table: 'listes_globales', 
        syllable: req.body.syllable
      })
      return res.status(200).send({ message: "Recherche effectuée", data: response });
    } else {
      return res.status(400).send({ message: "Corps de la requête manquant" });
    }
  };
  