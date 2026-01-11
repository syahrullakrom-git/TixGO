import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import RequireAuth from "./RequireAuth";
import AdminLayout from "./layout/AdminLayout";
import CustomerLayout from "./layout/CustomerLayout";

// Import Halaman
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventPage from "./pages/AcaraPage";
import DetailAcara from "./pages/DetailPage";
import HistoryPage from "./pages/HistoryPage";
import EditProfilePage from "./pages/ProfilePage";
import ChangePassword from "./pages/ChangePasswordPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import DetailStatistik from "./pages/DetailStatistik";
import KelolaPenggunaPage from "./pages/KelolaPengguna";
import StatistikPenjualanPage from "./pages/StatistikPenjualanPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DashboardPage from "./pages/DashboardPage";
import Checkin from "./pages/Checkin";
import AboutUsPage from "./pages/AboutUsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/event-detail/:id" element={<DetailAcara />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />

        {/* Rute untuk Customer */}
        <Route
          path=""
          element={
            <RequireAuth role="customer">
              <CustomerLayout />
            </RequireAuth>
          }
        >
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<EditProfilePage />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          <Route
            path="/payment-success/:transactionId"
            element={<PaymentSuccess />}
          />
          <Route
            path="/payment-fail/:transactionId"
            element={<PaymentFail />}
          />
        </Route>

        {/* Rute untuk Admin */}
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="create-event" element={<CreateEventPage />} />
          <Route path="edit-event/:eventId" element={<EditEventPage />} />
          <Route
            path="statistik-penjualan"
            element={<StatistikPenjualanPage />}
          />
          <Route
            path="statistik-penjualan/:eventId"
            element={<DetailStatistik />}
          />
          <Route path="kelola-pengguna" element={<KelolaPenggunaPage />} />
          <Route path="checkin-qrcode" element={<Checkin />} />
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
