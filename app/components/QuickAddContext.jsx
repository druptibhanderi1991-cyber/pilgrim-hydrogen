import {createContext, useContext, useState} from 'react';

const QuickAddContext = createContext(null);

export function QuickAddProvider({children}) {
  const [product, setProduct] = useState(null);

  return (
    <QuickAddContext.Provider value={{product, setProduct}}>
      {children}
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error('useQuickAdd must be inside QuickAddProvider');
  return ctx;
}
