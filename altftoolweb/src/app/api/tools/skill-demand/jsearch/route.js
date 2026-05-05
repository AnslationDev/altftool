import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'search'; // Default to search
    //const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY;
    const RAPIDAPI_KEY = "024ec09e80mshd1d6254a1174a76p1d7828jsnaba17b6410c3";

    if (!RAPIDAPI_KEY) {
      return NextResponse.json({ error: 'RAPIDAPI_KEY is not configured on the server.' }, { status: 500 });
    }

    let url;
    const headers = {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'jsearch.p.rapidapi.com'
    };

    if (type === 'salary') {
      // company-job-salary endpoint
      const company = searchParams.get('company') || 'Amazon';
      const jobTitle = searchParams.get('job_title') || 'Software Engineer';
      url = new URL('https://jsearch.p.rapidapi.com/company-job-salary');
      url.searchParams.append('company', company);
      url.searchParams.append('job_title', jobTitle);
      url.searchParams.append('location_type', 'ANY');
      url.searchParams.append('years_of_experience', 'ALL');
    } else {
      // Standard search endpoint
      const skill = (searchParams.get('skill') || '').trim();
      const countryCode = (searchParams.get('country') || 'us').trim().toLowerCase();
      const remote = searchParams.get('remote') === 'true';
      const fullTime = searchParams.get('fullTime') === 'true';

      const countryMap = {
        'in': 'India',
        'us': 'USA',
        'gb': 'United Kingdom',
        'ca': 'Canada',
        'de': 'Germany',
        'au': 'Australia'
      };

      const countryName = countryMap[countryCode] || countryCode.toUpperCase();

      if (!skill) return NextResponse.json({ error: 'Missing skill parameter' }, { status: 400 });

      url = new URL('https://jsearch.p.rapidapi.com/search');
      
      // Even more aggressive location forcing for JSearch
      const query = `${skill} jobs in ${countryName}, ${countryName}`;

      url.searchParams.append('query', query);
      url.searchParams.append('page', '1');
      url.searchParams.append('num_pages', '1');
      if (remote) url.searchParams.append('remote_jobs_only', 'true');
      if (fullTime) url.searchParams.append('employment_types', 'FULLTIME');
    }

    const response = await fetch(url.toString(), { method: 'GET', headers });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`JSearch API responded with ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('JSearch proxy error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
