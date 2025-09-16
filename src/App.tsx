
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from '@/contexts/LanguageContext';

import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { AgeVerificationProvider } from '@/contexts/AgeVerificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import AddTool from "./pages/AddTool";
import Search from "./pages/Search";
import ToolDetails from "./pages/ToolDetails";
import Rent from "./pages/Rent";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import GuideLoueur from "./pages/GuideLoueur";
import GuideLocataire from "./pages/GuideLocataire";
import FAQ from "./pages/FAQ";
import CGU from "./pages/CGU";
import ContratLocation from "./pages/ContratLocation";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import UnderAge from "./pages/UnderAge";
import AgeVerificationDialog from "./components/AgeVerificationDialog";
import FloatingActionButton from "./components/FloatingActionButton";
import ScrollToTop from "./components/ScrollToTop";
import PolitiqueAnnulation from "./pages/PolitiqueAnnulation";
import PolitiqueRemboursement from "./pages/PolitiqueRemboursement";
import NotificationsPage from "./pages/NotificationsPage";
import CategorySelectorExample from "./pages/CategorySelectorExample";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
    
              <AgeVerificationProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <ScrollToTop />
              <AgeVerificationDialog />
              <FloatingActionButton />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Register />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/verify-email" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <EmailVerification />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/add-tool" element={<AddTool />} />
                <Route path="/search" element={<Search />} />
                <Route path="/tool/:id" element={<ToolDetails />} />
                <Route path="/rent/:id" element={<Rent />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
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
                <Route path="/guide-loueur" element={<GuideLoueur />} /> 
                <Route path="/guide-locataire" element={<GuideLocataire />} /> 
                <Route path="/faq" element={<FAQ />} />
                <Route path="/cgu" element={<CGU />} />
                <Route path="/contrat-location" element={<ContratLocation />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                <Route path="/politique-annulation" element={<PolitiqueAnnulation />} />
                <Route path="/politique-remboursement" element={<PolitiqueRemboursement />} />
                <Route path="/under-age" element={<UnderAge />} />
                <Route path="/category-selector-example" element={<CategorySelectorExample />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
              </AgeVerificationProvider>
    
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
