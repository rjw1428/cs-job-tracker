import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProposalHistoryComponent } from './view-proposal-history.component';

describe('ViewProposalHistoryComponent', () => {
  let component: ViewProposalHistoryComponent;
  let fixture: ComponentFixture<ViewProposalHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewProposalHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProposalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
