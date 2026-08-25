import { NextRequest, NextResponse } from 'next/server';
import { getGlobalPipeline } from '@/core/pipeline';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const opportunityId = params.id;
  const pipeline = getGlobalPipeline();

  const opportunity = pipeline.getOpportunity(opportunityId);
  if (!opportunity) {
    return NextResponse.json(
      { error: `Opportunity ${opportunityId} not found.` },
      { status: 404 }
    );
  }

  // Server-side authorization & policy status validation
  if (opportunity.status !== 'ESCALATED') {
    return NextResponse.json(
      { error: `Invalid action: Opportunity is in status '${opportunity.status}'. Only 'ESCALATED' opportunities can be manually executed.` },
      { status: 403 }
    );
  }

  const now = Math.floor(Date.now() / 1000);
  if (opportunity.updatedAt && (now - opportunity.updatedAt > 86400 * 7)) {
    return NextResponse.json(
      { error: 'Opportunity has expired for human approval.' },
      { status: 400 }
    );
  }

  const success = await pipeline.approveEscalatedOpportunity(opportunityId);
  if (!success) {
    return NextResponse.json(
      { error: 'Execution engine failed to approve and dispatch opportunity.' },
      { status: 500 }
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
