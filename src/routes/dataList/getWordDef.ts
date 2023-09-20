import { FastifyRequest, FastifyReply,  RouteGenericInterface } from 'fastify';
import { JSDOM } from 'jsdom'

interface QueryParam extends RouteGenericInterface {
    Params: {
      word: string;
    };
}

export const wordDef = async (request: FastifyRequest<QueryParam>, reply: FastifyReply) => {
    const word = request.params.word;
    const url = `https://fr.wiktionary.org/wiki/${word}`;
    try {
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html)
      const result = dom.window.document.querySelector('ol')?.textContent?.split('\n')
      reply.send({result});
    } catch (error) {
      request.log.error(error);
      reply.status(500).send('Erreur lors de la récupération de la page');
    }
};