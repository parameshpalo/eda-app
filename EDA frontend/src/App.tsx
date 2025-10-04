import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages & Components
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import SubHeader from "./components/SubHeader";
import Placeholder from "./components/Placeholder";

import { Tab }   from "./assets/types";

// Styles
import "./App.css";


// ✅ Create QueryClient once, outside component to avoid recreation
const queryClient = new QueryClient();


function App() {
  
  const [activeTab, setActiveTab] = useState<Tab>("Trends");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        
        <Header />

        <main className="pt-16">

          {/* Pass tab control to SubHeader */}
          <SubHeader activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "Trends" ? (<Dashboard /> ) : (<Placeholder/>)}

        </main>

      </div>
    </QueryClientProvider>
  );
}

export default App;
