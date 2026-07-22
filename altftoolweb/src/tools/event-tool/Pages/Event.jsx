import React, { useState } from 'react';
import { Calendar, Clock, Users, Search, ExternalLink } from 'lucide-react';

const Event = ({ isDark }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState({ events: [], births: [], deaths: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { name: 'Events', key: 'events', icon: Calendar, color: '#6366f1' },
    { name: 'Births', key: 'births', icon: Users, color: '#ec4899' },
    { name: 'Deaths', key: 'deaths', icon: Clock, color: '#8b5cf6' },
  ];

  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const fetchHistoricalEvents = async () => {
  if (!selectedDate) {
    setError('Please select a date');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const [year, month, day] = selectedDate.split('-');
    const API_KEY = "7B2CcykLdNlyXOR+OG2qgw==1qihR8mLJaQO0lnb";

    const url = `https://api.api-ninjas.com/v1/historicalevents?year=${year}&month=${parseInt(
      month
    )}&day=${parseInt(day)}`;

    const response = await fetch(url, {
      headers: {
        "X-Api-Key": API_KEY,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch events");

    const data = await response.json();

    const formattedEvents = {
      events:
        data.slice(0, 15).map((event) => ({
          year: event.year,
          text: event.event,
          pages: [], // API does not provide wiki pages
        })) || [],
      births: [],
      deaths: [],
    };

    setEvents(formattedEvents);
  } catch (err) {
    console.error("Error fetching events:", err);
    setError("Failed to fetch historical events. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleRefresh=()=>{
    setSelectedDate('');
    setEvents({events:[],births:[],deaths:[]});

    setError('');
    setLoading(false);
  }








  return (
    <section style={{ padding: '40px 24px', minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          Explore Historical Events
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: isDark ? '#94a3b8' : '#64748b',
            marginBottom: '48px',
            fontSize: '1.1rem',
          }}
        >
          Select any date to discover what happened on that day throughout history
        </p>

        {/* Date Picker */}
        <div
          style={{
            maxWidth: '700px',
            margin: '0 auto 48px',
            padding: '32px',
            background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '16px',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '16px',
              textAlign: 'center',
              color:  '#1e293b',
            }}
          >
            Choose a Date
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getTodayFormatted()}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '14px 16px',
                fontSize: '1rem',
                borderRadius: '10px',
                border:  'rgba(0,0,0,0.2)',
                background: '#cbd5e1 ',
                color:  'black',
              }}
            />
            <button
              onClick={fetchHistoricalEvents}
              disabled={!selectedDate || loading}
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '10px',
                background:
                  !selectedDate || loading
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                color: 'white',
                cursor: !selectedDate || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (selectedDate && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>

<button
  onClick={handleRefresh}
  style={{
    padding: '14px 20px',
    fontSize: '1rem',
    fontWeight: 600,
    border: '1px solid #cbd5f5',
    borderRadius: '10px',
    background: 'transparent',
    cursor: 'pointer',
    color: isDark ? '#e2e8f0' : '#1e293b',
  }}
>
  🔄 Refresh
</button>









          </div>
          {selectedDate && (
            <p
              style={{
                marginTop: '16px',
                textAlign: 'center',
                color: isDark ? '#94a3b8' : '#64748b',
              }}
            >
              Exploring events from <strong>{formatDateDisplay(selectedDate)}</strong>
            </p>
          )}
          {error && (
            <p style={{ marginTop: '16px', textAlign: 'center', color: '#ef4444' }}>{error}</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #6366f1',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px',
              }}
            />
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.1rem' }}>
              Searching through the annals of history...
            </p>
            <style>
              {`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}

        {/* Results */}
        {!loading && events.events.length > 0 && (
          <div>
            {categories.map((category) => {
              const categoryEvents = events[category.key];
              if (!categoryEvents || categoryEvents.length === 0) return null;

              return (
                <div key={category.name} style={{ marginBottom: '48px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '24px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <category.icon size={24} color="white" />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                      {category.name}
                    </h3>
                    <span
                      style={{
                        padding: '4px 12px',
                        background: isDark
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    >
                      {categoryEvents.length}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {categoryEvents.map((event, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '24px',
                          background: isDark
                            ? 'rgba(30, 41, 59, 0.6)'
                            : 'rgba(255, 255, 255, 0.9)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(8px)';
                          e.currentTarget.style.boxShadow = `0 4px 16px ${category.color}30`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div
                            style={{
                              padding: '8px 16px',
                              background: `${category.color}20`,
                              borderRadius: '8px',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              color: category.color,
                              minWidth: '80px',
                              textAlign: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {event.year}
                          </div>
                          <div style={{ flex: 1, minWidth: '250px' }}>
                            <p
                              style={{
                                fontSize: '1.05rem',
                                lineHeight: 1.6,
                                margin: 0,
                                marginBottom: '12px',
                              }}
                            >
                              {event.text}
                            </p>
                            {event.pages && event.pages.length > 0 && (
                              <a
                                href={`https://en.wikipedia.org/wiki/${event.pages[0].titles.canonical}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: category.color,
                                  textDecoration: 'none',
                                  fontSize: '0.95rem',
                                  fontWeight: 600,
                                  transition: 'gap 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.gap = '8px';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.gap = '4px';
                                }}
                              >
                                Learn more
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.events.length === 0 && selectedDate && (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 32px',
              background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '16px',
            }}
          >
            <Calendar
              size={64}
              style={{ margin: '0 auto 24px', opacity: 0.3, display: 'block' }}
            />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>
              No Events Found
            </h3>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Try selecting a different date to explore historical events.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !selectedDate && (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 32px',
              background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              borderRadius: '16px',
            }}
          >
            <Calendar
              size={80}
              style={{
                margin: '0 auto 24px',
                opacity: 0.3,
                display: 'block',
                color:  'black',
              }}
            />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>
              Select a Date to Begin
            </h3>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.05rem' }}>
              Choose any date from the calendar above to discover historical events, births, and
              deaths from that day throughout history.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Event;
