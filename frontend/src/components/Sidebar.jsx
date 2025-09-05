// src/components/Sidebar.jsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';

const drawerWidth = 240;

const Sidebar = ({ open, toggleDrawer }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Properties', icon: <HomeIcon />, path: '/properties' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users', adminOnly: true },
    { text: 'User Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
  ];

  const bottomItems = [
    { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path, action) => {
    if (action) {
      action();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 80,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          overflowX: 'hidden',
          borderRight: '1px solid rgba(44, 110, 73, 0.12)',
          top: '64px', // offset by Navbar height
          height: 'calc(100% - 64px)', // fill rest of screen
        },
      }}
      open={open}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top header with title and toggle button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          {open && (
            <Typography
              variant="h6"
              component={Link}
              to="/dashboard"
              sx={{
                textDecoration: 'none',
                color: '#2C6E49',
                fontWeight: 600,
                letterSpacing: '-0.5px',
              }}
            >
              LandState
            </Typography>
          )}
          <IconButton onClick={toggleDrawer}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>

        <Divider />

        {/* Main menu */}
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => {
            if (item.adminOnly) {
              const token = localStorage.getItem('token');
              if (!token) return null;
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role !== 'admin') return null;
              } catch (err) {
                console.error('Error decoding token:', err);
                return null;
              }
            }

            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => handleNavigation(item.path, item.action)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: isActive(item.path) ? 'rgba(44, 110, 73, 0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(44, 110, 73, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive(item.path) ? '#2C6E49' : '#5C6B73',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        color: isActive(item.path) ? '#2C6E49' : '#2C3E50',
                        fontWeight: isActive(item.path) ? 500 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider />

        {/* Bottom menu */}
        <List>
          {bottomItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path, item.action)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: 'rgba(44, 110, 73, 0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: '#5C6B73',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.text}
                    sx={{ color: '#2C3E50' }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
