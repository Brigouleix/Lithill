import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { CookieProvider } from './context/CookieContext';
import { ThemeProvider }  from './context/ThemeContext';
import Header        from './components/common/Header';
import Footer        from './components/common/Footer';
import CookieBanner  from './components/common/CookieBanner';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

import Home          from './pages/Home/Home';
import Explore       from './pages/Explore/Explore';
import Portfolio     from './pages/Portfolio/Portfolio';
import Projet        from './pages/Projet/Projet';
import Login         from './pages/Auth/Login';
import Register      from './pages/Auth/Register';
import Dashboard     from './pages/Dashboard/Dashboard';
import EditProjet        from './pages/Dashboard/EditProjet';
import CreatePortfolio   from './pages/Dashboard/CreatePortfolio';
import Stats            from './pages/Dashboard/Stats';
import AdminUsers    from './pages/Admin/AdminUsers';
import AdminModeration from './pages/Admin/AdminModeration';
import Privacy       from './pages/Privacy/Privacy';
import Amis         from './pages/Amis/Amis';
import Galerie       from './pages/Galerie/Galerie';
import Error404      from './pages/Error/Error404';
import Error500      from './pages/Error/Error500';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <CookieProvider>
          <ErrorBoundary fallback={<Error500 />}>
            <Header />
            <main>
              <Routes>
                <Route path="/"                   element={<Home />} />
                <Route path="/explorer"           element={<Explore />} />
                <Route path="/portfolio/:slug"    element={<Portfolio />} />
                <Route path="/projet/:slug"       element={<Projet />} />
                <Route path="/login"              element={<Login />} />
                <Route path="/inscription"        element={<Register />} />
                <Route path="/confidentialite"    element={<Privacy />} />
                <Route path="/erreur"             element={<Error500 />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard"        element={<Dashboard />} />
                  <Route path="/dashboard/nouveau"            element={<EditProjet />} />
                  <Route path="/dashboard/projet/:slug"       element={<EditProjet />} />
                  <Route path="/dashboard/portfolio/creer"    element={<CreatePortfolio />} />
                  <Route path="/dashboard/stats"             element={<Stats />} />
                  <Route path="/amis"             element={<Amis />} />
                  <Route path="/galerie"          element={<Galerie />} />
                </Route>

                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="/admin/utilisateurs"   element={<AdminUsers />} />
                  <Route path="/admin/moderation"     element={<AdminModeration />} />
                </Route>

                <Route path="*" element={<Error404 />} />
              </Routes>
            </main>
            <Footer />
            <CookieBanner />
          </ErrorBoundary>
        </CookieProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
