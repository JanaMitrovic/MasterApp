import './App.css';
import {BrowserRouter, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import { UserProvider, useUser} from './components/UserContext';
import IssuesPage from './components/IssuesPage';
import { useState } from 'react';
import ProjectsPage from './components/ProjectsPage';
import StatisticsPage from './components/StatisticsPage';

export default function App() {

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  window.addEventListener('beforeunload', function (event) {
    localStorage.clear();
  });

  const ProtectedRoute = ({ element, ...rest }) => {
    const { user } = useUser();
  
    if (user.isAuthenticated) {
      return <Route {...rest} element={element} />;
    } else {
      return <Navigate to="/login" />;
    }
  };

  return (
    <UserProvider>
      <div className="App">
        <BrowserRouter>
          <Sidebar isOpen={isOpen} openModal={openModal} closeModal={closeModal}/>
          <Routes>
            <Route path='/' element = {<Navigate to='/login'/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/register' element={<RegisterPage/>}/>
            <Route path='/projects' element={<ProjectsPage openModal={openModal}/>}/>
            <Route path='/issues' element={<IssuesPage/>}/>
            <Route path='/statistics' element={<StatisticsPage/>}/>
          </Routes>
        </BrowserRouter>
      </div>
    </UserProvider>
  );
}
