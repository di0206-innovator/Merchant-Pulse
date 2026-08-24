import { NextRequest, NextResponse } from 'next/server';
import { getGlobalPipeline } from '@/core/pipeline';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const opportunityId = params.id;
  const pipeline = getGlobalPipeline();

  const success = await pipeline.approveEscalatedOpportunity(opportunityId);
  if (!success) {
    return NextResponse.json(
      { error: 'Failed to approve or execute opportunity. Ensure opportunity is in ESCALATED state.' },
      { status: 400 }
    );
  }

  const updatedOpp = pipeline.getOpportunity(opportunityId);
  const auditRecord = pipeline.getAuditTrail().find(a => a.opportunityId === opportunityId);

  return NextResponse.json({
    success: true,
    message: 'Opportunity approved and executed via Razorpay Payment Links API.',
    opportunity: updatedOpp,
    auditRecord,
  });
}
