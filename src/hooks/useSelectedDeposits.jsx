import React, { createContext, useContext, useState } from 'react';

const SelectedDepositsContext = createContext();

export function SelectedDepositsProvider({ children }) {
  const [selected, setSelected] = useState([]);

  const toggleDeposit = (deposit) => {
    setSelected((prev) => {
      const exists = prev.find((d) => d.id === deposit.id);
      if (exists) return prev.filter((d) => d.id !== deposit.id);
      if (prev.length >= 3) return prev;
      return [...prev, deposit];
    });
  };

  const clearSelected = () => setSelected([]);

  return (
    <SelectedDepositsContext.Provider value={{ selected, toggleDeposit, clearSelected }}>
      {children}
    </SelectedDepositsContext.Provider>
  );
}

export const useSelectedDeposits = () => useContext(SelectedDepositsContext);
