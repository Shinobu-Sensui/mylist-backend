import { FastifyRequest, FastifyReply } from 'fastify';
import { BddRequestError } from '../../error/bddRequestError.js';
import { insertIntoCategories } from '../../bdd/bdd.js';
import { isAdmin } from '../auth/isConnect.js';

interface Body {
    items: string[],
    category: string
}

type Response = {
    inDico: string[],
    notInDico:string[],
    textError:string[]
}

export const addItem = (req: FastifyRequest<{ Body: Body }>, res: FastifyReply) => {
    try {
        console.log(req.session)
        const adminIsOK = isAdmin(req, res)
        if (!adminIsOK) return res.code(403).send({error:'Vous n\'avez pas les droits nécessaires.'})

        const { items, category } = req.body;
        
        if (!items || !category) {
            return res.status(400).send({ message: "Both items and category must be provided." });
        }

        let response:Response = {
            inDico: [],
            notInDico: [], 
            textError:[]
        }

        for(let i = 0; i < items.length; i++) {
            const regex = /^[a-z]+(('[a-z]+)*(-[a-z]+)*)*$/;
            if (!regex.test(items[i]) || items[i].length < 2 || items[i].length > 30) {
                response.textError = [...response.textError, items[i]]
                continue;
            }

            let inDico = insertIntoCategories('listes_globales', { dico:items[i].toLowerCase() })
            
            if (inDico) {
                response.inDico = [
                    ...response.inDico, 
                    items[i]
                ]
            } else {
                response.notInDico = [
                    ...response.notInDico, 
                    items[i]
                ]
            }
        }
    
        const result:{[key:string]: string[] } = {
            success: response.notInDico,
            inInserted: response.inDico,
            textError:response.textError
        };
        
        const message = Object.keys(result).reduce((acc:{success:string[], error:string[]} , val:string) : { success: string[], error:string[]}  => {
            const arraySize:number = result[val].length 
            
            if (arraySize === 0) return acc

            const pluriel = arraySize > 1
            const dataString = result[val].join(' ')

            if (val === "success") {
                let msg:string = pluriel ? "Mots ajoutés " : "Mot ajouté "
                    msg += dataString
                    acc.success.push(msg)
            } else if (val === "inInserted") {
                let msg:string = pluriel ? "Mots non ajoutés (déjà dans le dico) " : "Mot non ajouté "
                    msg += dataString
                    acc.error.push(msg)
            } else if (val === "textError") {
                let msg:string = pluriel ? "Mots non ajoutés (Syntaxe) " : "Mot non ajouté (Syntaxe) "
                    msg += dataString
                    acc.error.push(msg)
            }
            return acc      
        }, {
            success:[],
            error:[]
        })

        console.log(req.session)
        return res.status(200).send({ result, success: message.success, error:message.error });
        

    } catch (error) {
        res.status(500).send(new BddRequestError('Un problème est survenu lors des ajouts d\'items.')); 
    }
};
