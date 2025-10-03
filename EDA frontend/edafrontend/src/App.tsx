import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Header from "./pages/Header";
import SubHeader from "./pages/SubHeader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Placeholder from "./pages/placeholder"; // 👈 import
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const [activeTab, setActiveTab] = useState("Trends");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="pt-16">
          <SubHeader activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "Trends" ? (
            <Dashboard />
          ) : (
            <>
              <img
                src="/ifdata.png"
                alt="Coming soon"
                className="object-contain mx-auto"
              />
              <div className="text-center text-gray-500 mt-4 text-lg">
                Coming soon
              </div>
            </>
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
