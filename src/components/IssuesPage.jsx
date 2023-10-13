import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/pages.css'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddEstimateModal from './AddEstimateModal';
import CheckInProgressModal from './CheckInProgressModal';
import StatisticsModal from './StatisticsModal';
import { useUser } from './UserContext';

export default function IssuesPage() {

    const user = useUser();
    
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
            console.log(res.data);
            setIssues(res.data);
        })
        .catch(err => {
            alert("Get issues error: " + err);
            navigate('/projects');
        })
        hasRunRef.current = true;
        }
    }, []);

    const [issue, setIssue] = useState(null);

    const [showEstimateTimeModal, setEstimateTimeModal] = useState(false);

    const [value, setValue] = useState(0);

    const openEstimateTimeModal = async (selectedIssue, value) => {
        setValue(value);
        setIssue(selectedIssue);
        setEstimateTimeModal(true);
    };
  
    const closeEstimateTimeModal = () => {
        setIssue(null);
        setEstimateTimeModal(false);
    };

    //Check if issue is already saved is db (has estimate time)
    //If res.data/estimate is not 0 that issue already exists
    const handleEstimateTime = (selectedIssue, modal) => {
        axios.post('http://localhost:8000/getIssue',{issue: selectedIssue}, {
            headers: {
                'access-token' : localStorage.getItem("token")
                }
            })
            .then(res => {
                //res.data is estimate time
                if(modal === "TO DO"){
                    openEstimateTimeModal(selectedIssue, res.data);
                }else if (modal === "IN PROGRESS"){
                    openInProgressModal(selectedIssue, res.data);
                }else if(modal === "DONE"){
                    openStatisticsModal(selectedIssue, res.data)
                }
                
            })
            .catch(err => {
                alert("Error get issue: " + err);
            }
        )
    }

    const [showInProgressModal, setInProgressModal] = useState(false);

    const openInProgressModal = (selectedIssue, value) => {
        setValue(value);
        setIssue(selectedIssue);
        setInProgressModal(true);
    };
  
    const closeInProgressModal = () => {
        setIssue(null);
        setInProgressModal(false);
    };

    const [showStatisticsModal, setStatisticsModal] = useState(false);

    const openStatisticsModal = (selectedIssue, value) => {
        setValue(value);
        setIssue(selectedIssue);
        setStatisticsModal(true);
    };
  
    const closeStatisticsModal = () => {
        setIssue(null);
        setStatisticsModal(false);
    };

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
                            .sort((a, b) => {
                                return a.id - b.id;
                            })
                            .map((issue, index) => 
                                <Card sx={{ minWidth: 275 }} key={index} className='card-issue'>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            {issue.name}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {issue.key}
                                        </Typography>
                                        <br />
                                        <Typography className='assignee'>
                                            <AccountCircleIcon style={{marginRight: '5px'}}/> {issue.assignee === null ? "No assignee" : issue.assignee.displayName}
                                        </Typography>
                                    </CardContent>
                                    {(issue.assignee !== null && user.user.email == issue.assignee.emailAddress) && 
                                        <>
                                            <CardActions className='card-actions'>
                                                <Button 
                                                    variant="contained" 
                                                    size='small' 
                                                    style={{width: '100%', backgroundColor: '#1ba182'}}
                                                    onClick={() => handleEstimateTime(issue, "TO DO")}
                                                >Estimate time</Button>
                                            </CardActions>
                                        </>    
                                    }
                                    
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
                            .sort((a, b) => {
                                return a.id - b.id;
                            })
                            .map((issue, index) => 
                            <Card sx={{ minWidth: 275 }} key={index} className='card-issue'>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {issue.name}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {issue.key}
                                    </Typography>
                                    <br />
                                    <Typography className='assignee'>
                                        <AccountCircleIcon style={{marginRight: '5px'}}/> {issue.assignee === null ? "No assignee" : issue.assignee.displayName}
                                    </Typography>
                                </CardContent>
                                <CardActions className='card-actions'>
                                    <Button 
                                        variant="contained" 
                                        size='small' 
                                        style={{width: '100%', backgroundColor: '#1ba182'}}
                                        onClick={() => handleEstimateTime(issue, 'IN PROGRESS')}
                                    >Check time in progress</Button>
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
                            .sort((a, b) => {
                                return a.id - b.id;
                            })
                            .map((issue, index) => 
                            <Card sx={{ minWidth: 275 }} key={index} className='card-issue'>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {issue.name}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {issue.key}
                                    </Typography>
                                    <br />
                                    <Typography className='assignee'>
                                        <AccountCircleIcon style={{marginRight: '5px'}}/> {issue.assignee === null ? "No assignee" : issue.assignee.displayName}
                                    </Typography>
                                </CardContent>
                                <CardActions className='card-actions'>
                                    <Button 
                                        variant="contained" 
                                        size='small' 
                                        style={{width: '100%', backgroundColor: '#1ba182'}}
                                        onClick={() => handleEstimateTime(issue, "DONE")}
                                    >Show statistics</Button>
                                </CardActions>
                            </Card>
                            )
                        }
                    </div>
                </div>
                <AddEstimateModal showEstimateTimeModal={showEstimateTimeModal} closeEstimateTimeModal={closeEstimateTimeModal} issue={issue} value={value}/>
                <CheckInProgressModal showInProgressModal={showInProgressModal} closeInProgressModal={closeInProgressModal} issue={issue} value={value}/>
                <StatisticsModal showStatisticsModal={showStatisticsModal} closeStatsticsModal={closeStatisticsModal} issue={issue} value={value}/> 
            </div>
    )
}
