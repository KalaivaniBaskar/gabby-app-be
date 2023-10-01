import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { mongoConnection } from './db.js'
import { userRouter } from './Routes/userRoutes.js'
import {Server} from 'socket.io';

const app = express();
const PORT = process.env.PORT || 9000;
const client_URL = "http://localhost:3000"
//DataBase connection 
mongoConnection(); 

//middleware
app.use(cors());
app.use(express.json()); 

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

//Base Route - Router 
app.use('/auth/user', userRouter);

// Listening to server
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = new Server(server, {  
    cors:{
        origin : client_URL,
    },
});

io.on("connection", (socket) => {
    console.log("User Connected: ", socket.id);

    socket.on("join_room", (data) => {
        socket.join(data.room);
        // console.log(`User with ID: ${socket.id} joined room : ${data.room} `)
        socket.to(data.room).emit('notification', { message: `${data.name} is online` })
    })
    
    socket.on("send_msg", (data) => {
        //console.log("New msg sent", data);
        socket.to(data.room).emit("receive_msg", data)
    })

    socket.on("disconnect", () => {
        console.log("User left", socket.id)
        
    }); 
})
// import crypto from 'crypto'
// console.log(crypto.randomBytes(64).toString('hex'));