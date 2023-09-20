import { FastifyRequest, FastifyReply } from 'fastify';
import { AvatarError } from '../../error/avatarError.js';
import { db } from '../../bdd/bdd.js';
import {writeFileSync} from 'node:fs'

type Dbrequest = {
    id_users:number,
    name:string, 
    password:string
    IMAGE: Buffer, 
    role:string | null

}

export const getAvatar = (req:FastifyRequest, res: FastifyReply) => {
    try {
      const session = req.session.get('user')
      if (!session)  throw new AvatarError('User not logged in');
      const dbrequest: Dbrequest | any  = db.prepare('SELECT * from USERS WHERE id_users = ?').get(session.id)
      if (!dbrequest || !dbrequest.IMAGE) throw new AvatarError('No image found for the user');
      res.header('Content-Type', 'application/json');
      const imageBase64 = dbrequest.IMAGE.toString('base64');
      writeFileSync('output.jpg', dbrequest.IMAGE); // optional: for testing
      return res.send({ image:imageBase64 } )
      
    } catch(error) {
        if (error instanceof AvatarError) {
            res.code(400)
            throw new AvatarError('AvatarError')
        }
        return res.code(500)
    }
}