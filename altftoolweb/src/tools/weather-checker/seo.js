const seo = {
  title: "Weather Checker — Live Temperature & Wind by City",
  h1: "Weather Checker",
  metaDescription:
    "Check live weather for any city or your current location — temperature, wind speed and sky conditions from the Open-Meteo API. No API key, no signup.",
  intro:
    "The Weather Checker reads current conditions for any city in the world straight from the Open-Meteo API. Typing a city name sends it to Open-Meteo's geocoding endpoint, which returns the best-matching place with its latitude, longitude and country; those coordinates then go to the forecast endpoint with `current_weather=true` and `timezone=auto`, so the reading you see is timestamped in that location's own time zone. You can skip typing entirely: on load the page asks the browser's Geolocation API for your position and reverse-geocodes it to a place name. Everything runs client-side in your browser — there is no AltFTool account, no API key and no server of ours between you and the weather data.",
  useCases: [
    "Deciding whether you need a jacket or umbrella before you walk out the door",
    "Checking conditions in a city you are travelling to before you finish packing",
    "Confirming wind speed in km/h before cycling, running or flying a drone",
  ],
  benefits: [
    [
      "No key, no account",
      "Open-Meteo's public endpoints are called directly from the page, so there is nothing to sign up for and no API key to paste in.",
    ],
    [
      "Worldwide city search",
      "Any place in Open-Meteo's geocoding index resolves to coordinates, and the result is labelled with its country so you can confirm you got the right Springfield.",
    ],
    [
      "One-tap local weather",
      "The browser Geolocation API fills in your position and reverse-geocodes it to a place name — deny the prompt and city search still works normally.",
    ],
    [
      "Conditions in plain English",
      "The WMO weather code returned by the API is decoded into readable labels like Partly cloudy, Heavy rain or Thunderstorm instead of a bare number.",
    ],
  ],
  faqs: [
    [
      "How do I check the weather in my city right now?",
      "Type the city name in the search box and press Search. The tool sends that name to Open-Meteo's geocoding endpoint, takes the top match's latitude and longitude, then requests the current conditions for those coordinates — two requests that normally resolve in under a second. The result shows the matched city and country, so you can confirm it picked the place you meant.",
    ],
    [
      "Is this weather checker free, and do I need an account or an API key?",
      "Yes, it's free, and no — there's no account, no API key and no usage limit imposed by this page. The tool calls Open-Meteo's public endpoints directly from your browser, so there is no AltFTool login or backend in the request path.",
    ],
    [
      "Why does the page ask for my location?",
      "So it can show your local weather without you typing anything. On load it calls the browser's Geolocation API; if you allow it, your coordinates are sent to Open-Meteo to reverse-geocode the place name and fetch current conditions. AltFTool does not receive or store those coordinates. If you deny the prompt, nothing breaks — just search by city name instead.",
    ],
    [
      "Can I switch the temperature to Fahrenheit?",
      "No, readings currently display in Celsius and wind speed in km/h. To convert manually, multiply the Celsius figure by 9/5 and add 32 (28 °C = 82.4 °F), and divide km/h by 1.609 for mph (20 km/h ≈ 12.4 mph).",
    ],
    [
      "Where does the weather data come from and how current is it?",
      "From Open-Meteo's forecast API, using its `current_weather` block with `timezone=auto`, which is built on numerical models published by national meteorological services and refreshed on an hourly cycle. Each search fetches live values rather than reusing an earlier result. If you use the location button, the browser may return a position cached for up to 60 seconds.",
    ],
    [
      "What does \"City not found\" mean when I search?",
      "It means the geocoding lookup returned zero matches for the text you typed. Try the common English spelling, drop abbreviations and postal codes, or search the nearest larger town — very small settlements are often missing from the index. Because only the single best match is used, ambiguous names can also resolve to another country, which the country label next to the city name will reveal.",
    ],
    [
      "What do labels like \"Overcast\" or \"Slight rain showers\" actually mean?",
      "They are WMO weather codes from the API translated into plain English. Code 0 is a clear sky, 1–3 run from mainly clear to overcast, 45–48 is fog, 51–57 drizzle, 61–67 rain, 71–77 snow, 80–82 rain showers, and 95 and above indicates a thunderstorm.",
    ],
  ],
  steps: [
    "Allow the location prompt when the page loads to see weather where you are, or skip it and type a city name in the search box.",
    "Press Search — the city is matched to coordinates via Open-Meteo geocoding, then its current conditions are fetched.",
    "Read the temperature in °C, wind speed in km/h and the sky-condition label, with the matched city and country shown alongside.",
  ],
};

export default seo;
