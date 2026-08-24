import { NextRequest, NextResponse } from 'next/server';
import { getGlobalPipeline } from '@/core/pipeline';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const opportunityId = params.id;
  const pipeline = getGlobalPipeline();
  const decision = pipeline.getAuditTrail().find(a => a.opportunityId === opportunityId);

  if (!decision || !decision.executedActionId) {
    return NextResponse.json(
      { error: 'No active Razorpay payment link found for this opportunity. Execute it first.' },
      { status: 400 }
    );
  }

  const success = pipeline.handlePaymentLinkOutcome(
    decision.executedActionId,
    'paid',
    decision.deterministicMetrics.amountPaise,
    `evt_sim_${Date.now()}`
  );

  return NextResponse.json({
    success,
    message: `Payment Link ${decision.executedActionId} paid. Closed-loop outcome attributed to decision ${decision.decisionId}.`,
    opportunity: pipeline.getOpportunity(opportunityId),
    metrics: pipeline.getMetrics(),
  });
}
