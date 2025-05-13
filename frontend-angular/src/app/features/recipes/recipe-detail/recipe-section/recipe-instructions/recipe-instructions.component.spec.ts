import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { RecipeInstructionsComponent } from './recipe-instructions.component';
import { RecipeDetailUIService } from '@features/recipes/recipe-detail/services/recipe-detail-ui.service';

interface InstructionStep {
  number: number;
  step: string;
}

interface InstructionGroup {
  name?: string;
  steps: InstructionStep[];
}

type InstructionData = string | InstructionGroup;

describe('RecipeInstructionsComponent', () => {
  let component: RecipeInstructionsComponent;
  let fixture: ComponentFixture<RecipeInstructionsComponent>;
  let mockRecipeDetailUIService: jasmine.SpyObj<RecipeDetailUIService>;
  let instructionsSubject: BehaviorSubject<InstructionData[]>;

  beforeEach(async () => {
    instructionsSubject = new BehaviorSubject<InstructionData[]>([]);

    mockRecipeDetailUIService = jasmine.createSpyObj('RecipeDetailUIService', [], {
      instructions$: instructionsSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RecipeInstructionsComponent
      ],
      providers: [
        { provide: RecipeDetailUIService, useValue: mockRecipeDetailUIService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject RecipeDetailUIService', () => {
    expect(component.recipeUI).toBe(mockRecipeDetailUIService);
  });

  it('should handle empty instructions array', (done) => {
    instructionsSubject.next([]);

    component.instructions$.pipe(first()).subscribe(result => {
      expect(result).toEqual([]);
      done();
    });
  });

  it('should handle null instructions', (done) => {
    instructionsSubject.next(null as unknown as InstructionData[]);

    component.instructions$.pipe(first()).subscribe(result => {
      expect(result).toEqual([]);
      done();
    });
  });

  it('should handle undefined instructions', (done) => {
    instructionsSubject.next(undefined as unknown as InstructionData[]);

    component.instructions$.pipe(first()).subscribe(result => {
      expect(result).toEqual([]);
      done();
    });
  });

  it('should convert string instructions to instruction groups', (done) => {
    const stringInstructions: string[] = ['Mix the ingredients', 'Bake for 30 minutes'];
    instructionsSubject.next(stringInstructions);

    component.instructions$.pipe(first()).subscribe(result => {
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        name: undefined,
        steps: [{ number: 1, step: 'Mix the ingredients' }]
      });
      expect(result[1]).toEqual({
        name: undefined,
        steps: [{ number: 1, step: 'Bake for 30 minutes' }]
      });
      done();
    });
  });

  it('should pass through instruction group objects', (done) => {
    const instructionGroups: InstructionGroup[] = [
      {
        name: 'Preparation',
        steps: [
          { number: 1, step: 'Preheat oven' },
          { number: 2, step: 'Prepare ingredients' }
        ]
      },
      {
        name: 'Cooking',
        steps: [
          { number: 1, step: 'Mix and bake' }
        ]
      }
    ];

    instructionsSubject.next(instructionGroups);

    component.instructions$.pipe(first()).subscribe(result => {
      expect(result).toEqual(instructionGroups);
      done();
    });
  });

  it('should handle mixed array of strings and instruction groups', (done) => {
    const mixedInstructions: InstructionData[] = [
      'Preheat oven to 350°F',
      {
        name: 'Preparation',
        steps: [
          { number: 1, step: 'Mix dry ingredients' },
          { number: 2, step: 'Add wet ingredients' }
        ]
      }
    ];

    instructionsSubject.next(mixedInstructions);

    component.instructions$.pipe(first()).subscribe(result => {
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        name: undefined,
        steps: [{ number: 1, step: 'Preheat oven to 350°F' }]
      });
      expect(result[1]).toEqual({
        name: 'Preparation',
        steps: [
          { number: 1, step: 'Mix dry ingredients' },
          { number: 2, step: 'Add wet ingredients' }
        ]
      });
      done();
    });
  });
});
