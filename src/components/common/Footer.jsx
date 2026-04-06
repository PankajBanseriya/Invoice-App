import {
  Box,
  Typography,
  Divider,
} from "@mui/material";

function Footer() {
  return (
    <Box textAlign="center" component="footer" width="100%" bgcolor="background.paper" mt={2}> 
         <Divider/>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 500,
          mt:1,
          py:1,
        }}
      >
        <Typography color="text.secondary" fontSize={13} mb={1}>
          © 2026 InvoiceApp. All rights reserved.
        </Typography>
        <Box variant="body2" color="text.secondary" display="flex" alignItems="center" gap={3}>
            <Typography fontSize={13}>Privacy Policy</Typography>
            <Typography fontSize={13}>Terms of Service</Typography>
            <Typography fontSize={13}>Support</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
