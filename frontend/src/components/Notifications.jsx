// src/components/Notifications.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Avatar,
  Chip,
  Divider,
  Alert,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp < currentTime) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      // Mock notifications - in a real app, you would fetch from API
      const mockNotifications = [
        {
          id: 1,
          title: 'Property Verified',
          message: 'Your property "Modern Apartment" has been verified and is now visible to all users.',
          type: 'success',
          read: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        {
          id: 2,
          title: 'New Inquiry',
          message: 'You have a new inquiry for your property "Downtown Loft".',
          type: 'info',
          read: false,
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        },
        {
          id: 3,
          title: 'Payment Received',
          message: 'Payment for your premium listing has been received.',
          type: 'success',
          read: true,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: 4,
          title: 'Maintenance Notice',
          message: 'Scheduled maintenance will occur on Sunday, 2:00 AM - 4:00 AM EST.',
          type: 'warning',
          read: true,
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
        {
          id: 5,
          title: 'Welcome to LandState',
          message: 'Thank you for joining our platform! Get started by creating your first property listing.',
          type: 'info',
          read: true,
          timestamp: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
        },
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#10B981' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#EF4444' }} />;
      case 'warning':
        return <InfoIcon sx={{ color: '#F59E0B' }} />;
      default:
        return <InfoIcon sx={{ color: '#3B82F6' }} />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading notifications...</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3, backgroundColor: '#2C6E49', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={600}>
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={unreadCount} color="secondary">
              <NotificationsIcon />
            </Badge>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                sx={{ ml: 2 }}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" color="#5C6B73">
              No notifications
            </Typography>
            <Typography variant="body2" color="#5C6B73">
              You're all caught up! Check back later for updates.
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'rgba(44, 110, 73, 0.05)',
                    '&:hover': { backgroundColor: 'rgba(44, 110, 73, 0.08)' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? '#E5E7EB' : '#2C6E49' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant="body1"
                          fontWeight={notification.read ? 400 : 600}
                          color={notification.read ? '#2C3E50' : '#2C6E49'}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color={notification.read ? '#5C6B73' : '#2C6E49'}
                      >
                        {notification.message}
                        <Typography
                          component="span"
                          variant="caption"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    {!notification.read && (
                      <IconButton
                        edge="end"
                        onClick={() => handleMarkAsRead(notification.id)}
                        sx={{ mr: 1 }}
                      >
                        <MarkEmailReadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearAll}
            >
              Clear All Notifications
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Notifications;