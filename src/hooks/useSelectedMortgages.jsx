import React, { createContext, useContext, useState, useEffect } from 'react';

const SelectedMortgagesContext = createContext();

export function SelectedMortgagesProvider({ children }) {
  const [selected, setSelected] = useState(() => {
    const stored = localStorage.getItem('selectedMortgages');
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleMortgage = (mortgage) => {
    setSelected((prev) => {
      const exists = prev.find((m) => m.id === mortgage.id);
      if (exists) {
        return prev.filter((m) => m.id !== mortgage.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, mortgage];
    });
  };

  const clearSelected = () => setSelected([]);

  useEffect(() => {
    localStorage.setItem('selectedMortgages', JSON.stringify(selected));
  }, [selected]);

  return (
    <SelectedMortgagesContext.Provider value={{ selected, toggleMortgage, clearSelected }}>
      {children}
    </SelectedMortgagesContext.Provider>
  );
}

export const useSelectedMortgages = () => useContext(SelectedMortgagesContext);
