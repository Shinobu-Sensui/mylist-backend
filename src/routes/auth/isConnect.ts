import { FastifyRequest, FastifyReply } from "fastify"

const isConnect = (req:FastifyRequest, res: FastifyReply) => {
    if (req.session.get('user')) {
       return res.send(req.session.get('user'))
    } else {
       return res.send()
    }
}

type IsAdminUser = {
    id:number,
    name:string,
    role:string
}


const isAdmin = (req:FastifyRequest, reply:FastifyReply) => {
    const user:IsAdminUser|null = req.session.get('user')
    console.log(req.session)
    if (user) { 
        if (user.role === "Admin") return true
        return false
    }
    return false
}

export {
    isAdmin,
    isConnect
}