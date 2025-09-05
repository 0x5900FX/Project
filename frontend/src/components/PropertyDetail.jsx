// src/components/PropertyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  LocationOn,
  Bed,
  Bathtub,
  SquareFoot,
  Edit,
  Delete,
  Favorite,
  Share,
  ArrowBack,
  Home,
  Phone,
  Email,
  CalendarToday
} from '@mui/icons-material';
import { fetchProperties, deleteProperty } from '../api/api';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        // In a real app, you would have an API endpoint to get a single property
        // For now, we'll simulate it by filtering from all properties
        const res = await fetchProperties();
        const properties = res.data.properties || [];
        const foundProperty = properties.find(p => p.id === parseInt(id));

        if (foundProperty) {
          setProperty(foundProperty);
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

    // Get user role from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }

    fetchPropertyDetails();
  }, [id]);

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProperty(id);
      navigate('/properties');
    } catch (err) {
      console.error('Failed to delete property:', err);
      setError('Failed to delete property');
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleEditClick = () => {
    navigate(`/properties/${id}/edit`);
  };

  const isOwner = property && userRole === 'seller' && property.seller_id === userRole;
  const canEdit = isOwner || userRole === 'admin';
  const canDelete = isOwner || userRole === 'admin';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading property details...</Typography>
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Property not found'}</Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/properties')}
        >
          Back to Properties
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
        <Typography color="#2C6E49">{property.title}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate('/properties')}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Back to Properties
      </Button>

      {/* Property Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight={600} color="#2C3E50" gutterBottom>
              {property.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn fontSize="small" sx={{ color: '#5C6B73', mr: 0.5 }} />
              <Typography variant="body1" color="#5C6B73">
                {property.location || 'Location not specified'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight={600} color="#2C6E49">
                ${property.price ? property.price.toLocaleString() : 'Price on request'}
              </Typography>
              <Chip
                label={property.propertyType || 'Property'}
                size="small"
                sx={{
                  ml: 2,
                  bgcolor: '#E8E2D8',
                  color: '#2C6E49',
                  fontWeight: 500,
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <Box>
              <IconButton sx={{ color: '#D4A373', mr: 1 }}>
                <Favorite />
              </IconButton>
              <IconButton sx={{ color: '#5C6B73' }}>
                <Share />
              </IconButton>
              {canEdit && (
                <IconButton sx={{ color: '#2C6E49', mr: 1 }} onClick={handleEditClick}>
                  <Edit />
                </IconButton>
              )}
              {canDelete && (
                <IconButton sx={{ color: '#d32f2f' }} onClick={handleDeleteClick}>
                  <Delete />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Property Images */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600} color="#2C3E50" gutterBottom>
          Property Images
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardMedia
                component="div"
                sx={{
                  height: 400,
                  backgroundImage: property.image
                    ? `url(${property.image})`
                    : 'linear-gradient(135deg, #E8E2D8 0%, #D4A373 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Property Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={600} color="#2C3E50" gutterBottom>
              Property Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body1" color="#5C6B73" paragraph>
              {property.description || 'No description available'}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} sm={3}>
                <Card elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Bed sx={{ fontSize: 30, color: '#2C6E49', mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>{property.bedrooms || '0'}</Typography>
                  <Typography variant="body2" color="#5C6B73">Bedrooms</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Bathtub sx={{ fontSize: 30, color: '#2C6E49', mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>{property.bathrooms || '0'}</Typography>
                  <Typography variant="body2" color="#5C6B73">Bathrooms</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <SquareFoot sx={{ fontSize: 30, color: '#2C6E49', mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>{property.area || '0'}</Typography>
                  <Typography variant="body2" color="#5C6B73">Square Feet</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Home sx={{ fontSize: 30, color: '#2C6E49', mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>{property.propertyType || 'N/A'}</Typography>
                  <Typography variant="body2" color="#5C6B73">Property Type</Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={600} color="#2C3E50" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#2C6E49', mr: 2 }}>
                {property.seller_name ? property.seller_name.charAt(0) : 'S'}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={500}>
                  {property.seller_name || 'Seller Name'}
                </Typography>
                <Typography variant="body2" color="#5C6B73">
                  {property.seller_role || 'Property Owner'}
                </Typography>
              </Box>
            </Box>

            <List>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: '#5C6B73' }}>
                  <Phone fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={property.seller_phone || 'Phone not available'} />
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36, color: '#5C6B73' }}>
                  <Email fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={property.seller_email || 'Email not available'} />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 36, color: '#5C6B73' }}>
                  <CalendarToday fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`Listed on ${property.created_at ? new Date(property.created_at).toLocaleDateString() : 'Date not available'}`}
                />
              </ListItem>
            </List>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              Contact Seller
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Property?"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this property? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyDetail;