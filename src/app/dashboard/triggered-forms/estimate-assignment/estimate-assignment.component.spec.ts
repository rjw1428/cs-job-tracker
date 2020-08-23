import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateAssignmentComponent } from './estimate-assignment.component';

describe('EstimateAssignmentComponent', () => {
  let component: EstimateAssignmentComponent;
  let fixture: ComponentFixture<EstimateAssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstimateAssignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimateAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
