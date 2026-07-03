import React, { createContext, useContext } from 'react';
import { useSettings } from '../hooks/useSettings';
import { UserPreferences } from '../../shared/types';

// Define context based on useSettings return type
type SettingsContextType = ReturnType<typeof useSettings>;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{
children: React.ReactNode;
initialSettings: UserPreferences | null;
onSave?: (settings: UserPreferences) => Promise<boolean>;
onReset?: () => Promise<boolean>;
}> = ({
children,
initialSettings,
onSave
}) => {
const settingsManager = useSettings(initialSettings || undefined, { autoSave: true });

return (
<SettingsContext.Provider value={settingsManager}>
{children}
</SettingsContext.Provider>
);
};

export const useSettingsContext = () => {
const context = useContext(SettingsContext);
if (!context) throw new Error('useSettingsContext must be used within SettingsProvider');
return context;
};
