

"use client";

import { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import Features from '../components/Features';

export default function ToolHome() {
  const [panchang, setPanchang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(moment().tz('Asia/Kolkata').format('YYYY-MM-DD'));
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.209, city: 'New Delhi' });
  const [city, setCity] = useState('New Delhi');
  const [error, setError] = useState('');

  const generatePanchangData = (date, lat, lng) => {
    const tithis = [
      'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami',
      'Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Amavasya'
    ];

    const nakshatras = [
      'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
      'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra',
      'Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha',
      'Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
    ];

    const yogas = [
      'Vriddhi','Dhruva','Vyatipata','Parigha','Shiva','Siddha','Sadhya',
      'Shubha','Bhadra','Vriddhi','Dhruva','Vyatipata','Parigha','Shiva',
      'Siddha','Sadhya','Shubha','Bhadra','Vriddhi','Dhruva','Vyatipata',
      'Parigha','Shiva','Siddha','Sadhya','Shubha','Bhadra'
    ];

    const karanas = [
      'Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti',
      'Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti',
      'Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti',
      'Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti',
      'Shakuni','Chatushpada','Naga','Kimstughna'
    ];

    const samvatsaras = [
      'Prabhava','Vibhava','Shukla','Pramodoota','Prajapati','Angirasa',
      'Shrimukha','Bhava','Yuva','Dhatri','Ishvara','Bahudhanya',
      'Pramathi','Vikrama','Vrisha','Chitrabhanu','Subhanu','Tārana',
      'Pārthiva','Vyaya','Sarvajit','Sarvadhārin','Virodhi','Vikriti',
      'Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukha','Hemalambi',
      'Vilambi','Vikāri','Sharvari','Plava','Shubhakrit','Shobhakṛita',
      'Krodhi','Vishvāvasu','Parābhava','Plavanga','Kīlaka','Saumya',
      'Sādhārana','Virodhikṛita','Paridhāvi','Pramādin','Ānanda','Rākshasa',
      'Nala','Pingala','Kālayukti','Siddhārthi','Raudri','Durmati','Dundubhi',
      'Rudhirodgāri','Raktākshī','Krodhana','Akshaya'
    ];

    const maasas = [
      'Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada',
      'Ashwina','Kartika','Margashira','Pausha','Magha','Phalguna'
    ];

    const rituSeasons = ['Vasanta','Grishma','Varsha','Sharad','Hemant','Shishir'];
    const ayanas = ['Uttarayana','Dakshinayana'];

    const dayOfYear = moment(date).dayOfYear();
    const randomIndex = (dayOfYear + Math.floor(lat + lng)) % 100;

    return {
      tithi: tithis[randomIndex % tithis.length],
      nakshatra: nakshatras[randomIndex % nakshatras.length],
      yoga: yogas[randomIndex % yogas.length],
      karana: karanas[randomIndex % karanas.length],
      samvatsara: samvatsaras[randomIndex % samvatsaras.length],
      maasa: maasas[Math.floor(dayOfYear / 30) % maasas.length],
      ritu: rituSeasons[Math.floor(dayOfYear / 60) % rituSeasons.length],
      ayana: ayanas[dayOfYear > 180 ? 1 : 0],
      paksha: randomIndex % 2 === 0 ? 'Shukla' : 'Krishna',
      sunrise: moment(date).add(5 + (lng - 77) * 4 / 60 + Math.random() * 0.5, 'hours').format('hh:mm A'),
      sunset: moment(date).add(18 + (lng - 77) * 4 / 60 + Math.random() * 0.5, 'hours').format('hh:mm A'),
      moonrise: moment(date).add(20 + Math.random() * 4, 'hours').format('hh:mm A'),
      moonset: moment(date).add(8 + Math.random() * 4, 'hours').format('hh:mm A'),
      shubhMuhurat: ['06:15 AM - 07:30 AM','10:00 AM - 11:45 AM','05:30 PM - 06:45 PM'],
      rahuKaal: '04:30 PM - 06:00 PM',
      yamaganda: '07:30 AM - 09:00 AM',
      gulika: '12:00 PM - 01:30 PM',
      abhijit: '11:45 AM - 12:30 PM',
      amritKaal: '08:15 AM - 09:45 AM',
      brahmaMuhurta: '04:00 AM - 05:30 AM',
      pratahSandhya: '05:30 AM - 06:15 AM',
      sayanSandhya: '06:30 PM - 07:15 PM'
    };
  };

  const fetchCityCoordinates = async (cityName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon), city: display_name.split(',')[0] };
      }
      return null;
    } catch (err) {
      console.error('Error fetching coordinates:', err);
      return null;
    }
  };

  const fetchPanchang = async () => {
    setLoading(true);
    setError('');
    try {
      if (city && city !== location.city) {
        const coords = await fetchCityCoordinates(city);
        if (coords) setLocation(coords);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generatePanchangData(date, location.lat, location.lng);
      setPanchang(data);
    } catch (err) {
      console.error('Error fetching panchang:', err);
      setError('Failed to fetch Panchang data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPanchang(); }, []);
  useEffect(() => { if (panchang) fetchPanchang(); }, [date, location]);

  const formatDate = (dateStr) => moment(dateStr).format('dddd, D MMMM YYYY');

  return (
    <div className="min-h-screen bg-(--background) ">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
         
          <h1 className="heading  mb-2 animate-fade-up">
            Panchang Calendar
          </h1>
          <p className="description "></p>
        </header>

        <div className="bg-(--background) rounded-2xl shadow-xl p-6 mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-(--foreground) mb-2">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border-2 bg-(--card) border-(--border) rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-(--foreground) mb-2">Enter City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchPanchang();
                  }
                }}
                placeholder="e.g., Mumbai, New Delhi"
                className="w-full px-4 py-3 border-2 border-(--border) bg-(--card) rounded-xl  focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchPanchang}
                disabled={loading}
                className="w-full bg-(--primary) text-white py-3 border border-(--border) px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Loading...' : 'Get Panchang'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-(--card) border-l-4 border-(--border) p-4 mb-6 max-w-4xl mx-auto rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-(--border) border-t-transparent mb-4"></div>
              <p className="text-(--foreground) text-lg">Loading Panchang data...</p>
            </div>
          </div>
        ) : panchang ? (
          <>
            <div className="bg-(--card) rounded-2xl shadow-xl p-6 mb-8 max-w-4xl mx-auto text-white">
              <div className="text-center">
                <p className="text-(--foreground) mb-2">{formatDate(date)}</p>
                <h2 className="subheading mb-4">{location.city}, India</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-(--card) border border-(--border) text-(--foreground) rounded-xl p-4">
                    <p className="content">Sunrise</p>
                    <p className="text-2xl font-bold">{panchang.sunrise}</p>
                  </div>
                  <div className="bg-(--card) border border-(--border) text-(--foreground) rounded-xl p-4">
                    <p className="content ">Sunset</p>
                    <p className="text-2xl font-bold">{panchang.sunset}</p>
                  </div>
                  <div className="bg-(--card) border border-(--border) text-(--foreground) rounded-xl p-4">
                    <p className="content">Moonrise</p>
                    <p className="text-2xl font-bold">{panchang.moonrise}</p>
                  </div>
                  <div className="bg-(--card) border border-(--border) text-(--foreground) rounded-xl p-4">
                    <p className="content">Moonset</p>
                    <p className="text-2xl font-bold">{panchang.moonset}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-8 ">
              <h3 className="subheading mb-4 flex items-center">
                <span className="w-1 h-6 bg-(--primary) rounded mr-3"></span>
                Basic Panchang
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-(--card) rounded-xl shadow-md p-5 border-t-4 border-blue-500">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-(--foreground) uppercase">Tithi</span>
                  </div>
                  <p className="text-xl font-bold text-(--foreground)">{panchang.tithi}</p>
                  <p className="text-sm text-gray-500">{panchang.paksha} Paksha</p>
                </div>
                <div className="bg-(--card) rounded-xl shadow-md p-5 border-t-4 border-red-500">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-(--foreground) uppercase">Nakshatra</span>
                  </div>
                  <p className="text-xl font-bold text-(--foreground)">{panchang.nakshatra}</p>
                </div>
                <div className="bg-(--card) rounded-xl shadow-md p-5 border-t-4 border-yellow-500">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-(--foreground) uppercase">Yoga</span>
                  </div>
                  <p className="text-xl font-bold text-(--foreground)">{panchang.yoga}</p>
                </div>
                <div className="bg-(--card) rounded-xl shadow-md p-5 border-t-4 border-green-500">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5 5-2.24 5-5zm-5-3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-() uppercase">Karana</span>
                  </div>
                  <p className="text-xl font-bold text-(--foreground)">{panchang.karana}</p>
                </div>
                <div className="bg-(--card) rounded-xl shadow-md p-5 border-t-4 border-purple-500">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-(--foreground) uppercase">Maasa</span>
                  </div>
                  <p className="text-xl font-bold text-(--foreground)">{panchang.maasa}</p>
                  <p className="text-sm text-(--foreground)">{panchang.ritu} Ritu</p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <h3 className="subheading mb-4 flex items-center">
                <span className="w-1 h-6 bg-red-500 rounded mr-3"></span>
                Hindu Calendar Details
              </h3>
              <div className="bg-(--card) rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-(--card) border border-(--border) rounded-lg">
                  <p className="text-sm text-(--foreground) mb-1">Samvatsara</p>
                  <p className="text-lg font-bold text-red-700">{panchang.samvatsara}</p>
                </div>
                <div className="text-center p-4 bg-(--card) border border-(--border) rounded-lg">
                  <p className="text-sm text-(--foreground) mb-1">Ayana</p>
                  <p className="text-lg font-bold text-orange-700">{panchang.ayana}</p>
                </div>
                <div className="text-center p-4 bg-(--card) border border-(--border) rounded-lg">
                  <p className="text-sm text-(--foreground) mb-1">Ritu</p>
                  <p className="text-lg font-bold text-yellow-700">{panchang.ritu}</p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <h3 className="subheading mb-4 flex items-center">
                <span className="w-1 h-6 bg-green-500 rounded mr-3"></span>
                Day Timings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-(--card) rounded-xl shadow-md p-6">
                  <h4 className="text-lg font-semibold text-(--foreground) mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Inauspicious Timings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-gray-700">Rahu Kaal</span>
                      <span className="text-red-600 font-semibold">{panchang.rahuKaal}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-gray-700">Yamaganda</span>
                      <span className="text-red-600 font-semibold">{panchang.yamaganda}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-gray-700">Gulika Kaal</span>
                      <span className="text-red-600 font-semibold">{panchang.gulika}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-(--card) rounded-xl shadow-md p-6">
                  <h4 className="subheading mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Auspicious Timings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Abhijit Muhurat</span>
                      <span className="text-green-600 font-semibold">{panchang.abhijit}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Amrit Kaal</span>
                      <span className="text-green-600 font-semibold">{panchang.amritKaal}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Brahma Muhurta</span>
                      <span className="text-green-600 font-semibold">{panchang.brahmaMuhurta}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <h3 className="subheading mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-500 rounded mr-3"></span>
                Shubh Muhurat (Auspicious Periods)
              </h3>
              <div className="bg-(--card) rounded-xl shadow-md p-6">  
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {panchang.shubhMuhurat.map((muhurat, index) => (
                    <div key={index} className="flex items-center p-4 bg-(--card) rounded-lg border border-purple-100">
                      <svg className="w-6 h-6 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-(--foreground) font-semibold">{muhurat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <h3 className="subheading mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-500 rounded mr-3"></span>
                Sandhya Timings
              </h3>
              <div className="bg-(--card)  rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center border border-(--border) p-4 text-(--foreground)  rounded-lg">
                  <div className="w-12 h-12 bg-linear-to-br from-red-400 to-yellow-400 border border-(--border) rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-(--foreground)">Pratah Sandhya</p>
                    <p className="text-lg font-bold text-(--foregroundd)">{panchang.pratahSandhya}</p>
                  </div>
                </div>
                <div className="flex items-center border border-(--border) p-4 text-(--foreground)  rounded-lg">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-(--foreground)">Sayan Sandhya</p>
                    <p className="text-lg font-bold text-(--foregroundd)">{panchang.sayanSandhya}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      <Features/>

        {/* <footer className="text-center py-8 text-gray-500">
          <p className="mb-2">Panchang data is calculated based on astronomical algorithms and geographical location.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              Sunrise/Sunset
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Moonrise/Moonset
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Auspicious
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Inauspicious
            </span>
          </div>
        </footer> */}
      </div>
    </div>
  );
}
