import React, { useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useItems } from '../../hooks/useItems';

const ItemSelect = ({ value, onChange, error, helperText, size="small" }) => {
  const { items, isLoading } = useItems();

  return (
    <Autocomplete
      size={size}
      options={items}
      loading={isLoading}
      getOptionLabel={(option) => option.itemName || ""}
      isOptionEqualToValue={(option, val) => option.itemID === val?.itemID}
      value={value} 
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select item..."
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

export default ItemSelect;