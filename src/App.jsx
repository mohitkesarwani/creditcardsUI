import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CardsPage from './pages/CardsPage';
import CardDetailPage from './pages/CardDetailPage';
import ComparePage from './pages/ComparePage';
import HowWeMakeMoneyPage from './pages/HowWeMakeMoneyPage';
import LoansDepositsPage from './pages/LoansDepositsPage';
import { SelectedCardsProvider } from './hooks/useSelectedCards';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <SelectedCardsProvider>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/cards/:id" element={<CardDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/how-we-make-money" element={<HowWeMakeMoneyPage />} />
        <Route path="/loans-deposits" element={<LoansDepositsPage />} />
      </Routes>
      <Footer />
    </SelectedCardsProvider>
  );
}

export default App;
