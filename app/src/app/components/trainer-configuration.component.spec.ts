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

  it('should show chips as inactive by default (no groups enabled)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const activeChips = fixture.nativeElement.querySelectorAll('[data-group-chip][aria-pressed="true"]');
    expect(activeChips.length).toBe(0);
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
    fixture.detectChanges();
    await fixture.whenStable();

    const group = CANONICAL_RECOGNITION_GROUPS[0];
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
});
