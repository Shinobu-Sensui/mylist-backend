import Database from "better-sqlite3";
import { BddRequestError } from "../error/bddRequestError.js";
import { getSyllables } from "../utils/list_details.js";
import { promises as fs } from 'fs';


import path, { dirname, join } from "path";
import { fileURLToPath } from "url";


const db: Database.Database = new Database('database.db')

type Values = { [key: string]: string | number | boolean }
type DeleteFromTable = (table: string, conditions: Values) => void
type DataListCategory = (category: string) => string[]

// const wordExistsInTable = (table: string, wordColumn: string, word: string) => {
// 
//     type ResultCount = {
//         count:number
//     }
//     const sql = `SELECT COUNT(*) as count FROM ${table} WHERE ${wordColumn} = ?`;
//     const stmt = db.prepare(sql);
//     const result =  stmt.get(word) as ResultCount;
//     return result.count > 0;
//   };
//   

const detectWordInCategory = (word: string) => {
    const checkWordQuery = db.prepare(`SELECT COUNT(*) as count FROM listes_globales WHERE dico = ?`);
    type Result = {
        count: number
    }
    const result = checkWordQuery.get(word) as Result;
    return result.count > 0;
}

type Wordvalues = {
    dico: string
}

type InsertIntoCategories = (table: string, values: Wordvalues) => boolean

const insertIntoCategories: InsertIntoCategories = (table, values) => {
    let bolRequest = detectWordInCategory(values.dico)
    if (bolRequest) return true
    if (!bolRequest) {
        const keys = Object.keys(values);
        const valuesArray = Object.values(values);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        const stmt = db.prepare(sql);
        stmt.run(...valuesArray);
        return false
    }
    return true
}


type UpdateInTable = (table: string, values: Record<string, any>, whereClause: string, whereValues: any[]) => void;
const updateInTable: UpdateInTable = (table, values, whereClause, whereValues) => {
    try {
        const keys = Object.keys(values);
        const valuesArray = Object.values(values);

        const setClause = keys.map(key => `${key} = ?`).join(', ');

        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

        const stmt = db.prepare(sql);
        stmt.run(...valuesArray, ...whereValues);
    } catch (error) {
        throw new BddRequestError('Updated Word failed')
    }
};



