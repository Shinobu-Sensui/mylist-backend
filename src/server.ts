import fastify, { FastifyInstance } from 'fastify';

const app: FastifyInstance = fastify()

type StartServer = (port:number) => Promise<void> 

const startServer: StartServer = async (port:number) => {
    try {
        await app.listen({ port: 8000 })
    } catch(err) {
        console.error(err)
        process.exit(1)
    }
}

export {
    startServer, 
    app
};



