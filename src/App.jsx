import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CardsPage from './pages/CardsPage';
import CardDetailPage from './pages/CardDetailPage';
import ComparePage from './pages/ComparePage';
import CompareMortgagesPage from './pages/CompareMortgagesPage.jsx';
import HomeLoanDetailsPage from './pages/HomeLoanDetailsPage.jsx';
import HowWeMakeMoneyPage from './pages/HowWeMakeMoneyPage';
import LoansDepositsPage from './pages/LoansDepositsPage';
import DepositsPage from './pages/DepositsPage';
import DepositDetailPage from './pages/DepositDetailPage';
import MortgagesPage from './pages/MortgagesPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { SelectedCardsProvider } from './hooks/useSelectedCards';
import { SelectedMortgagesProvider } from './hooks/useSelectedMortgages.jsx';
import { SelectedDepositsProvider } from './hooks/useSelectedDeposits.jsx';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ToastProvider } from './hooks/useToast.tsx';
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
        <Route path="/compare-mortgages" element={<CompareMortgagesPage />} />
        <Route path="/how-we-make-money" element={<HowWeMakeMoneyPage />} />
        <Route path="/loans-deposits" element={<LoansDepositsPage />} />
        <Route path="/home-loans" element={<MortgagesPage />} />
        <Route path="/home-loans/:loanId" element={<HomeLoanDetailsPage />} />
        <Route path="/mortgages" element={<MortgagesPage />} />
        <Route path="/deposits" element={<DepositsPage />} />
        <Route path="/deposits/:id" element={<DepositDetailPage />} />
        <Route path="/faqs" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
      <ToastProvider>
        <SelectedCardsProvider>
          <SelectedMortgagesProvider>
            <SelectedDepositsProvider>
              <AppContent />
            </SelectedDepositsProvider>
          </SelectedMortgagesProvider>
        </SelectedCardsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