const deleteFromTable: DeleteFromTable = (table, conditions) => {
    const keys = Object.keys(conditions);
    const valuesArray = Object.values(conditions);

    const whereClause = keys.map((key) => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

    const stmt = db.prepare(sql);
    stmt.run(...valuesArray);
}



const dataListCategory: DataListCategory = (category) => {
    try {
        const select = db.prepare(`SELECT dico FROM listes_globales ${category !== "dico" ? `WHERE ${category} = 1` : ""}`);
        return select.all().map((x: any) => x.dico);
    } catch (error) {
        throw new BddRequestError(`Failed to select category with ${category}`)
    }
}


type ShowListName = () => string[]
type TableInfo = { name: string }

const showListName: ShowListName = () => {
    try {
        const tableInfo = db.pragma('table_info(listes_globales)') as TableInfo[];
        const columnNames = tableInfo.map((column) => column.name);
        return columnNames
    } catch (error) {
        throw new BddRequestError('Failed to get all listName from the database')
    }
}

type forDicoType = {
    list: string[],
    size: number[]
}


export const getWordTags = (word: string): string[] | undefined => {
    try {
        const request = db.prepare('SELECT * from listes_globales WHERE dico = ?')
        type Response = {
            [key: string]: number | string
        }

        const response = request.get(word) as Response

        if (response) {
            const result = Object.keys(response).reduce((acc: string[], val) => {
                response[val] && acc.push(val)
                return acc
            }, []).slice(2)
            return result
        }
        return

    } catch (error) {
        throw new BddRequestError('Request BDD getTags failed')
    }
}

const getListData = () => {
    const listName = showListName().slice(1)
    let objectData: any = {}
    if (listName) {
        let forDico: forDicoType = {
            list: [],
            size: []
        }

        for (let l of listName) {
            const result = dataListCategory(l)
            const resultSize = result.length
            const syllables = getSyllables(result)
            const firstLetterSyCountSyllables = CountFirstLetterSyllable(syllables)
            const firstLetterSyCountList = CountFirstLetter(l)
            const wsize = wordSize(result)
            forDico.size.push(resultSize)
            objectData[l] = {
                size: resultSize,
                sizeSyllables: syllables.length,
                firstLetterSyCountSyllables,
                firstLetterSyCountList,
                wordSize: wsize
            }
        }

        forDico.list.push(...listName)

        objectData['dico'] = { ...objectData['dico'], forDico }

    }
    return objectData
}

interface paramFindListLikeElements {
    category: string,
    table: string,
    syllable: string
}

type FindListLikeElements = (obj: paramFindListLikeElements, choose?: string) => any

/**
 * Récupère les mots trouvés en fonction d'une syllable dans une liste
 * @param obj Objet de paramètres
 * @returns 
 */


const findListLikeElements: FindListLikeElements = (obj, choose = "in"): any => {
    try {
        const syllable = choose === "in" ? `%${obj.syllable}%` : choose === "end" ? `%%${obj.syllable}` : `${obj.syllable}%%`;

        let request: string
        let selectRequest: string

        if (obj.category === "dico") {
            request = `SELECT COUNT(*) as totalCount FROM ${obj.table} WHERE dico LIKE ?`;
            selectRequest = `SELECT * FROM ${obj.table} WHERE dico LIKE ? ORDER BY LENGTH(dico) LIMIT 10`;
        } else {
            request = `SELECT COUNT(*) as totalCount FROM ${obj.table} WHERE ${obj.category} AND dico LIKE ?`
            selectRequest = `SELECT * FROM ${obj.table} WHERE ${obj.category} AND dico LIKE ? ORDER BY LENGTH(dico) ASC LIMIT 7`
        }

        const countRequest = db.prepare(request);
        const countResult: any = countRequest.get(syllable); // Nombre d'élements récupérés


        const totalCount = countResult.totalCount;

        const randomRequest = db.prepare(selectRequest);
        const randomResults = randomRequest.all(syllable);
        const solutions = randomResults.reduce((acc: any, val: any) => {
            acc = [...acc, [val.dico, Object.keys(val).filter(element => val[element] === 1).map(e => e)]]
            return acc
        }, [])
        return {
            totalCount,
            solutions
        };

    } catch (error) {
        throw new BddRequestError('Request BDD FindLikeElement failed');
    }
}

interface CounterFirstLetterResult {
    first_letter: string;
    count: number;
}

const CountFirstLetter = (category: string) => {
    try {
        let SQLrequest: string

        if (category === "dico") {
            SQLrequest = `SELECT SUBSTR(dico, 1, 1) AS first_letter, COUNT(*) AS count
            FROM listes_globales
            GROUP BY first_letter
            ORDER BY first_letter;`
        } else {
            SQLrequest = `SELECT SUBSTR(dico, 1, 1) AS first_letter, ${category}, COUNT(*) AS count
                FROM listes_globales
                WHERE ${category}
                GROUP BY first_letter, ${category}
                ORDER BY first_letter, ${category};`
        }

        const request = db.prepare(SQLrequest);
        const result: CounterFirstLetterResult[] = request.all() as CounterFirstLetterResult[];


        // Utilisation de la méthode `reduce` pour transformer le résultat
        const transformedResult: [string[], number[], number] = result.reduce(
            (acc: [string[], number[], number], val: CounterFirstLetterResult) => {
                acc[0].push(val.first_letter);
                acc[1].push(val.count);
                acc[2] += val.count
                return acc;
            },
            [[], [], 0]
        );
        return transformedResult
    } catch (error) {
        throw new BddRequestError('Request BDD CountFirstLetter faild')
    }
};

interface ObjSyllables {
    [key: string]: number
}

type CounterFirstLetterSyllableType = (syllables: string[]) => [[string], [number]]


type Obj = {
    [key:string]:number
}

const syllablesWithSoluces = (array:string[]) => {
    let obj: {[key: string]: number} = {};  
    const regex = /^[a-z]{2,3}$/;

    const incrementOrSet = (key: string) => {
        obj[key] = (obj[key] || 0) + 1;
    };

   for(let i = array.length -1; i > 0; i--) {
        for(let j = 0, len = array[i].length - 1; j < len; j++) {
            const a = array[i].slice(j, j + 2);
            const b = array[i].slice(j, j + 3);

            if (regex.test(a)) incrementOrSet(a);
            if (regex.test(b)) incrementOrSet(b);
        }
    }


    return JSON.stringify(obj)
}


const generateFiles = async () => {
    const rootDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
  
    try {
        const lists = showListName();
        for(let i = 1; i < lists.length; i++) {
            let currentData = dataListCategory(lists[i]);
            const filePath = join(rootDir, 'src', 'data', 'occ', `${lists[i]}.json`);
            const dirPath = join(rootDir, 'src', 'data', 'occ');

            console.log("Checking directory:", dirPath);
            if (!await fsExists(dirPath)) {
                console.log("Directory doesn't exist, creating:", dirPath);
                await fs.mkdir(dirPath, { recursive: true });
            }

            let data = syllablesWithSoluces(currentData);
            console.log("Writing to file:", filePath);
            await fs.writeFile(filePath, data);
        }
        return true
    } catch(error) {
        console.error(error);
    }
};

// Helper function to check if a file or directory exists
const fsExists = async (path:string) => {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
};



const CountFirstLetterSyllable: CounterFirstLetterSyllableType = (syllables) => {
    const objsyllables: ObjSyllables = {}

    let firstletter: string
    for (let i = 0; i < syllables.length; i++) {
        firstletter = syllables[i].slice(0, 1)
        if (firstletter !== "'" && firstletter !== "-") {
            objsyllables[firstletter] ? ++objsyllables[firstletter] : objsyllables[firstletter] = 1;
        }
    }
    return Object.entries(objsyllables)
        .reduce((acc: any, val) => {
            acc[0] = [...acc[0], val[0]]
            acc[1] = [...acc[1], val[1]]
            return acc
        }, [[], []]
        )
}

const wordSize = (array: string[]) => {
    type ResultType = { [key: number]: number };

    let valSize: number;
    const result = array.reduce((acc: ResultType, val: string) => {
        valSize = val.length;
        acc[valSize] ? acc[valSize]++ : (acc[valSize] = 1);
        return acc;
    }, {});

    return Object.entries(result).reduce(
        (acc: [number[], number[]], val) => {
            acc[0].push(Number(val[0]));
            acc[1].push(Number(val[1]));
            return acc;
        },
        [[], []]
    );
};

export {
    db,
    generateFiles, 
    getListData,
    updateInTable,
    detectWordInCategory,
    showListName,
    insertIntoCategories,
    deleteFromTable,
    findListLikeElements
}
