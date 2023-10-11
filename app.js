import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import fetch from 'node-fetch';
import url from 'url';
import { error } from "console";
import moment from "moment-timezone";

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
            const token = jwt.sign({id, userData: data[0]}, process.env.SECRET_KEY); //, {expiresIn: 3000}
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
                name: issues[i].fields.summary,
                project: issues[i].fields.project,
                status: issues[i].fields.status.name,
                assignee: issues[i].fields.assignee,
                story_points: issues[i].fields.customfield_10016,
                sprint: issues[i].fields.customfield_10020
            }
            issuesResponse.push(issue);      
        }
        // console.log(issuesResponse)
        res.status(200).json(issuesResponse);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('Internal Server Error');
    });
})

app.post('/getIssue', varifyJwt, async (req, res) => {
    const sql = "SELECT estimate FROM issues WHERE `userId` = ? AND `issueId` = ?";
    db.query(sql, [req.userId, req.body.issue.id], (err, data) => {
        if(err){
            return res.json("Error: Cannot find issue");
        }
        if(data.length > 0){
            const estimate = data[0].estimate;
            // console.log(estimate);
            return res.json(estimate)
        }else{
            return res.json(0)
        }
    })
    
})

app.post('/saveIssue', varifyJwt, async (req, res) => {
    const sql = "INSERT INTO issues (`userId`, `issueId`, `projectId`, `assignee`, `estimate`, `actual`) VALUES (?)";
    let assignee = "";
    if(req.body.issue.assignee !== null){
        assignee = req.body.issue.assignee.emailAddress;
    }
    const values = [
        req.userId,
        req.body.issue.id,
        req.body.issue.project.id,
        assignee,
        req.body.estimate,
        0
    ]
    db.query(sql, [values], (err, data) => {
        if(err){
            return error("Insert issue server error: " + err);
        }
        return res.json(data);
    })
    
})

app.put('/updateIssue', varifyJwt, async (req, res) => {
    const sql = "UPDATE issues SET `estimate` = ? WHERE `userId` = ? AND `issueId` = ?";
    const values = [
        req.body.estimate,
        req.userId,
        req.body.issue.id
    ]
    db.query(sql, values, (err, data) => {
        if(err){
            return error("Change domain server error: " + err)
        }
        return res.json(data);
    })
    
})

app.get('/getInProgressTime', varifyJwt, async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const key = parsedUrl.query.key;
    const status = parsedUrl.query.status;

    fetch(`https://${req.user.domain}.atlassian.net/rest/api/3/issue/${key}/changelog`, {
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
        let response = null;
        if(status === "In Progress"){
            response = EstimateInProgress(data.values, data.total);
        }else if(status === "Done"){
            response = EstimateDone(data.values, data.total);
        }
        res.status(200).json(response);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('Internal Server Error');
    });
})

function EstimateInProgress(values, count){
    //If issue has status "In Progress"
    //Time in progress is difference between current time and time issue got in status "In Progress"
    const date = getInProgressDate(values, count);
    const today = moment();

    //Extract date without timezone
    const [datePart, offset] = date.split('+');

    //Format date and time
    const inProgressDate = (moment.tz(datePart, 'YYYY-MM-DDTHH:mm:ss.SSS', true, offset)).format('YYYY-MM-DD');
    const inProgressTime = (moment.tz(datePart, 'YYYY-MM-DDTHH:mm:ss.SSS', true, offset)).format('HH:mm:ss');
    let currentDate = today.format('YYYY-MM-DD');
    let currentTime = today.format('HH:mm:ss');
  
    //If current date is Saturday or Sunday
    //Find first previus Friday
    if (today.isoWeekday() === 6 || today.isoWeekday() === 7) {
        const daysToSubtract = (today.isoWeekday() === 6) ? 1 : 2;
        const previousFriday = today.clone().subtract(daysToSubtract, 'days');
        currentDate = previousFriday.format('YYYY-MM-DD');
    }
        
    //If time if after 17:00
    //Set current time on 17:00
    if(today.hour() > 17){
        currentTime = moment('17:00:00', 'HH:mm:ss').format('HH:mm:ss');
    }

    // console.log("Pdate: " + inProgressDate + " Ptime: " + inProgressTime + " Cdate: " + currentDate + " Ctime: " + currentTime);

    const pTime = moment(inProgressTime, 'HH:mm:ss');
    const cTime = moment(currentTime, 'HH:mm:ss');
    const pDate = moment(inProgressDate);
    const cDate = moment(currentDate);

    const diff = getHoursDifference(pDate, pTime, cDate, cTime);

    const response = {
        inProgressDate: inProgressDate,
        inProgressTime: inProgressTime,
        secondDate: currentDate,
        secondTime: currentTime,
        timeDifference: diff
    }

    return response;

}

