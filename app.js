const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");

dotenv.config({path: './.env'});

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect((error) => {
    if(error){
        console.log(error)
    }else{
        console.log("MySQL Connected...")
    }
})

app.post('/register', async (req, res) => {
    const sql = "INSERT INTO users (`email`, `password`, `domain`) VALUES (?)";
    values = [
        req.body.email,
        req.body.password,
        req.body.domain
    ]
    db.query(sql, [values], (err, data) => {
        if(err){
            return res.json("Error: Cannot register user");
        }
        return res.json(data);
    })
    
})

const varifyJwt = (req, res, next) => {
    const token = req.headers["access-token"];
    if(!token){
        return res.json("No token")
    }else{
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if(err){
                res.json("Not Authenticated")
            }else{
                req.userId = decoded.id;
                next();
            }
        })
    }
}

app.get('/checkauth', varifyJwt,(req,res) => {
    return res.json("Authenticated");
})

app.post('/login', async (req, res) => {
    const sql = "SELECT * FROM users WHERE `email` = ? AND `password` = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if(err){
            return res.json("Error: Cannot login user");
        }
        if(data.length > 0){
            const id = data[0].id;
            const token = jwt.sign({id}, process.env.SECRET_KEY, {expiresIn: 300});
            return res.json({Login: true, token, data})
        }else{
            return res.json("Fail")
        }
    })
    
})

app.listen(8000, () => {
    console.log("Server started on port 8000");
})