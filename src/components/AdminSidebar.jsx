import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FolderGit2,
  LogOut,
  Settings,
  Home,
  Bot,
  Mail,
  FileText,
} from "lucide-react";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Users,
  GalleryThumbnails,
  Calendar,
  MessageSquareQuote,
  ShieldUser,
  Coins,
  ListCheck,
  Tractor,
  HardHat,
  Image,
  Briefcase,
  Award,
  PlaySquare,
  Layout,
} from "lucide-react";

import UseAuth from "../hooks/useAuth";
import useCont from "../hooks/useCont";

const drawerWidth = 240;
const collapsedWidth = 72;

const AdminSidebar = () => {
  const { company } = useCont();
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const { logout, user } = UseAuth({ middleware: "auth" });

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const menuItems = [
    {
      text: "Sliders",
      icon: <GalleryThumbnails size={20} />,
      path: "/admin-dash/sliders",
    },
    // { text: 'Galería', icon: <GalleryThumbnails size={20} />, path: '/admin-dash/galeria' },
    {
      text: "Obras",
      icon: <HardHat size={20} />,
      path: "/admin-dash/servicios",
    },
    {
      text: "Certificados",
      icon: <Award size={20} />,
      path: "/admin-dash/certificados",
    },
    {
      text: "Brochure",
      icon: <FileText size={20} />,
      path: "/admin-dash/brochure",
    },
    {
      text: "Video Principal",
      icon: <PlaySquare size={20} />,
      path: "/admin-dash/video-principal",
    },
    {
      text: "Maquinarias",
      icon: <Tractor size={20} />,
      path: "/admin-dash/portafolio",
    },

    //  { text: 'Posts', icon: <FileText size={20} />, path: '/admin-dash/posts' },
    // { text: 'Calendario', icon: <Calendar size={20} />, path: '/admin-dash' },
    // { text: 'Finanzas', icon: <Coins size={20} />, path: '/admin-dash/finanzas' },
    // { text: 'Citas', icon: <ListCheck size={20} />, path: '/admin-dash/citas' },
    // { text: 'Profesionales', icon: <ShieldUser size={20} />, path: '/admin-dash/doctores' },
    { text: "Líderes", icon: <Users size={20} />, path: "/admin-dash/lideres" },
    {
      text: "Leads Contacto",
      icon: <Mail size={20} />,
      path: "/admin-dash/leads-contacto",
    },
    {
      text: "RRHH",
      icon: <Briefcase size={20} />,
      path: "/admin-dash/leads-rrhh",
    },
    // { text: 'Testimonios', icon: <MessageSquareQuote size={20} />, path: '/admin-dash/testimonios' },
    // { text: 'Chatbot', icon: <Bot size={20} />, path: '/admin-dash/chatbot' },
    {
      text: "Usuarios",
      icon: <Users size={20} />,
      path: "/admin-dash/usuarios",
    },
    {
      text: "Recursos ",
      icon: <Image size={20} />,
      path: "/admin-dash/imagen-corporativa",
    },
    { text: "Footer", icon: <Layout size={20} />, path: "/admin-dash/footer" },
    {
      text: "Configuraciones",
      icon: <Settings size={20} />,
      path: "/admin-dash/configuraciones",
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : collapsedWidth,
            transition: "width 0.3s ease",
            overflowX: "hidden",
            overflow: "hidden",
            boxShadow: 2,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            color: "#1c1c1c",
            borderRight: "1px solid #f1f5f9",
          },
        }}
      >
        {/* Header mejorado */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            minHeight: 64,
          }}
        >
          {/* Logo/Inicio */}
          {open ? (
            <Box
              component="a"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "primary.main",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name || "Logo"}
                  style={{
                    height: "40px",
                    maxWidth: "100px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Home size={24} style={{ color: "#fdce27" }} />
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ color: "#1c1c1c", letterSpacing: "0.05em" }}
                  >
                    {company.name || "Panel Admin"}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Tooltip title="Ver sitio web" placement="right">
              <IconButton
                component="a"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: "primary.main",
                  mx: "auto",
                }}
              >
                <Home size={24} />
              </IconButton>
            </Tooltip>
          )}

          {/* Toggle button */}
          <Tooltip
            title={open ? "Contraer menú" : "Expandir menú"}
            placement="right"
          >
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                ml: open ? 0 : "auto",
                color: "#1c1c1c",
                "&:hover": { color: "#fdce27" },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ borderColor: "#f1f5f9" }} />

        {/* Info del usuario (opcional) */}
        {open && user && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              backgroundColor: "#f8f9fa",
              borderBottom: "1px solid",
              borderColor: "#f1f5f9",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#64748b" }}
              display="block"
              fontWeight={700}
            >
              Bienvenido,
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{ color: "#1c1c1c" }}
            >
              {user.name || user.email}
            </Typography>
          </Box>
        )}

        {/* Menú principal */}
        <List sx={{ flexGrow: 1, py: 1, overflow: "auto", minHeight: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Tooltip
                key={item.text}
                title={!open ? item.text : ""}
                placement="right"
              >
                <NavLink
                  to={item.path}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <ListItemButton
                    selected={isActive}
                    sx={{
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 2,
                      backgroundColor: isActive
                        ? "rgba(253, 206, 39, 0.1)"
                        : "transparent",
                      color: isActive ? "#d9a800" : "#1c1c1c", // Un amarillo más oscuro para visibilidad sobre blanco
                      "&:hover": {
                        backgroundColor: "#f8f9fa",
                        color: "#d9a800",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(253, 206, 39, 0.15)",
                        "&:hover": {
                          backgroundColor: "rgba(253, 206, 39, 0.2)",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        justifyContent: "center",
                        color: "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          fontWeight: isActive ? 800 : 500,
                          letterSpacing: "0.02em",
                        }}
                      />
                    )}
                  </ListItemButton>
                </NavLink>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ borderColor: "#f1f5f9" }} />

        {/* Botón de logout */}
        <Tooltip title={!open ? "Cerrar sesión" : ""} placement="right">
          <ListItemButton
            onClick={logout}
            sx={{
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              mx: 1,
              my: 1,
              borderRadius: 1,
              maxHeight: "50px",
              backgroundColor: "error.main",
              color: "white",
              "&:hover": {
                backgroundColor: "error.dark",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                justifyContent: "center",
                color: "white",
              }}
            >
              <LogOut size={20} />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Cerrar sesión"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  maxHeight: "50px",
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Drawer>

      <Box
        component="main"
        className="bg-gray-50 min-h-screen"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.3s ease",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminSidebar;