function EstimateDone(values, count){
    //If issue has status "Done"
    //Time in progress is difference between time issue got in status "Done" and time issue got in status "In Progress"
    const dateInProgress = getInProgressDate(values, count);
    const dateDone = getDoneDate(values, count);

    //Extract date without timezone
    const [datePartIP, offsetIP] = dateInProgress.split('+');
    const [datePartD, offsetD] = dateDone.split('+');

    //Format date and time
    const inProgressDate = (moment.tz(datePartIP, 'YYYY-MM-DDTHH:mm:ss.SSS', true, offsetIP)).format('YYYY-MM-DD');
    const inProgressTime = (moment.tz(datePartIP, 'YYYY-MM-DDTHH:mm:ss.SSS', true, offsetIP)).format('HH:mm:ss');
    const doneDate = (moment.tz(datePartD, 'YYYY-MM-DDTHH:mm:ss.SSS', true, offsetD)).format('YYYY-MM-DD');
    const doneTime = (moment.tz(datePartD, 'YYYY-MM-DDTHH:mm:ss.SSS', true, offsetD)).format('HH:mm:ss');

    // console.log("Pdate: " + inProgressDate + " Ptime: " + inProgressTime + " Ddate: " + doneDate + " Dtime: " + doneTime);

    const pTime = moment(inProgressTime, 'HH:mm:ss');
    const dTime = moment(doneTime, 'HH:mm:ss');
    const pDate = moment(inProgressDate);
    const dDate = moment(doneDate);

    const diff = getHoursDifference(pDate, pTime, dDate, dTime);

    const response = {
        inProgressDate: inProgressDate,
        inProgressTime: inProgressTime,
        secondDate: doneDate,
        secondTime: doneTime,
        timeDifference: diff
    }

    return response;

}

function getInProgressDate(values, count){
    //In progress date is the last item from changelog where status field is "status", from string is "To Do" and toStrng is "In Progress"
    let date = null;
    for(let i = count - 1; i >= 0; i--){
        for(let j = 0; j < values[i].items.length; j++){
            if(values[i].items[j].field === "status" && values[i].items[j].fromString === "To Do" && values[i].items[j].toString === "In Progress"){
                date = values[i].created;
                break;
            }
        }
        if(date !== null){
            break;
        }
    }
    return date;
}

function getDoneDate(values, count){
    //Done date is the last item from changelog where status field is "status" and toStrng is "Done"
    let dateDone = null;
    for(let i = count - 1; i >= 0; i--){
        for(let j = 0; j < values[i].items.length; j++){
            if(values[i].items[j].field === "status" && values[i].items[j].toString === "Done"){
                dateDone = values[i].created;
                break;
            }
        }
        if(dateDone !== null){
            break;
        }
    }
    return dateDone;
}

function getHoursDifference(firstDate, firstTime, secondDate, secondTime){
    let hoursDifference = 0;
    let daysDifference = 0;
    //Working hours from 09:00 to 17:00
    const start = moment('09:00:00', 'HH:mm:ss');
    const end = moment('17:00:00', 'HH:mm:ss');

    //Count day difference between two dates including them
    while (firstDate.isSameOrBefore(secondDate, 'day')) {
        if (firstDate.isoWeekday() >= 1 && firstDate.isoWeekday() <= 5) {
            daysDifference++;
        }
        firstDate.add(1, 'day');
    }

    //Number of days difference without first and last date
    daysDifference -= 2;

    //If difference = -1 => same day
    //If difference = 0 => day after another
    //If difference > 0 => few days between
    if(daysDifference === -1){
        const duration = moment.duration(secondTime.diff(firstTime));
        hoursDifference = Math.floor(duration.asMinutes());
    }else if(daysDifference === 0){
        const duration1 = moment.duration(end.diff(firstTime));
        const duration2 = moment.duration(secondTime.diff(start));
        const duration = Math.floor(duration1.asMinutes()) + Math.floor(duration2.asMinutes());
        hoursDifference = Math.floor(duration);
    }else{
        const duration1 = moment.duration(end.diff(firstTime));
        const duration2 = moment.duration(secondTime.diff(start));
        const duration = Math.floor(duration1.asMinutes()) + Math.floor(duration2.asMinutes()) + 8*daysDifference;
        hoursDifference = Math.floor(duration);
    }

    // console.log("Hours: " + hoursDifference);

    return hoursDifference;
}


app.listen(8000, () => {
    console.log("Server started on port 8000");
})