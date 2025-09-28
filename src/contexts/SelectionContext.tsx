import React, { createContext, useState, useCallback } from 'react';
import type { EarthquakeData } from '../types';

interface SelectionContextType {
  selectedEarthquake: EarthquakeData | null;
  selectedId: string | null;
  setSelectedEarthquake: (earthquake: EarthquakeData | null) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedEarthquake, setSelectedEarthquakeState] = useState<EarthquakeData | null>(null);

  const setSelectedEarthquake = useCallback((earthquake: EarthquakeData | null) => {
    setSelectedEarthquakeState(earthquake);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEarthquakeState(null);
  }, []);

  const value = {
    selectedEarthquake,
    selectedId: selectedEarthquake?.id || null,
    setSelectedEarthquake,
    clearSelection,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export { SelectionContext };