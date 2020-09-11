import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TimeShortcut } from 'src/models/timeShortcut';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomDateHeaderComponent } from './custom-date-header/custom-date-header.component';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() shortcuts: TimeShortcut[] = []
  @Input("selectedShortcut") selectedShortcutId: string = ""
  @Output() dateRange = new EventEmitter<{ from: Date, to: Date }>()
  timeFilterFormGroup: FormGroup

  customHeader = CustomDateHeaderComponent

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    const shortcut = this.shortcuts ? this.shortcuts.find(sc => sc.id == this.selectedShortcutId) : null
    this.timeFilterFormGroup = this.formBuilder.group({
      from: [shortcut ? shortcut.start(new Date()) : "", Validators.required],
      to: [shortcut ? shortcut.end(new Date()) : "", Validators.required],
      shortcut: [shortcut ? shortcut : ""]
    })

    this.timeFilterFormGroup.get('shortcut').valueChanges
      .subscribe(shortcut => {
        if (shortcut) {
          this.timeFilterFormGroup.patchValue({
            from: shortcut.start(new Date()),
            to: shortcut.end(new Date())
          })
        }
      })
  }


  onApply() {
    this.dateRange.emit(this.timeFilterFormGroup.value)
  }
}
