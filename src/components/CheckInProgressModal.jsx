import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';

export default function AddEstimateModal({showInProgressModal, closeInProgressModal, issue, value}) {
    
    useEffect(() => {
        if (showInProgressModal) {
          //every time modal opens
          getInProgressTime(issue);
        }
    }, [showInProgressModal]);

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
            timeDifference: 0
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
            console.log(res.data);
            setTimeDifference(res.data.timeDifference);
            const timeLeft = value*60 - res.data.timeDifference;
            setTimeLeft(timeLeft);
            setHoursLeft(parseInt(timeLeft/60));
            setMinutesLeft(timeLeft%60);
            setRes(res.data);
        })
        .catch(err => {
            alert("Get in progress time error: " + err);
            closeInProgressModal();
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return (
        <>
                <Modal
                    open={showInProgressModal}
                    onClose={closeInProgressModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box className='modalBox'>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={closeInProgressModal}
                            aria-label="close"
                            sx={{ position: 'absolute', top: 0, right: 0 }}
                        >
                            <CloseIcon style={{marginRight: '10px', color: 'grey'}}/>
                        </IconButton>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            <b>Check Issue In Progress Time</b>
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>

                            {isLoading ? 
                                (
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress />
                                </Box>
                                ) : (
                                    <div>
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="a dense table">
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell align="left"><b>In progress from</b></TableCell>
                                                        <TableCell align="center">{res.inProgressDate}</TableCell>
                                                        <TableCell align="center">{res.inProgressTime}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell align="left"><b>Current date/time</b></TableCell>
                                                        <TableCell align="center">{res.secondDate}</TableCell>
                                                        <TableCell align="center">{res.secondTime}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                            </TableContainer>

                                        {value !== 0 ? <p><b>Estimate time: </b>{value}</p> : 
                                            <>
                                                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                    <p>Time is not estimated!</p>
                                                    {/* <Button 
                                                        variant="outlined" 
                                                        style={{color: '#070b3f', borderColor: '#070b3f', height: '30px', marginLeft: '10px'}}
                                                        onClick={() => {
                                                            // setEstimateTimeModal(true);
                                                            // closeInProgressModal();
                                                        }}
                                                    >Add estimate</Button> */}
                                                </div>
                                            </>
                                        }

                                        <p><b>In progress time: </b>{parseInt(timeDifference/60)} hour(s) {timeDifference%60} minute(s)</p>

                                        {value === 0 ? <Alert severity="info">You have not estimated time.</Alert> :
                                            (timeLeft < 0 ? <Alert severity="error">You passed estimate time by {hoursLeft*(-1)} hour(s) {minutesLeft*(-1)} minute(s)!</Alert> : 
                                                (timeLeft === 0 ? <Alert severity="warning">Your time in progress is same as estimate time!</Alert> :
                                                    <Alert severity="success">You have {hoursLeft} hour(s) {minutesLeft} minute(s) left.</Alert>
                                                )
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
