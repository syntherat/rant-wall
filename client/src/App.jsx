// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import RantThreadPage from "./pages/RantThreadPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import StorePage from "./pages/StorePage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/rant/:id" element={<RantThreadPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/me" element={<ProfilePage />} />

        {/* ✅ new */}
        <Route path="/store" element={<StorePage />} />
        <Route path="/inventory" element={<InventoryPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
