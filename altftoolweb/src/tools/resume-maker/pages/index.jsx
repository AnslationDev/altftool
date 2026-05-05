
"use client";


import React, { useState, useRef } from 'react';

import { User, Briefcase, GraduationCap, Code, Award, Mail, Phone, MapPin, Linkedin, Github, Globe, Download, Eye, Edit3, Plus, Trash2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';

import Description from "../components/Description";

const initialPersonalInfo = {
  fullName: '',
  jobTitle: '',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  github: '',
  website: '',
  summary: ''
};

const initialExperience = {
  id: Date.now(),
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: ''
};

const initialEducation = {
  id: Date.now(),
  degree: '',
  school: '',
  location: '',
  graduationDate: '',
  description: ''
};

const initialProject = {
  id: Date.now(),
  name: '',
  description: '',
  technologies: '',
  link: ''
};

export default function ToolHome() {
  const [activeTab, setActiveTab] = useState('personal');
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical' });
  const [showPreview, setShowPreview] = useState(false);
  const resumeRef = useRef(null);

  const calculateATSScore = () => {
    let score = 0;
    let maxScore = 100;
    
    
    if (personalInfo.fullName.length > 2) score += 5;
    if (personalInfo.jobTitle.length > 5) score += 10;
    if (personalInfo.email.includes('@')) score += 5;
    if (personalInfo.phone.length >= 10) score += 5;
    if (personalInfo.summary.length > 100) score += 15;
    if (personalInfo.summary.length > 200) score += 5;
    
    if (experiences.length >= 1) score += 15;
    if (experiences.length >= 2) score += 5;
    if (experiences.some(e => e.description.length > 50)) score += 10;
    if (experiences.some(e => e.description.includes('achieved') || e.description.includes('increased') || e.description.includes('improved'))) score += 5;
    
    if (educations.length >= 1) score += 10;
    
    if (skills.length >= 5) score += 5;
    if (skills.length >= 10) score += 5;
    
    return Math.round((score / maxScore) * 100);
  };

  const getATSFeedback = () => {
    const feedback = [];
    const score = calculateATSScore();
    
    if (personalInfo.fullName.length <= 2) feedback.push('Add your full name');
    if (personalInfo.jobTitle.length <= 5) feedback.push('Add a professional job title');
    if (!personalInfo.email.includes('@')) feedback.push('Add a valid email address');
    if (personalInfo.phone.length < 10) feedback.push('Add a valid phone number');
    if (personalInfo.summary.length < 100) feedback.push('Write a detailed summary (100+ characters)');
    if (experiences.length < 1) feedback.push('Add at least one work experience');
    if (!experiences.some(e => e.description.length > 50)) feedback.push('Add detailed descriptions for experiences');
    if (educations.length < 1) feedback.push('Add your education details');
    if (skills.length < 5) feedback.push('Add 5+ skills');
    
    return { score, feedback };
  };

  const addExperience = () => setExperiences([...experiences, { ...initialExperience, id: Date.now() }]);
  const removeExperience = (id) => setExperiences(experiences.filter(e => e.id !== id));
  const updateExperience = (id, field, value) => {
    setExperiences(experiences.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addEducation = () => setEducations([...educations, { ...initialEducation, id: Date.now() }]);
  const removeEducation = (id) => setEducations(educations.filter(e => e.id !== id));
  const updateEducation = (id, field, value) => {
    setEducations(educations.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      setSkills([...skills, { id: Date.now(), ...newSkill }]);
      setNewSkill({ name: '', category: 'Technical' });
    }
  };
  const removeSkill = (id) => setSkills(skills.filter(s => s.id !== id));

  const addProject = () => setProjects([...projects, { ...initialProject, id: Date.now() }]);
  const removeProject = (id) => setProjects(projects.filter(p => p.id !== id));
  const updateProject = (id, field, value) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // const downloadPDF = () => {
  //   const element = resumeRef.current;
  //   if (!element) return;

  //   const opt = {
  //     margin: 0.5,
  //     filename: `${personalInfo.fullName || 'resume'}.pdf`,
  //     image: { type: 'jpeg' , quality: 0.98 },
  //     html2canvas: { scale: 2, useCORS: true },
  //     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait'  }
  //   };

  //   html2pdf().set(opt).from(element).save();
  // };



const downloadPDF = async () => {
  const element = resumeRef.current;
  if (!element) return;

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.98);

  const pdf = new jsPDF("p", "in", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("resume.pdf");
};














  const atsData = getATSFeedback();

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} );

  return (
    <div className="min-h-screen bg-(--background)">
     
        <div className="container mx-auto px-4">
          <div className="">
            
                <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]"> Resume Maker</h1>
                <p className="description text-center animate-fade-up pt-2">Build your resume in just one click add description  get  ats friendly resume.</p>
              
           
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${atsData.score >= 80 ? 'bg-green-500' : atsData.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">ATS Score: {atsData.score}%</span>
              </div>
            </div>
          </div>
        </div>
      

      <div className="container mx-auto px-4 py-6">
        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          <div className="bg-(--background) text-(--foreground) rounded-xl gap-4 shadow-lg overflow-hidden">
            <div className="flex border-b">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'skills', label: 'Skills', icon: Code },
                { id: 'projects', label: 'Projects', icon: Award },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id )}
                  className={`flex-1 py-3 px-4 text-sm font-medium flex items-center bg-(--card) rounded-xl  cursor-pointer  justify-center gap-2 transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-b-2  border-(--border)' : 'text-(--foreground) '}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Full Name" value={personalInfo.fullName} onChange={(v) => setPersonalInfo({...personalInfo, fullName: v})} placeholder="John Doe" />
                    <InputField label="Job Title" value={personalInfo.jobTitle} onChange={(v) => setPersonalInfo({...personalInfo, jobTitle: v})} placeholder="Senior Software Engineer" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Email" value={personalInfo.email} onChange={(v) => setPersonalInfo({...personalInfo, email: v})} placeholder="john@example.com" type="email" />
                    <InputField label="Phone" value={personalInfo.phone} onChange={(v) => setPersonalInfo({...personalInfo, phone: v})} placeholder="+1 234 567 890" />
                  </div>
                  <InputField label="Address" value={personalInfo.address} onChange={(v) => setPersonalInfo({...personalInfo, address: v})} placeholder="New York, NY" />
                  <div className="grid grid-cols-3 gap-4">
                    <InputField label="LinkedIn" value={personalInfo.linkedin} onChange={(v) => setPersonalInfo({...personalInfo, linkedin: v})} placeholder="linkedin.com/in/johndoe" />
                    <InputField label="GitHub" value={personalInfo.github} onChange={(v) => setPersonalInfo({...personalInfo, github: v})} placeholder="github.com/johndoe" />
                    <InputField label="Website" value={personalInfo.website} onChange={(v) => setPersonalInfo({...personalInfo, website: v})} placeholder="johndoe.com" />
                  </div>
                  <TextAreaField label="Professional Summary" value={personalInfo.summary} onChange={(v) => setPersonalInfo({...personalInfo, summary: v})} placeholder="Experienced software engineer with 5+ years..." rows={4} />
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <button onClick={addExperience} className="w-full py-3 border-2 border-dashed border-(--border) rounded-lg text-(--muted-foreground) hover:border-(--primary)  transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Plus className="w-5 h-5" /> Add Experience
                  </button>
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="border rounded-lg p-4 space-y-4 relative">
                      <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <h4 className="font-medium text-(--muted-foreground) ">Experience {index + 1}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Job Title" value={exp.jobTitle} onChange={(v) => updateExperience(exp.id, 'jobTitle', v)} placeholder="Software Engineer" />
                        <InputField label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} placeholder="Google Inc." />
                      </div>
                      <InputField label="Location" value={exp.location} onChange={(v) => updateExperience(exp.id, 'location', v)} placeholder="Mountain View, CA" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(exp.id, 'startDate', v)} placeholder="Jan 2020" />
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-(--muted-foreground)">End Date</label> 
                          {exp.current ? (
                            <input type="text" value="Present" disabled className="w-full px-3 py-2 border border-(--border) rounded-lg bg-(--card)" />
                          ) : (
                            <InputField label="" value={exp.endDate} onChange={(v) => updateExperience(exp.id, 'endDate', v)} placeholder="Dec 2025" />
                          )}
                          <label className="flex items-center gap-2 text-sm text-(--muted-foreground)">
                            <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} />
                            I currently work here
                          </label>
                        </div>
                      </div>
                      <TextAreaField label="Description (Use action verbs like 'achieved', 'increased', 'improved')" value={exp.description} onChange={(v) => updateExperience(exp.id, 'description', v)} placeholder="• Developed features that improved user engagement by 40%&#10;• Led a team of 5 engineers..." rows={4} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-4">
                  <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-(--border) rounded-lg text-(--muted-foreground) hover:border-(--primary) transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Plus className="w-5 h-5" /> Add Education
                  </button>
                  {educations.map((edu, index) => (
                    <div key={edu.id} className="border rounded-lg p-4 space-y-4 relative">
                      <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <h4 className="font-medium text-(--muted-foreground)">Education {index + 1}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} placeholder="Bachelor of Science in Computer Science" />
                        <InputField label="School" value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} placeholder="Stanford University" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Location" value={edu.location} onChange={(v) => updateEducation(edu.id, 'location', v)} placeholder="Stanford, CA" />
                        <InputField label="Graduation Date" value={edu.graduationDate} onChange={(v) => updateEducation(edu.id, 'graduationDate', v)} placeholder="June 2020" />
                      </div>
                      <TextAreaField label="Description" value={edu.description} onChange={(v) => updateEducation(edu.id, 'description', v)} placeholder="• GPA: 3.8/4.0&#10;• Dean's List&#10;• Relevant Coursework..." rows={3} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input type="text" value={newSkill.name} onChange={(e) => setNewSkill({...newSkill, name: e.target.value})} placeholder="Add skill (e.g., JavaScript)" className="flex-1 px-4 py-2 border border-(--border) rounded-lg focus:border-transparent" onKeyPress={(e) => e.key === 'Enter' && addSkill()} />
                    <select value={newSkill.category} onChange={(e) => setNewSkill({...newSkill, category: e.target.value})} className="px-4 py-2 border border-(--border) rounded-lg ">
                      <option>Technical</option>
                      <option>Soft Skills</option>
                      <option>Tools</option>
                      <option>Languages</option>
                      <option>Frameworks</option>
                    </select>
                    <button onClick={addSkill} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      <div key={category}>
                        <h5 className="font-medium text-(--foreground) mb-2">{category}</h5>
                        <div className="flex flex-wrap gap-2">
                          {categorySkills.map(skill => (
                            <span key={skill.id} className="inline-flex items-center gap-2 px-3 py-1 bg-(--card) text-(--foreground) rounded-full text-sm">
                              {skill.name}
                              <button onClick={() => removeSkill(skill.id)} className="hover:text-red-500">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <button onClick={addProject} className="w-full py-3 border-2 border-dashed border-(--border) rounded-lg text-(--muted-foreground) hover:border-(--primary)  transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Add Project
                  </button>
                  {projects.map((proj, index) => (
                    <div key={proj.id} className="border rounded-lg p-4 space-y-4 relative">
                      <button onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <h4 className="font-medium text-(--foreground)">Project {index + 1}</h4>
                      <InputField label="Project Name" value={proj.name} onChange={(v) => updateProject(proj.id, 'name', v)} placeholder="E-Commerce Platform" />
                      <TextAreaField label="Description" value={proj.description} onChange={(v) => updateProject(proj.id, 'description', v)} placeholder="A full-stack e-commerce platform with..." rows={3} />
                      <InputField label="Technologies Used" value={proj.technologies} onChange={(v) => updateProject(proj.id, 'technologies', v)} placeholder="React, Node.js, MongoDB, Express" />
                      <InputField label="Project Link" value={proj.link} onChange={(v) => updateProject(proj.id, 'link', v)} placeholder="github.com/johndoe/ecommerce" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-(--card) flex justify-between items-center">
              <div className={`text-sm ${atsData.score >= 80 ? 'text-green-600' : atsData.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {atsData.score >= 80 ? '✓ Excellent ATS Score!' : atsData.score >= 60 ? '⚠ Good, but can be improved' : '✗ Needs improvement'}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
                  {showPreview ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button onClick={downloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          <div className="bg-(--card) rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-(--foreground) mb-4 flex items-center gap-2">
              <CheckCircle className={`w-6 h-6 ${atsData.score >= 80 ? 'text-green-500' : atsData.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`} />
              ATS Optimization Checklist
            </h2>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">ATS Compatibility Score</span>
                <span className="font-bold">{atsData.score}%</span>
              </div>
              <div className="w-full bg-(--card) rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-500 ${atsData.score >= 80 ? 'bg-green-500' : atsData.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${atsData.score}%` }} />
              </div>
            </div>
            <div className="space-y-3">
              {atsData.feedback.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>Your resume is ATS optimized!</span>
                </div>
              ) : (
                atsData.feedback.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))
              )}
            </div>
            {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">ATS Tips:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use standard section headings (Experience, Education, Skills)</li>
                <li>• Include keywords from the job description</li>
                <li>• Use action verbs: achieved, increased, improved, led</li>
                <li>• Avoid tables, images, and special characters</li>
                <li>• Keep formatting simple and consistent</li>
              </ul>
            </div> */}
          </div>
        </div>

        {showPreview && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Resume Preview</h2>
            <div className="flex justify-center mb-6">
              <button onClick={downloadPDF} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg">
                <Download className="w-5 h-5" />
                Download Resume as PDF
              </button>
            </div>
            <div className="flex justify-center">
              <div ref={resumeRef} className="bg-(--card) shadow-2xl" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
                {personalInfo.fullName && (
                  <div className="text-center mb-6 pb-4 border-b-2 border-blue-600">
                    <h1 className="text-3xl font-bold text-(--foreground) uppercase tracking-wide">{personalInfo.fullName}</h1>
                    <p className="text-lg text-blue-600 font-medium mt-1">{personalInfo.jobTitle}</p>
                    <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-(--muted-foreground)">
                      {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {personalInfo.email}</span>}
                      {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {personalInfo.phone}</span>}
                      {personalInfo.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {personalInfo.address}</span>}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-(--muted-foreground)">
                      {personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-4 h-4" /> {personalInfo.linkedin}</span>}
                      {personalInfo.github && <span className="flex items-center gap-1"><Github className="w-4 h-4" /> {personalInfo.github}</span>}
                      {personalInfo.website && <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {personalInfo.website}</span>}
                    </div>
                  </div>
                )}

                {personalInfo.summary && (
                  <section className="mb-5">
                    <h2 className="text-lg font-bold text-(--foreground) uppercase tracking-wide border-b border-(--border) pb-1 mb-3">Professional Summary</h2>
                    <p className="text-(--muted-foreground) leading-relaxed text-sm">{personalInfo.summary}</p>
                  </section>
                )}

                {experiences.length > 0 && (
                  <section className="mb-5">
                    <h2 className="text-lg font-bold text-(--foreground) uppercase tracking-wide border-b border-(--border) pb-1 mb-3">Work Experience</h2>
                    {experiences.map((exp) => (
                      <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-(--foreground)">{exp.jobTitle}</h3>
                            <p className="text-blue-600 font-medium">{exp.company}</p>
                            {exp.location && <p className="text-(--muted-foreground) text-sm">{exp.location}</p>}
                          </div>
                          <span className="text-(--muted-foreground) text-sm font-medium">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                        </div>
                        {exp.description && <p className="text-(--muted-foreground) mt-2 text-sm whitespace-pre-line">{exp.description}</p>}
                      </div>
                    ))}
                  </section>
                )}

                {educations.length > 0 && (
                  <section className="mb-5">
                    <h2 className="text-lg font-bold text-(--foreground) uppercase tracking-wide border-b border-(--border) pb-1 mb-3">Education</h2>
                    {educations.map((edu) => (
                      <div key={edu.id} className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-(--foreground)">{edu.degree}</h3>
                            <p className="text-blue-600 font-medium">{edu.school}</p>
                            {edu.location && <p className="text-(--muted-foreground) text-sm">{edu.location}</p>}
                          </div>
                          {edu.graduationDate && <span className="text-(--muted-foreground) text-sm font-medium">{edu.graduationDate}</span>}
                        </div>
                        {edu.description && <p className="text-(--muted-foreground) mt-2 text-sm whitespace-pre-line">{edu.description}</p>}
                      </div>
                    ))}
                  </section>
                )}

                {skills.length > 0 && (
                  <section className="mb-5">
                    <h2 className="text-lg font-bold text-(--foreground) uppercase tracking-wide border-b border-(--border) pb-1 mb-3">Skills</h2>
                    <div className="space-y-2">
                      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                        <div key={category} className="flex flex-wrap items-start gap-2">
                          <span className="font-bold text-(--muted-foreground) text-sm min-w-24">{category}:</span>
                          <span className="text-(--muted-foreground) text-sm">{categorySkills.map(s => s.name).join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {projects.length > 0 && (
                  <section className="mb-5">
                    <h2 className="text-lg font-bold text-(--foreground) uppercase tracking-wide border-b border-(--border) pb-1 mb-3">Projects</h2>
                    {projects.map((proj) => (
                      <div key={proj.id} className="mb-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-(--foreground)">{proj.name}</h3>
                          {proj.link && <span className="text-blue-600 text-sm">{proj.link}</span>}
                        </div>
                        {proj.description && <p className="text-(--muted-foreground) mt-1 text-sm">{proj.description}</p>}
                        {proj.technologies && <p className="text-(--muted-foreground) mt-1 text-sm"><span className="font-medium">Technologies:</span> {proj.technologies}</p>}
                      </div>
                    ))}
                  </section>
                )}
              </div>
            </div>
            <div className="text-center mt-6">
              <button onClick={downloadPDF} className="px-6 py-3 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg mx-auto">
                <Download className="w-5 h-5" />
                Download 
              </button>
            </div>
          </div>
        )}
        <Description />

      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-(--muted-foreground)">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-(--border) rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-(--muted-foreground)">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-(--border) rounded-lg  text-sm resize-none" />
  </div>
);

