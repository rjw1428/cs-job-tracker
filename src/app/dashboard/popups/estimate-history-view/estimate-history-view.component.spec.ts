import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateHistoryViewComponent } from './estimate-history-view.component';

describe('EstimateHistoryViewComponent', () => {
  let component: EstimateHistoryViewComponent;
  let fixture: ComponentFixture<EstimateHistoryViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstimateHistoryViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimateHistoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
