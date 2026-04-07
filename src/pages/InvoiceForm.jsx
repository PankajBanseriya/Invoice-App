import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Grid,
  Card,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ItemSelect from "../components/item/ItemsSelect";
import { useInvoices } from "../hooks/useInvoices";
import { useItems } from "../hooks/useItems";
import api from "../api/axios";

const defaultRow = () => ({
  id: Date.now(),
  itemObject: null,
  description: "",
  qty: 1,
  rate: 0,
  discountPct: 0,
  amount: 0,
});

const InvoiceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeInvoice = location.state?.activeInvoice || null;
  const isEdit = !!activeInvoice;

  const { addInvoice, updateInvoice, invoices } = useInvoices();

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceID: 0,
    primaryKeyID: 0,
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    customerName: "",
    city: "",
    address: "",
    notes: "",
  });

  const [lineItems, setLineItems] = useState([defaultRow()]);
  const [taxPct, setTaxPct] = useState(0);
  const [taxAmt, setTaxAmt] = useState(0);
  const { items } = useItems();

  useEffect(() => {
    if (!isEdit && invoices.length > 0) {
      const lastNo = Math.max(
        ...invoices.map((inv) => parseInt(inv.invoiceNo) || 0),
      );
      const nextNo = lastNo + 1;

      setInvoiceDetails((prev) => ({
        ...prev,
        invoiceNo: nextNo.toString(),
        invoiceID: nextNo,
      }));
    } else if (!isEdit) {
      setInvoiceDetails((prev) => ({ ...prev, invoiceNo: "1", invoiceID: 1 }));
    }
  }, [isEdit, invoices]);

  useEffect(() => {
    const fetchFullInvoice = async () => {
      if (isEdit && activeInvoice) {
        try {
          const response = await api.get(`/Invoice/${activeInvoice.invoiceID}`);
          const data = response.data;

          setInvoiceDetails({
            primaryKeyID: data.primaryKeyID,
            invoiceID: data.invoiceID,
            invoiceNo: data.invoiceNo.toString(),
            invoiceDate: data.invoiceDate.split("T")[0],
            customerName: data.customerName,
            address: data.address,
            city: data.city || "",
            notes: data.notes || "",
          });

          setTaxPct(data.taxPercentage || 0);

          if (data.lines && data.lines.length > 0) {
            const mappedRows = data.lines.map((line) => {
              const masterItem = items.find((it) => it.itemID === line.itemID);

              return {
                id: Math.random(),
                itemObject: masterItem
                  ? masterItem
                  : {
                      itemID: line.itemID,
                      itemName: line.description,
                    },
                description: line.description || "",
                qty: line.quantity || 0,
                rate: line.rate || 0,
                discountPct: line.discountPct || 0,
                amount:
                  (line.quantity || 0) *
                  (line.rate || 0) *
                  (1 - (line.discountPct || 0) / 100),
              };
            });
            setLineItems(mappedRows);
          }
        } catch (error) {
          console.error("Error fetching full invoice model:", error);
        }
      }
    };

    fetchFullInvoice();
  }, [isEdit, activeInvoice, items]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems((prevRows) => {
      return prevRows.map((row) => {
        if (row.id === id) {
          const safeValue = value === "" ? 0 : value;
          const updatedRow = { ...row, [field]: safeValue };

          if (field === "itemObject") {
            const selectedItem = value;
            updatedRow.description = selectedItem?.description || "";
            updatedRow.rate = selectedItem?.salesRate || 0;
            updatedRow.discountPct = selectedItem?.discountPct || 0;
          }

          const qty = parseFloat(updatedRow.qty) || 0;
          const rate = parseFloat(updatedRow.rate) || 0;
          const disc = parseFloat(updatedRow.discountPct) || 0;

          const amount = qty * rate;
          const discountAmt = amount * (disc / 100);
          updatedRow.amount =
            parseFloat((amount - discountAmt).toFixed(2)) || 0;

          return updatedRow;
        }
        return row;
      });
    });
  };

  const addRow = () => setLineItems([...lineItems, defaultRow()]);
  const deleteRow = (id) => setLineItems(lineItems.filter((r) => r.id !== id));

  const copyRow = (rowToCopy) => {
    const newRow = { ...rowToCopy, id: Date.now() + 1 };
    setLineItems([...lineItems, newRow]);
  };

  const invoiceTotals = useMemo(() => {
    const subTotal = lineItems.reduce((sum, row) => sum + (row.amount || 0), 0);
    const currentTaxPct = parseFloat(taxPct) || 0;

    const calculatedTaxAmt = subTotal * (currentTaxPct / 100);

    if (calculatedTaxAmt !== taxAmt) setTaxAmt(calculatedTaxAmt || 0);
    const finalAmount = subTotal + calculatedTaxAmt;

    return {
      subTotal: (subTotal || 0).toFixed(2),
      taxAmt: (calculatedTaxAmt || 0).toFixed(2),
      invoiceAmount: (finalAmount || 0).toFixed(2),
    };
  }, [lineItems, taxPct]);

  const handleSubmit = async () => {
    if (!invoiceDetails.customerName) {
      alert("Customer Name is required");
      return;
    }

    const validLines = lineItems.filter((line) => line.itemObject);
    if (validLines.length === 0) {
      alert("Please add at least one item to the invoice");
      return;
    }

    const formattedLines = lineItems
      .filter((line) => line.itemObject)
      .map((line, index) => ({
        rowNo: index + 1,
        itemID: line.itemObject.itemID,
        description: line.description,
        quantity: parseFloat(line.qty) || 0,
        rate: parseFloat(line.rate) || 0,
        discountPct: parseFloat(line.discountPct) || 0,
      }));

    const finalPayload = {
      invoiceNo: parseInt(invoiceDetails.invoiceNo),
      invoiceDate: invoiceDetails.invoiceDate,
      customerName: invoiceDetails.customerName,
      address: invoiceDetails.address,
      city: invoiceDetails.city || null,
      taxPercentage: parseFloat(taxPct) || 0,
      notes: invoiceDetails.notes,

      subTotal: parseFloat(invoiceTotals.subTotal),
      taxAmount: parseFloat(invoiceTotals.taxAmt),
      invoiceAmount: parseFloat(invoiceTotals.invoiceAmount),

      lines: formattedLines,
    };

    if (isEdit) {
      finalPayload.invoiceID = activeInvoice.invoiceID;
      finalPayload.updatedOn = activeInvoice.updatedOn;
    }

    try {
      if (isEdit) {
        updateInvoice(finalPayload);
      } else {
        addInvoice(finalPayload);
      }
      navigate("/invoices");
    } catch (error) {
      console.log("Submission failed:", error);
      toast.error("Error in saving invoice.");
    }
  };

  const cancelForm = () => navigate(-1);

  const textProps = {
    size: "small",
    fullWidth: true,
    sx: { bgcolor: "white" },
  };

  return (
    <Box sx={{ width: "96%", mx: "auto", py: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="500">
          {isEdit ? "Edit Invoice" : "New Invoice"}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={cancelForm}
            sx={{ color: "black", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: "black",
              "&:hover": { bgcolor: "#333" },
              textTransform: "none",
              px: 4,
              py: 1,
            }}
          >
            Save
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ p: 4, borderRadius: "8px" }}>
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight="400"
            mb={3}
          >
            Invoice Details
          </Typography>
          <Grid container spacing={4} rowSpacing={3}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Invoice No
              </Typography>
              <TextField
                {...textProps}
                name="invoiceNo"
                value={invoiceDetails.invoiceNo}
                onChange={handleDetailChange}
                placeholder="INV-001"
                InputProps={{ readOnly: true }}
              />
              <Typography variant="caption" color="text.secondary">
                Auto next available number
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Invoice Date *
              </Typography>
              <TextField
                {...textProps}
                type="date"
                name="invoiceDate"
                value={invoiceDetails.invoiceDate}
                onChange={handleDetailChange}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Customer Name *
              </Typography>
              <TextField
                {...textProps}
                name="customerName"
                value={invoiceDetails.customerName}
                onChange={handleDetailChange}
                placeholder="Enter customer name"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                City
              </Typography>
              <TextField
                {...textProps}
                name="city"
                value={invoiceDetails.city}
                onChange={handleDetailChange}
                placeholder="Enter city"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Address
              </Typography>
              <TextField
                {...textProps}
                name="address"
                value={invoiceDetails.address}
                onChange={handleDetailChange}
                placeholder="Enter address"
                multiline
                rows={3}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Notes
              </Typography>
              <TextField
                {...textProps}
                name="notes"
                value={invoiceDetails.notes}
                onChange={handleDetailChange}
                placeholder="Additional notes"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Card>

        <Card variant="outlined" sx={{ p: 0, borderRadius: "8px" }}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "none" }}
          >
            <Table size="small" sx={{ border: "none" }}>
              <TableHead
                sx={{ bgcolor: "#fafafa", borderBottom: "1px solid #eee" }}
              >
                <TableRow>
                  <TableCell
                    width={60}
                    sx={{ border: "none", py: 2, fontWeight: 600 }}
                  >
                    S.No
                  </TableCell>
                  <TableCell
                    width={300}
                    sx={{ border: "none", fontWeight: 600 }}
                  >
                    Item *
                  </TableCell>
                  <TableCell sx={{ border: "none", fontWeight: 600 }}>
                    Description
                  </TableCell>
                  <TableCell
                    width={100}
                    sx={{ border: "none", fontWeight: 600 }}
                  >
                    Qty *
                  </TableCell>
                  <TableCell
                    width={100}
                    sx={{ border: "none", fontWeight: 600 }}
                  >
                    Rate *
                  </TableCell>
                  <TableCell
                    width={100}
                    sx={{ border: "none", fontWeight: 600 }}
                  >
                    Disc %
                  </TableCell>
                  <TableCell
                    width={120}
                    align="right"
                    sx={{ border: "none", fontWeight: 600, px: 3 }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    width={80}
                    align="center"
                    sx={{ border: "none", fontWeight: 600 }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ border: "none" }}>{index + 1}</TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <ItemSelect
                        size="small"
                        value={row.itemObject}
                        onChange={(event, val) =>
                          handleLineItemChange(row.id, "itemObject", val)
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.description}
                        onChange={(e) =>
                          handleLineItemChange(
                            row.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <TextField
                        size="small"
                        type="number"
                        value={row.qty}
                        onChange={(e) =>
                          handleLineItemChange(
                            row.id,
                            "qty",
                            parseInt(e.target.value),
                          )
                        }
                        inputProps={{ step: 1, min: 1 }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <TextField
                        size="small"
                        type="number"
                        value={row.rate}
                        onChange={(e) =>
                          handleLineItemChange(
                            row.id,
                            "rate",
                            parseFloat(e.target.value),
                          )
                        }
                        inputProps={{ step: "0.01", min: 0 }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <TextField
                        size="small"
                        type="number"
                        value={row.discountPct}
                        onChange={(e) =>
                          handleLineItemChange(
                            row.id,
                            "discountPct",
                            parseFloat(e.target.value),
                          )
                        }
                        inputProps={{ step: "0.01", min: 0, max: 100 }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        border: "none",
                        fontWeight: 600,
                        fontSize: "15px",
                        px: 3,
                      }}
                    >
                      ${row.amount.toFixed(2)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "none" }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        <IconButton size="small" onClick={() => copyRow(row)}>
                          <ContentCopyIcon fontSize="small" color="action" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteRow(row.id)}
                          disabled={lineItems.length === 1}
                        >
                          <DeleteOutlineIcon fontSize="small" color="error" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box p={3}>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              sx={{
                color: "black",
                borderColor: "#ccc",
                textTransform: "none",
              }}
              onClick={addRow}
            >
              Add Row
            </Button>
          </Box>
        </Card>

        <Card variant="outlined" sx={{ p: 4, borderRadius: "8px" }}>
          <Grid container spacing={2} alignItems="start">
            <Grid size={{xs: 12, md: 6}}>
              <Typography variant="h6" color="text.primary" fontWeight="400">
                Invoice Totals
              </Typography>
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Sub Total
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ pr: 2 }}>
                    ${invoiceTotals.subTotal}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Tax
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      value={taxPct}
                      onChange={(e) =>
                        setTaxPct(parseFloat(e.target.value) || 0)
                      }
                      sx={{ width: "100px", bgcolor: "white" }}
                      type="number"
                      inputProps={{
                        step: 0.1,
                        min: 0,
                        style: { textAlign: "right" },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      size="small"
                      value={taxAmt.toFixed(2)}
                      sx={{ width: "100px", bgcolor: "#fcfcfc" }}
                      disabled
                      inputProps={{ style: { textAlign: "right" } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Box
                  sx={{
                    bgcolor: "#f5f5f5",
                    p: 2.5,
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight="500"
                  >
                    Invoice Amount
                  </Typography>
                  <Typography variant="h4" fontWeight="600">
                    ${invoiceTotals.invoiceAmount}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </Box>
  );
};

export default InvoiceForm;
