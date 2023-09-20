import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../bdd/bdd.js';
import { AvatarError } from '../../error/avatarError.js';
import { writeFileSync } from 'node:fs';

export const paramAvatar = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const data: any = await req.file();
        let buffer = Buffer.alloc(0);
        for await (const chunk of data.file) {
            buffer = Buffer.concat([buffer, chunk instanceof Buffer ? chunk : Buffer.from(chunk)]);
        }
        
        const session = req.session.get('user');
        if (!session) throw new AvatarError('User not logged in');
        const insert = db.prepare('UPDATE USERS SET IMAGE = ? WHERE id_users = ?');
       
        const result = insert.run(buffer, session.id);

        if (result.changes === 0) {
            throw new AvatarError('No user updated');
        }

        return res.send({ status: 'ok' });

    } catch (error) {
        if (error instanceof AvatarError) {
            res.code(400).send({ status: 'error', message: error.message });
        } else {
            res.code(500).send({ status: 'error', message: 'Error Server' });
        }
    }
};
