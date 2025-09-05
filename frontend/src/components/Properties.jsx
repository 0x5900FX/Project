// src/components/Properties.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchProperties } from "../api/api";
import HomeIcon from "@mui/icons-material/Home";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const fetchPropertiesData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchProperties();
      const propertiesData = res.data.properties || [];

      const token = localStorage.getItem("token");
      if (!token) {
        // Guest → only verified
        setProperties(propertiesData.filter((p) => p.verified));
      } else {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp < currentTime) {
            localStorage.removeItem("token");
            setRole(null);
            setProperties(propertiesData.filter((p) => p.verified));
          } else {
            setRole(payload.role);
            if (payload.role === "admin") {
              setProperties(propertiesData);
            } else if (payload.role === "seller") {
              setProperties(
                propertiesData.filter((p) => p.seller_id === payload.user_id)
              );
            } else {
              setProperties(propertiesData.filter((p) => p.verified));
            }
          }
        } catch (err) {
          localStorage.removeItem("token");
          setRole(null);
          setProperties(propertiesData.filter((p) => p.verified));
        }
      }
    } catch (err) {
      setError("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPropertiesData();
  }, [fetchPropertiesData]);

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#F5F2ED", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={700} color="#2C3E50" gutterBottom>
            LandState Properties
          </Typography>
          <Typography variant="h6" color="#5C6B73">
            Browse all available listings
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "#2C6E49", mr: 2 }}>
                  <HomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {properties.length}
                  </Typography>
                  <Typography variant="body2" color="#5C6B73">
                    {role === "admin" ? "All Properties" : "Available Properties"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "#10B981", mr: 2 }}>
                  <VerifiedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {properties.filter((p) => p.verified).length}
                  </Typography>
                  <Typography variant="body2" color="#5C6B73">
                    Verified
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Properties List */}
        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardHeader
            title="All Properties"
            titleTypographyProps={{ variant: "h5", fontWeight: 600 }}
            subheader="Click any property for more details"
            subheaderTypographyProps={{ variant: "body1", color: "#5C6B73" }}
          />
          <Divider />
          <List>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : properties.length > 0 ? (
              properties.map((p) => (
                <ListItem
                  key={p.id}
                  sx={{
                    borderBottom: "1px solid rgba(44, 110, 73, 0.12)",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(44, 110, 73, 0.05)" },
                  }}
                  onClick={() => handlePropertyClick(p.id)}
                >
                  {/* ✅ Show property image */}
                  <Avatar
                    src={p.image_url}
                    alt={p.title}
                    sx={{ mr: 2, width: 64, height: 64, borderRadius: 2 }}
                  />

                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h6" fontWeight={600} color="#2C3E50">
                          {p.title}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="#2C6E49">
                          ${p.price.toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {p.verified && (
                            <Chip
                              icon={<VerifiedIcon fontSize="small" />}
                              label="Verified"
                              size="small"
                              sx={{
                                bgcolor: "#10B981",
                                color: "#FFFFFF",
                                fontWeight: 500,
                              }}
                            />
                          )}
                          {p.location && (
                            <Chip
                              icon={<LocationOnIcon fontSize="small" />}
                              label={p.location}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {p.property_type && (
                            <Chip label={p.property_type} size="small" variant="outlined" />
                          )}
                        </Box>

                        <Box sx={{ mt: 2, display: "flex", gap: 3 }}>
                          {p.bedrooms && (
                            <Typography variant="body2" color="#5C6B73">
                              <BedIcon fontSize="small" /> {p.bedrooms} bed
                            </Typography>
                          )}
                          {p.bathrooms && (
                            <Typography variant="body2" color="#5C6B73">
                              <BathIcon fontSize="small" /> {p.bathrooms} bath
                            </Typography>
                          )}
                          {p.area && (
                            <Typography variant="body2" color="#5C6B73">
                              <SquareFootIcon fontSize="small" /> {p.area} sq ft
                            </Typography>
                          )}
                        </Box>

                        {p.description && (
                          <Typography variant="body2" color="#5C6B73" sx={{ mt: 1 }}>
                            {p.description.length > 100
                              ? `${p.description.substring(0, 100)}...`
                              : p.description}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No properties found"
                  secondary="Check back later for new listings"
                />
              </ListItem>
            )}
          </List>
        </Card>

        {/* ✅ Back to Dashboard button (only if logged in) */}
        {role && (
          <Box textAlign="center" mt={4}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/dashboard")}
              sx={{
                py: 1.2,
                px: 4,
                borderRadius: 2,
                fontWeight: 600,
                borderColor: "#2C6E49",
                color: "#2C6E49",
                "&:hover": {
                  backgroundColor: "rgba(44, 110, 73, 0.08)",
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
