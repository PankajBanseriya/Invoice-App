import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useItems = () => {
  const queryClient = useQueryClient();

  // Fetch All Items
  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await api.get("/Item/GetList");
      return response.data;
    },
  });

  // Add Item
  const addMutation = useMutation({
    mutationFn: async (newItem) => {
      const response = await api.post("/Item", newItem);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: () => toast.error("Failed to add item."),
  });

  // Edit Item
  const editMutation = useMutation({
    mutationFn: (updatedItem) => api.put(`/Item`, updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item updated successfully!");
    },
    onError: (err) => toast.error(err.response.data || "Update failed."),
  });

  // Delete Item
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/Item/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted!");
    },
    onError: (err) =>
      toast.error(err.response.data || "Could not delete item."),
  });

  return {
    items: itemsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    isError: itemsQuery.isError,

    addItem: addMutation.mutate,
    isAdding: addMutation.isPending,
    addItemAsync: addMutation.mutateAsync,

    updateItem: editMutation.mutateAsync,
    isUpdating: editMutation.isPending,

    deleteItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
