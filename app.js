import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import fetch from 'node-fetch';
import url from 'url';
import { error } from "console";

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
    const values = [
        req.body.email,
        req.body.password,
        req.body.domain
    ]
    db.query(sql, [values], (err, data) => {
        if(err){
            return error("Register server error: " + err);
        }
        return res.json(data);
    })
    
})

app.post('/login', async (req, res) => {
    const sql = "SELECT * FROM users WHERE `email` = ? AND `password` = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if(err){
            return res.json("Error: Cannot login user");
        }
        if(data.length > 0){
            const id = data[0].id;
            //create token and sign user data to it
            const token = jwt.sign({id, userData: data[0]}, process.env.SECRET_KEY, {expiresIn: 3000});
            return res.json({Login: true, token, data})
        }else{
            return res.json("Fail")
        }
    })
    
})

const varifyJwt = (req, res, next) => {
    const token = req.headers["access-token"];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token is not valid' });
        }

        //extract user data from token and attach it to request
        req.userId = decoded.id;
        req.user = decoded.userData;
        next();
    });
}

app.get('/logout', varifyJwt, async (req, res) => {
    return res.json(true);
})

app.put('/changeDomain', varifyJwt, async (req, res) => {
    const sql = "UPDATE users SET `domain` = ? WHERE `email` = ?";
    const values = [
        req.body.domain,
        req.body.email
    ]
    db.query(sql, values, (err, data) => {
        if(err){
            return error("Change domain server error: " + err)
        }
        return res.json(data);
    })
    
})

app.get('/getProjects', varifyJwt, async (req, res) => {
    fetch(`https://${req.user.domain}.atlassian.net/rest/api/3/project/search`, {
    method: 'GET',
    headers: {
        'Authorization': `Basic ${Buffer.from(
        `${req.user.email}:` + process.env.API_TOKEN
        ).toString('base64')}`,
        'Accept': 'application/json'
    }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Request failed');
        }
    })
    .then(data => {
        let values = data.values;
        let projects = [];
        for (let i = 0; i < values.length; i++) {
            let project = {
                id: values[i].id,
                key: values[i].key,
                name: values[i].name
            }
            projects.push(project);      
        }
        res.status(200).json(projects);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('Internal Server Error');
    });
})

app.get('/getProjectIssues', varifyJwt, async (req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const project = parsedUrl.query.project;

    fetch(`https://${req.user.domain}.atlassian.net/rest/api/3/search?jql=project=${project}&maxResults=1000`, {
    method: 'GET',
    headers: {
        'Authorization': `Basic ${Buffer.from(
        `${req.user.email}:` + process.env.API_TOKEN
        ).toString('base64')}`,
        'Accept': 'application/json'
    }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Request failed');
        }
    })
    .then(data => {
        let issues = data.issues;
        let issuesResponse = [];
        for (let i = 0; i < issues.length; i++) {
            let issue = {
                id: issues[i].id,
                key: issues[i].key,
                project: issues[i].fields.project.key,
                status: issues[i].fields.status.name
            }
            issuesResponse.push(issue);      
        }
        res.status(200).json(issuesResponse);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('Internal Server Error');
    });
})

app.listen(8000, () => {
    console.log("Server started on port 8000");
})