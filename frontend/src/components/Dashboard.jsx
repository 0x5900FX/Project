// src/components/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Alert,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import Sidebar from "./Sidebar";
import PropertyForm from "./PropertyForm";
import { fetchUsers, fetchProperties, verifyProperty, deleteProperty } from "../api/api";
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function Dashboard({ sidebarOpen, toggleSidebar }) {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [unverifiedProperties, setUnverifiedProperties] = useState([]);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchPropertiesData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchProperties();
      const propertiesData = res.data.properties || [];

      if (role === "admin") {
        setProperties(propertiesData);
        setUnverifiedProperties(propertiesData.filter(p => !p.verified));
      } else if (role === "seller") {
        const sellerProperties = propertiesData.filter(p => p.seller_id === userId);
        setProperties(sellerProperties);
      } else {
        // Buyer: only verified properties
        const verifiedProperties = propertiesData.filter(p => p.verified);
        setProperties(verifiedProperties);
      }
    } catch (err) {
      setError("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [role, userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp < currentTime) {
        localStorage.removeItem('token');
        window.location.href = "/";
        return;
      }

      if (!role) {
        setRole(payload.role);
      }
      if (!userId) {
        setUserId(payload.user_id);
      }
    } catch (err) {
      localStorage.removeItem('token');
      window.location.href = "/";
    }
  }, [role, userId]);

  useEffect(() => {
    if (role && userId) {
      fetchPropertiesData();

      if (role === "admin") {
        setUsersLoading(true);
        fetchUsers()
          .then((res) => {
            setUsers(res.data.users || []);
            setUsersLoading(false);
          })
          .catch(() => {
            setError("Failed to fetch users");
            setUsersLoading(false);
          });
      }
    }
  }, [role, userId, fetchPropertiesData]);

  const handlePropertyCreated = (newProperty) => {
    if (role === "admin") {
      setProperties(prev => [...prev, newProperty]);
      setUnverifiedProperties(prev => [...prev, newProperty]);
    } else if (role === "seller" && newProperty.seller_id === userId) {
      setProperties(prev => [...prev, newProperty]);
    }
  };

  const handleVerifyClick = (property) => {
    setSelectedProperty(property);
    setOpenVerifyDialog(true);
  };

  const handleVerifyConfirm = async () => {
    try {
      await verifyProperty(selectedProperty.id, { verified: true });
      setProperties(prev =>
        prev.map(p =>
          p.id === selectedProperty.id
            ? { ...p, verified: true }
            : p
        )
      );
      setUnverifiedProperties(prev =>
        prev.filter(p => p.id !== selectedProperty.id)
      );
      setOpenVerifyDialog(false);
    } catch (err) {
      setError('Failed to verify property');
    }
  };

  const handleVerifyCancel = () => {
    setOpenVerifyDialog(false);
  };

  const handleDeleteClick = (property) => {
    setSelectedProperty(property);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProperty(selectedProperty.id);
      setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
      setUnverifiedProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
      setOpenDeleteDialog(false);
    } catch (err) {
      setError('Failed to delete property');
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleRefresh = () => {
    fetchPropertiesData();
  };

  const canDeleteProperty = (property) => {
    return role === "admin" || (role === "seller" && property.seller_id === userId);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#F5F2ED" }}>
      <Sidebar open={sidebarOpen} toggleDrawer={toggleSidebar} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>

        <Container sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Welcome message */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'transparent' }}>
            <Typography variant="h4" fontWeight={600} color="#2C3E50" gutterBottom>
              Welcome to Your Dashboard
            </Typography>
            <Typography variant="body1" color="#5C6B73">
              {role === "admin"
                ? "Manage all properties and users here."
                : role === "seller"
                ? "Manage your properties. Admins will verify them."
                : "Browse verified properties."}
            </Typography>
          </Paper>

          {/* Stats Cards — only show to admin/seller */}
          {(role === "admin" || role === "seller") && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#2C6E49', mr: 2 }}>
                      <HomeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>{properties.length}</Typography>
                      <Typography variant="body2" color="#5C6B73">
                        {role === "admin" ? "All Properties" : "Your Properties"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {role === "admin" && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#D4A373', mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight={600}>{users.length}</Typography>
                          <Typography variant="body2" color="#5C6B73">Users</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#F59E0B', mr: 2 }}>
                          <PendingIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight={600}>
                            {unverifiedProperties.length}
                          </Typography>
                          <Typography variant="body2" color="#5C6B73">Pending</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#10B981', mr: 2 }}>
                          <VerifiedIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight={600}>
                            {properties.filter(p => p.verified).length}
                          </Typography>
                          <Typography variant="body2" color="#5C6B73">Verified</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          )}

          {/* Simple stats card for buyers */}
          {role === "buyer" && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#2C6E49', mr: 2 }}>
                      <HomeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>{properties.length}</Typography>
                      <Typography variant="body2" color="#5C6B73">
                        Available Properties
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Unverified Properties — admin only */}
          {role === "admin" && (
            <Card elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      Properties Awaiting Verification
                    </Typography>
                    <Typography variant="body2" color="#5C6B73" sx={{ ml: 2 }}>
                      ({unverifiedProperties.length} properties)
                    </Typography>
                  </Box>
                }
                action={
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefresh}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Refresh
                    </Button>
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                }
              />
              <Divider />
              <List>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : unverifiedProperties.length > 0 ? (
                  unverifiedProperties.map((p) => (
                    <ListItem key={p.id} sx={{ borderBottom: "1px solid rgba(44, 110, 73, 0.12)" }}>
                      <Avatar sx={{ mr: 2, bgcolor: '#F59E0B' }}>
                        <HomeIcon />
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {p.title}
                            <Chip
                              icon={<PendingIcon fontSize="small" />}
                              label="Pending Verification"
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: '#F59E0B',
                                color: '#FFFFFF',
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                        }
                        secondary={`$${p.price} | Seller ID: ${p.seller_id}`}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleVerifyClick(p)}
                        sx={{ mr: 1 }}
                      >
                        Verify
                      </Button>
                      <IconButton
                        onClick={() => handleDeleteClick(p)}
                        disabled={!canDeleteProperty(p)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No properties awaiting verification"
                      secondary="All properties have been verified"
                    />
                  </ListItem>
                )}
              </List>
            </Card>
          )}

          {/* Users list — admin only */}
          {role === "admin" && (
            <Card elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
              <CardHeader
                title="Users"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <Divider />
              <List>
                {usersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : users.map((u) => (
                  <ListItem key={u.id} sx={{ borderBottom: "1px solid rgba(44, 110, 73, 0.12)" }}>
                    <Avatar sx={{ mr: 2, bgcolor: '#2C6E49' }}>
                      <PersonIcon />
                    </Avatar>
                    <ListItemText
                      primary={u.username}
                      secondary={
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{
                            bgcolor: u.role === 'admin' ? '#2C6E49' : '#D4A373',
                            color: '#FFFFFF',
                            fontWeight: 500,
                          }}
                        />
                      }
                    />
                    <IconButton>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Card>
          )}

          {/* Properties — visible to all */}
          <Card elevation={2} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
            <CardHeader
              title="Properties"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              action={
                (role === "admin" || role === "seller") && (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefresh}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Refresh
                    </Button>
                    <IconButton aria-label="settings">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                )
              }
            />
            <Divider />
            <List>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : properties.length > 0 ? (
                properties.map((p) => (
                  <ListItem key={p.id} sx={{ borderBottom: "1px solid rgba(44, 110, 73, 0.12)" }}>
                    <Avatar sx={{ mr: 2, bgcolor: p.verified ? '#2C6E49' : '#F59E0B' }}>
                      <HomeIcon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {p.title}
                          {p.verified ? (
                            <Chip
                              icon={<VerifiedIcon fontSize="small" />}
                              label="Verified"
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: '#10B981',
                                color: '#FFFFFF',
                                fontWeight: 500,
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<PendingIcon fontSize="small" />}
                              label="Pending"
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: '#F59E0B',
                                color: '#FFFFFF',
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="#5C6B73">
                            ${p.price} | Seller ID: {p.seller_id}
                          </Typography>
                          {p.location && (
                            <Typography component="div" variant="body2" color="#5C6B73">
                              Location: {p.location}
                            </Typography>
                          )}
                          {p.property_type && (
                            <Typography component="div" variant="body2" color="#5C6B73">
                              Type: {p.property_type}
                            </Typography>
                          )}
                          {p.bedrooms && p.bathrooms && (
                            <Typography component="div" variant="body2" color="#5C6B73">
                              {p.bedrooms} bed, {p.bathrooms} bath
                            </Typography>
                          )}
                          {p.area && (
                            <Typography component="div" variant="body2" color="#5C6B73">
                              {p.area} sq ft
                            </Typography>
                          )}
                        </React.Fragment>
                      }
                    />
                    {/* Only show action buttons for admin and seller */}
                    {(role === "admin" || role === "seller") && (
                      <>
                        {!p.verified && role === "admin" && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleVerifyClick(p)}
                            sx={{ mr: 1 }}
                          >
                            Verify
                          </Button>
                        )}
                        <IconButton
                          onClick={() => handleDeleteClick(p)}
                          disabled={!canDeleteProperty(p)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No properties found"
                    secondary={role === "seller" ? "Add a new property to get started" : "No properties available"}
                  />
                </ListItem>
              )}
            </List>
          </Card>

          {/* Property Form — seller & admin only */}
          {(role === "seller" || role === "admin") && (
            <Card elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <CardHeader title="Add New Property" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
              <Divider />
              <Box sx={{ p: 1 }}>
                <PropertyForm onPropertyCreated={handlePropertyCreated} />
              </Box>
            </Card>
          )}
        </Container>
      </Box>

      {/* Verify Confirmation Dialog */}
      <Dialog
        open={openVerifyDialog}
        onClose={handleVerifyCancel}
        aria-labelledby="verify-dialog-title"
        aria-describedby="verify-dialog-description"
      >
        <DialogTitle id="verify-dialog-title">
          Verify Property?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to verify this property? This will make it visible to all users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVerifyCancel}>Cancel</Button>
          <Button onClick={handleVerifyConfirm} color="primary" autoFocus>
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Property?
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
}