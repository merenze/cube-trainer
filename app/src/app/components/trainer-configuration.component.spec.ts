import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TrainerConfigurationComponent } from './trainer-configuration.component';
import { TrainerConfigurationService } from '../services/trainer-configuration.service';
import { CANONICAL_RECOGNITION_GROUPS } from '../domain/recognition-groups';

function checkGroupRow(fixture: any, groupKey: string): HTMLElement {
  return fixture.nativeElement.querySelector(`[data-group-row="${groupKey}"]`) as HTMLElement;
}

function groupCheckboxInput(row: HTMLElement): HTMLInputElement {
  return row.querySelector('input[type="checkbox"]') as HTMLInputElement;
}

function clickCheckbox(row: HTMLElement, fixture: any): void {
  const label = row.querySelector('mat-checkbox label') as HTMLElement;
  label.click();
  fixture.detectChanges();
}

describe('TrainerConfigurationComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<TrainerConfigurationComponent>>;
  let configService: TrainerConfigurationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerConfigurationComponent],
      providers: [TrainerConfigurationService, provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainerConfigurationComponent);
    configService = TestBed.inject(TrainerConfigurationService);
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  // ─── Group list rendering ───────────────────────────────────────────────

  it('should render a row for each of the 24 canonical recognition groups', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const rows = fixture.nativeElement.querySelectorAll('[data-group-row]');
    expect(rows.length).toBe(24);
  });

  it('should display left and right pattern labels in each row', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const row = checkGroupRow(fixture, group.key);

    expect(row.textContent).toContain(group.leftPattern);
    expect(row.textContent).toContain(group.rightPattern);
  });

  it('should show 7 checkboxes as checked by default', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const checkedInputs = fixture.nativeElement.querySelectorAll(
      '[data-group-row] input[type="checkbox"]:checked',
    );
    expect(checkedInputs.length).toBe(7);
  });

  it('should show checkbox as checked when group is enabled', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[7]; // first multi-candidate group
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const row = checkGroupRow(fixture, group.key);
    expect(groupCheckboxInput(row).checked).toBe(true);
  });

  it('should show checkbox as unchecked when group is disabled', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[7];
    fixture.detectChanges();
    await fixture.whenStable();

    const row = checkGroupRow(fixture, group.key);
    expect(groupCheckboxInput(row).checked).toBe(false);
  });

  it('should enable a group when its checkbox is clicked while unchecked', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[7];
    fixture.detectChanges();
    await fixture.whenStable();

    clickCheckbox(checkGroupRow(fixture, group.key), fixture);

    expect(configService.enabledGroupKeys()).toContain(group.key);
  });

  it('should disable a group when its checkbox is clicked while checked', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[0]; // pre-enabled
    fixture.detectChanges();
    await fixture.whenStable();

    clickCheckbox(checkGroupRow(fixture, group.key), fixture);

    expect(configService.enabledGroupKeys()).not.toContain(group.key);
  });

  it('should keep other groups unchanged when one checkbox is toggled', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    const group0 = CANONICAL_RECOGNITION_GROUPS[0];
    const group1 = CANONICAL_RECOGNITION_GROUPS[1];
    configService.enableGroup(group1.key);
    fixture.detectChanges();
    await fixture.whenStable();

    clickCheckbox(checkGroupRow(fixture, group0.key), fixture);

    expect(configService.enabledGroupKeys()).toContain(group0.key);
    expect(configService.enabledGroupKeys()).toContain(group1.key);
  });

  // ─── Single-candidate chips (always visible in row) ─────────────────────

  it('should show a case chip in the row for single-candidate groups', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const group = CANONICAL_RECOGNITION_GROUPS[0]; // None | 3-bar → F
    const row = checkGroupRow(fixture, group.key);
    const chip = row.querySelector('[data-candidate-chip]') as HTMLElement;

    expect(chip).not.toBeNull();
    expect(chip.textContent?.trim()).toBe(group.candidates[0]);
  });

  it('should show single-candidate chip as active when group is enabled', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const group = CANONICAL_RECOGNITION_GROUPS[0]; // pre-enabled
    const row = checkGroupRow(fixture, group.key);
    const chip = row.querySelector('[data-candidate-chip]') as HTMLElement;

    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });

  it('should show single-candidate chip as inactive when group is disabled', async () => {
    configService.disableGroup(CANONICAL_RECOGNITION_GROUPS[0].key);
    fixture.detectChanges();
    await fixture.whenStable();

    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const row = checkGroupRow(fixture, group.key);
    const chip = row.querySelector('[data-candidate-chip]') as HTMLElement;

    expect(chip.getAttribute('aria-pressed')).toBe('false');
  });

  it('should enable the group when a candidate chip is clicked on a disabled group', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[7]; // multi-candidate, not pre-enabled
    fixture.detectChanges();
    await fixture.whenStable();

    const row = checkGroupRow(fixture, group.key);
    (row.querySelector('[data-expand-btn]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const expandedArea = fixture.nativeElement.querySelector(`[data-expanded-group="${group.key}"]`) as HTMLElement;
    const chip = expandedArea.querySelector('[data-candidate-chip]') as HTMLButtonElement;
    chip.click();
    fixture.detectChanges();

    expect(configService.enabledGroupKeys()).toContain(group.key);
    expect(configService.enabledCandidateKeys(group.key)).toContain(group.candidates[0]);
    expect(configService.enabledCandidateKeys(group.key)).not.toContain(group.candidates[1]);
  });

  it('should not show an expand button for single-candidate groups', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const group = CANONICAL_RECOGNITION_GROUPS[0];
    const row = checkGroupRow(fixture, group.key);
    expect(row.querySelector('[data-expand-btn]')).toBeNull();
  });

  // ─── Expand / collapse ───────────────────────────────────────────────────

  it('should show an expand button for multi-candidate groups', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const group = CANONICAL_RECOGNITION_GROUPS[7]; // 2-bar inside | 2-bar inside → Aa, Ab
    const row = checkGroupRow(fixture, group.key);
    expect(row.querySelector('[data-expand-btn]')).not.toBeNull();
  });

  it('should not show candidate chips for a multi-candidate group when collapsed', async () => {
    configService.enableGroup(CANONICAL_RECOGNITION_GROUPS[7].key);
    fixture.detectChanges();
    await fixture.whenStable();

    const group = CANONICAL_RECOGNITION_GROUPS[7];
    expect(
      fixture.nativeElement.querySelector(`[data-expanded-group="${group.key}"]`),
    ).toBeNull();
  });

  it('should show candidate chips in expanded area when expand is clicked', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[7];
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const row = checkGroupRow(fixture, group.key);
    (row.querySelector('[data-expand-btn]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const expandedArea = fixture.nativeElement.querySelector(
      `[data-expanded-group="${group.key}"]`,
    ) as HTMLElement;
    expect(expandedArea).not.toBeNull();
    expect(expandedArea.querySelectorAll('[data-candidate-chip]').length).toBe(
      group.candidates.length,
    );
  });

  it('should collapse an expanded group when collapse button is clicked', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[7];
    fixture.detectChanges();
    await fixture.whenStable();

    const row = checkGroupRow(fixture, group.key);
    const expandBtn = row.querySelector('[data-expand-btn]') as HTMLButtonElement;
    expandBtn.click();
    fixture.detectChanges();

    expandBtn.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(`[data-expanded-group="${group.key}"]`),
    ).toBeNull();
  });

  it('should reflect case count in expanded group row', async () => {
    const group = CANONICAL_RECOGNITION_GROUPS[7]; // Aa, Ab — 2 candidates
    configService.enableGroup(group.key);
    fixture.detectChanges();
    await fixture.whenStable();

    const row = checkGroupRow(fixture, group.key);
    const countEl = row.querySelector('[data-case-count]') as HTMLElement;
    expect(countEl.textContent?.trim()).toBe(`${group.candidates.length}/${group.candidates.length}`);
  });

  // ─── Filters ─────────────────────────────────────────────────────────────

  it('should show all 24 groups with no filter applied', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('[data-group-row]').length).toBe(24);
  });

  it('should filter rows by left pattern', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.componentInstance as any).leftFilter.set('Headlights');
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('[data-group-row]');
    for (const row of rows) {
      expect(row.querySelector('.group-left')?.textContent?.trim()).toBe('Headlights');
    }
  });

  it('should filter rows by right pattern', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.componentInstance as any).rightFilter.set('3-bar');
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('[data-group-row]');
    for (const row of rows) {
      expect(row.querySelector('.group-right')?.textContent?.trim()).toBe('3-bar');
    }
  });

  it('should show no rows when filter matches nothing', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    (fixture.componentInstance as any).leftFilter.set('3-bar');
    (fixture.componentInstance as any).rightFilter.set('3-bar');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-group-row]').length).toBe(0);
  });

  // ─── Bulk actions ────────────────────────────────────────────────────────

  it('should enable all filtered groups when Select all is clicked', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    fixture.detectChanges();
    await fixture.whenStable();

    const selectAllBtn = fixture.nativeElement.querySelector('button[mat-button]:first-child') as HTMLButtonElement;
    selectAllBtn.click();
    fixture.detectChanges();

    expect(configService.enabledGroupKeys().length).toBe(24);
  });

  it('should disable all filtered groups when Clear is clicked', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const clearBtn = fixture.nativeElement.querySelector('.bulk-actions button:last-child') as HTMLButtonElement;
    clearBtn.click();
    fixture.detectChanges();

    expect(configService.enabledGroupKeys().length).toBe(0);
  });

  it('should select all only scopes to filtered groups', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    (fixture.componentInstance as any).leftFilter.set('Headlights');
    fixture.detectChanges();
    await fixture.whenStable();

    const selectAllBtn = fixture.nativeElement.querySelector('button[mat-button]:first-child') as HTMLButtonElement;
    selectAllBtn.click();
    fixture.detectChanges();

    const enabledKeys = configService.enabledGroupKeys();
    expect(enabledKeys.every((k: string) => k.startsWith('Headlights'))).toBe(true);
  });

  // ─── Summary ─────────────────────────────────────────────────────────────

  it('should show correct summary text for default state', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const summary = fixture.nativeElement.querySelector('[data-summary]') as HTMLElement;
    expect(summary.textContent?.trim()).toContain('7 groups');
    expect(summary.textContent?.trim()).toContain('7 cases');
  });

  it('should update summary text when a group is enabled', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    fixture.detectChanges();
    await fixture.whenStable();

    configService.enableGroup(CANONICAL_RECOGNITION_GROUPS[0].key);
    fixture.detectChanges();

    const summary = fixture.nativeElement.querySelector('[data-summary]') as HTMLElement;
    expect(summary.textContent?.trim()).toContain('1 group');
  });

  // ─── Output events ───────────────────────────────────────────────────────

  it('should emit cancelled when Cancel is clicked', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted = false;
    fixture.componentInstance.cancelled.subscribe(() => (emitted = true));

    (fixture.nativeElement.querySelector('.cancel-btn') as HTMLButtonElement).click();

    expect(emitted).toBe(true);
  });

  it('should emit applied when Done is clicked and candidates are selected', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted = false;
    fixture.componentInstance.applied.subscribe(() => (emitted = true));

    (fixture.nativeElement.querySelector('.done-btn') as HTMLButtonElement).click();

    expect(emitted).toBe(true);
  });

  it('should disable Done button when no candidates are selected', async () => {
    configService.restoreSnapshot({ enabledGroups: [], enabledCandidates: new Map() });
    fixture.detectChanges();
    await fixture.whenStable();

    const doneBtn = fixture.nativeElement.querySelector('.done-btn') as HTMLButtonElement;
    expect(doneBtn.disabled).toBe(true);
  });
});
