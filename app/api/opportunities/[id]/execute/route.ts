import { NextRequest, NextResponse } from 'next/server';
import { getGlobalPipeline } from '@/core/pipeline';
import { globalAuthManager } from '@/core/auth/manager';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const opportunityId = params.id;
  const pipeline = getGlobalPipeline();

  // 1. Server-side Authentication & RBAC Enforcement
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const user = globalAuthManager.authenticateSession(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Valid authentication token required.' },
      { status: 401 }
    );
  }

  if (!globalAuthManager.hasPermission(user, 'opportunities:execute')) {
    return NextResponse.json(
      { error: `Forbidden: Role '${user.role}' lacks 'opportunities:execute' permission.` },
      { status: 403 }
    );
  }

  // 2. Validate opportunity presence
  const opportunity = pipeline.getOpportunity(opportunityId);
  if (!opportunity) {
    return NextResponse.json(
      { error: `Opportunity ${opportunityId} not found.` },
      { status: 404 }
    );
  }

  // 3. Server-side policy status validation: only ESCALATED opportunities can be manually executed
  if (opportunity.status !== 'ESCALATED') {
    return NextResponse.json(
      { error: `Invalid action: Opportunity is in status '${opportunity.status}'. Only 'ESCALATED' opportunities can be manually executed.` },
      { status: 400 }
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
    message: `Opportunity approved and executed by ${user.name} (${user.role}) via Razorpay Payment Links API.`,
    opportunity: updatedOpp,
    auditRecord,
  });
}
