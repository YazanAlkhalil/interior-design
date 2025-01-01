import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MainLayout from './components/layout/MainLayout';
import { Home } from './pages/Home';
import Sections from './pages/Sections';
import SectionProducts from './pages/SectionProducts';
import ProductDetails from './pages/ProductDetails';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Services from './pages/Services';
import DesignServiceForm from './pages/services/DesignServiceForm';
import AreaServiceForm from './pages/services/AreaServiceForm';
import ConsultationServiceForm from './pages/services/ConsultationServiceForm';
import SupervisionServiceForm from './pages/services/SupervisionServiceForm';
import ImplementServiceForm from './pages/services/ImplementServiceForm';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import AdminSections from './pages/admin/Sections';
import Plans from './pages/admin/Plans';
import OrdersManagement from './pages/admin/Orders';
import Products from './pages/admin/Products';
import ClientsPage from './pages/admin/Clients';
import { Toaster } from 'react-hot-toast';
import OTPPage from './pages/OTP';
import EmailForPasswordReset from './pages/EmailForPasswordReset';
import ResetPasswordOTP from './pages/ResetPasswordOTP';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Departments from './pages/admin/Departments';
import Employees from './pages/admin/Employees';

function App() {
  const isAdmin = localStorage.getItem('role') === "ADMIN";

  return (
    <>
    <div><Toaster/></div>
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/email" element={<EmailForPasswordReset />} />
          <Route path="/verify-otp" element={<ResetPasswordOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<MainLayout />} >
            <Route index element={<Home />} />
            <Route path="sections" element={<Sections />} />
            <Route path="sections/:sectionId" element={<SectionProducts />} />
            <Route path="products/:productId" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="services" element={<Services />} />
            <Route path="services/interior-design" element={<DesignServiceForm />} />
            <Route path="services/area" element={<AreaServiceForm />} />
            <Route path='services/consultation' element={<ConsultationServiceForm/>}/>
            <Route path="services/supervision" element={<SupervisionServiceForm />} />
            <Route path="services/implementation" element={<ImplementServiceForm />} />
          </Route>

          {/* admin pages */}
          <Route element={<ProtectedRoute isAdmin={isAdmin} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="products" element={<Products />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="overview" element={<Dashboard />} />
              <Route path="sections" element={<AdminSections />} />
              <Route path="plans" element={<Plans />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="departments" element={<Departments />} />
              <Route path="employees" element={<Employees/>} />
              
            </Route>
          </Route>
        </Routes>
      </Router>
    </CartProvider>
    </>
  ); 
    
}

export default App;
