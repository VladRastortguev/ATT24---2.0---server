require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index');
const errorMiddlewaer = require('./middlewaers/error-middlewaer');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json({ limit: '30mb' }));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:3000',  // ваш локальный адрес
    'https://www.kia-bishkek.kg', // первый разрешенный домен
    'https://another-domain.com'  // второй разрешенный домен
];

app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));

app.use('/api', router);
app.use(errorMiddlewaer);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start();
