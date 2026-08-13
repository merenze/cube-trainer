import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CubeRendererComponent } from './components/cube-renderer.component';
import { TrainerConfigurationComponent } from './components/trainer-configuration.component';
import { AnswerControlComponent } from './components/answer-control.component';
import { ConfirmDialogComponent } from './components/confirm-dialog.component';
import { TrainerLifecycleService } from './services/trainer-lifecycle.service';
import { TrainerConfigurationService, type ConfigSnapshot } from './services/trainer-configuration.service';
import { SessionStatisticsService } from './services/session-statistics.service';

@Component({
  selector: 'app-root',
  imports: [CubeRendererComponent, TrainerConfigurationComponent, AnswerControlComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly lifecycle = inject(TrainerLifecycleService);
  protected readonly stats = inject(SessionStatisticsService);
  private readonly configService = inject(TrainerConfigurationService);
  private readonly dialog = inject(MatDialog);

  protected readonly isConfiguring = signal(false);
  private configVersionAtOpen = 0;
  private configSnapshot: ConfigSnapshot | null = null;

  protected openConfig(): void {
    this.configSnapshot = this.configService.takeSnapshot();
    this.configVersionAtOpen = this.configService.configurationVersion();
    this.isConfiguring.set(true);
  }

  protected cancelConfig(): void {
    if (this.configSnapshot) {
      this.configService.restoreSnapshot(this.configSnapshot);
    }
    this.isConfiguring.set(false);
  }

  protected doneConfig(): void {
    const isDirty = this.configService.configurationVersion() !== this.configVersionAtOpen;
    if (!isDirty) {
      this.isConfiguring.set(false);
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Start new session?',
        message: 'Changing settings will reset the current training session.',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.lifecycle.resetToIdle();
        this.isConfiguring.set(false);
      }
    });
  }
}
