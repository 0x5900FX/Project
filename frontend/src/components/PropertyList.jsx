// src/components/PropertyList.jsx
import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Avatar,
  Paper,
  InputBase,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Menu,
  Pagination
} from '@mui/material';
import { Link } from 'react-router-dom';
import { fetchProperties } from '../api/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    const getProperties = async () => {
      try {
        const res = await fetchProperties();
        setProperties(res.data.properties || []);
        setFilteredProperties(res.data.properties || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setLoading(false);
      }
    };

    getProperties();
  }, []);

  useEffect(() => {
    let result = properties;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by property type
    if (propertyType !== 'all') {
      result = result.filter(property => property.propertyType === propertyType);
    }

    // Sort properties
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Assuming properties have a createdAt field
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProperties(result);
    setPage(1); // Reset to first page when filters change
  }, [properties, searchTerm, propertyType, sortBy]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePropertyTypeChange = (e) => {
    setPropertyType(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setAnchorEl(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Calculate pagination
  const pageCount = Math.ceil(filteredProperties.length / itemsPerPage);
  const displayedProperties = filteredProperties.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading properties...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Search and Filter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: 2 }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search properties..."
                value={searchTerm}
                onChange={handleSearchChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#5C6B73' }} />
                  </InputAdornment>
                }
              />
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <Select
                value={propertyType}
                onChange={handlePropertyTypeChange}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="house">House</MenuItem>
                <MenuItem value="apartment">Apartment</MenuItem>
                <MenuItem value="condo">Condo</MenuItem>
                <MenuItem value="land">Land</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleMenuClick}
              startIcon={<FilterListIcon />}
              sx={{ borderRadius: 2, justifyContent: 'space-between' }}
            >
              {sortBy === 'newest' && 'Newest First'}
              {sortBy === 'price-low' && 'Price: Low to High'}
              {sortBy === 'price-high' && 'Price: High to Low'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleSortChange({ target: { value: 'newest' } })}>
                Newest First
              </MenuItem>
              <MenuItem onClick={() => handleSortChange({ target: { value: 'price-low' } })}>
                Price: Low to High
              </MenuItem>
              <MenuItem onClick={() => handleSortChange({ target: { value: 'price-high' } })}>
                Price: High to Low
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600} color="#2C3E50">
          {filteredProperties.length} Properties Found
        </Typography>
      </Box>

      {/* Property Grid */}
      <Grid container spacing={3}>
        {displayedProperties.length > 0 ? (
          displayedProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    backgroundImage: property.image
                      ? `url(${property.image})`
                      : 'linear-gradient(135deg, #E8E2D8 0%, #D4A373 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                    <Chip
                      label={property.propertyType || 'Property'}
                      size="small"
                      sx={{
                        bgcolor: '#FFFFFF',
                        color: '#2C6E49',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: 10, left: 10 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="#FFFFFF"
                      sx={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        p: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      ${property.price ? property.price.toLocaleString() : 'Price on request'}
                    </Typography>
                  </Box>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600} color="#2C3E50" gutterBottom>
                    {property.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ color: '#5C6B73', mr: 0.5 }} />
                    <Typography variant="body2" color="#5C6B73">
                      {property.location || 'Location not specified'}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="#5C6B73" sx={{ mb: 2 }}>
                    {property.description ? `${property.description.substring(0, 100)}...` : 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    {property.bedrooms && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BedIcon fontSize="small" sx={{ color: '#5C6B73', mr: 0.5 }} />
                        <Typography variant="body2" color="#5C6B73">
                          {property.bedrooms} Beds
                        </Typography>
                      </Box>
                    )}
                    {property.bathrooms && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BathtubIcon fontSize="small" sx={{ color: '#5C6B73', mr: 0.5 }} />
                        <Typography variant="body2" color="#5C6B73">
                          {property.bathrooms} Baths
                        </Typography>
                      </Box>
                    )}
                    {property.area && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SquareFootIcon fontSize="small" sx={{ color: '#5C6B73', mr: 0.5 }} />
                        <Typography variant="body2" color="#5C6B73">
                          {property.area} sqft
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton size="small" sx={{ color: '#D4A373' }}>
                      <FavoriteIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#5C6B73' }}>
                      <ShareIcon />
                    </IconButton>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    component={Link}
                    to={`/properties/${property.id}`}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 500,
                      boxShadow: 'none',
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" color="#5C6B73">
                No properties found matching your criteria
              </Typography>
              <Typography variant="body2" color="#5C6B73" sx={{ mt: 1 }}>
                Try adjusting your filters or search terms
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1,
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default PropertyList;