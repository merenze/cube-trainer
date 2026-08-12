import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<ConfirmDialogComponent>>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Confirm action', message: 'Are you sure?' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the injected title', () => {
    expect(fixture.nativeElement.textContent).toContain('Confirm action');
  });

  it('should display the injected message', () => {
    expect(fixture.nativeElement.textContent).toContain('Are you sure?');
  });

  it('should close with true when the confirm button is clicked', () => {
    const confirmBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-confirm]');
    confirmBtn.click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with false when the cancel button is clicked', () => {
    const cancelBtn: HTMLButtonElement = fixture.nativeElement.querySelector('[data-cancel]');
    cancelBtn.click();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
