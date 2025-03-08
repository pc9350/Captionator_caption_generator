import { useState, createContext, useContext } from 'react';

// Define the navigation context type
export type NavigationContextType = {
  currentScreen: string;
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  screenHistory: string[];
  params: Record<string, any>;
};

// Create the context
export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Create a hook to use the navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Create a hook to provide navigation functionality
export const useNavigationState = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('Home');
  const [screenHistory, setScreenHistory] = useState<string[]>(['Home']);
  const [params, setParams] = useState<Record<string, any>>({});

  const navigate = (screen: string, newParams?: any) => {
    setScreenHistory([...screenHistory, screen]);
    setCurrentScreen(screen);
    if (newParams) {
      setParams((prevParams) => ({ ...prevParams, [screen]: newParams }));
    }
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(previousScreen);
    }
  };

  // Create a navigation object that mimics React Navigation
  const navigation = {
    navigate,
    goBack,
    dispatch: (action: any) => {
      // Handle reset action
      if (action.type === 'RESET') {
        const screen = action.payload?.routes?.[0]?.name;
        if (screen) {
          setCurrentScreen(screen);
          setScreenHistory([screen]);
        }
      }
    },
    reset: (routes: { name: string }[]) => {
      if (routes && routes.length > 0) {
        const screen = routes[0].name;
        setCurrentScreen(screen);
        setScreenHistory([screen]);
      }
    },
    // Add other navigation methods as needed
  };

  return {
    currentScreen,
    navigate,
    goBack,
    screenHistory,
    params,
    navigation,
  };
};

// Create a navigation provider component
export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentScreen, navigate, goBack, screenHistory, params } = useNavigationState();

  return (
    <NavigationContext.Provider 
      value={{ 
        currentScreen, 
        navigate, 
        goBack, 
        screenHistory, 
        params 
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}; 