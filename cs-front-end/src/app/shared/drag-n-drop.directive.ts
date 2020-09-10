import { Directive, HostListener, HostBinding, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[DragNDrop]'
})
export class DragNDropDirective {
  @Output() fileDropped = new EventEmitter()
  @HostBinding('class.fileover') fileOver: boolean
  constructor() { }

  @HostListener('dragover', ['$event'])
  onDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    this.fileOver = true
    console.log("Drag Over")
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event) {
    event.preventDefault()
    event.stopPropagation()
    this.fileOver = false
    console.log("Drag Leave")
  }

  @HostListener('drop', ['$event'])
  public onDrop(event) {
    event.preventDefault()
    event.stopPropagation()

    this.fileOver = false
    const files = event.dataTransfer.files
    if (files.length > 0) {
      console.log("Uploading " + files.length + " files")
      this.fileDropped.emit(files)
    }
  }
}
