import { AppProvider } from './AppContext';
import { VerifyFlow } from './VerifyFlow';

function App() {
  return (
    <AppProvider>
      <VerifyFlow />
    </AppProvider>
  );
}

export default App;
