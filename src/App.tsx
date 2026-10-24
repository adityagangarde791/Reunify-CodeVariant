import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ItemsProvider } from './context/ItemsContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SupabaseStatusBanner } from './components/layout/SupabaseStatusBanner';
import { Toast } from './components/common/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { MatchesPage } from './pages/MatchesPage';
import { MyCasesPage } from './pages/MyCasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ClaimDetailPage } from './pages/ClaimDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ItemsProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-600 selection:text-white">
              <SupabaseStatusBanner />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/items/:id" element={<ItemDetailPage />} />
                  <Route path="/matches" element={<MatchesPage />} />
                  <Route path="/cases/:id" element={<CaseDetailPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  {/* Public Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Authenticated Protected Routes */}
                  <Route
                    path="/report/lost"
                    element={
                      <ProtectedRoute>
                        <ReportLostPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/report/found"
                    element={
                      <ProtectedRoute>
                        <ReportFoundPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-cases"
                    element={
                      <ProtectedRoute>
                        <MyCasesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/claims/:id"
                    element={
                      <ProtectedRoute>
                        <ClaimDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Role-Protected Admin Console */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['campus_security', 'admin']}>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <Toast />
            </div>
          </BrowserRouter>
        </ItemsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
