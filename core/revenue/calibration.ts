export interface CohortCalibrationStats {
  failureCode: string;
  sampleCount: number;
  successfulCount: number;
  failureCount: number;
  predictedProbability: number;
  observedProbability: number;
  status: 'CALIBRATED' | 'INSUFFICIENT_DATA';
}

export class ProbabilityCalibrationEngine {
  private cohortStats: Map<string, { total: number; success: number }> = new Map();

  // Baseline priors per failure code
  private readonly priors: Record<string, number> = {
    BANK_TIMEOUT: 0.68,
    GATEWAY_ERROR: 0.65,
    AUTHENTICATION_ERROR: 0.70,
    CHECKOUT_ABANDONMENT: 0.42,
    UPI_APP_TIMEOUT: 0.75,
    BAD_REQUEST: 0.12,
    CARD_DECLINED: 0.25,
  };

  public recordObservation(failureCode: string, isSuccess: boolean): void {
    const stat = this.cohortStats.get(failureCode) || { total: 0, success: 0 };
    stat.total += 1;
    if (isSuccess) stat.success += 1;
    this.cohortStats.set(failureCode, stat);
  }

  public getCalibratedProbability(failureCode: string): number {
    const prior = this.priors[failureCode] || 0.50;
    const stat = this.cohortStats.get(failureCode);

    if (!stat || stat.total < 10) {
      return prior; // Return prior if sample size is insufficient
    }

    // Bayesian Laplace Smoothing: (successes + 2 * prior) / (total + 2)
    const smoothedProb = (stat.success + 2 * prior) / (stat.total + 2);
    return Number(smoothedProb.toFixed(3));
  }

  public getCalibrationReport(failureCode: string): CohortCalibrationStats {
    const prior = this.priors[failureCode] || 0.50;
    const stat = this.cohortStats.get(failureCode) || { total: 0, success: 0 };
    const observed = stat.total > 0 ? stat.success / stat.total : prior;

    return {
      failureCode,
      sampleCount: stat.total,
      successfulCount: stat.success,
      failureCount: stat.total - stat.success,
      predictedProbability: prior,
      observedProbability: Number(observed.toFixed(3)),
      status: stat.total >= 10 ? 'CALIBRATED' : 'INSUFFICIENT_DATA',
    };
  }

  public getAllCalibrationReports(): CohortCalibrationStats[] {
    const codes = Array.from(new Set([...Object.keys(this.priors), ...Array.from(this.cohortStats.keys())]));
    return codes.map(c => this.getCalibrationReport(c));
  }

  public clear(): void {
    this.cohortStats.clear();
  }
}
