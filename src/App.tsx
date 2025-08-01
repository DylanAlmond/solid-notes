import { AppProvider } from './context/AppContext';
import Editor from './components/Editor';

function App() {
  return (
    <AppProvider>
      <Editor />
    </AppProvider>
  );
}

export default App;

