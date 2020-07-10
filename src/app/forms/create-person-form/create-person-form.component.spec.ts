import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePersonFormComponent } from './create-person-form.component';

describe('CreatePersonFormComponent', () => {
  let component: CreatePersonFormComponent;
  let fixture: ComponentFixture<CreatePersonFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePersonFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePersonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
