import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import InvoiceDashboard from "./pages/InvoiceDashboard";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import ItemsPage from "./pages/ItemsPage";
import InvoiceForm from "./pages/InvoiceForm";
import OpenRoute from "./components/auth/OpenRoute";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route element={<OpenRoute />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/invoices" element={<InvoiceDashboard />} />
          <Route path="/invoices/form" element={<InvoiceForm />} />
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
