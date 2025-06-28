import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CardsPage from './pages/CardsPage';
import CardDetailPage from './pages/CardDetailPage';
import ComparePage from './pages/ComparePage';
import HowWeMakeMoneyPage from './pages/HowWeMakeMoneyPage';
import LoansDepositsPage from './pages/LoansDepositsPage';
import DepositsPage from './pages/DepositsPage';
import MortgagesPage from './pages/MortgagesPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import InfographicPage from './pages/InfographicPage';
import { SelectedCardsProvider } from './hooks/useSelectedCards';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage.jsx';

function AppContent() {
  const { authed } = useAuth();
  if (!authed) {
    return <LoginPage />;
  }
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/credit-cards" element={<CardsPage />} />
        <Route path="/credit-cards/:id" element={<CardDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/how-we-make-money" element={<HowWeMakeMoneyPage />} />
        <Route path="/loans-deposits" element={<LoansDepositsPage />} />
        <Route path="/home-loans" element={<MortgagesPage />} />
        <Route path="/mortgages" element={<MortgagesPage />} />
        <Route path="/deposits" element={<DepositsPage />} />
        <Route path="/faqs" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/infographic" element={<InfographicPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SelectedCardsProvider>
        <AppContent />
      </SelectedCardsProvider>
    </AuthProvider>
  );
}

export default App;
