// src/components/PropertyEdit.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import { fetchProperties, updateProperty, uploadPropertyImage } from '../api/api';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import TitleIcon from '@mui/icons-material/Title';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PropertyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: ''
  });
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const res = await fetchProperties();
        const properties = res.data.properties || [];
        const foundProperty = properties.find(p => p.id === parseInt(id));

        if (foundProperty) {
          setForm({
            title: foundProperty.title || '',
            description: foundProperty.description || '',
            price: foundProperty.price || '',
            location: foundProperty.location || '',
            propertyType: foundProperty.propertyType || '',
            bedrooms: foundProperty.bedrooms || '',
            bathrooms: foundProperty.bathrooms || ''
          });
          setExistingImage(foundProperty.image || '');
        } else {
          setError('Property not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch property details:', err);
        setError('Failed to load property details');
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.price) {
      setError('Title and Price are required.');
      return;
    }

    try {
      // Update property details
      await updateProperty(id, form);

      // Upload new image if selected
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await uploadPropertyImage(id, formData);
      }

      setSuccess('Property updated successfully!');
      // Navigate to property detail page after a short delay
      setTimeout(() => {
        navigate(`/properties/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update property');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading property details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate(`/properties/${id}`)}
        >
          Back to Property
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/dashboard" color="inherit">
          Dashboard
        </MuiLink>
        <MuiLink component={Link} to="/properties" color="inherit">
          Properties
        </MuiLink>
        <MuiLink component={Link} to={`/properties/${id}`} color="inherit">
          {form.title}
        </MuiLink>
        <Typography color="#2C6E49">Edit Property</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/properties/${id}`)}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Back to Property
      </Button>

      <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <HomeIcon sx={{ color: '#2C6E49', mr: 1.5 }} />
            <Typography variant="h6" fontWeight={600} color="#2C3E50">
              Edit Property
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Property Title"
                  name="title"
                  fullWidth
                  margin="normal"
                  value={form.title}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon sx={{ color: '#5C6B73' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Price"
                  name="price"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon sx={{ color: '#5C6B73' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Location"
                  name="location"
                  fullWidth
                  margin="normal"
                  value={form.location}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: '#5C6B73' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" sx={{ mt: 1 }}>
                  <InputLabel id="property-type-label">Property Type</InputLabel>
                  <Select
                    labelId="property-type-label"
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleChange}
                    label="Property Type"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="house">House</MenuItem>
                    <MenuItem value="apartment">Apartment</MenuItem>
                    <MenuItem value="condo">Condo</MenuItem>
                    <MenuItem value="land">Land</MenuItem>
                    <MenuItem value="commercial">Commercial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Bedrooms"
                  name="bedrooms"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={form.bedrooms}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ color: '#5C6B73' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Bathrooms"
                  name="bathrooms"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={form.bathrooms}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ color: '#5C6B73' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionIcon sx={{ color: '#5C6B73' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      border: '2px dashed #2C6E49',
                      borderRadius: 2,
                      p: 2,
                      mr: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(44, 110, 73, 0.04)',
                      }
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <AddPhotoAlternateIcon fontSize="large" sx={{ color: '#2C6E49' }} />
                  </IconButton>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {file ? file.name : (existingImage ? 'Change Property Image' : 'Upload Property Image')}
                    </Typography>
                    <Typography variant="body2" color="#5C6B73">
                      {file ? 'New image selected' : (existingImage ? 'Current image will be replaced' : 'JPG, PNG up to 5MB')}
                    </Typography>
                  </Box>
                </Box>

                {existingImage && !file && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="#5C6B73" gutterBottom>
                      Current Image:
                    </Typography>
                    <Box
                      component="img"
                      src={existingImage}
                      alt="Current property"
                      sx={{
                        height: 150,
                        borderRadius: 1,
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  Update Property
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PropertyEdit;