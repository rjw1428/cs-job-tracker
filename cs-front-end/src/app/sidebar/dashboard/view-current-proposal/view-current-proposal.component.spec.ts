import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCurrentProposalComponent } from './view-current-proposal.component';

describe('ViewCurrentProposalComponent', () => {
  let component: ViewCurrentProposalComponent;
  let fixture: ComponentFixture<ViewCurrentProposalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCurrentProposalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCurrentProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
