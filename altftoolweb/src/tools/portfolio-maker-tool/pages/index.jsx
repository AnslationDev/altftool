import { useState } from "react";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Mail,
  Github,
  Linkedin,
  Globe,
  ArrowLeft,
  Rocket,
  Palette,
  Share,
  User,
  Layout,
  Cpu,
  Briefcase
} from "lucide-react";
const PortfolioMaker = () => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    github: "",
    linkedin: "",
    twitter: "",
    website: "",
    project1Name: "",
    project1Desc: "",
    project2Name: "",
    project2Desc: "",
    project3Name: "",
    project3Desc: "",
    skill1: "",
    skill2: "",
    skill3: "",
    skill4: ""
  });
  const [preview, setPreview] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  if (preview) {
    const projects = [
      { name: formData.project1Name, desc: formData.project1Desc },
      { name: formData.project2Name, desc: formData.project2Desc },
      { name: formData.project3Name, desc: formData.project3Desc }
    ].filter((p) => p.name);
    return <div className="py-6 min-h-screen bg-(--muted)/40 dark:bg-(--muted)/60">
        <div className="container max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <Button
      variant="default"
      onClick={() => setPreview(false)}
      className="bg-(--background) text-(--foreground) hover:bg-(--muted) rounded-full font-semibold shadow"
    >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Edit Info
            </Button>

            <Badge variant="default" className="bg-secondary text-(--foreground) font-semibold px-4 py-2">
              Live Preview
            </Badge>
          </div>

          <Card className="rounded-2xl overflow-hidden shadow-lg">
            {
      /* HERO */
    }
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 md:p-12 text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                {formData.name || "Your Name"}
              </h1>

              <h2 className="text-lg md:text-xl font-light text-blue-100 mb-4">
                {formData.title || "Creative Professional"}
              </h2>

              <p className="max-w-2xl mx-auto text-lg leading-relaxed text-white/90">
                {formData.bio || "Your professional bio will appear here."}
              </p>

              {
      /* SOCIAL ICONS */
    }
              <div className="flex justify-center space-x-4 mt-8">
                {formData.email && <a
      href={`mailto:${formData.email}`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white/10 border border-white/20 p-3 rounded-full hover:bg-white/20 transition-transform hover:scale-110"
    >
                    <Mail className="w-5 h-5" />
                  </a>}
                {formData.github && <a
      href={`https://github.com/${formData.github}`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white/10 border border-white/20 p-3 rounded-full hover:bg-white/20 transition-transform hover:scale-110"
    >
                    <Github className="w-5 h-5" />
                  </a>}
                {formData.linkedin && <a
      href={`https://linkedin.com/in/${formData.linkedin}`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white/10 border border-white/20 p-3 rounded-full hover:bg-white/20 transition-transform hover:scale-110"
    >
                    <Linkedin className="w-5 h-5" />
                  </a>}
                {formData.website && <a
      href={formData.website}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white/10 border border-white/20 p-3 rounded-full hover:bg-white/20 transition-transform hover:scale-110"
    >
                    <Globe className="w-5 h-5" />
                  </a>}
              </div>
            </div>

            {
      /* CONTENT */
    }
            <div className="p-6 md:p-10 bg-(--muted)">
              {
      /* PROJECTS */
    }
              {projects.length > 0 && <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" />
                    Featured Projects
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {projects.map((project, idx) => <Card key={idx} className="h-full rounded-xl border border-(--border) transition-transform hover:translate-y-[-4px] hover:shadow-md">
                        <div className="p-5">
                          <div className="bg-purple-100 text-purple-600 mb-3 w-12 h-12 rounded-lg flex items-center justify-center">
                            <Layout className="w-6 h-6" />
                          </div>

                          <h3 className="text-lg font-bold mb-2">{project.name}</h3>

                          <p className="text-sm text-(--muted-foreground)">
                            {project.desc || "A featured project demonstrating core competencies."}
                          </p>
                        </div>
                      </Card>)}
                  </div>
                </div>}

              {
      /* SKILLS */
    }
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
                  <Cpu className="w-6 h-6 text-purple-600" />
                  Technical Skills
                </h2>

                <div className="flex flex-wrap justify-center gap-2">
                  {[formData.skill1, formData.skill2, formData.skill3, formData.skill4].filter(Boolean).map((skill, i) => <Badge key={i} variant="secondary" className="px-3 py-2 rounded-lg bg-(--background) border border-(--border) text-(--foreground) font-semibold">
                        {skill}
                      </Badge>)}
                </div>
              </div>
            </div>

            {
      /* FOOTER */
    }
            <div className="bg-(--muted)/40 dark:bg-(--muted)/60 py-4 text-center">
              <p className="text-sm text-(--foreground)/70 dark:text-(--foreground)/60">
                © {(/* @__PURE__ */ new Date()).getFullYear()} {formData.name}. All rights reserved.
              </p>
            </div>
          </Card>
        </div>
      </div>;
  }
  return <div className="space-y-8 text-(--foreground) [&_p]:text-(--foreground)/80 [&_label]:text-(--foreground) [&_h1]:text-(--foreground) [&_h2]:text-(--foreground) [&_h3]:text-(--foreground)">

      {
    /* How to Use */
  }
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <h2 className="text-xl font-semibold text-(--foreground) mb-2">How to Use</h2>
        <p className="text-(--foreground)/70 dark:text-(--foreground)/60">

          Fill in your details below and instantly generate a professional portfolio.
        </p>
      </Card>

      <Card className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Portfolio Generator
            </span>
          </h1>
          <p className="text-(--muted-foreground) max-w-2xl mx-auto">
            Fill in your details below and instantly generate a professional portfolio.
          </p>
        </div>

        <div className="border rounded-2xl p-6 bg-(--background)/80 backdrop-blur-sm">
          {
    /* HEADER */
  }
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <Palette className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Customize Your Portfolio</h2>
          </div>

          {
    /* FORM */
  }
          <div>
            {
    /* Personal Info */
  }
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" /> Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
    id="name"
    name="name"
    value={formData.name}
    onChange={handleChange}
    placeholder="John Doe"
    className="bg-(--muted)/50"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
    id="title"
    name="title"
    value={formData.title}
    onChange={handleChange}
    placeholder="Software Engineer"
    className="bg-(--muted)/50"
  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea
    id="bio"
    name="bio"
    value={formData.bio}
    onChange={handleChange}
    placeholder="A brief description about yourself"
    rows={3}
    className="bg-(--muted)/50"
  />
                </div>
              </div>
            </div>

            {
    /* Contact */
  }
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Share className="w-5 h-5 text-blue-600" /> Contact & Social
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
    id="email"
    name="email"
    type="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="john@example.com"
    className="bg-(--muted)/50"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
    id="website"
    name="website"
    value={formData.website}
    onChange={handleChange}
    placeholder="https://yourwebsite.com"
    className="bg-(--muted)/50"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Username</Label>
                  <Input
    id="github"
    name="github"
    value={formData.github}
    onChange={handleChange}
    placeholder="username"
    className="bg-(--muted)/50"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Username</Label>
                  <Input
    id="linkedin"
    name="linkedin"
    value={formData.linkedin}
    onChange={handleChange}
    placeholder="username"
    className="bg-(--muted)/50"
  />
                </div>
              </div>
            </div>

            {
    /* Projects */
  }
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-pink-600" /> Key Projects
              </h3>

              <div className="space-y-6">
                {
    /* Project 1 */
  }
                <div className="p-4 border rounded-lg bg-(--muted)/40 dark:bg-(--muted)/60">
                  <h4 className="font-semibold mb-3 text-sm text-(--muted-foreground)">Project 1</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="project1Name">Project Name</Label>
                      <Input
    id="project1Name"
    name="project1Name"
    value={formData.project1Name}
    onChange={handleChange}
    placeholder="E-commerce Platform"
  />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project1Desc">Project Description (Optional)</Label>
                      <Textarea
    id="project1Desc"
    name="project1Desc"
    value={formData.project1Desc}
    onChange={handleChange}
    placeholder="A modern e-commerce platform built with React and Node.js..."
    rows={2}
  />
                    </div>
                  </div>
                </div>

                {
    /* Project 2 */
  }
                <div className="p-4 border rounded-lg bg-(--muted)/50">
                  <h4 className="font-semibold mb-3 text-sm text-(--muted-foreground)">Project 2</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="project2Name">Project Name</Label>
                      <Input
    id="project2Name"
    name="project2Name"
    value={formData.project2Name}
    onChange={handleChange}
    placeholder="Task Management App"
  />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project2Desc">Project Description (Optional)</Label>
                      <Textarea
    id="project2Desc"
    name="project2Desc"
    value={formData.project2Desc}
    onChange={handleChange}
    placeholder="A collaborative task management tool with real-time updates..."
    rows={2}
  />
                    </div>
                  </div>
                </div>

                {
    /* Project 3 */
  }
                <div className="p-4 border rounded-lg bg-(--muted)/50">
                  <h4 className="font-semibold mb-3 text-sm text-(--muted-foreground)">Project 3</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="project3Name">Project Name</Label>
                      <Input
    id="project3Name"
    name="project3Name"
    value={formData.project3Name}
    onChange={handleChange}
    placeholder="AI Chatbot"
  />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project3Desc">Project Description (Optional)</Label>
                      <Textarea
    id="project3Desc"
    name="project3Desc"
    value={formData.project3Desc}
    onChange={handleChange}
    placeholder="An intelligent chatbot powered by machine learning..."
    rows={2}
  />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {
    /* Skills */
  }
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-600" /> Top Skills
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skill1">Skill 1</Label>
                  <Input
    id="skill1"
    name="skill1"
    value={formData.skill1}
    onChange={handleChange}
    placeholder="JavaScript"
    className="bg-(--muted)/50"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill2">Skill 2</Label>
                  <Input
    id="skill2"
    name="skill2"
    value={formData.skill2}
    onChange={handleChange}
    placeholder="React"
    className="bg-(--muted)/50"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill3">Skill 3</Label>
                  <Input
    id="skill3"
    name="skill3"
    value={formData.skill3}
    onChange={handleChange}
    placeholder="Node.js"
    className="bg-(--muted)/50"
  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill4">Skill 4</Label>
                  <Input
    id="skill4"
    name="skill4"
    value={formData.skill4}
    onChange={handleChange}
    placeholder="UI/UX"
    className="bg-(--muted)/50"
  />
                </div>
              </div>
            </div>

            {
    /* Submit Button */
  }
            <Button
    type="button"
    onClick={() => setPreview(true)}
    className="w-full min-h-[52px] flex items-center justify-center gap-2 px-4 text-base sm:text-lg leading-none rounded-xl
              font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
  >
              <Rocket className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap">Generate Portfolio</span>
            </Button>

          </div>
        </div>
      </Card>

      {
    /* Features */
  }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Instant Export</h3>
          </div>
          <p className="text-sm text-(--foreground)/70 dark:text-(--foreground)/60">
            Get a production-ready React codebase instantly.
          </p>
        </Card>
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Customizable</h3>
          </div>
          <p className="text-sm text-(--foreground)/70 dark:text-(--foreground)/60">
            Real-time preview with easy editing tools.
          </p>
        </Card>
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="font-bold">Responsive</h3>
          </div>
          <p className="text-sm text-(--foreground)/70 dark:text-(--foreground)/60">
            Looks perfect on mobile, tablet, and desktop.
          </p>
        </Card>
      </div>
    </div>;
};
export default PortfolioMaker;
