import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import api from "../../api/axios";

export const imageCache = {};

const ItemImage = ({ itemID }) => {
  const [imgSrc, setImgSrc] = useState(imageCache[itemID] || null);

  useEffect(() => {
    if (imageCache[itemID]) {
        setImgSrc(imageCache[itemID]);
      
      return;
    }

    const fetchImage = async () => {
      try {
        const response = await api.get(`/Item/Picture/${itemID}?t=${Date.now()}`);
        
        if (response.data && typeof response.data === 'string') {
          const cleanUrl = response.data.replace(/^"|"$/g, '');
          
          imageCache[itemID] = cleanUrl;
          setImgSrc(cleanUrl);
        }
      } catch (error) {
        console.error("Error loading image URL", error);
      }
    };

    if (itemID) fetchImage();
  }, [itemID, imgSrc, imageCache[itemID]]);

  return (
    <Avatar
      src={imgSrc}
      variant="rounded"
      sx={{ 
        width: 45, 
        height: 45, 
        borderRadius: "5px",
        bgcolor: "#f5f5f5",
      }}
    >
      <ImageIcon sx={{ fontSize: "20px", color: "#bdbdbd" }} />
    </Avatar>
  );
};

export default React.memo(ItemImage);