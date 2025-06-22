import { Routes, Route, Navigate } from 'react-router-dom';
import CardsPage from './pages/CardsPage';
import ComparePage from './pages/ComparePage';
import { SelectedCardsProvider } from './hooks/useSelectedCards';

function App() {
  return (
    <SelectedCardsProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/cards" replace />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </SelectedCardsProvider>
  );
}

export default App;
