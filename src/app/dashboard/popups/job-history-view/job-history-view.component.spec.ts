import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobHistoryViewComponent } from './job-history-view.component';

describe('JobHistoryViewComponent', () => {
  let component: JobHistoryViewComponent;
  let fixture: ComponentFixture<JobHistoryViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobHistoryViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobHistoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
