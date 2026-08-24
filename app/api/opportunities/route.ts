import { NextResponse } from 'next/server';
import { getGlobalPipeline } from '@/core/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pipeline = getGlobalPipeline();
  const opportunities = pipeline.getOpportunities();
  const recommendations = opportunities.map(opp => ({
    opportunity: opp,
    recommendation: pipeline.getRecommendation(opp.id),
    auditRecord: pipeline.getAuditTrail().find(a => a.opportunityId === opp.id),
  }));

  return NextResponse.json({ opportunities: recommendations });
}
