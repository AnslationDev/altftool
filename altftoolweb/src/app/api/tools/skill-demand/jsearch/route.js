import { NextResponse } from 'next/server';
import { requireServerEnv } from '@altftool/core/env';
import { enforceRateLimit, fetchJson, jsonResponse, routeError } from '@altftool/core/http';
import { SERVER_ENV } from '@altftool/core/services';

export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 30,
      scope: 'tools:jsearch',
      windowMs: 60000,
    });
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'search'; // Default to search
    const RAPIDAPI_KEY = requireServerEnv(SERVER_ENV.rapidApi);

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

    const result = await fetchJson(url, {
      method: 'GET',
      headers,
      next: { revalidate: 300 },
      timeoutMs: 10000,
    });

    if (!result.ok) {
      const error = new Error(`JSearch API responded with ${result.status}`);
      error.status = result.status || 502;
      throw error;
    }

    return jsonResponse(NextResponse, result.data, {
      cache: { sMaxage: 300, staleWhileRevalidate: 600 },
    });
  } catch (error) {
    console.error('JSearch proxy error:', error);
    return routeError(NextResponse, error, 'Internal server error');
  }
}
