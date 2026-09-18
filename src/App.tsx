import { useState, type FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppProvider, useAppState } from "@/state/AppContext";
import AppLayout from "@/components/Layout";
import Onboarding from "@/components/Onboarding";
import DashboardPage from "@/pages/DashboardPage";
import NutritionPage from "@/pages/NutritionPage";
import WorkoutPage from "@/pages/WorkoutPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

const DashboardRoutes: FC = () => {
  const { state, updateState } = useAppState();
  const [onboardingOpen, setOnboardingOpen] = useState(!state.profile.completed);
  return <>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/nutrition" element={<NutritionPage />} />
      <Route path="/workouts" element={<WorkoutPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <Onboarding profile={state.profile} open={onboardingOpen} onClose={() => setOnboardingOpen(false)} onSave={(profile) => { updateState({ profile }); setOnboardingOpen(false); }} />
  </>;
};

function App() {
  return <AppProvider><BrowserRouter><AppLayout><DashboardRoutes /></AppLayout></BrowserRouter></AppProvider>;
}

export default App;
