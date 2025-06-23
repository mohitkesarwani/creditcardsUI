import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CardsPage from './pages/CardsPage';
import CardDetailPage from './pages/CardDetailPage';
import ComparePage from './pages/ComparePage';
import { SelectedCardsProvider } from './hooks/useSelectedCards';
import Header from './components/Header';

function App() {
  return (
    <SelectedCardsProvider>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/cards/:id" element={<CardDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </SelectedCardsProvider>
  );
}

export default App;
