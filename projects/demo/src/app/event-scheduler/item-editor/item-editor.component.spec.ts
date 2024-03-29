import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualSchedulerService } from 'chichi-ng';

import { ItemEditorComponent } from './item-editor.component';

describe('ItemEditorComponent', () => {
  let component: ItemEditorComponent;
  let fixture: ComponentFixture<ItemEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemEditorComponent ],
      providers: [VisualSchedulerService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an ItemEditorComponent', () => {
    expect(component).toBeTruthy();
  });
});
