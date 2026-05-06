"use client";

import React, { useState, useRef } from "react";
import {
  Mail, Phone, Globe, MapPin, Linkedin, Download,
  Upload, Image as ImageIcon, X, Share2, Move, Maximize, Type, Building2, Sparkles
} from "lucide-react";
import { toBlob } from "html-to-image"; 
import { motion } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";

export default function Generator() {
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "JANE DOE",
    title: "Graphic Designer",
    company: "Creative Agency",
    tagline: "Design that speaks",
    email: "jane@design.com",
    phone: "9876543210",
    website: "www.design.com",
    linkedin: "",
    address: "New Delhi, India",
    cardColor: "#4f46e5",
    secondaryColor: "#ffffff",
    textColor: "#ffffff",
    design: "default",
    textAlign: "left",
    logoSize: 40,
    photoSize: 60 
  });

  const [fontSizes, setFontSizes] = useState({
    name: 24, title: 10, company: 10, tagline: 8, email: 9, phone: 9, website: 9, address: 9
  });
  const [selectedElement, setSelectedElement] = useState("name");

  const [logo, setLogo] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [phoneValid, setPhoneValid] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (value.length > 10) return;
      setPhoneValid(/^\d{0,10}$/.test(value));
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await toBlob(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        backgroundColor: formData.cardColor 
      });
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formData.name}_BusinessCard.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { 
      alert("Download failed."); 
    }
  };

  const shareCard = async () => {
    if (!cardRef.current) return;
    if (!navigator.share) {
      alert("Sharing is not supported on this browser/device.");
      return;
    }
    try {
      const blob = await toBlob(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      if (!blob) return;
      const file = new File([blob], "business-card.png", { type: "image/png" });
      await navigator.share({ title: "My Business Card", files: [file] });
    } catch (err) { console.error(err); }
  };

  // Helper function to render background patterns based on 15 designs
  const renderBackgroundPattern = () => {
    const sColor = formData.secondaryColor;
    const op = 0.15;
    
    switch (formData.design) {
      case "diagonal": return <div className="absolute inset-0" style={{background: `linear-gradient(135deg, transparent 50%, ${sColor} 50%)`, opacity: 0.8}} />;
      case "corporate": return <div className="absolute bottom-0 left-0 w-full h-12 bg-black/20 border-t border-white/10" />;
      case "striped": return <div className="absolute inset-0" style={{backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${sColor} 10px, ${sColor} 11px)`, opacity: 0.3}} />;
      case "sidebar": return <div className="absolute left-0 top-0 w-20 h-full bg-black/10 border-r border-white/5" />;
      case "glass": return <div className="absolute inset-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-md" />;
      case "dots": return <div className="absolute inset-0" style={{backgroundImage: `radial-gradient(${sColor} 1.5px, transparent 1.5px)`, backgroundSize: '18px 18px', opacity: 0.4}} />;
      case "mesh": return <div className="absolute inset-0" style={{backgroundColor: formData.cardColor, backgroundImage: `radial-gradient(at 0% 0%, ${sColor}55 0px, transparent 50%), radial-gradient(at 100% 100%, ${sColor}55 0px, transparent 50%)`}} />;
      case "modern-v": return <div className="absolute right-0 top-0 w-1/3 h-full" style={{backgroundColor: sColor, opacity: 0.1}} />;
      case "split-h": return <div className="absolute top-0 left-0 w-full h-1/2" style={{backgroundColor: sColor, opacity: 0.1}} />;
      case "waves": return <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden opacity-30" style={{background: `radial-gradient(circle at 50% 100%, ${sColor}, transparent)`}} />;
      case "border-bold": return <div className="absolute inset-3 border-4" style={{borderColor: sColor, opacity: 0.2}} />;
      case "dual-tone": return <div className="absolute left-0 top-0 w-1/2 h-full" style={{background: `linear-gradient(to right, rgba(0,0,0,0.1), transparent)`}} />;
      case "center-glow": return <div className="absolute inset-0" style={{background: `radial-gradient(circle at center, ${sColor}33, transparent 70%)`}} />;
      case "minimal-line": return <div className="absolute top-1/2 left-0 w-full h-[1px]" style={{backgroundColor: sColor, opacity: 0.3}} />;
      case "geometric": return <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{backgroundColor: sColor, opacity: 0.15}} />;
      default: return null;
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-(--primary)">Business Card Builder</h1>
        <p className="text-gray-500 text-center mb-10 md:mb-14">Design your professional digital business card instantly</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
          <div className="space-y-8">
            <div className="panel">
              <h3 className="section-title">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="input" />
                <input name="title" placeholder="Job Title" value={formData.title} onChange={handleChange} className="input" />
              </div>
              <input name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} className="input mt-2" />
              <input name="tagline" placeholder="Tagline / Motto" value={formData.tagline} onChange={handleChange} className="input mt-2" />
            </div>

            <div className="panel">
              <h3 className="section-title">Contact Details</h3>
              <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="input" />
              <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className={`input ${phoneValid ? "" : "border-red-500"}`} />
              <input name="website" placeholder="Website URL" value={formData.website} onChange={handleChange} className="input" />
              <input name="address" placeholder="Office Address" value={formData.address} onChange={handleChange} className="input" />
            </div>

            <div className="panel">
              <h3 className="section-title">Card Style & Colors</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {['cardColor', 'secondaryColor', 'textColor'].map((c) => (
                   <div key={c} className="flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{c.replace('Color','')}</span>
                    <input type="color" name={c} value={formData[c]} onChange={handleChange} className="w-full h-10 rounded cursor-pointer border-0" />
                   </div>
                ))}
              </div>

              <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <label className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1 mb-2">
                  <Type size={12}/> {selectedElement.toUpperCase()} Font Size: {fontSizes[selectedElement]}px
                </label>
                <input type="range" min="6" max="60" value={fontSizes[selectedElement]} onChange={(e) => setFontSizes({...fontSizes, [selectedElement]: parseInt(e.target.value)})} className="w-full accent-indigo-600" />
              </div>

              <select name="design" value={formData.design} onChange={handleChange} className="input">
                <option value="default"> Default Classic</option>
                <option value="corporate"> Corporate Bottom-Bar</option>
                <option value="diagonal"> Diagonal Split</option>
                <option value="striped"> Modern Striped</option>
                <option value="sidebar">Left Sidebar</option>
                <option value="glass"> Glassmorphism</option>
                <option value="dots"> Minimalist Dots</option>
                <option value="mesh"> Vibrant Mesh</option>
                <option value="modern-v"> Right Column Accent</option>
                <option value="split-h"> Horizontal Split</option>
                <option value="waves"> Ocean Waves</option>
                <option value="border-bold"> Framed Border</option>
                <option value="dual-tone"> Dual Tone Gradient</option>
                <option value="center-glow"> Radiant Center</option>
                <option value="geometric"> Modern Geometric</option>
              </select>
            </div>

            <div className="panel">
              <h3 className="section-title">Assets</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="upload-area flex-col text-center cursor-pointer"><Upload size={20} /> <span className="text-xs">Logo</span><input type="file" hidden onChange={handleLogo} /></label>
                <label className="upload-area flex-col text-center cursor-pointer"><ImageIcon size={20} /> <span className="text-xs">Photo</span><input type="file" hidden onChange={handlePhoto} /></label>
              </div>
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <div className="sticky top-24">
            <div className="panel w-full max-w-[420px] mx-auto overflow-visible shadow-2xl">
              <h3 className="section-title flex items-center gap-2"><Move size={16}/> Live Preview</h3>
              <div ref={cardRef} className="relative w-full h-[240px] rounded-xl overflow-hidden shadow-2xl" style={{ backgroundColor: formData.cardColor, color: formData.textColor }}>
                
                {/* Designs Background Layer */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {renderBackgroundPattern()}
                </div>

                {/* --- ALL INFORMATION RENDERED HERE --- */}
                <motion.div drag dragConstraints={cardRef} dragMomentum={false} onClick={() => setSelectedElement("name")} className={`absolute top-4 left-6 z-20 cursor-move p-1 rounded-sm ${selectedElement === 'name' ? 'ring-1 ring-white/50 bg-white/10' : ''}`}>
                  <h2 className="font-black uppercase leading-tight select-none" style={{ fontSize: `${fontSizes.name}px` }}>{formData.name}</h2>
                </motion.div>

                <motion.div drag dragConstraints={cardRef} dragMomentum={false} onClick={() => setSelectedElement("title")} className={`absolute top-12 left-6 z-20 cursor-move p-1 rounded-sm ${selectedElement === 'title' ? 'ring-1 ring-white/50 bg-white/10' : ''}`}>
                  <p className="font-bold opacity-90 uppercase select-none" style={{color: formData.secondaryColor, fontSize: `${fontSizes.title}px` }}>{formData.title}</p>
                </motion.div>

                <motion.div drag dragConstraints={cardRef} dragMomentum={false} onClick={() => setSelectedElement("company")} className={`absolute top-20 left-6 z-20 cursor-move p-1 rounded-sm ${selectedElement === 'company' ? 'ring-1 ring-white/50 bg-white/10' : ''}`}>
                  <div className="flex items-center gap-1 font-semibold" style={{ fontSize: `${fontSizes.company}px` }}><Building2 size={fontSizes.company}/> {formData.company}</div>
                </motion.div>

                <motion.div drag dragConstraints={cardRef} dragMomentum={false} onClick={() => setSelectedElement("tagline")} className={`absolute top-28 left-6 z-20 cursor-move p-1 rounded-sm ${selectedElement === 'tagline' ? 'ring-1 ring-white/50 bg-white/10' : ''}`}>
                  <p className="italic opacity-70" style={{ fontSize: `${fontSizes.tagline}px` }}>&quot;{formData.tagline}&quot;</p>
                </motion.div>

                {/* Contact Block */}
                <div className="absolute bottom-4 left-6 z-20 space-y-1">
                    <motion.div drag dragConstraints={cardRef} dragMomentum={false} onClick={() => setSelectedElement("email")} className="flex items-center gap-2 cursor-move">
                        <Mail size={fontSizes.email + 2} style={{color: formData.secondaryColor}}/> <span style={{ fontSize: `${fontSizes.email}px` }}>{formData.email}</span>
                    </motion.div>
                    <motion.div drag dragConstraints={cardRef} dragMomentum={false} onClick={() => setSelectedElement("phone")} className="flex items-center gap-2 cursor-move">
                        <Phone size={fontSizes.phone + 2} style={{color: formData.secondaryColor}}/> <span style={{ fontSize: `${fontSizes.phone}px` }}>{formData.phone}</span>
                    </motion.div>
                    <motion.div drag dragConstraints={cardRef} dragMomentum={false} onClick={() => setSelectedElement("website")} className="flex items-center gap-2 cursor-move">
                        <Globe size={fontSizes.website + 2} style={{color: formData.secondaryColor}}/> <span style={{ fontSize: `${fontSizes.website}px` }}>{formData.website}</span>
                    </motion.div>
                    <motion.div drag dragConstraints={cardRef} dragMomentum={false} onClick={() => setSelectedElement("address")} className="flex items-center gap-2 cursor-move">
                        <MapPin size={fontSizes.address + 2} style={{color: formData.secondaryColor}}/> <span style={{ fontSize: `${fontSizes.address}px` }}>{formData.address}</span>
                    </motion.div>
                </div>

                {photo && (
                  <motion.div drag dragConstraints={cardRef} dragMomentum={false} className="absolute top-6 right-6 z-30 cursor-move">
                    <ManagedImage src={photo} style={{ width: `${formData.photoSize}px`, height: `${formData.photoSize}px` }} className="rounded-full border-2 border-white/50 object-cover shadow-lg" />
                  </motion.div>
                )}

                {logo && (
                  <motion.div drag dragConstraints={cardRef} dragMomentum={false} className="absolute bottom-6 right-6 z-30 cursor-move">
                    <ManagedImage src={logo} style={{ width: `${formData.logoSize}px` }} className="object-contain" />
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 mt-6">
                <button onClick={downloadCard} className="download-btn active:scale-95 transition-all"><Download size={18}/> Download Card</button>
                <button onClick={shareCard} className="share-btn active:scale-95 transition-all"><Share2 size={18}/> Share Card</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .panel{background:white;padding:26px;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,0.05);}
        .section-title{font-weight:700;font-size:14px;margin-bottom:16px;color:#4b5563;text-transform:uppercase;letter-spacing:1px;}
        .input{width:100%;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;margin-bottom:12px;outline:none;}
        .upload-area{display:flex;align-items:center;gap:10px;padding:20px;border:2px dashed #e5e7eb;border-radius:12px;background:#f9fafb;}
        .download-btn{width:100%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;padding:16px;border-radius:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px; cursor: pointer; border: none;}
        .share-btn{width:100%;background:white;color:#4b5563;border:1px solid #e5e7eb;padding:16px;border-radius:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px; cursor: pointer;}
      `}</style>
    </section>
  );
}