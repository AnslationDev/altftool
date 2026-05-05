import React, { useState, useEffect } from 'react';
import { Search, Gift, DollarSign, Heart, ShoppingCart, Star } from 'lucide-react';


const OCCASIONS = [
  { id: 1, name: 'Birthday', icon: '🎂' },
  { id: 2, name: 'Anniversary', icon: '💝' },
  { id: 3, name: 'Wedding', icon: '💒' },
  { id: 4, name: 'Graduation', icon: '🎓' },
  { id: 5, name: 'Festival', icon: '🎉' },
  { id: 6, name: 'Valentine\'s Day', icon: '❤️' },
  { id: 7, name: 'Mother\'s Day', icon: '🌸' },
  { id: 8, name: 'Father\'s Day', icon: '👔' },
];

const RELATIONSHIPS = [
  { id: 1, name: 'Spouse/Partner' },
  { id: 2, name: 'Parent' },
  { id: 3, name: 'Child' },
  { id: 4, name: 'Sibling' },
  { id: 5, name: 'Friend' },
  { id: 6, name: 'Colleague' },
  { id: 7, name: 'Grandparent' },
  { id: 8, name: 'Other Family' },
];

const GIFTS_DATABASE = [
  // Birthday gifts
  { id: 1, name: 'Wireless Headphones Premium', price: 89.99, rating: 4.5, reviews: 1234, occasion: 1, relationship: [1, 4, 5], budget: 'medium', image: '🎧', category: 'Electronics', description: 'High-quality noise-cancelling headphones' },
  { id: 2, name: 'Personalized Photo Album', price: 34.99, rating: 4.8, reviews: 856, occasion: 1, relationship: [1, 2, 7], budget: 'low', image: '📸', category: 'Personalized', description: 'Custom photo album with leather cover' },
  { id: 3, name: 'Smartwatch Fitness Tracker', price: 199.99, rating: 4.6, reviews: 2341, occasion: 1, relationship: [1, 4, 5], budget: 'high', image: '⌚', category: 'Electronics', description: 'Track your fitness goals in style' },
  
  // Anniversary gifts
  { id: 4, name: 'Diamond Pendant Necklace', price: 299.99, rating: 4.9, reviews: 456, occasion: 2, relationship: [1], budget: 'high', image: '💎', category: 'Jewelry', description: 'Elegant diamond pendant with certificate' },
  { id: 5, name: 'Romantic Dinner Set for Two', price: 79.99, rating: 4.7, reviews: 623, occasion: 2, relationship: [1], budget: 'medium', image: '🍽️', category: 'Experience', description: 'Premium dinner set with candles' },
  { id: 6, name: 'Couple\'s Spa Package', price: 249.99, rating: 4.8, reviews: 789, occasion: 2, relationship: [1], budget: 'high', image: '🧖', category: 'Experience', description: 'Relaxing spa day for two' },
  
  // Wedding gifts
  { id: 7, name: 'Kitchen Appliance Set', price: 189.99, rating: 4.7, reviews: 934, occasion: 3, relationship: [5, 6, 8], budget: 'high', image: '🍳', category: 'Home', description: 'Complete kitchen starter set' },
  { id: 8, name: 'Luxury Bedding Set', price: 129.99, rating: 4.6, reviews: 567, occasion: 3, relationship: [5, 6, 8], budget: 'medium', image: '🛏️', category: 'Home', description: 'Premium cotton bedding set' },
  { id: 9, name: 'Crystal Wine Glasses Set', price: 69.99, rating: 4.8, reviews: 445, occasion: 3, relationship: [5, 6, 8], budget: 'medium', image: '🥂', category: 'Home', description: 'Elegant crystal stemware' },
  
  // Graduation gifts
  { id: 10, name: 'Professional Briefcase', price: 99.99, rating: 4.5, reviews: 678, occasion: 4, relationship: [3, 4, 5], budget: 'medium', image: '💼', category: 'Fashion', description: 'Leather professional briefcase' },
  { id: 11, name: 'Inspirational Book Collection', price: 45.99, rating: 4.7, reviews: 890, occasion: 4, relationship: [3, 4, 5], budget: 'low', image: '📚', category: 'Books', description: 'Set of motivational books' },
  { id: 12, name: 'Designer Pen Set', price: 149.99, rating: 4.9, reviews: 234, occasion: 4, relationship: [3, 4, 5], budget: 'medium', image: '✒️', category: 'Accessories', description: 'Premium fountain pen set' },
  
  // Christmas gifts
  { id: 13, name: 'Cozy Blanket & Hot Cocoa Set', price: 39.99, rating: 4.6, reviews: 1567, occasion: 5, relationship: [1, 2, 4, 5, 7], budget: 'low', image: '🧣', category: 'Home', description: 'Warm blanket with gourmet cocoa' },
  { id: 14, name: 'Gaming Console', price: 399.99, rating: 4.8, reviews: 3456, occasion: 5, relationship: [1, 3, 4], budget: 'high', image: '🎮', category: 'Electronics', description: 'Latest generation gaming system' },
  { id: 15, name: 'Gourmet Food Basket', price: 79.99, rating: 4.7, reviews: 1234, occasion: 5, relationship: [2, 6, 7, 8], budget: 'medium', image: '🧺', category: 'Food', description: 'Assorted gourmet treats' },
  
  // Valentine's Day
  { id: 16, name: 'Red Roses Bouquet Premium', price: 59.99, rating: 4.9, reviews: 2345, occasion: 6, relationship: [1], budget: 'medium', image: '🌹', category: 'Flowers', description: 'Two dozen premium red roses' },
  { id: 17, name: 'Chocolate & Champagne Set', price: 89.99, rating: 4.8, reviews: 1456, occasion: 6, relationship: [1], budget: 'medium', image: '🍫', category: 'Food', description: 'Luxury chocolates with champagne' },
  { id: 18, name: 'Heart Locket Necklace', price: 129.99, rating: 4.7, reviews: 678, occasion: 6, relationship: [1], budget: 'medium', image: '💝', category: 'Jewelry', description: 'Sterling silver heart locket' },
  
  // Mother's Day
  { id: 19, name: 'Spa Gift Basket', price: 69.99, rating: 4.8, reviews: 1890, occasion: 7, relationship: [2, 7], budget: 'medium', image: '🛁', category: 'Beauty', description: 'Luxurious spa products set' },
  { id: 20, name: 'Birthstone Bracelet', price: 119.99, rating: 4.9, reviews: 567, occasion: 7, relationship: [2, 7], budget: 'medium', image: '💍', category: 'Jewelry', description: 'Personalized birthstone bracelet' },
  { id: 21, name: 'Garden Tool Set Premium', price: 54.99, rating: 4.6, reviews: 789, occasion: 7, relationship: [2, 7], budget: 'medium', image: '🌻', category: 'Garden', description: 'Complete gardening tool set' },
  
  // Father's Day
  { id: 22, name: 'Tool Set Professional Grade', price: 149.99, rating: 4.7, reviews: 2134, occasion: 8, relationship: [2, 7], budget: 'high', image: '🔧', category: 'Tools', description: 'Complete mechanic tool set' },
  { id: 23, name: 'Grilling Accessories Set', price: 79.99, rating: 4.8, reviews: 1456, occasion: 8, relationship: [2, 7], budget: 'medium', image: '🔥', category: 'Outdoor', description: 'Premium BBQ tool set' },
  { id: 24, name: 'Leather Wallet with Engraving', price: 49.99, rating: 4.6, reviews: 890, occasion: 8, relationship: [2, 7], budget: 'low', image: '👛', category: 'Accessories', description: 'Personalized leather wallet' },
  
  // Additional universal gifts
  { id: 25, name: 'Coffee Maker Deluxe', price: 129.99, rating: 4.7, reviews: 2567, occasion: [1, 5], relationship: [1, 2, 5, 6], budget: 'medium', image: '☕', category: 'Home', description: 'Premium coffee brewing system' },
  { id: 26, name: 'Wireless Speaker Portable', price: 69.99, rating: 4.5, reviews: 1678, occasion: [1, 5], relationship: [3, 4, 5], budget: 'medium', image: '🔊', category: 'Electronics', description: 'Waterproof Bluetooth speaker' },
  { id: 27, name: 'Yoga Mat & Accessories', price: 44.99, rating: 4.6, reviews: 1234, occasion: [1, 7], relationship: [1, 2, 5], budget: 'low', image: '🧘', category: 'Fitness', description: 'Premium yoga starter kit' },
  { id: 28, name: 'Board Game Collection', price: 59.99, rating: 4.8, reviews: 1567, occasion: [1, 5], relationship: [3, 5, 8], budget: 'medium', image: '🎲', category: 'Games', description: 'Family game night collection' },
];

