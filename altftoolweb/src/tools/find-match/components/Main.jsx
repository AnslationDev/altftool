import { useState } from "react";
import { Heart, Sparkles, User, Mail, MapPin, Music, Book, Utensils, Users, ArrowRight } from "lucide-react";

export default function Main(){
    const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
    interests: [],
    personality: "",
    lifestyle: ""
  });
  const [matches, setMatches] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const interestOptions = [
    { id: "music", label: "Music", icon: Music },
    { id: "reading", label: "Reading", icon: Book },
    { id: "food", label: "Food & Dining", icon: Utensils },
    { id: "travel", label: "Travel", icon: MapPin },
    { id: "sports", label: "Sports", icon: Users },
    { id: "art", label: "Art & Culture", icon: Sparkles }
  ];

  const potentialMatches = [
    {
      name: "Priya Sharma",
      age: 25,
      location: "Mumbai",
      interests: ["music", "food", "travel"],
      personality: "extrovert",
      lifestyle: "active",
      image: "PS"
    },
    {
      name: "Rahul Verma",
      age: 28,
      location: "Delhi",
      interests: ["reading", "music", "art"],
      personality: "introvert",
      lifestyle: "relaxed",
      image: "RV"
    },
    {
      name: "Ananya Patel",
      age: 26,
      location: "Bangalore",
      interests: ["sports", "travel", "food"],
      personality: "extrovert",
      lifestyle: "active",
      image: "AP"
    },
    {
      name: "Arjun Mehta",
      age: 27,
      location: "Pune",
      interests: ["reading", "art", "music"],
      personality: "ambivert",
      lifestyle: "balanced",
      image: "AM"
    },
    {
      name: "Sneha Iyer",
      age: 24,
      location: "Chennai",
      interests: ["food", "reading", "travel"],
      personality: "introvert",
      lifestyle: "relaxed",
      image: "SI"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(i => i !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const calculateCompatibility = (match) => {
    let score = 0;

    // Interest match (40%)
    const commonInterests = formData.interests.filter(i => match.interests.includes(i));
    score += (commonInterests.length / Math.max(formData.interests.length, 1)) * 40;

    // Personality match (30%)
    if (formData.personality === match.personality) {
      score += 30;
    } else if (formData.personality === "ambivert" || match.personality === "ambivert") {
      score += 20;
    } else {
      score += 10;
    }

    // Lifestyle match (30%)
    if (formData.lifestyle === match.lifestyle) {
      score += 30;
    } else if (formData.lifestyle === "balanced" || match.lifestyle === "balanced") {
      score += 20;
    } else {
      score += 10;
    }

    return Math.min(Math.round(score), 100);
  };

  const findMatches = () => {
    if (!formData.name || !formData.age || formData.interests.length === 0) {
      alert("Please fill in all required fields!");
      return;
    }

    const matchedProfiles = potentialMatches.map(match => ({
      ...match,
      compatibility: calculateCompatibility(match)
    })).sort((a, b) => b.compatibility - a.compatibility);

    setMatches(matchedProfiles);
    setShowResults(true);
  };

  const getCompatibilityColor = (score) => {
    if (score >= 80) return "from-pink-500 to-rose-500";
    if (score >= 60) return "from-purple-500 to-pink-500";
    if (score >= 40) return "from-blue-500 to-purple-500";
    return "from-slate-500 to-blue-500";
  };

  const getCompatibilityLabel = (score) => {
    if (score >= 80) return "Perfect Match!";
    if (score >= 60) return "Great Match";
    if (score >= 40) return "Good Match";
    return "Potential Match";
  };

    return(
       <>
             <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {!showResults ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 border-pink-500/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-foreground" />
                <span className="text-foreground text-sm font-medium">AI-Powered Matchmaking</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                Find Your
                <br />
                <span className="bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
                  Perfect Match
                </span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
                Answer a few questions and discover compatible matches based on your interests and personality.
              </p>
            </div>

            {/* Profile Form */}
            <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-pink-400" />
                <h2 className="text-2xl font-bold text-foreground">Create Your Profile</h2>
              </div>

              <div className="space-y-6">
                {/* Name & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted-foreground text-sm mb-2 block">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm mb-2 block">Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Your age"
                      className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-muted-foreground text-sm mb-2 block">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  />
                </div>

                {/* Interests */}
                {/* <div>
                  <label className="text-muted-foreground text-sm mb-3 block">Interests * (Select at least one)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {interestOptions.map(interest => {
                      const Icon = interest.icon;
                      const isSelected = formData.interests.includes(interest.id);
                      return (
                        <button
                          key={interest.id}
                          onClick={() => toggleInterest(interest.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? "bg-pink-500/20 border-pink-500 text-pink-400"
                              : "bg-card/30 border-input text-muted-foreground hover:border-accent"
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2" />
                          <span className="text-sm font-medium">{interest.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div> */}

{/* Interests */}
<div>
  <label className="text-muted-foreground text-sm mb-3 block">
    Interests <span className="text-red-500">*</span> (Select at least one)
  </label>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {interestOptions.map((interest) => {
      const Icon = interest.icon;
      const isSelected = formData.interests.includes(interest.id);

      return (
        <button
          type="button"
          key={interest.id}
          onClick={() => toggleInterest(interest.id)}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all text-center
            ${
              isSelected
                ? "bg-pink-500/20 border-pink-500 text-pink-400 shadow-md scale-[1.03]"
                : "bg-card/40 border-input text-muted-foreground hover:border-pink-400 hover:text-pink-400"
            }
          `}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          <span className="text-xs sm:text-sm font-medium text-foreground">
            {interest.label}
          </span>
        </button>
      );
    })}
  </div>

  {/* Selected count */}
  <p className="text-xs text-muted-foreground mt-2">
    Selected: {formData.interests.length}
  </p>
</div>



                {/* Personality */}
                <div>
                  <label className="text-muted-foreground text-sm mb-2 block">Personality Type</label>
                  <select
                    name="personality"
                    value={formData.personality}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  >
                    <option value="">Select personality</option>
                    <option value="introvert">Introvert (Prefer quiet time)</option>
                    <option value="extrovert">Extrovert (Love socializing)</option>
                    <option value="ambivert">Ambivert (Mix of both)</option>
                  </select>
                </div>

                {/* Lifestyle */}
                <div>
                  <label className="text-muted-foreground text-sm mb-2 block">Lifestyle</label>
                  <select
                    name="lifestyle"
                    value={formData.lifestyle}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  >
                    <option value="">Select lifestyle</option>
                    <option value="active">Active (Always on the go)</option>
                    <option value="relaxed">Relaxed (Take it easy)</option>
                    <option value="balanced">Balanced (Mix of both)</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  onClick={findMatches}
                  className="w-full bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-500 text-foreground font-semibold px-6 py-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
                >
                  Find My Matches
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Your Matches</h2>
              <p className="text-muted-foreground text-lg">
                Found {matches.length} compatible matches for you!
              </p>
              <button
                onClick={() => setShowResults(false)}
                className="mt-4 text-foreground transition underline  border border-1px solid #000000 rounded-lg px-4 py-2 flex  gap-2"
              >
                ← Edit Profile
              </button>
            </div>

            {/* Match Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl p-6 hover:border-pink-500/50 transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full flex items-center justify-center text-foreground font-bold text-xl shrink-0">
                      {match.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">{match.name}</h3>
                      <p className="text-muted-foreground text-sm">{match.age} years • {match.location}</p>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">Compatibility</span>
                      <span className="text-foreground font-bold">{match.compatibility}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getCompatibilityColor(match.compatibility)} transition-all duration-500`}
                        style={{ width: `${match.compatibility}%` }}
                      />
                    </div>
                    <p className="text-foreground text-sm mt-2 font-medium">
                      {getCompatibilityLabel(match.compatibility)}
                    </p>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.interests.map(interestId => {
                      const interest = interestOptions.find(i => i.id === interestId);
                      const Icon = interest?.icon;
                      const isCommon = formData.interests.includes(interestId);
                      return (
                        <span
                          key={interestId}
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center text-foreground gap-1 ${
                            isCommon
                              ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                              : "bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {Icon && <Icon className="w-3 h-3" />}
                          {interest?.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Details */}
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Personality: <span className="text-foreground capitalize">{match.personality}</span></p>
                    <p>Lifestyle: <span className="text-foreground capitalize">{match.lifestyle}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>


       </>
    )
}
