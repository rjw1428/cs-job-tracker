import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDueDateComponent } from './update-due-date.component';

describe('UpdateDueDateComponent', () => {
  let component: UpdateDueDateComponent;
  let fixture: ComponentFixture<UpdateDueDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateDueDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDueDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
