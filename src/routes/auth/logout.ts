import { FastifyRequest, FastifyReply } from 'fastify'


export const logout = async (req:FastifyRequest, res: FastifyReply) => {
    req.session.delete()
    if (req.session.deleted) return res.code(200).send({message:'success' })
    return res.code(400).send({error:"error"})
}