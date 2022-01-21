import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpOrInComponent } from './sign-up-or-in.component';

describe('SignUpOrInComponent', () => {
  let component: SignUpOrInComponent;
  let fixture: ComponentFixture<SignUpOrInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignUpOrInComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpOrInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
