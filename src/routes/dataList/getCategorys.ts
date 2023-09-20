import fastify, { FastifyRequest, FastifyReply } from 'fastify'
import { showListName } from '../../bdd/bdd.js'


export const getNameList = (req:FastifyRequest, res: FastifyReply) => {
    const response = showListName().slice(1)
    return res.send({ data: response })  
}