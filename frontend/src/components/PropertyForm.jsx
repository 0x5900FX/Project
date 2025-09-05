// src/components/PropertyForm.jsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from "@mui/material";
import { createProperty } from "../api/api";

export default function PropertyForm({ onPropertyCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    area: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Convert string numbers to actual numbers
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseInt(formData.area) || 0
      };

      const response = await createProperty(propertyData);

      if (response.data) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          price: "",
          location: "",
          propertyType: "",
          bedrooms: "",
          bathrooms: "",
          area: ""
        });

        setSuccess(true);

        // Notify parent component
        onPropertyCreated(response.data);
      }
    } catch (err) {
      console.error("Error creating property:", err);
      setError(err.response?.data?.error || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Property created successfully!
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="title"
            label="Property Title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            required
            helperText="Enter a descriptive title for your property"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            helperText="Provide details about the property"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="price"
            label="Price ($)"
            type="number"
            fullWidth
            value={formData.price}
            onChange={handleChange}
            required
            inputProps={{ min: 0, step: "0.01" }}
            helperText="Enter the asking price"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Property Type</InputLabel>
            <Select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              label="Property Type"
            >
              <MenuItem value="house">House</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="land">Land</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="location"
            label="Location"
            fullWidth
            value={formData.location}
            onChange={handleChange}
            helperText="City, State or full address"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            name="bedrooms"
            label="Bedrooms"
            type="number"
            fullWidth
            value={formData.bedrooms}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            helperText="Number of bedrooms"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            name="bathrooms"
            label="Bathrooms"
            type="number"
            fullWidth
            value={formData.bathrooms}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            helperText="Number of bathrooms"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            name="area"
            label="Area (sq ft)"
            type="number"
            fullWidth
            value={formData.area}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            helperText="Property size in square feet"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
            sx={{ py: 1.2 }}
          >
            {loading ? "Creating Property..." : "Create Property"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}