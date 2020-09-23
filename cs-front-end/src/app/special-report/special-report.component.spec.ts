import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialReportComponent } from './special-report.component';

describe('SpecialReportComponent', () => {
  let component: SpecialReportComponent;
  let fixture: ComponentFixture<SpecialReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
