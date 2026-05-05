"use client";
import Image from "next/image";

import { ArrowLeft, ArrowRight, Quote, QuoteIcon } from "lucide-react";

import testimonials from "../(data)/db.json"
import { useState, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";


import React from 'react'

function FeedbackSection() {
  return (
    <section  className="border h-200  my-16" >
         <div className="border" >
            <h2 className="text-[#0F172A] font-bold text-4xl " >Testimonials</h2>
            <p className="text-[#4A5565] text-2xl font-extralight py-4  " >Discover tips, sale insights, and hacks to save more on every purchase</p>
         </div>
         <div  className="flex my-6 justify-between" >
            {[1,2].map((item) => (
                <div key={item}>
                     <FeedbackCard/>
                </div>
            ))}
         </div>
    </section>
  )
}

export default FeedbackSection


function FeedbackCard(){
     return (
        <div className="w-150 h-75 border p-4 bg-white border-white/20 shadow-sm rounded-4xl" >
            <div className="h-[30%] relative border" >
                <div className="absolute right-0"><QuoteIcon size={30} className="text-[#2563EB]" /> </div>
            </div>
            <div></div>
        </div>
     )
}



