import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../screens/login.jsx'
import Register from '../screens/Register.jsx';
import Home from '../screens/Home.jsx';
import ProjectForm from '../screens/project_form.jsx';
import Project from '../screens/project.jsx';
import AddMember from '../screens/Addmember.jsx';
import GlobalToaster from '../assets/globaltoast.jsx';
import HomeWrapper from '../screens/HomeWrapper.jsx';

const AppRoutes = () => {
  return (
    <>
      <GlobalToaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeWrapper />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-project" element={<ProjectForm />} />
          <Route path="/project/:projectId" element={<Project />} />
          <Route path="/project/:projectId/add-member" element={<AddMember />} />
        </Route>
      </Routes>
    </>
  );
}

export default AppRoutes;