// import { NextResponse } from 'next/server';
// import { getSkillInsights } from '@/tools/skill-demand-analyzer/services/geminiService';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const skill = (body?.skill || '').toString().trim();
//     if (!skill) return NextResponse.json({ error: 'Missing skill' }, { status: 400 });

//     const insights = await getSkillInsights(skill, { timeoutMs: 40000 });

//     return NextResponse.json({ aiSummary: insights.summary || '', insights }, { status: 200 });
//   } catch (err) {
//     console.error('Analyze API error:', err);
//     if (err?.isConfigError) {
//       return NextResponse.json({ aiUnavailable: true, aiError: err.message }, { status: 500 });
//     }
//     return NextResponse.json({ aiUnavailable: true, aiError: err.message || 'AI request failed' }, { status: 500 });
//   }
// }
