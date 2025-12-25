import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import RantThreadPage from "./pages/RantThreadPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CustomizePage from "./pages/CustomizePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/rant/:id" element={<RantThreadPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/customize" element={<CustomizePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
