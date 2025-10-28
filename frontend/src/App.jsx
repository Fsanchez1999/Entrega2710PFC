import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// 🧭 Páginas principais
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import TipsPage from "./pages/TipsPage";
import FAQPage from "./pages/FAQPage";
import AdminDashboard from "./pages/AdminDashboard";

// 🧩 Componentes e páginas administrativas
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./components/AdminRoute";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminFaqs from "./pages/admin/AdminFaqs";
import AdminSocials from "./pages/admin/AdminSocials";
import AdminTips from "./pages/admin/AdminTips";
import AdminUsers from "./pages/admin/AdminUsers";
import ProductDetails from "@/pages/ProductDetails";

// ⚙️ Componentes globais
import Footer from "./components/Footer";

function App() {
  const [user, setUser] = useState(null);

  // Carregar usuário salvo no localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* 🔝 Navbar */}
        <nav className="bg-green-900 text-white px-6 py-3 flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/" className="hover:underline">
              Início
            </Link>
            <Link to="/produtos" className="hover:underline">
              Produtos
            </Link>
            <Link to="/dicas" className="hover:underline">
              Dicas
            </Link>
            <Link to="/faq" className="hover:underline">
              FAQ
            </Link>
            {user?.is_admin && (
              <Link
                to="/AdminPanel/dashboard"
                className="font-semibold hover:underline text-yellow-300"
              >
                Painel Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">{user.name || user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-green-900 px-3 py-1 rounded hover:bg-gray-200"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
                <Link to="/cadastro" className="hover:underline">
                  Cadastro
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* 🧭 Conteúdo principal */}
        <main className="flex-grow">
          <Routes>
            {/* 🌍 Rotas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/produtos" element={<ProductsPage user={user} />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/perfil" element={<ProfilePage user={user} />} />
            <Route path="/favoritos" element={<FavoritesPage user={user} />} />
            <Route path="/dicas" element={<TipsPage user={user} />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />

            {/* 🔐 Login do Administrador */}
            <Route path="/AdminPanel" element={<AdminLogin />} />

            {/* 🧰 Rotas protegidas do Painel Admin */}
            <Route
              path="/AdminPanel/dashboard"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route
              path="/AdminPanel/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/AdminPanel/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/AdminPanel/tips"
              element={
                <AdminRoute>
                  <AdminTips />
                </AdminRoute>
              }
            />
            <Route
              path="/AdminPanel/faqs"
              element={
                <AdminRoute>
                  <AdminFaqs />
                </AdminRoute>
              }
            />
            <Route
              path="/AdminPanel/socials"
              element={
                <AdminRoute>
                  <AdminSocials />
                </AdminRoute>
              }
            />
            <Route 
              path="/produtos/:id" 
              element={
                <ProductDetails user={user} />
              } 
            />
          </Routes>
        </main>

        {/* ⚙️ Rodapé */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
