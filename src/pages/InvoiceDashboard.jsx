import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  OutlinedInput,
  InputAdornment,
  Divider,
  Grid,
  Paper,
  IconButton,
} from "@mui/material";
import { useGridApiRef } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import { format, subDays } from "date-fns";
import { Search, Add, Edit, Delete, Print } from "@mui/icons-material";
import { useInvoices, useInvoiceChart } from "../hooks/useInvoices";
import { useNavigate } from "react-router-dom";
import { FaColumns, FaDownload } from "react-icons/fa";
import { PieChart } from "@mui/x-charts/PieChart";
import { DataGridPro as DataGrid } from "@mui/x-data-grid-pro";
import { printInvoice } from "../utils/printInvoice";
import toast from "react-hot-toast";

const Invoices = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Month");
  const [customDates, setCustomDates] = useState({ from: null, to: null });
  const apiRef = useGridApiRef();

  const dateParams = useMemo(() => {
    const today = new Date();
    let from;
    let to = null;

    switch (activeFilter) {
      case "Today":
        from = format(today, "yyyy-MM-dd");
        break;
      case "Week":
        from = format(subDays(today, 7), "yyyy-MM-dd");
        break;
      case "Month":
        from = format(subDays(today, 30), "yyyy-MM-dd");
        break;
      case "Year":
        from = format(subDays(today, 365), "yyyy-MM-dd");
        break;
      case "Custom":
        from = customDates.from;
        to = customDates.to;
        break;
      default:
        from = format(subDays(today, 30), "yyyy-MM-dd");
    }
    return { from, to };
  }, [activeFilter, customDates]);

  const {
    invoices,
    isLoading,
    invoiceMetrics,
    isLoadingMetrics,
    deleteInvoice,
    topItems,
    isLoadingTopItems,
  } = useInvoices(dateParams.from, dateParams.to);
  const { data } = useInvoiceChart();

  const chartData = data.map((item) => {
    const date = new Date(item.monthStart);

    return {
      month: date.toLocaleString("default", { month: "short" }),
      amount: item.amountSum,
      invoices: item.invoiceCount,
    };
  });

  const pieData = useMemo(() => {
    return topItems.map((item, index) => ({
      id: index,
      value: item.amountSum,
      label: item.itemName,
    }));
  }, [topItems]);

  const columns = [
    {
      field: "invoiceNo",
      headerName: "Invoice No",
      flex: 0.75,
      minWidth: 100,
      renderCell: (params) => (
        <Typography
          fontWeight="600"
          color="primary"
          sx={{
            fontSize: 14,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() =>
            navigate("/invoices/form", {
              state: { activeInvoice: params.row },
            })
          }
        >
          {params?.row?.invoiceNo}
        </Typography>
      ),
    },
    {
      field: "invoiceDate",
      headerName: "Date",
      flex: 0.75,
      minWidth: 120,
      valueFormatter: (value) =>
        value ? format(new Date(value), "dd-MMM-yyyy") : "",
    },
    { field: "customerName", headerName: "Customer", flex: 1, minWidth: 180 },
    { field: "totalItems", headerName: "Items", type: "number", minWidth: 100 },
    {
      field: "subTotal",
      headerName: "Sub Total",
      width: 150,
      minWidth: 150,
      type: "number",
      valueFormatter: (value) => `$${value.toLocaleString()}`,
    },
    {
      field: "taxPercentage",
      headerName: "Tax %",
      minWidth: 150,
      type: "number",
      valueFormatter: (value) => `${value}%`,
    },
    {
      field: "taxAmount",
      headerName: "Tax Amt",
      minWidth: 150,
      type: "number",
      valueFormatter: (value) => `$${value}`,
    },
    {
      field: "invoiceAmount",
      headerName: "Total",
      minWidth: 150,
      type: "number",
      renderCell: (params) => (
        <Typography
          fontWeight="600"
          height={"100%"}
          sx={{ display: "flex", alignItems: "center", justifyContent: "end" }}
        >
          ${params?.value?.toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      exportable: false,
      hideable: false,
      headerAlign: "right",
      align: "right",
      disableReorder: true,
      flex: 1,
      width: 130,
      headerClassName: "actions",
      renderCell: (params) => (
        <Stack
          direction="row"
          alignItems="center"
          height="100%"
          justifyContent="end"
        >
          <IconButton
            size="small"
            onClick={() =>
              navigate("/invoices/form", {
                state: { activeInvoice: params.row },
              })
            }
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={async () => {
              try {
                await printInvoice(params.row.invoiceID);
              } catch (e) {
                toast.error("Failed to generate print view");
              }
            }}
          >
            <Print fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => deleteInvoice(params.row.invoiceID)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredRows = invoices.filter((row) => {
    const searchTerm = search.toLowerCase();
    return (
      row.invoiceNo?.toLowerCase().includes(searchTerm) ||
      row.customerName?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <Box sx={{ width: "95%", mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        gap={2}
        flexWrap="wrap"
      >
        <Typography variant="h5" component="h2" fontWeight="500">
          Invoices
        </Typography>
        <Stack
          direction="row"
          flexWrap={"wrap"}
          justifyContent={"center"}
          gap={1}
        >
          {["Today", "Week", "Month", "Year", "Custom"].map((label) => {
            const isActive = activeFilter === label;

            return (
              <Button
                key={label}
                variant="contained"
                onClick={() => setActiveFilter(label)}
                sx={{
                  bgcolor: isActive ? "#1a1a1a" : "#f1f3f5",
                  color: isActive ? "#ffffff" : "#495057",
                  borderRadius: "50px",
                  textTransform: "none",
                  fontSize: "14px",
                  px: 2,
                  py: 0.5,
                  fontWeight: isActive ? "500" : "400",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: isActive ? "#000000" : "#e9ecef",
                    boxShadow: "none",
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Stack>
      </Stack>

      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} flexWrap={"wrap"}>
          <Card variant="outlined" sx={{ p: 2, height: "185px" }}>
            <Typography variant="h4" fontWeight="500">
              {isLoadingMetrics ? "..." : invoiceMetrics?.invoiceCount}
            </Typography>
            <Typography color="text.secondary">Number of Invoices</Typography>
            <Typography variant="caption" color="text.secondary">
              {activeFilter}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ p: 2, height: "185px" }}>
            <Typography variant="h4" fontWeight="500">
              {isLoadingMetrics
                ? "..."
                : `$${invoiceMetrics?.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </Typography>
            <Typography color="text.secondary">Total Invoice Amount</Typography>
            <Typography variant="caption" color="text.secondary">
              {activeFilter}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{
              py: 2,
              px: 3,
              height: "185px",
              bgcolor: "#f9f9f9",
            }}
          >
            <Typography color="textSecondary" fontSize={13} mb={2}>
              Last 12 Months
            </Typography>
            <Card
              variant="outlined"
              sx={{
                height: "75%",
                bgcolor: "#eee",
                border: "none",
              }}
            >
              <LineChart
                height={100}
                series={[
                  {
                    data: chartData.map((item) => item.amount),
                    label: "Revenue",
                    valueFormatter: (value) => `₹ ${value.toFixed(2)}`,
                  },
                ]}
                xAxis={[
                  {
                    scaleType: "point",
                    data: chartData.map((item) => item.month),
                  },
                ]}
              />
            </Card>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{
              py: 2,
              px: 3,
              height: "185px",
              bgcolor: "#f9f9f9",
            }}
          >
            <Typography color="textSecondary" fontSize={13} mb={2}>
              Top 5 Items
            </Typography>
            <Box
              sx={{
                height: "85%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoadingTopItems ? (
                <Typography variant="caption">Loading...</Typography>
              ) : pieData.length > 1 ? (
                <PieChart
                  width={120}
                  height={120}
                  margin={{ top: 0, bottom: 30, left: 0, right: 35 }}
                  series={[
                    {
                      data: pieData,
                      innerRadius: 20,
                      outerRadius: 40,
                      paddingAngle: 2,
                      cornerRadius: 3,
                    },
                  ]}
                  slotProps={{
                    legend: { hidden: true },
                  }}
                />
              ) : (
                <Typography variant="caption" color="textDisabled">
                  No data available
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Stack
        direction="row"
        justifyContent="space-between"
        flexWrap={"wrap"}
        mb={2}
        gap={2}
      >
        <OutlinedInput
          size="small"
          placeholder="Search Invoice No, Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 350, bgcolor: "white" }}
          startAdornment={
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          }
        />
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            sx={{
              mr: 1,
              textTransform: "capitalize",
              borderColor: "text.primary",
              color: "text.primary",
              py: 0.9,
              mb: 1,
            }}
            size="medium"
            onClick={() => navigate("/items")}
          >
            All Items
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              bgcolor: "black",
              textTransform: "none",
              "&:hover": { bgcolor: "#333" },
              mr: 1,
              textTransform: "capitalize",
              py: 0.9,
              mb: 1,
            }}
            onClick={() =>
              navigate("/invoices/form", { state: { activeInvoice: null } })
            }
          >
            New Invoice
          </Button>

          <Button
            variant="outlined"
            sx={{
              mr: 1,
              textTransform: "capitalize",
              borderColor: "text.primary",
              color: "text.primary",
              py: 0.9,
              mb: 1,
            }}
            size="medium"
            onClick={() =>
              apiRef.current.exportDataAsCsv({
                fileName: "invoices-data",
                fields: [
                  "invoiceNo",
                  "invoiceDate",
                  "customerName",
                  "totalItems",
                  "subTotal",
                  "taxPercentage",
                  "taxAmount",
                  "invoiceAmount",
                ],
              })
            }
          >
            <FaDownload style={{ marginRight: "10px" }} fontSize={16} />
            Export
          </Button>
          <Button
            variant="outlined"
            sx={{
              mr: 1,
              textTransform: "capitalize",
              borderColor: "text.primary",
              color: "text.primary",
              py: 1.2,
              mb: 1,
              minWidth: "50Px",
            }}
            size="medium"
            onClick={() => apiRef.current.showPreferences("columns")}
          >
            <FaColumns fontSize={20} />
          </Button>
        </Box>
      </Stack>

      <Paper sx={{ height: 260 }}>
        <DataGrid
          apiRef={apiRef}
          rows={filteredRows}
          getRowId={(row) => row.primaryKeyID}
          columns={columns}
          getRowHeight={() => "auto"}
          hideFooter
          sx={{
            border: 0,
            px: 2,
            "& .MuiDataGrid-cell": {
              p: 1.2,
            },
            "& .actions": {
              paddingRight: "25px !important",
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default Invoices;
