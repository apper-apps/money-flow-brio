import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import Dashboard from "@/components/pages/Dashboard";
import Transactions from "@/components/pages/Transactions";
import Budgets from "@/components/pages/Budgets";
import Bills from "@/components/pages/Bills";
import Goals from "@/components/pages/Goals";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          
          {/* Main Content */}
          <div className="flex-1 lg:ml-0 min-h-screen">
            <Header 
              title="MoneyFlow"
              onMenuClick={toggleSidebar}
            />
            
            <main className="p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/goals" element={<Goals />} />
              </Routes>
            </main>
          </div>
        </div>

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="mt-16"
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  );
}

export default App;