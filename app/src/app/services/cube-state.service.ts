import { Injectable, computed } from '@angular/core';
import { TrainerLifecycleService } from './trainer-lifecycle.service';
import { type SideColorIndex } from '../domain/observation-color-layout';

export type CubeDisplayState = {
  leftFace: readonly [SideColorIndex, SideColorIndex, SideColorIndex];
  rightFace: readonly [SideColorIndex, SideColorIndex, SideColorIndex];
};

@Injectable({
  providedIn: 'root',
})
export class CubeStateService {
  readonly displayState = computed<CubeDisplayState | null>(() => {
    const layout = this.lifecycleService.resolvedLayout();
    if (!layout) {
      return null;
    }
    return {
      leftFace: layout.left,
      rightFace: layout.right,
    };
  });

  constructor(private lifecycleService: TrainerLifecycleService) {}
}
