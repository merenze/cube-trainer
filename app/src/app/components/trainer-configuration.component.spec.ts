import { TestBed } from '@angular/core/testing';
import { TrainerConfigurationComponent } from './trainer-configuration.component';
import { TrainerConfigurationService } from '../services/trainer-configuration.service';
import { CANONICAL_RECOGNITION_GROUPS } from '../domain/recognition-groups';

describe('TrainerConfigurationComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<TrainerConfigurationComponent>>;
  let configService: TrainerConfigurationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerConfigurationComponent],
      providers: [TrainerConfigurationService],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainerConfigurationComponent);
    configService = TestBed.inject(TrainerConfigurationService);
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a chip for each of the 24 canonical recognition groups', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const chips = fixture.nativeElement.querySelectorAll('[data-group-chip]');
    expect(chips.length).toBe(24);
  });

  it('should display both ordered pattern labels on each chip', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const chips: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('[data-group-chip]');
    const chip = chips[0];
    const group = CANONICAL_RECOGNITION_GROUPS[0];

    expect(chip.textContent).toContain(group.leftPattern);
    expect(chip.textContent).toContain(group.rightPattern);
  });

  it('should show 7 chips as active by default (single-candidate groups pre-enabled)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const activeChips = fixture.nativeElement.querySelectorAll('[data-group-chip][aria-pressed="true"]');
    expect(activeChips.length).toBe(7);
  });

  it('should mark a chip as active when its group is enabled', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const chip = fixture.nativeElement.querySelector(`[data-group-key="${group.key}"]`);
    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });

  it('should enable a group when its chip is clicked while disabled', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS.find(g => g.candidates.length > 1)!;
    fixture.detectChanges();
    await fixture.whenStable();

    const chip: HTMLElement = fixture.nativeElement.querySelector(`[data-group-key="${group.key}"]`);
    chip.click();
    fixture.detectChanges();

    expect(configService.enabledGroupKeys()).toContain(group.key);
  });

  it('should disable a group when its chip is clicked while enabled', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const chip: HTMLElement = fixture.nativeElement.querySelector(`[data-group-key="${group.key}"]`);
    chip.click();
    fixture.detectChanges();

    expect(configService.enabledGroupKeys()).not.toContain(group.key);
  });

  it('should keep other groups unchanged when one chip is toggled', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    const group0 = CANONICAL_RECOGNITION_GROUPS[0];
    const group1 = CANONICAL_RECOGNITION_GROUPS[1];
    configService.enableGroup(group1.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const chip: HTMLElement = fixture.nativeElement.querySelector(`[data-group-key="${group0.key}"]`);
    chip.click();
    fixture.detectChanges();

    expect(configService.enabledGroupKeys()).toContain(group0.key);
    expect(configService.enabledGroupKeys()).toContain(group1.key);
  });

  // Candidate chip tests
  it('should show no candidate chips when no groups are enabled', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    fixture.detectChanges();
    await fixture.whenStable();

    const candidateChips = fixture.nativeElement.querySelectorAll('[data-candidate-chip]');
    expect(candidateChips.length).toBe(0);
  });

  it('should show candidate chips for an enabled group', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const candidateChips = fixture.nativeElement.querySelectorAll('[data-candidate-chip]');
    expect(candidateChips.length).toBe(group.candidates.length);
  });

  it('should display the candidate PLL name on each candidate chip', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    for (const candidate of group.candidates) {
      const chip = fixture.nativeElement.querySelector(
        `[data-group-key="${group.key}"] ~ [data-candidate-chip][data-candidate="${candidate}"]`,
      ) ?? fixture.nativeElement.querySelector(`[data-candidate="${candidate}"]`);
      expect(chip).not.toBeNull();
    }
  });

  it('should show all candidate chips as enabled by default', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const candidateChips = fixture.nativeElement.querySelectorAll('[data-candidate-chip]');
    for (const chip of candidateChips) {
      expect(chip.getAttribute('aria-pressed')).toBe('true');
    }
  });

  it('should disable a candidate when its chip is clicked while enabled', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const candidate = group.candidates[0];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const chip: HTMLElement = fixture.nativeElement.querySelector(`[data-candidate="${candidate}"]`);
    chip.click();
    fixture.detectChanges();

    expect(configService.enabledCandidateKeys(group.key)).not.toContain(candidate);
  });

  it('should re-enable a candidate when its chip is clicked while disabled', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS.find(g => g.candidates.length > 1)!;
    const candidate = group.candidates[0];
    configService.enableGroup(group.key);
    configService.disableCandidate(group.key, candidate);
    fixture.detectChanges();
    await fixture.whenStable();

    const chip: HTMLElement = fixture.nativeElement.querySelector(`[data-candidate="${candidate}"]`);
    chip.click();
    fixture.detectChanges();

    expect(configService.enabledCandidateKeys(group.key)).toContain(candidate);
  });

  it('should not show candidate chips for disabled groups', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    const group0 = CANONICAL_RECOGNITION_GROUPS[0];
    const group1 = CANONICAL_RECOGNITION_GROUPS[1];
    configService.enableGroup(group0.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const allCandidateChips = fixture.nativeElement.querySelectorAll('[data-candidate-chip]');
    expect(allCandidateChips.length).toBe(group0.candidates.length);

    // group1 candidates must not appear
    for (const candidate of group1.candidates) {
      if (!group0.candidates.includes(candidate)) {
        expect(
          fixture.nativeElement.querySelector(`[data-candidate="${candidate}"]`),
        ).toBeNull();
      }
    }
  });
});
