import { createContext, useContext, useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  //Extract user data from token on page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedToken = jwt_decode(storedToken);
        setUser(decodedToken.userData);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  //Set user data on login
  const login = (userData) => {
    setUser(userData);
  };

  //Set user to null on logout
  const logout = () => {
    axios.get('http://localhost:8000/logout', {
      headers: {
        'access-token' : localStorage.getItem("token")
      }
    })
    .then(res => {
      if(res.data){
        localStorage.removeItem('token');
        setUser(null);
      }
    })
    .catch(err => {
      alert("Logout error: " + err);
    })
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;