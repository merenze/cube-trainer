import { Component, inject } from '@angular/core';
import { CubeRendererComponent } from './components/cube-renderer.component';
import { TrainerConfigurationComponent } from './components/trainer-configuration.component';
import { TrainerLifecycleService } from './services/trainer-lifecycle.service';
import { SessionStatisticsService } from './services/session-statistics.service';

@Component({
  selector: 'app-root',
  imports: [CubeRendererComponent, TrainerConfigurationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly lifecycle = inject(TrainerLifecycleService);
  protected readonly stats = inject(SessionStatisticsService);
}