export default function GiftPlanner(){
  const [step, setStep] = useState(1);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [budgetRange, setBudgetRange] = useState('medium');
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  //  API call 
  const fetchRecommendations = () => {
    let filtered = GIFTS_DATABASE.filter(gift => {
      const occasionMatch = Array.isArray(gift.occasion) 
        ? gift.occasion.includes(selectedOccasion)
        : gift.occasion === selectedOccasion;
      
      const relationshipMatch = gift.relationship.includes(selectedRelationship);
      const budgetMatch = gift.budget === budgetRange;
      
      return occasionMatch && relationshipMatch && budgetMatch;
    });

    
    if (filtered.length === 0) {
      filtered = GIFTS_DATABASE.filter(gift => {
        const occasionMatch = Array.isArray(gift.occasion) 
          ? gift.occasion.includes(selectedOccasion)
          : gift.occasion === selectedOccasion;
        return occasionMatch;
      }).slice(0, 6);
    }

    setRecommendations(filtered);
  };

  const handleGetRecommendations = () => {
    fetchRecommendations();
    setStep(4);
  };

  const resetSearch = () => {
    setStep(1);
    setSelectedOccasion(null);
    setSelectedRelationship(null);
    setBudgetRange('medium');
    setRecommendations([]);
    setSearchQuery('');
  };

  const getBudgetLabel = (budget) => {
    switch(budget) {
      case 'low': return 'Under $50';
      case 'medium': return '$50 - $150';
      case 'high': return '$150+';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      


  <div>
    <h1 className="heading text-center animate-fade-up pt-12 mt-8">Gift Finder</h1>
    <p className="description text-center animate-fade-up pt-2">Find the perfect gift for your loved ones.</p>
  </div>



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 bg-(--card) text-(--foreground) border border-(--border) rounded-lg mt-8">
        {step < 4 && (
          <div className="mb-8">
            <h2 className="subheading mb-2">Find the Perfect Gift</h2>
            <p className="description">Answer a few questions to get personalized recommendations</p>
          </div>
        )}

        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Occasion</span>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Relationship</span>
              <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Budget</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Step 1: Select Occasion */}
        {step === 1 && (
          <div className="bg-(--card) border border-(--border) text-(--foreground) rounded-lg p-8">
            <h3 className="subheading mb-6">What's the occasion?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {OCCASIONS.map((occasion) => (
                <button
                  key={occasion.id}
                  onClick={() => {
                    setSelectedOccasion(occasion.id);
                    setStep(2);
                  }}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-600 hover:shadow-lg ${
                    selectedOccasion === occasion.id ? 'border-blue-600 bg-yellow-50' : 'border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{occasion.icon}</div>
                  <div className="text-(--foreground) font-semibold">{occasion.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Relationship */}
        {step === 2 && (
          <div className="bg-(--card) border border-(--border) text-(--foreground) rounded-lg p-8">
            <h3 className="subheading mb-6">Who is this gift for?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {RELATIONSHIPS.map((relationship) => (
                <button
                  key={relationship.id}
                  onClick={() => {
                    setSelectedRelationship(relationship.id);
                    setStep(3);
                  }}
                  className={`p-6 border-2 border-(--border) cursor-pointer rounded-lg transition-all hover:border-blue-600 hover:shadow-lg ${
                    selectedRelationship === relationship.id ? 'border-blue-600 bg-yellow-50' : 'border-gray-300'
                  }`}
                >
                  <div className="content">{relationship.name}</div>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setStep(1)}
                className="text-blue-700 hover:text-blue-800 font-medium cursor-pointer"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Budget */}
        {step === 3 && (
          <div className="bg-(--card) border border-(--border) rounded-lg p-8">
            <h3 className="subheading mb-6">What's your budget?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setBudgetRange('low')}
                className={`p-8 border-2 rounded-lg transition-all hover:border-blue-600 hover:shadow-lg ${
                  budgetRange === 'low' ? 'border-blue-600 ' : 'border-(--border)'
                }`}
              >
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="content">Under $50</div>
                <div className="text-(--muted-foreground) text-sm mt-1">Thoughtful & Affordable</div>
              </button>
              <button
                onClick={() => setBudgetRange('medium')}
                className={`p-8 border-2 rounded-lg transition-all hover:border-blue-600 hover:shadow-lg ${
                  budgetRange === 'medium' ? 'border-blue-600 ' : 'border-(--border)'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  {/* <DollarSign className="w-8 h-8 text-yellow-600 -ml-2" /> */}
                </div>
                <div className="content">$50 - $150</div>
                <div className="text-(--foreground) text-sm mt-1">Popular Range</div>
              </button>
              <button
                onClick={() => setBudgetRange('high')}
                className={`p-8 border-2 rounded-lg transition-all hover:border-blue-600 hover:shadow-lg ${
                  budgetRange === 'high' ? 'border-blue-600 ' : 'border-(--border)'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <DollarSign className="w-8 h-8 text-blue-700" />
                  {/* <DollarSign className="w-8 h-8 text-yellow-700 -ml-2" />
                  <DollarSign className="w-8 h-8 text-yellow-700 -ml-2" /> */}
                </div>
                <div className="content">$150+</div>
                <div className=" text-(--foreground) text-sm mt-1">Premium & Luxury</div>
              </button>
            </div>
            <div className="flex justify-between items-center cursor-pointer">
              <button
                onClick={() => setStep(2)}
                className="text-(--primary) hover:text-(--primary) font-medium"
              >
                ← Back
              </button>
              <button
                onClick={handleGetRecommendations}
                className="bg-(--primary) cursor-pointer  text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Get Recommendations
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Show Recommendations */}
        {step === 4 && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="subheading">Your Personalized Gift Recommendations</h3>
                <p className="text-(--foreground) mt-1">
                  {OCCASIONS.find(o => o.id === selectedOccasion)?.name} • {' '}
                  {RELATIONSHIPS.find(r => r.id === selectedRelationship)?.name} • {' '}
                  {getBudgetLabel(budgetRange)}
                </p>
              </div>
              <button
                onClick={resetSearch}
                className="bg-(--primary) border-2 border-(--border)  text-(--foreground) font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
              >
                New Search
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="bg-(--card) border border-(--border) rounded-lg p-8 text-center">
                <p className="description mb-2">No exact matches found</p>
                <p className="text-(--foreground)">Try adjusting your budget or relationship selection</p>
                <button
                  onClick={resetSearch}
                  className="mt-4 bg-(--primary) cursor-pointer  text-white font-bold py-2 px-6 rounded-lg"
                >
                  Start Over
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((gift) => (
                  <div key={gift.id} className="bg-(--card) border border-(--border) rounded-lg hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="text-6xl text-center mb-4">{gift.image}</div>
                      <h4 className="subheading mb-2">{gift.name}</h4>
                      <p className="content mb-3">{gift.description}</p>
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(gift.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-(--foreground) ml-2">
                          {gift.rating} ({gift.reviews.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-(--foreground)">${gift.price}</span>
                        <span className="text-xs bg-(--card) text-(--foreground) px-2 py-1 rounded">{gift.category}</span>
                      </div>
                      <button className="w-full bg-(--primary)  text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        Add to Cart
                      </button>
                      <button className="w-full mt-2 bg-white border border-gray-300 hover:border-gray-400 text-(--primary) font-semibold py-2 px-4 rounded-lg transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

     
    </div>
  );
};

