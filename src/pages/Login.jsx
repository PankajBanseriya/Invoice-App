import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  InputLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Backdrop,
} from "@mui/material";
import { Visibility, VisibilityOff, Description } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const isFormInvalid =
    !validateEmail(formData.email);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "#f9f9f9",
        display: "flex",
        flexDirection: "column",
      }}

    >
      {/* <Header/> */}
      <Container maxWidth="sm" sx={{ my: 3.5 }}>
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            fontWeight="400"
            gutterBottom
            letterSpacing={1}
            fontSize="30px"
          >
            Welcome Back
          </Typography>
          <Typography color="textSecondary" fontSize="16px">
            Log in to your account.
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{ p: 4, borderRadius: 2, bgcolor: "white" }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <InputLabel
              sx={{
                mb: 1,
                fontSize: "0.9rem",
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              Email Address*
            </InputLabel>
            <TextField
              fullWidth
              name="email"
              placeholder="Enter your email"
              size="small"
              value={formData.email}
              onChange={handleChange}
              error={formData.email !== "" && !validateEmail(formData.email)}
              helperText={
                formData.email !== "" && !validateEmail(formData.email)
                  ? "Enter a valid email."
                  : ""
              }
              sx={{ mb: 3 }}
            />

            <InputLabel
              sx={{
                mb: 1,
                fontSize: "0.9rem",
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              Password*
            </InputLabel>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              size="small"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              
              sx={{ mb: 2 }}
            />

            {/* Remember Me */}
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  onChange={handleChange}
                  size="small"
                />
              }
              label={<Typography variant="body2">Remember me</Typography>}
              sx={{ mb: 2, color: "text.secondary" }}
            />

            <Box textAlign="right" mt={1}>
              <Button
                type="submit"
                variant="contained"
                disabled={isFormInvalid || isLoggingIn}
                sx={{
                  bgcolor: "#555",
                  px: 4,
                  py: 1,
                  textTransform: "none",
                  fontSize: "16px",
                  "&:hover": { bgcolor: "#333" },
                  minWidth: "100px",
                }}
              >
                {isLoggingIn ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </Box>

            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{" "}
                <Link
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                    textDecoration: "none",
                    fontWeight: "550",
                  }}
                  color="textSecondary"
                  onClick={() => navigate("/signup")}
                >
                  Create account
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoggingIn}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Processing your request...</Typography>
        </Box>
      </Backdrop>
      <Box>
        {/* <Footer /> */}
      </Box>
    </Box>
  );
}
