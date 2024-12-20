require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddlewaer = require('./middlewaers/error-middlewaer')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 5000;
const app = express()

app.use(bodyParser.json({ limit: '30mb' }))
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,  
    origin: process.env.CLIENT_URL,
}));
app.use('/api', router);
app.use(errorMiddlewaer);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        
        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
    } catch (e) {
        console.log(e);       
    }
}

start()