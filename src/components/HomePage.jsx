import React from 'react'
import axios from 'axios'

export default function HomePage() {

  const handleAuth = () => {
    axios.get('http://localhost:8000/checkauth', {
      headers: {
        'access-token' : localStorage.getItem("token")
      }
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }

  return (
    <div>
      <h1>HomePage</h1>
      <button onClick={handleAuth}>CheckAuth</button>
    </div>
  )
}


