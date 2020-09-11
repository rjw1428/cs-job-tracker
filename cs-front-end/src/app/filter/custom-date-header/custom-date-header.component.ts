import { Component, OnInit, Inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-custom-date-header',
  templateUrl: './custom-date-header.component.html',
  styleUrls: ['./custom-date-header.component.scss']
})
export class CustomDateHeaderComponent implements OnDestroy {
  private _destroyed = new Subject<void>();
  constructor(
    private _calendar: MatCalendar<any>, private _dateAdapter: DateAdapter<any>,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats, cdr: ChangeDetectorRef) {
    _calendar.stateChanges
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  get periodLabel() {
    return this._dateAdapter
      .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
      .toLocaleUpperCase();
  }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate = mode === 'month' ?
      this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1) :
      this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate = mode === 'month' ?
      this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1) :
      this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);
  }
}