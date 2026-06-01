import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout/Layout";
import AuthLayout from "./layout/AuthLayout";
import Inicio from "./views/Inicio";
import Login from "./views/Login";
import Register from "./views/Register";
import Product from "./layout/Product";
import ResetPassword from "./src/views/ResetPassword";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />
     
    },
    {
        path: "/product",
        element: <Product />
     
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [{
            path: '/auth/login',
            element: <Login />,
        },
        {
            path: '/auth/register',
            element: <Register />,
        },
    
        {
            path: '/auth/reset-password',
            element: <ResetPassword />,
        },
    
        ]
    },
    {
    }
]);

export default router;