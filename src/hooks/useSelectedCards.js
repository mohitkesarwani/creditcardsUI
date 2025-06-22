import React, { createContext, useContext, useState } from 'react';

const SelectedCardsContext = createContext();

export function SelectedCardsProvider({ children }) {
  const [selected, setSelected] = useState([]);

  const toggleCard = (card) => {
    setSelected((prev) => {
      const exists = prev.find((c) => c.id === card.id);
      if (exists) {
        return prev.filter((c) => c.id !== card.id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, card];
    });
  };

  return (
    <SelectedCardsContext.Provider value={{ selected, toggleCard }}>
      {children}
    </SelectedCardsContext.Provider>
  );
}

export const useSelectedCards = () => useContext(SelectedCardsContext);
