import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { UserProvider } from './context/user.context.jsx';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
    <UserProvider>
      <AppRoutes />
    </UserProvider>
    </BrowserRouter>
  );
}

export default App;