import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./ErrobBoundary";

// Lazy loading des pages
const LoadingSpinner = lazy(() => import( "./components/Layout/LoadingSpinner"));
const ClientDashboard = lazy(() => import("./pages/Dashboard/ClientDashboard"));
const TechnicianDashboard = lazy(() => import("./pages/Dashboard/TechnicianDashboard"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const AuthPage = lazy(() => import("./components/Auth/AuthPage"));
const NotFound = lazy(() => import("./components/NotFound"));
const InterventionList = lazy(() => import("./pages/Interventions/InterventionList"));
const InterventionDetail = lazy(() => import("./pages/Interventions/InterventionDetail"));
const InterventionForm = lazy(() => import("./pages/Interventions/InterventionForm"));
const TicketList = lazy(() => import("./pages/Tickets/TicketList"));
const TicketDetail = lazy(() => import("./pages/Tickets/TicketDetail"));
const TicketReply = lazy(() => import("./pages/Tickets/TicketReply"));
const TicketForm = lazy(() => import("./pages/Tickets/TicketForm"));
const ProfilePage = lazy(() => import("./pages/profile/Profile"));
const UserListPage = lazy(() => import("./pages/Users/UserListPage"));
const UserForm = lazy(() => import("./pages/Users/UserForm"));
const UserDetailPage = lazy(() => import("./pages/Users/UserDetailPage"));
const ProceduresList = lazy(() => import("./pages/Procedures/ProceduresListPage"));
const ProcedureDetailsPage = lazy(() => import("./pages/Procedures/ProcedureDetailsPage"));
const ParentProcedureComponent = lazy(() => import("./pages/Procedures/ProcedureCreateEditPage"));
const RootRedirect = lazy(() => import("./components/Auth/RootRedirect"));
const ForgotPasswordForm = lazy(() => import("./components/Auth/ForgotPasswordForm"));
const ResetPasswordForm = lazy(() => import("./components/Auth/ResetPasswordForm"));

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<div><LoadingSpinner/></div>}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<AuthPage />} />
              <Route
                path="/forgot/password"
                element={<ForgotPasswordForm onBackToLogin={() => window.location.replace("/login")} />}
              />
              <Route
                path="/reset-password/:uid/:token"
                element={<ResetPasswordForm onBackToLogin={() => window.location.replace("/login")} />}
              />

              {/* ================= ADMIN ================= */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserListPage />} />
                <Route path="/admin/users/add" element={<UserForm />} />
                <Route path="/admin/users/:id/edit" element={<UserForm isEdit />} />
                <Route path="/admin/users/:id/" element={<UserDetailPage />} />
              </Route>

              {/* ================= TECHNICIAN ================= */}
              <Route element={<ProtectedRoute requiredRole="technician" />}>
                <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
              </Route>

              {/* ================= CLIENT ================= */}
              <Route element={<ProtectedRoute requiredRole="client" />}>
                <Route path="/client/dashboard" element={<ClientDashboard />} />
              </Route>

              {/* ================= SHARED ROUTES ================= */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "technician"]} />}>
                <Route path="/interventions" element={<InterventionList title="" />} />
                <Route path="/interventions/:id" element={<InterventionDetail />} />
                <Route path="/interventions/add" element={<InterventionForm />} />
                <Route path="/interventions/:id/edit" element={<InterventionForm isEdit />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["admin", "client", "technician"]} />}>
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/tickets/:id/chat" element={<TicketReply />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/procedures" element={<ProceduresList />} />
                <Route path="/procedures/:id" element={<ProcedureDetailsPage />} />
                <Route path="/procedures/:id/edit" element={<ParentProcedureComponent />} />
                <Route path="/procedures/add" element={<ParentProcedureComponent />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["admin", "client"]} />}>
                <Route path="/tickets/add" element={<TicketForm />} />
                <Route path="/tickets/:id/edit" element={<TicketForm isEdit />} />
              </Route>

              {/* Not Found */}
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>

      {/* Global toast system */}
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
};

export default App;
