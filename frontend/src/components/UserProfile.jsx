// src/components/UserProfile.jsx
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
  Avatar,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
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

      // Mock user data for now
      const mockUser = {
        id: payload.id,
        username: payload.username || 'User',
        email: 'user@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        bio: 'Real estate enthusiast with a passion for finding the perfect home for every client.',
        role: payload.role,
        created_at: '2023-01-01',
        avatar_url: '',
      };

      setUser(mockUser);
      setFormData({
        username: mockUser.username,
        email: mockUser.email,
        phone: mockUser.phone,
        location: mockUser.location,
        bio: mockUser.bio,
      });
      setAvatarPreview(mockUser.avatar_url);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit mode
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          phone: user.phone,
          location: user.location,
          bio: user.bio,
        });
        setAvatarPreview(user.avatar_url);
        setAvatarFile(null);
      }
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    try {
      // Mock update - in a real app, you would call your API
      const updatedUser = {
        ...user,
        ...formData,
      };

      if (avatarFile) {
        // Mock avatar upload
        updatedUser.avatar_url = URL.createObjectURL(avatarFile);
      }

      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
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
            User Profile
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Left Column - Avatar and Basic Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    editMode ? (
                      <IconButton
                        component="label"
                        sx={{
                          backgroundColor: '#2C6E49',
                          color: 'white',
                          '&:hover': { backgroundColor: '#1E4B37' },
                        }}
                      >
                        <PhotoCameraIcon fontSize="small" />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </IconButton>
                    ) : null
                  }
                >
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 120, height: 120, border: '4px solid #F5F2ED' }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                </Badge>

                <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>
                  {user?.username}
                </Typography>

                <Chip
                  label={user?.role}
                  sx={{
                    mt: 1,
                    bgcolor: user?.role === 'admin' ? '#2C6E49' : '#D4A373',
                    color: 'white',
                    fontWeight: 500,
                  }}
                />

                <Typography variant="body2" color="#5C6B73" sx={{ mt: 2 }}>
                  Member since {new Date(user?.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader title="Account Details" />
                <Divider />
                <CardContent>
                  <List disablePadding>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#2C6E49' }}>
                          <EmailIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Email"
                        secondary={user?.email}
                      />
                    </ListItem>

                    {user?.phone && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#D4A373' }}>
                            <PhoneIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Phone"
                          secondary={user?.phone}
                        />
                      </ListItem>
                    )}

                    {user?.location && (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#10B981' }}>
                            <LocationOnIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Location"
                          secondary={user?.location}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Editable Form */}
            <Grid item xs={12} md={8}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title="Profile Information"
                  action={
                    <Button
                      variant={editMode ? "outlined" : "contained"}
                      startIcon={<EditIcon />}
                      onClick={handleEditToggle}
                    >
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Username"
                        name="username"
                        fullWidth
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <PersonIcon sx={{ mr: 1, color: '#5C6B73' }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Email"
                        name="email"
                        type="email"
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <EmailIcon sx={{ mr: 1, color: '#5C6B73' }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Phone"
                        name="phone"
                        fullWidth
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <PhoneIcon sx={{ mr: 1, color: '#5C6B73' }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Location"
                        name="location"
                        fullWidth
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <LocationOnIcon sx={{ mr: 1, color: '#5C6B73' }} />
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Bio"
                        name="bio"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={!editMode}
                        placeholder="Tell us about yourself..."
                      />
                    </Grid>

                    {editMode && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                          >
                            Save Changes
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile;