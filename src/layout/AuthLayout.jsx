import React from 'react';
import { Outlet } from 'react-router-dom';
import UseAuth from '../hooks/useAuth';
import Header from '../components/header/Header';


const AuthLayout = () => {
    const { user,error } = UseAuth({ middleware: 'auth' });
    return (
        <div>
      
              <Header />
              <Outlet /> 
        </div>
    );
}

export default AuthLayout;
