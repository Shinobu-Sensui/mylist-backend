import { startServer, app } from "./server.js";
import { isConnect } from "./routes/auth/isConnect.js";
import { fileURLToPath } from "url";
import { fastifySecureSession } from "@fastify/secure-session"
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { login } from "./routes/auth/login.js";
import cors from '@fastify/cors'
import { logout } from "./routes/auth/logout.js";
import { paramAvatar } from "./routes/params/addavatar.js";
import { fastifyMultipart } from '@fastify/multipart'
import { getAvatar } from "./routes/params/getAvatar.js";
import { getNameList } from "./routes/dataList/getCategorys.js";
import { search } from "./routes/dataList/search.js";
import { getListData } from "./bdd/bdd.js";
import { graphData } from "./routes/dataList/graphData.js";
import { addItem } from "./routes/wordManagement/addWord.js";
import { wordDef } from "./routes/dataList/getWordDef.js";
import { FastifyRequest, FastifyReply } from 'fastify'
import { deleteItem } from "./routes/wordManagement/deleteWord.js";
import { getTags } from "./routes/dataList/getTags.js";
import { updateItem } from "./routes/wordManagement/updateTag.js";
import { updateWord } from "./routes/wordManagement/updateWord.js";
import { refreshGraph } from "./routes/wordManagement/refreshGraph.js";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const allowedOrigins = ['http://localhost:5173', 'https://khayyer.io'];


app.register(cors, {
    origin: (origin, cb) => {
        if (origin && allowedOrigins.includes(origin)) {
            cb(null, true);
            return;
        }
        cb(new Error('Not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
});

app.register(fastifySecureSession, {
    cookieName:"my-session-cookie", 
    key: readFileSync(join(rootDir, 'secret_key')), 
    cookie: {
        path:"/"
    }
})

app.register(fastifyMultipart)

/**
 * Authentification
 */

app.get('/me', isConnect)
app.post('/login', login )
app.delete('/logout', logout)


/**
 * Profil
 */

app.post('/avatar', paramAvatar)
app.get('/avatar', getAvatar)
app.get('/listname', getNameList)

/**
 * Traitement de données
 */

// admin WordManagement
app.post('/additems', (req:any, res: FastifyReply) => addItem(req, res))
app.delete('/deleteitems/:word', deleteItem)
app.put('/updateTags', updateItem)
app.put('/updateWord', updateWord)


// data
app.post('/search', search)
app.get('/graph', graphData)
app.get('/def/:word', (req:any, res:FastifyReply) => wordDef(req, res))
app.get('/getTags/:word', getTags)
app.get('/refresh', refreshGraph)

startServer(8000)
