import { FastifyRequest, FastifyReply, RouteGenericInterface } from "fastify";
import { db } from "../../bdd/bdd.js";
import { verifyPassword } from "../../utils/hash.js";

interface MyRequestBody extends RouteGenericInterface {
  Body: {
    name: string;
    password: string;
  };
}

interface LoginMatch {
  id: number;
  name: string;
  role:string;
  password: string;
  IMAGE:Buffer;
  inscription:string;

}

const login = async (req: FastifyRequest<MyRequestBody>, res: FastifyReply) => {
  const { name, password } = req.body;
  if (name && password) {
    const loginMatch: LoginMatch | any = db.prepare('SELECT * from USERS where name = ?').get(name);
    if (loginMatch && (await verifyPassword(password, loginMatch.password))) {
      console.log(loginMatch)
      req.session.set('user', {
        id: loginMatch.id_users,
        name: loginMatch.name,
        role:loginMatch.role,
        inscription: loginMatch.created_at
      });
      
      return res.send({ id:loginMatch.id_users, name: loginMatch.name, role:loginMatch.role, inscription:loginMatch.created_at });
    } else {
      res.status(401).send({message: 'Invalid username or password' });
    }
  } else {
    res.status(400).send({message: 'Username and password are required' });
  }
};

export {
  login,
};
