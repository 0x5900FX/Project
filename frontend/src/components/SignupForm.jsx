// src/components/SignupForm.jsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  Box,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { createUser } from "../api/api";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function SignupForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer" // default role
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (form.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    try {
      await createUser(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          <Box
            component="img"
            src="/logo.png"
            alt="LandState Logo"
            sx={{
              height: 60,
              mb: 2,
              display: { xs: "none", md: "block" }
            }}
          />
          <Typography
            variant="h4"
            fontWeight={700}
            color="#2C6E49"
            gutterBottom
          >
            Create Account
          </Typography>
          <Typography variant="body2" color="#5C6B73">
            Join us today and get started
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            value={form.username}
            onChange={handleChange}
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
              "& .MuiOutlinedInput-root": {
                borderRadius: 2
              }
            }}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#5C6B73" }} />
                </InputAdornment>
              )
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2
              }
            }}
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#5C6B73" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2
              }
            }}
          />

          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#5C6B73" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2
              }
            }}
          />

          {/* Role Selection */}
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel
              component="legend"
              sx={{ color: "#2C6E49", fontWeight: 600 }}
            >
              Select Role
            </FormLabel>
            <RadioGroup
              row
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <FormControlLabel
                value="buyer"
                control={<Radio color="primary" />}
                label="Buyer"
              />
              <FormControlLabel
                value="seller"
                control={<Radio color="primary" />}
                label="Seller"
              />
            </RadioGroup>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                color="primary"
                sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
              />
            }
            label={
              <Typography variant="body2" color="#5C6B73">
                I agree to the{" "}
                <Link
                  to="/terms"
                  style={{
                    color: "#2C6E49",
                    textDecoration: "none"
                  }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  style={{
                    color: "#2C6E49",
                    textDecoration: "none"
                  }}
                >
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(44, 110, 73, 0.3)"
              }
            }}
          >
            Create Account
          </Button>
        </form>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="#5C6B73">
            Already have an account?{" "}
            <Link
              to="/"
              style={{
                color: "#2C6E49",
                fontWeight: 500,
                textDecoration: "none"
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
