import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';

interface InstructionStep {
  number: number;
  step: string;
}

interface InstructionGroup {
  name?: string;
  steps: InstructionStep[];
}

@Component({
  selector: 'app-recipe-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-instructions.component.html',
})
export class RecipeInstructionsComponent implements OnInit {
  instructions$!: Observable<InstructionGroup[]>;

  constructor(public recipeUI: RecipeDetailUIService) {}

  ngOnInit(): void {
    this.instructions$ = this.recipeUI.instructions$.pipe(
      map((instructions: (string | InstructionGroup)[]): InstructionGroup[] => {
        if (!instructions || !Array.isArray(instructions)) return [];

        return instructions.map(group => {
          if (typeof group === 'string') {
            return {
              name: undefined,
              steps: [{ number: 1, step: group }]
            };
          }
          return group as InstructionGroup;
        });
      })
    );
  }
}
