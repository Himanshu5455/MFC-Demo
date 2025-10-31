import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Route-level code splitting
const Navbar = lazy(() => import("./components/layout/Navbar"));
const TriageManagement = lazy(() => import("./pages/TriageManagement"));
const PatientDetailsPage = lazy(() => import("./pages/PatientDetailsPage"));
const ChatbotQuestionnaire = lazy(() => import("./pages/ChatbotQuestionnaire"));
const EmberIntake = lazy(() => import("./pages/EmberIntake"));
const ChatbotFlow = lazy(() => import("./pages/ChatbotFlow"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#125A67",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
  },
});

// Hoisted style to avoid re-creation on each render
const appContainerStyle = { backgroundColor: "#f8f9fa", minHeight: "100vh" };

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={appContainerStyle}>
          <Router>
            
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<EmberIntake />} />
                <Route path="/ember-intake" element={<EmberIntake />} />
                <Route path="/chatbot-flow" element={<ChatbotFlow />} />
                <Route path="/admin/login" element={<LoginPage />} />
                <Route element={<MainLayout />}>
                  <Route
                    path="/admin/dashboard"
                    element={<TriageManagement />}
                  />
                  <Route
                    path="/admin/patient-detail/:id"
                    element={<PatientDetailsPage />}
                  />
                  <Route
                    path="/patient-details/:id"
                    element={<PatientDetailsPage />}
                  />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </div>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
