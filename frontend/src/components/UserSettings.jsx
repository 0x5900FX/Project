// src/components/UserSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Switch,
  TextField,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';

const UserSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
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

      // Mock settings - in a real app, you would fetch from API
      const mockSettings = {
        emailNotifications: true,
        pushNotifications: false,
        darkMode: false,
        language: 'en',
      };

      setSettings(mockSettings);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  const handleSettingChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.checked || e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveSettings = () => {
    try {
      // Mock save - in a real app, you would call your API
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
    }
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      // Mock password change - in a real app, you would call your API
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to change password');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3, backgroundColor: '#2C6E49', color: 'white' }}>
          <Typography variant="h4" fontWeight={600}>
            User Settings
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Notification Settings */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title="Notification Settings"
                  avatar={
                    <Avatar sx={{ bgcolor: '#2C6E49' }}>
                      <NotificationsIcon />
                    </Avatar>
                  }
                />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Receive email notifications about property updates"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          name="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={handleSettingChange}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>

                    <ListItem>
                      <ListItemText
                        primary="Push Notifications"
                        secondary="Receive push notifications on your device"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          name="pushNotifications"
                          checked={settings.pushNotifications}
                          onChange={handleSettingChange}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Appearance Settings */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title="Appearance"
                  avatar={
                    <Avatar sx={{ bgcolor: '#D4A373' }}>
                      <PaletteIcon />
                    </Avatar>
                  }
                />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Dark Mode"
                        secondary="Enable dark theme for the application"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          name="darkMode"
                          checked={settings.darkMode}
                          onChange={handleSettingChange}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>

                    <ListItem>
                      <ListItemText
                        primary="Language"
                        secondary="Select your preferred language"
                      />
                      <ListItemSecondaryAction>
                        <TextField
                          select
                          name="language"
                          value={settings.language}
                          onChange={handleSettingChange}
                          variant="outlined"
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Spanish</MenuItem>
                          <MenuItem value="fr">French</MenuItem>
                        </TextField>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Security Settings */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title="Security"
                  avatar={
                    <Avatar sx={{ bgcolor: '#10B981' }}>
                      <SecurityIcon />
                    </Avatar>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        fullWidth
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="New Password"
                        name="newPassword"
                        type="password"
                        fullWidth
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        fullWidth
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleChangePassword}
                      >
                        Change Password
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveSettings}
                  startIcon={<SettingsIcon />}
                >
                  Save Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserSettings;