import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardTimelineFormComponent } from './award-timeline-form.component';

describe('AwardTimelineFormComponent', () => {
  let component: AwardTimelineFormComponent;
  let fixture: ComponentFixture<AwardTimelineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardTimelineFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardTimelineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
