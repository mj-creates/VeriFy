import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, VerifyResult } from './types';

type Action =
  | { type: 'NEXT_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'SET_QUESTION'; payload: string }
  | { type: 'SET_MOCK_CONFLICT'; payload: boolean }
  | { type: 'SET_RESULT'; payload: VerifyResult };

const initialState: AppState = {
  currentStep: 1,
  question: '',
  isMockConflict: false,
  verifyResult: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1 };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_QUESTION':
      return { ...state, question: action.payload };
    case 'SET_MOCK_CONFLICT':
      return { ...state, isMockConflict: action.payload };
    case 'SET_RESULT':
      return { ...state, verifyResult: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
