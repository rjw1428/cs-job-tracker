import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobBoardColumnComponent } from './job-board-column.component';

describe('JobBoardColumnComponent', () => {
  let component: JobBoardColumnComponent;
  let fixture: ComponentFixture<JobBoardColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobBoardColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobBoardColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
