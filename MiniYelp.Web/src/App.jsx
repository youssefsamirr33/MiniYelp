import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CartPage } from "./pages/CartPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import { MyReservationsPage } from "./pages/MyReservationsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RestaurantDetailsPage } from "./pages/RestaurantDetailsPage";
import { RestaurantMenuPage } from "./pages/RestaurantMenuPage";
import { RestaurantReservePage } from "./pages/RestaurantReservePage";
import { RestaurantsPage } from "./pages/RestaurantsPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
          <Route path="/restaurants/:id/menu" element={<RestaurantMenuPage />} />
          <Route path="/restaurants/:id/reserve" element={<RestaurantReservePage />} />
          <Route path="/my-reservations" element={<MyReservationsPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
