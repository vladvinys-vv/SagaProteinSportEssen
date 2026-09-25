import { type FC, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "@/components/Layout";
import Onboarding from "@/components/Onboarding";
import AnalyticsPage from "@/pages/AnalyticsPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import NutritionPage from "@/pages/NutritionPage";
import PricesPage from "@/pages/PricesPage";
import ProfilePage from "@/pages/ProfilePage";
import WorkoutPage from "@/pages/WorkoutPage";
import { AppProvider, useAppState } from "@/state/AppContext";

const DashboardRoutes: FC = () => {
  const { state, updateState } = useAppState();
  // Онбординг показываем, пока профиль не заполнен; «Позже» скрывает его
  // до следующего запуска, а сброс данных открывает снова.
  const [dismissed, setDismissed] = useState(false);
  const onboardingOpen = !state.profile.completed && !dismissed;

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/workouts" element={<WorkoutPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/prices" element={<PricesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Onboarding
        profile={state.profile}
        open={onboardingOpen}
        onClose={() => setDismissed(true)}
        onSave={(profile) => {
          updateState({ profile });
          setDismissed(false);
        }}
      />
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <DashboardRoutes />
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
