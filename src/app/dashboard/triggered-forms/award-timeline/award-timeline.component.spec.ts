import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardTimelineComponent } from './award-timeline.component';

describe('AwardTimelineComponent', () => {
  let component: AwardTimelineComponent;
  let fixture: ComponentFixture<AwardTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
