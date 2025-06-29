import React, { createContext, useContext, useState } from 'react';

const SelectedMortgagesContext = createContext();

export function SelectedMortgagesProvider({ children }) {
  const [selected, setSelected] = useState([]);

  const toggleMortgage = (mortgage) => {
    setSelected((prev) => {
      const exists = prev.find((m) => m.id === mortgage.id);
      if (exists) {
        return prev.filter((m) => m.id !== mortgage.id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, mortgage];
    });
  };

  const clearSelected = () => setSelected([]);

  return (
    <SelectedMortgagesContext.Provider value={{ selected, toggleMortgage, clearSelected }}>
      {children}
    </SelectedMortgagesContext.Provider>
  );
}

export const useSelectedMortgages = () => useContext(SelectedMortgagesContext);
