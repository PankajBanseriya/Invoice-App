import { useMutation } from "@tanstack/react-query";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post("/Auth/Signup", payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/invoices");
      toast.success("Signup Successful!");
    },
    onError: (error) => {
      console.log(error.response);
      toast.error(error.response?.data || "Signup failed");
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/Auth/Login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/invoices");
      toast.success("Login Successful!");
    },
    onError: (error) => {
      console.error(error.message)
      toast.error("Invalid email or password.");
    },
  });

  return {
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
  };
};

