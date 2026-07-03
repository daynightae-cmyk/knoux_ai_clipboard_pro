import React, { createContext, useContext } from 'react';
import { useAI } from '../hooks/useAI';

type AIContextType = ReturnType<typeof useAI>;

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const aiLogic = useAI();

return (
<AIContext.Provider value={aiLogic}>
{children}
</AIContext.Provider>
);
};

export const useAIContext = () => {
const context = useContext(AIContext);
if (!context) throw new Error('useAIContext must be used within AIContextProvider');
return context;
};
