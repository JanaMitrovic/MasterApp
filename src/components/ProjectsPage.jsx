import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import '../styles/pages.css'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage({openModal}) {

  const hasRunRef = useRef(false);

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!hasRunRef.current) {
      axios.get('http://localhost:8000/getProjects', {
        headers: {
          'access-token' : localStorage.getItem("token")
        }
      })
      .then(res => {
        if(res.data.length == 0){
          alert("There is no projects visible to you in this domain\nor your domain is not valid...");
        }
        setProjects(res.data);
      })
      .catch(err => {
        alert("Your domain is not valid, please chage it!");
        openModal();
      }
      )
      hasRunRef.current = true;
    }
  }, []); 

  const navigate = new useNavigate();

  const handleCardClick = (project) => {
    navigate('/issues', {state: {project: project}});
  }; 

  const getProjectStatistics = (project) => {
    axios.post('http://localhost:8000/statistics/project', {project: project.id}, {
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

  const getProjectUserStatistics = (project) => {
    axios.post('http://localhost:8000/statistics/project/user', {project: project.id}, {
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
    <div className='page'>
      <div className='project-container'>
        {
          projects.map((project, index) => 
            <Card sx={{ minWidth: 275 }} key={index} className='card-project'>
              <CardContent  onClick={() => handleCardClick(project)}>
                <Typography variant="h5" component="div">
                  {project.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {project.key}
                </Typography>
              </CardContent>
              <CardActions className='card-actions'>
                <div  style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                  <Button 
                      variant="contained" 
                      size='small' 
                      style={{width: '100%', backgroundColor: '#1ba182', marginBottom: '5px'}}
                      onClick={() => getProjectStatistics(project)}
                  >Show project statistics</Button>
                  <Button 
                      variant="contained" 
                      size='small' 
                      style={{width: '100%', backgroundColor: '#1ba182', marginBottom: '5px'}}
                      onClick={() => getProjectUserStatistics(project)}
                  >Show my statistics</Button>
                </div>
              </CardActions>
            </Card>
          )
        }
      </div>
    </div>
  )
}


