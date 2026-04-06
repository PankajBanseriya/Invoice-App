import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useInvoices = (fromDate, toDate) => {
  const queryClient = useQueryClient();

  // Fetch Invoices with dynamic date
  const invoicesQuery = useQuery({
    queryKey: ["invoices", fromDate, toDate],
    queryFn: async () => {
      const params = { fromDate };
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/GetList", { params });
      return response.data;
    },
  });

  // Fetch Invoice Metrics data 
  const invoiceMetrics = useQuery({
    queryKey: ["invoiceMetrics", fromDate, toDate],
    queryFn: async () => {
      const params = { fromDate };
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/GetMetrices", { params });

      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      return data || { invoiceCount: 0, totalAmount: 0 };
    },
  });

  // Fetch top 5 items
  const topItemsQuery = useQuery({
    queryKey: ["topItems", fromDate, toDate],
    queryFn: async () => {
      const params = { fromDate, topN: 5 };
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/TopItems", { params });
      return response.data;
    },
  });

  // Add Invoice
  const addMutation = useMutation({
    mutationFn: (newInvoice) => api.post("/Invoice", newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice Created Successfully.")
    },
    onError: (err) => {
      toast.error(err.response?.data || "Failed to create invoice.");
    },
  });

  // Update Invoice
  const updateMutation = useMutation({
    mutationFn: (updatedInvoice) => api.put("/Invoice", updatedInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice updated successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data || "Failed to update invoice.");
    },
  });

  // Delete Invoice
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/Invoice/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data || "Failed to delete invoice.");
    },
  });

  return {
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,

    invoiceMetrics: invoiceMetrics.data,
    isLoadingMetrics: invoiceMetrics.isLoading,

    topItems: topItemsQuery.data || [],
    isLoadingTopItems: topItemsQuery.isLoading,

    addInvoice: addMutation.mutate,
    isAdding: addMutation.isPending,
    

    updateInvoice: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    deleteInvoice: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

// Line Chart
export const useInvoiceChart = () => {
  const invoiceChart = useQuery({
    queryKey: ["invoiceChart"],
    queryFn: async () => {
      
      const response = await api.get("/Invoice/GetTrend12m");
      return response.data;

    },
    
  });

  return {
    data: invoiceChart.data || [],
  }
};
