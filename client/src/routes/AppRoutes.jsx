import React from 'react'
import { Route, BrowserRouter , Routes } from 'react-router-dom'
import Login from '../screens/login.jsx'

const AppRoutes = () => {
  return (
   <BrowserRouter>

    <Routes>
        <Route path="/" element = {<div>HOME</div>} />
        <Route path="/login" element = {<Login />} />
        <Route path="/register" element = {<div>Register</div>} />
    </Routes>
   </BrowserRouter>
  );
}

export default AppRoutes;