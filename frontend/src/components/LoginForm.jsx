// src/components/LoginForm.jsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Alert
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/api";
import { useAuth } from "../context/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call backend login API
      const res = await apiLogin(username, password);

      if (!res.data || !res.data.token) {
        throw new Error("No token received from server");
      }

      // ✅ use AuthContext login
      login(res.data.token);

      navigate("/dashboard");
    } catch (err) {
      let errorMessage = "Login failed";
      if (err.response) {
        if (err.response.status === 415) {
          errorMessage = "Unsupported Media Type.";
        } else if (err.response.status === 400) {
          errorMessage = "Bad Request. Check your credentials.";
        } else if (err.response.status === 401) {
          errorMessage = "Invalid username or password.";
        } else {
          errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Check your network.";
      } else {
        errorMessage = err.message || "An unknown error occurred";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "linear-gradient(135deg, #F5F2ED 0%, #E8E2D8 100%)",
        p: 2
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          width: "100%",
          maxWidth: 450,
          boxShadow: "0 10px 30px rgba(44, 110, 73, 0.1)"
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight={700} color="#2C6E49" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="#5C6B73">
            Sign in to continue to your account
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: "#5C6B73" }} />
                </InputAdornment>
              )
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#5C6B73" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
            }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="body2" color="#5C6B73">
              Don&apos;t have an account?{" "}
              <Link to="/signup" style={{ color: "#2C6E49", fontWeight: 500, textDecoration: "none" }}>
                Sign up
              </Link>
            </Typography>
            <Link
              to="/forgot-password"
              style={{ color: "#5C6B73", fontSize: "0.875rem", textDecoration: "none" }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "none",
              "&:hover": { boxShadow: "0 4px 12px rgba(44, 110, 73, 0.3)" }
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
