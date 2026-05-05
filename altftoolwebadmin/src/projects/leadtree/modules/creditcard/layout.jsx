"use client";

import CreditCardTopBar from "./components/CreditCardTopBar";




export default function CreditCardsLayout({ children }) {

  return (

    <div className="min-h-screen bg-gray-50">

      {/* Top Navigation */}

 <CreditCardTopBar/>

      {/* Page Content */}

      <div className="mx-auto px-6 py-6">

        {children}

      </div>

    </div>

  );

}