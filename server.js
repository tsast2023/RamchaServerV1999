const express = require('express');
const app = express();
const mongoose = require('mongoose')
const cors = require("cors")
const http = require('http');
const socketIo = require('socket.io');
const socket = require("./socket")
// sockeet
const server = require('http').createServer(app);
socket.initializeSocket(server);




const cookieParser = require('cookie-parser')
app.use(express.json({ limit: '10gb' }))  
app.use(cors({origin: ["http://localhost:3000" , "http://localhost:3001"] , credentials:true }))
app.use(cookieParser());
require('dotenv').config()
const UserRoute = require('./routes/User')
const ServiceRoute = require('./routes/Service')
const OrderRoute = require('./routes/Order');
const AvisRoutes = require('./routes/Avis')       
//database connexion
require('./db/cnx');
//middlewares
app.use('/api/user' , UserRoute);
app.use('/api/service' , ServiceRoute);
app.use('/api/order' , OrderRoute);
app.use('/api/avis' , AvisRoutes);

app.get('/test', (req, res) => {
    res.send('Test route works!');
});


server.listen('5000', ()=>console.log("server is running"));