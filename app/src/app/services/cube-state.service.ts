import { Injectable, computed } from '@angular/core';
import { TrainerLifecycleService } from '../features/core';
import { type SideColorIndex } from '../domain';

export type CubeDisplayState = {
  leftFace: readonly [SideColorIndex, SideColorIndex, SideColorIndex];
  rightFace: readonly [SideColorIndex, SideColorIndex, SideColorIndex];
  // Random base for the two solved side-face layers; (solvedBase+1)%4 is used for the right face
  solvedBase: SideColorIndex;
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
      solvedBase: Math.floor(Math.random() * 4) as SideColorIndex,
    };
  });

  constructor(private lifecycleService: TrainerLifecycleService) {}
}
