import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJobHistoryComponent } from './view-job-history.component';

describe('ViewJobHistoryComponent', () => {
  let component: ViewJobHistoryComponent;
  let fixture: ComponentFixture<ViewJobHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewJobHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewJobHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
