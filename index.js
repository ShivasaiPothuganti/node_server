import express from "express";
import cors from "cors";
import {prisma} from './prismaConfig.js';
import session from 'express-session';
import KeyCloak from 'keycloak-connect';
import kc_config  from './kcconfig.js';


const memory_store = new session.MemoryStore();

const keycloak = new KeyCloak({store:memory_store},kc_config);


const app = express();
app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memory_store,
}))
app.use(keycloak.middleware({
    logout:'/logout',
    admin:'/',
    login:'/message'
}))

const port = 5000;

app.get("/callback", async (req, res) => {
    console.log('request is a query of ',req.query);
    const { code } = req.query;
    console.log('Received code:', code);

    if (!code) {
        return res.status(400).send("Authorization code missing");
    }

    // Exchange code for token
    const tokenRequest = {
        grant_type: 'authorization_code',
        client_id: 'myapp',
        client_secret: 'mzYJV5rKWu3lnQb7DBCEFJ6xERL7Jg7D',
        code,
        redirect_uri: 'http://localhost:5000/message'
    };

    try {
        const tokenResponse = await axios.post(
            'http://localhost:8080/realms/explore/protocol/openid-connect/token',
            new URLSearchParams(tokenRequest)
        );

        const accessToken = tokenResponse.data.access_token;
        req.session.accessToken = accessToken;  // Save token in session

        console.log('Token stored in session:', req.session.accessToken);  // Check session

        res.status(200).json({ message: "secure message", token: accessToken });
    } catch (error) {
        console.error('Error during token exchange:', error);
        res.status(500).send('Failed to exchange code for access token');
    }
});


app.get("/message",keycloak.protect(),(req,res)=>{
    console.log('trying to login');
    res.status({message:"secure message"});
})

// app.get('/',async (req,res)=>{
//     const notes = await prisma.note.findMany();
//     res.status(200).json(notes);
// });


app.delete('/notes/:id',async (req,res)=>{
    const id = parseInt(req.params.id);
    const deletedNote = await prisma.note.delete({
        where :{id}
    });
    res.status(200).json(deletedNote);
})

app.put("/notes/:id",async (req,res)=>{
    const id = parseInt(req.params.id);
    const {subject,description} = req.body;
    const updatedNote = await prisma.note.update({
        where:{id},
        data:{subject,description}
    });
    res.status(200).json(updatedNote);
})

app.post('/',async (req,res)=>{
    const {subject,description} = req.body;
    const note = await prisma.note.create({
        data:{subject,description}
    });
    res.status(200).json(note);
})

app.listen(port,(err)=>{
    if(!err){
        console.log(`server is running on http://localhost:${port}`)
    }
})