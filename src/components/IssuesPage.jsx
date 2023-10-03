import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/pages.css'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function IssuesPage() {

    const location = useLocation();
    const project = location.state?.project;

    const hasRunRef = useRef(false);
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);

    useEffect(() => {
        if (!hasRunRef.current) {
        axios.get('http://localhost:8000/getProjectIssues', {
            headers: {
            'access-token' : localStorage.getItem("token")
            },
            params: {
                project: project.key
            }
        })
        .then(res => {
            // console.log(res.data);
            setIssues(res.data);
        })
        .catch(err => {
            alert("Get issues error: " + err);
            navigate('/projects');
        })
        hasRunRef.current = true;
        }
    }, []);

    return (
        <div className='page'>
                <div className='issue-container'>
                    <div className='column1'>
                        <h2 className='status'>TO DO</h2>
                        {
                        issues
                        .filter((issue) => {
                            return issue.status === 'To Do';
                        })
                        .map((issue, index) => 
                        <Card sx={{ minWidth: 275 }} key={index} className='card-issue'>
                            <CardContent>
                            <Typography variant="h5" component="div">
                                {issue.key}
                            </Typography>
                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                {issue.project}
                            </Typography>
                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                {issue.status}
                            </Typography>
                            </CardContent>
                            <CardActions>
                            <Button size="small">Show</Button>
                            </CardActions>
                        </Card>
                        )
                        }
                    </div>
                    <div className='column2'>
                        <h2 className='status'>IN PROGRESS</h2>
                        {
                            issues
                            .filter((issue) => {
                                return issue.status === 'In Progress';
                            })
                            .map((issue, index) => 
                            <Card sx={{ minWidth: 275 }} key={index} className='card-issue'>
                                <CardContent>
                                <Typography variant="h5" component="div">
                                    {issue.key}
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    {issue.project}
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    {issue.status}
                                </Typography>
                                </CardContent>
                                <CardActions>
                                <Button size="small">Show</Button>
                                </CardActions>
                            </Card>
                            )
                            }
                    </div>
                    <div className='column3'>
                        <h2 className='status'>DONE</h2>
                        {
                            issues
                            .filter((issue) => {
                                return issue.status === 'Done';
                            })
                            .map((issue, index) => 
                            <Card sx={{ minWidth: 275 }} key={index} className='card-issue'>
                                <CardContent>
                                <Typography variant="h5" component="div">
                                    {issue.key}
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    {issue.project}
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    {issue.status}
                                </Typography>
                                </CardContent>
                                <CardActions>
                                <Button size="small">Show</Button>
                                </CardActions>
                            </Card>
                            )
                            }
                    </div>
                </div>
            </div>
    )
}
