import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RewardsPage from "./pages/RewardsPage";
import SmartRTIPage from "./pages/SmartRTIPage";
import EvidenceVaultPage from "./pages/EvidenceVaultPage";
import CommunityWatchPage from "./pages/CommunityWatchPage";
import LegalLibraryPage from "./pages/LegalLibraryPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useAuthStore, User } from "./lib/store";

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const handleUserData = async (session: any) => {
      if (!session) {
        setUser(null);
        return;
      }

      // Try to get from profiles
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (profile) {
        setUser(profile as User);
      } else {
        // Fallback to metadata
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          name: metadata?.full_name || metadata?.name || 'User',
          email: session.user.email!,
          role: metadata?.role || 'citizen',
          department: metadata?.department,
          language: metadata?.language || 'English',
          civic_points: metadata?.civic_points || 0
        });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserData(session).finally(() => setIsLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserData(session);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setIsLoading]);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/rti" element={<SmartRTIPage />} />
            <Route path="/vault" element={<EvidenceVaultPage />} />
            <Route path="/watch" element={<CommunityWatchPage />} />
            <Route path="/library" element={<LegalLibraryPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
