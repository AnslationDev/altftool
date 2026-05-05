import React from "react";
import { Toaster } from "react-hot-toast";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "8px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      {/* <header className="bg-white shadow-sm"> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-(--background)">
          <div className="flex flex-col  justify-center pt-4">
            <h1 className="heading text-center aniamte-fade-up">
              Expanse Tracker
            </h1>
            <p className="description text-center animate-fade-up">
              Track your expenses with ease
            </p>
          </div>
        </div>
      {/* </header> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* <footer className="bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            Expanse Tracker &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer> */}
    </div>
  );
};

export default DashboardLayout;
