import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Stack,
} from "@mui/material";
import { Description, Logout } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const open = Boolean(anchorEl);

 
  const checkUser = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, [location]); 

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    handleClose();
    navigate("/");
  };

  if (!user) {
    return (
      <Box textAlign="center" mb={2} component="header">
        <Typography
          variant="h6"
          component="h1"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            my: 2,
            fontWeight: 500,
            fontSize: "1.5rem"
          }}
        >
          <Description /> InvoiceApp
        </Typography>
        <Divider />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }} component="header">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 3, py: 1 }}
      >
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 500 }}
        >
          <Description color="text.primary"/> InvoiceApp
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: 'pointer' }}  onClick={handleClick}>
          <IconButton size="small">
            <Avatar sx={{ width: 30, height: 30, bgcolor: "black" }}>
              {user.firstName.charAt(0)} 
            </Avatar>
          </IconButton>
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {user.firstName} {user.lastName}
          </Typography>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem disabled sx={{ opacity: "1 !important" }}>
            <Box>
              <Typography variant="subtitle2">{user.firstName} {user.lastName}</Typography>
              <Typography variant="caption" color="text.secondary">{user.email}</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Stack>
      <Divider />
    </Box>
  );
}

export default Header;