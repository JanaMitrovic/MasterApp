import React from 'react'
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';
import AppsIcon from '@mui/icons-material/Apps';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import BarChartIcon from '@mui/icons-material/BarChart';
import UserModal from './UserModal';
import axios from 'axios';

export default function Sidebar({isOpen, openModal, closeModal}) {

  const { user, logout } = useUser();

  const navigate = useNavigate();

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
    navigate('/login')
  }

  const getUserStatistics = () => {
    axios.get('http://localhost:8000/statistics/user', {
      headers: {
          'access-token' : localStorage.getItem("token")
          }
    })
    .then(res => {
        if(res.data){
            console.log(res.data)
            navigate('/statistics', {state: {data: res.data}});
        }else{
            alert("Cannot get project statistics!")
        }
    })
    .catch(err => {
        alert("Get project statistics error: " + err);
        navigate('/projects');
    });
  }

  return (
    <>
      {user && (
        <div className="sidebar">
            <button className='item' onClick={openModal}><AccountCircleIcon className='icon' fontSize='large'/>  User info</button>
            <div onClick={() => {navigate('/projects')}}>
                <div className='item' style={{padding: '10px'}}><AppsIcon className='icon' fontSize='large'/> Projects</div>
            </div>
            <div onClick={() => getUserStatistics()}>
                <div className='item' style={{padding: '10px'}}><BarChartIcon className='icon' fontSize='large'/> User statistics</div>
            </div>
            <button className='item' onClick={handleLogout}><ExitToAppRoundedIcon className='icon' fontSize='large'/>  Log out</button>
            
            <UserModal isOpen={isOpen} closeModal={closeModal}/>
      </div>
      )}
    </>
  );
}
