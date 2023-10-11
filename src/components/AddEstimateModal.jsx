import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useUser } from './UserContext';
import axios from 'axios';

export default function AddEstimateModal({showEstimateTimeModal, closeEstimateTimeModal, issue, value}) {
    
    const [estimate, setEstimate] = useState(0);

    const handleIncrement = () => {
        setEstimate(estimate + 1);
    };

    const handleDecrement = () => {
        setEstimate(estimate - 1);
    };

    useEffect(() => {
        if (showEstimateTimeModal) {
          //Set estimate to 0 when modal opens
          setEstimate(0);
        }
      }, [showEstimateTimeModal]);

    //If value is 0 save issue, it not update
    const handleSubmit = () => {
        if(value === 0){
            saveIssue();
        }else{
            updateIssue();
        }
    }

    const saveIssue = () => {
        if(estimate !== 0){
            axios.post('http://localhost:8000/saveIssue',{
                issue: issue, 
                estimate: estimate
            },{
                headers: {
                    'access-token' : localStorage.getItem("token")
                }
            })
            .then(res => {
                if(res.data){
                    alert("Successfuly saved issue!");
                    closeEstimateTimeModal();
                }else{
                    alert("Cannot save issue")
                }
            })
            .catch(err => {
                alert("Save issue error: " + err);
                closeEstimateTimeModal();
            });
        }else{
            alert("Please choose estimate time!");
        }
    }

    const updateIssue = () => {
        if(estimate !== 0){
            axios.put('http://localhost:8000/updateIssue',{
                issue: issue, 
                estimate: estimate
            },{
                headers: {
                    'access-token' : localStorage.getItem("token")
                }
            })
            .then(res => {
                if(res.data){
                    alert("Successfuly updated issue!");
                    closeEstimateTimeModal();
                }else{
                    alert("Cannot update issue")
                }
            })
            .catch(err => {
                alert("Update issue error: " + err);
                closeEstimateTimeModal();
            });
        }else{
            alert("Please choose estimate time!");
        }
    }

    return (
        <>
                <Modal
                    open={showEstimateTimeModal}
                    onClose={closeEstimateTimeModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box className='modalBox'>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={closeEstimateTimeModal}
                            aria-label="close"
                            sx={{ position: 'absolute', top: 0, right: 0 }}
                        >
                            <CloseIcon style={{marginRight: '10px', color: 'grey'}}/>
                        </IconButton>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            <b>Add Issue Estimate Time</b>
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            <p><b>Id: </b>{issue?.id}</p>
                            <p><b>Name: </b>{issue?.name}</p>
                            <p><b>Key: </b>{issue?.key}</p>
                            <p><b>Assignee: </b>{issue?.assignee === null ? "No assignee" : issue?.assignee.displayName}</p>

                            {value !== 0 && <p><b>Previous estimate time: </b>{value}</p>}

                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'left'}}>
                                    <TextField
                                        value={estimate}
                                        inputProps={{
                                            readOnly: true,
                                            disabled: true,
                                            sx: {textAlign: 'center', width: '100px'}
                                        }}
                                        
                                    />
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <Button onClick={handleIncrement} style={{margin: '0px', padding: '0px'}}><KeyboardArrowUpIcon fontSize='large' style={{color: '#070b3f'}}/></Button>
                                        <Button onClick={handleDecrement} style={{margin: '0px', padding: '0px'}}><KeyboardArrowDownIcon fontSize='large' style={{color: '#070b3f'}}/></Button>
                                    </div>
                                </div>
                                <Button 
                                    variant="contained" 
                                    style={{backgroundColor: '#070b3f', width: '100%', height: '40px'}} 
                                    onClick={handleSubmit}
                                >{value !== 0 ? "Update estimate time" : "Submit"}</Button>
                            </div>
                        </Typography>
                    </Box>
                </Modal>
            </>
    )
}
