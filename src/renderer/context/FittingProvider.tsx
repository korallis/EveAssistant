import { createContext, useState, ReactNode } from 'react';
import { Fitting } from '../../shared/domain';

interface FittingContextType {
  fitting: Fitting | null;
  setFitting: (fitting: Fitting | null) => void;
}

export const FittingContext = createContext<FittingContextType | null>(null);

export const FittingProvider = ({ children }: { children: ReactNode }) => {
  const [fitting, setFitting] = useState<Fitting | null>(null);

  return (
    <FittingContext.Provider value={{ fitting, setFitting }}>
      {children}
    </FittingContext.Provider>
  );
}; 