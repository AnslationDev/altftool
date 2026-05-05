"use client";


import ExpertVideoTopBar from "./components/ExpertVideoTopBar";

export default function ExpertVideoLayout({ children }) {

    return (

        <div className="min-h-screen bg-gray-50">

            {/* Top Navigation */}

            <ExpertVideoTopBar />


            {/* Page Content */}

            <div className="mx-auto px-6 py-6">

                {children}

            </div>

        </div>

    );

}