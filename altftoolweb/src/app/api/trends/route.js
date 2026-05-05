import { NextResponse } from 'next/server';
import { enforceRateLimit, jsonResponse } from '@altftool/core/http';
import googleTrends from 'google-trends-api';

export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 30,
      scope: 'tools:trends',
      windowMs: 60000,
    });
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const skill = (searchParams.get('skill') || '').trim();
    const country = (searchParams.get('country') || '').trim();

    if (!skill) return NextResponse.json({ error: 'Missing skill' }, { status: 400 });

    // geo param: use country code if provided, else global
    const geo = country && country.length === 2 ? country.toUpperCase() : country || '';

    const now = new Date();
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const resText = await googleTrends.interestOverTime({
      keyword: skill,
      startTime: lastYear,
      endTime: now,
      geo,
    });

    if (!resText || typeof resText !== 'string' || resText.trim().startsWith('<')) {
      console.error('Google Trends returned non-JSON response:', resText.slice(0, 100));
      return NextResponse.json({ error: 'Google Trends is currently unavailable (rate limited). Please try again later.' }, { status: 503 });
    }

    let data;
    try {
      data = JSON.parse(resText);
    } catch (parseErr) {
      console.error('Failed to parse Google Trends response:', parseErr);
      return NextResponse.json({ error: 'Invalid response from Google Trends.' }, { status: 502 });
    }

    const timeline = data?.default?.timelineData || [];

    const labels = timeline.map(t => t.formattedTime || new Date(Number(t.time) * 1000).toISOString().slice(0,10));
    const values = timeline.map(t => (Array.isArray(t.value) ? t.value[0] : Number(t.value) || 0));

    // compute simple percentage change over period
    const first = values.length ? Number(values[0]) : 0;
    const last = values.length ? Number(values[values.length - 1]) : 0;
    const percentageChange = first ? ((last - first) / Math.max(1, first)) * 100 : 0;

    return jsonResponse(NextResponse, {
      skill,
      country: geo || 'global',
      labels,
      values,
      timelineData: timeline,
      percentageChange: Number(percentageChange.toFixed(2)),
      lastUpdated: now.toISOString(),
      averageInterest: values.length ? (values.reduce((a,b)=>a+b,0)/values.length) : 0,
    }, {
      cache: { sMaxage: 300, staleWhileRevalidate: 600 },
    });
  } catch (err) {
    console.error('Trends API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch trends' }, { status: 500 });
  }
}
