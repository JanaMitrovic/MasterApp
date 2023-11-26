import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import {Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend} from 'chart.js';
import {Bar} from 'react-chartjs-2';
ChartJS.register(
    BarElement, CategoryScale, LinearScale, Tooltip, Legend
)

export default function AddEstimateModal({showStatisticsModal, closeStatsticsModal, issue, value}) {

    useEffect(() => {
        if (showStatisticsModal) {
          //every time modal opens
          getInProgressTime(issue);
        }
    }, [showStatisticsModal]);

    const [isLoading, setIsLoading] = useState(false);
    const [hoursLeft, setHoursLeft] = useState(0);
    const [minutesLeft, setMinutesLeft] = useState(0);
    const [timeDifference, setTimeDifference] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [res, setRes] = useState(
        {
            inProgressDate: "",
            inProgressTime: "",
            secondDate: "",
            secondTime: "",
            hoursDifference: 0
        }
    );

    const getInProgressTime = (issue) => {
        setIsLoading(true);
        axios.get('http://localhost:8000/getInProgressTime', {
            headers: {
            'access-token' : localStorage.getItem("token")
            },
            params: {
                key: issue.key,
                status: issue.status
            }
        })
        .then(res => {
            setTimeDifference(res.data.timeDifference);
            const timeLeft = value*60 - res.data.timeDifference
            setTimeLeft(timeLeft);
            setHoursLeft(parseInt(timeLeft/60));
            setMinutesLeft(timeLeft%60);
            setRes(res.data);
        })
        .catch(err => {
            alert("Get in progress time error: " + err);
            closeStatsticsModal();
        }).finally(() => {
            setIsLoading(false);
        })
    }

    const color = (value*60 === timeDifference) ? '#070b3f' : ((value*60 > timeDifference) ? '#00DFA2' : '#FF0060');

    const data = {
        labels: [`${issue?.name}`],
        datasets: [
            {
                label: 'Estimate',
                data: [value*60],
                backgroundColor: '#FEF5AC',
            },
            {
                label: 'Actual',
                data: [timeDifference],
                backgroundColor: color,
            }
        ]
    }

    const options = {
        scales: {
            y: {
              beginAtZero: true
            }
          }
    }

    return (
        <>
                <Modal
                    open={showStatisticsModal}
                    onClose={closeStatsticsModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box className='modalBox'>
                        <IconButton
                        edge="end"
                        color="inherit"
                        onClick={closeStatsticsModal}
                        aria-label="close"
                        sx={{ position: 'absolute', top: 0, right: 0 }}
                        >
                            <CloseIcon style={{marginRight: '10px', color: 'grey'}}/>
                        </IconButton>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            <b>{issue?.key} Statistics</b>
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            {isLoading ? 
                                (
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <div>
                                        {value === 0 ? 
                                            (
                                                <div>
                                                    <Alert severity="info">You have not estimated time.</Alert>
                                                    <p><b>In progress time: </b>{parseInt(timeDifference/60)} hour(s) {timeDifference%60} minute(s)</p>
                                                </div>
                                            )
                                            : 
                                            (
                                                <div style={{width: '350px'}}>
                                                    <Bar data = {data}options = {options}></Bar>
                                                    
                                                    {timeLeft < 0 ? <Alert severity="error">Estimate time passed by {hoursLeft*(-1)} hour(s) {minutesLeft*(-1)} minute(s)!</Alert> : 
                                                        (timeLeft === 0 ? <Alert severity="warning">Your time in progress is same as estimate time!</Alert> :
                                                            <Alert severity="success">{hoursLeft} hour(s) {minutesLeft} minute(s) left.</Alert>
                                                        )
                                                    }

                                                </div>
                                            )
                                        }

                                    </div>
                                )  
                            }
                        </Typography>
                    </Box>
                </Modal>
            </>

    )
}
