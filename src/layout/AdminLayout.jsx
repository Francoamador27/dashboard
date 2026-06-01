import React, { useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import UseAuth from '../hooks/useAuth';

const AdminLayout = () => {
    const { user, error } = UseAuth({ middleware: 'auth' });
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.admin !== 1) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user && !error) return <p>Cargando...</p>;

    if (!user || user.admin !== 1) return null; // ya redirige

    return (
        <div className="admin-layout">
            <AdminSidebar />
           
        </div>
    );
};

export default AdminLayout;
