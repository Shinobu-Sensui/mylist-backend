import { getListData } from "../bdd/bdd.js"

interface Object {
    [key:string]:number
}

/**
 * 
 * @param array Tableau de mots (string) 
 * @returns 
 * Retourne toutes les syllabes possibles d'un tableau sans doublon
 */

const getSyllables = (array:string[]) : string[] => {
    const obj: Object = {}

    const cutter = (chaine:string) => {
        const len = chaine.length - 1
        for(let i = 0; i < len; i++) {
            obj[chaine.slice(i, i + 2)] = 0
            obj[chaine.slice(i, i + 3)] = 0 
        }
    }
    
    for(let i of array) cutter(i)

    return Object.keys(obj).sort()
}


const refreshDetails = () => {
   const response =  getListData()
   console.log(response)
}

export {
    getSyllables,
    refreshDetails
}