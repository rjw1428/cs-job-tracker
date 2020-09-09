import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingWrapperComponent } from './loading-wrapper.component';

describe('LoadingWrapperComponent', () => {
  let component: LoadingWrapperComponent;
  let fixture: ComponentFixture<LoadingWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
