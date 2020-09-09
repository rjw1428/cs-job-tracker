import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationSnackbarComponent } from './confirmation-snackbar.component';

describe('ConfirmationSnackbarComponent', () => {
  let component: ConfirmationSnackbarComponent;
  let fixture: ComponentFixture<ConfirmationSnackbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationSnackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
