import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Avatar,
  Typography,
  Grid,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { imageCache } from "../components/item/ItemsImage";
import { useItems } from "../hooks/useItems";
import api from "../api/axios";
import toast from "react-hot-toast";

const ItemModal = ({ open, handleClose, onSave, activeItem }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    salesRate: 0,
    discountPct: 0,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const { addItem, addItemAsync, updateItem } = useItems();

  const fetchExistingImage = async (id) => {
  try {
    if (imageCache[id]) {
      setLogoPreview(imageCache[id]);
      return;
    }
    const response = await api.get(`/Item/Picture/${id}`);
    if (response.data && typeof response.data === "string") {
      const cleanUrl = response.data.replace(/^"|"$/g, "");
      setLogoPreview(cleanUrl);
    } else {
      setLogoPreview(null);
    }
  } catch (error) {
    console.error("Error fetching existing image", error);
    setLogoPreview(null); 
  }
};

  useEffect(() => {
    setLogoPreview(null);
    setLogoFile(null);
    setErrors({});
    setIsSaving(false);

    if (activeItem) {
      setFormData({
        itemName: activeItem.itemName || "",
        description: activeItem.description || "",
        salesRate: activeItem.salesRate || 0,
        discountPct: activeItem.discountPct || 0,
      });
      fetchExistingImage(activeItem.itemID);
    } else {
      setFormData({
        itemName: "",
        description: "",
        salesRate: "",
        discountPct: "",
      });
      setLogoPreview(null);
      setLogoFile(null);
    }
    setErrors({});
  }, [activeItem, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.itemName.trim())
      tempErrors.itemName = "Item Name is required.";
    if (formData.itemName.length > 50)
      tempErrors.itemName = "Max 50 characters allowed.";
    if (formData.salesRate < 0)
      tempErrors.salesRate = "Sale Rate cannot be negative.";
    if (formData.discountPct < 0 || formData.discountPct > 100) {
      tempErrors.discountPct = "Discount must be between 0 and 100%.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isInvalidType = !["image/jpeg", "image/png"].includes(file.type);
    const isTooLarge = file.size > 5 * 1024 * 1024;

    if (isInvalidType) return alert("Only PNG/JPG allowed.");
    if (isTooLarge) return alert("Max size is 5MB.");

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);

    const payload = {
      itemName: formData.itemName,
      description: formData.description,
      salesRate: parseFloat(formData.salesRate || 0),
      discountPct: parseFloat(formData.discountPct || 0),
    };

    if (activeItem) {
      if (logoFile) {
        const imageData = new FormData();
        imageData.append("ItemID", activeItem.itemID);
        imageData.append("File", logoFile);

        try {
          await api.post("/Item/UpdateItemPicture", imageData);
          delete imageCache[activeItem.itemID];
        } catch (err) {
          console.error("Image update failed", err);
        }
      }

      payload.itemID = activeItem.itemID;
      payload.updatedOn = activeItem.updatedOn;
      await updateItem(payload);
    } else {
      const response = await addItemAsync(payload);
      const newItemId = response.data.primaryKeyID;
      if (logoFile && newItemId) {
        const imageData = new FormData();
        imageData.append("ItemID", newItemId);
        imageData.append("File", logoFile);

        try {
          await api.post("/Item/UpdateItemPicture", imageData);
          delete imageCache[activeItem.itemID];
        } catch (err) {
          console.error("Image update failed", err);
        }
      }
      toast.success("Item added successfully!");
    }
    handleClose();
    setIsSaving(false);
  };

  // const handleSubmit = async () => {
  //   if (!validate()) return;
  //   setIsSaving(true); // Start Loader

  //   const payload = {
  //     itemName: formData.itemName,
  //     description: formData.description,
  //     salesRate: parseFloat(formData.salesRate || 0),
  //     discountPct: parseFloat(formData.discountPct || 0),
  //   };

  //   try {
  //     if (activeItem) {
  //       // --- EDIT LOGIC ---
  //       payload.itemID = activeItem.itemID;
  //       payload.updatedOn = activeItem.updatedOn;

  //       if (logoFile) {
  //         await uploadImage(activeItem.itemID);
  //       }
  //       // 1. Update Item Data
  //       await onSave(payload);

  //       // 2. Update Image if a new file was selected
  //       toast.success("Item updated successfully!");
  //     } else {
  //       // --- CREATE LOGIC ---
  //       // 1. Create the Item and wait for the response to get the new ID
  //       const responseData = await addItemAsync(payload);
  //       const newId = responseData.primaryKeyID;

  //       // 2. Upload the Image using that new ID
  //       if (logoFile && newId) {
  //         await uploadImage(newId);
  //       }
  //       toast.success("Item created successfully!");
  //     }

  //     // After success, the 'invalidateQueries' in the hook will
  //     // automatically trigger the UI refresh.
  //     handleClose();
  //   } catch (err) {
  //     console.error("Save failed:", err);
  //     toast.error(err.response?.data || "An error occurred while saving.");
  //   } finally {
  //     setIsSaving(false); // Stop Loader
  //   }
  // };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          overflowX: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {activeItem ? "Edit Item" : "New Item"}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom color="text.secondary">
            Item Picture
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              variant="rounded"
              src={logoPreview}
              sx={{ width: 80, height: 80 }}
            >
              <CloudUploadIcon />
            </Avatar>
            <Box>
              <Button
                variant="outlined"
                component="label"
                size="small"
                sx={{
                  textTransform: "none",
                  color: "black",
                  borderColor: "#ccc",
                }}
              >
                {logoPreview ? "Change File" : "Choose File"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                PNG or JPG, max 5MB
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
          Item Name*
        </Typography>
        <TextField
          fullWidth
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          placeholder="Enter item name"
          size="small"
          sx={{ mb: 3 }}
          error={!!errors.itemName}
          helperText={errors.itemName}
        />

        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
          Description
        </Typography>
        <TextField
          fullWidth
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter item description"
          multiline
          rows={3}
          size="small"
          inputProps={{ maxLength: 500 }}
        />
        <Typography
          variant="caption"
          align="right"
          display="block"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {formData.description.length}/500
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              Sale Rate*
            </Typography>
            <TextField
              fullWidth
              name="salesRate"
              type="number"
              value={formData.salesRate}
              onChange={handleChange}
              error={!!errors.salesRate}
              helperText={errors.salesRate}
              inputProps={{
                style: { textAlign: "right" },
              }}
              placeholder="0.00"
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              Discount %
            </Typography>
            <TextField
              fullWidth
              name="discountPct"
              type="number"
              value={formData.discountPct}
              onChange={handleChange}
              error={!!errors.discountPct}
              helperText={errors.discountPct}
              size="small"
              placeholder="0"
              inputProps={{
                style: { textAlign: "right" },
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          variant="contained"
          sx={{
            bgcolor: "#444",
            "&:hover": { bgcolor: "#222" },
            textTransform: "none",
            px: 4,
          }}
        >
          {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save"}
        </Button>
        <Button
          onClick={handleClose}
          color="inherit"
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemModal;
