import { TestBed } from '@angular/core/testing';
import { SessionStatisticsService } from './session-statistics.service';

describe('SessionStatisticsService', () => {
  let service: SessionStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SessionStatisticsService] });
    service = TestBed.inject(SessionStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with zero counts', () => {
    expect(service.firstTryCorrectCount()).toBe(0);
    expect(service.totalRoundsCompleted()).toBe(0);
  });

  it('should increment total rounds on each recordRoundComplete call', () => {
    service.recordRoundComplete(true);
    service.recordRoundComplete(false);
    service.recordRoundComplete(true);

    expect(service.totalRoundsCompleted()).toBe(3);
  });

  it('should increment first-try-correct only when firstTryCorrect is true', () => {
    service.recordRoundComplete(true);
    service.recordRoundComplete(false);
    service.recordRoundComplete(true);

    expect(service.firstTryCorrectCount()).toBe(2);
  });

  it('should not increment first-try-correct when firstTryCorrect is false', () => {
    service.recordRoundComplete(false);
    service.recordRoundComplete(false);

    expect(service.firstTryCorrectCount()).toBe(0);
    expect(service.totalRoundsCompleted()).toBe(2);
  });

  it('should reset all counts to zero', () => {
    service.recordRoundComplete(true);
    service.recordRoundComplete(true);

    service.reset();

    expect(service.firstTryCorrectCount()).toBe(0);
    expect(service.totalRoundsCompleted()).toBe(0);
  });
});
