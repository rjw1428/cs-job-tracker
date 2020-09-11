import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignBidFormComponent } from './assign-bid-form.component';

describe('AssignBitFormComponent', () => {
  let component: AssignBidFormComponent;
  let fixture: ComponentFixture<AssignBidFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignBidFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignBidFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
