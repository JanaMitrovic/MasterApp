import axios from 'axios';
import React, { useState } from 'react'
import { useUser } from './UserContext';
import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';


export default function UserModal({ isOpen, closeModal }) {

    const {user, logout} = useUser();

    const [domain, setDomain] = useState("");

    const navigate = useNavigate();

    const changeDomain = () => {
        axios.put('http://localhost:8000/changeDomain', {domain: domain, email: user.email}, {
        headers: {
            'access-token' : localStorage.getItem("token")
        }
        })
        .then(res => {
            if(res.data.affectedRows > 0){
                alert("Please login again!");
                closeModal();
                logout();
                navigate('/login')
            }
        })
        .catch(err => {
            alert("Change domain error: " + err);
            closeModal();
            logout();
            navigate('/login')
        })
    }

    return (
        <>
            <Modal
                open={isOpen}
                onClose={closeModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                >
                <Box className='modalBox'>
                    <IconButton
                    edge="end"
                    color="inherit"
                    onClick={closeModal}
                    aria-label="close"
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                    >
                    <CloseIcon style={{marginRight: '10px', color: 'grey'}}/>
                    </IconButton>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                    User info
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    <TextField
                        id="outlined-read-only-input"
                        label="User email"
                        defaultValue={user.email}
                        InputProps={{
                        readOnly: true,
                        }}
                        style={{marginBottom: '20px', width: '100%'}}
                    />
                    <TextField id="outlined-basic" label="Domain" variant="outlined" style={{marginBottom: '20px', width: '100%'}} defaultValue={user.domain} onChange={(e) => setDomain(e.target.value)} focused/>
                    <Button variant="contained" style={{backgroundColor: '#070b3f'}} onClick={changeDomain}>Change domain</Button>
                    </Typography>
                </Box>
            </Modal>
        </>
        
    )
}
