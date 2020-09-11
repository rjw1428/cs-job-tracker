import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDateHeaderComponent } from './custom-date-header.component';

describe('CustomDateHeaderComponent', () => {
  let component: CustomDateHeaderComponent;
  let fixture: ComponentFixture<CustomDateHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomDateHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDateHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
