import React from 'react'
import { Route, BrowserRouter , Routes } from 'react-router-dom'
import Login from '../screens/login.jsx'
import Register from '../screens/Register.jsx';
import Home from '../screens/Home.jsx';
import ProjectForm from '../screens/project_form.jsx';
import Project from '../screens/project.jsx';
import AddMember from '../screens/Addmember.jsx';
import GlobalToaster from '../assets/globaltoast.jsx';

const AppRoutes = () => {
  return (
   <BrowserRouter>
   <GlobalToaster />
    <Routes>
        <Route path="/" element = {<Home />} />
        <Route path="/login" element = {<Login />} />
        <Route path="/register" element = {<Register />} />
        <Route path="/create-project" element = {<ProjectForm />} />
        <Route path="/project/:projectId" element = {<Project />} />
        <Route path="/project/:projectId/add-member" element = {<AddMember />} />
    </Routes>
   </BrowserRouter>
  );
}

export default AppRoutes;