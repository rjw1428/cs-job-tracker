import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Job } from 'src/models/job';

interface Move {
  sourceColIndex: string,
  sourceOrderIndex: number,
  targetColIndex: string,
  targetOrderIndex: number,
  selectedJob: Job
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  triggerAssignmentFrom = new Subject<Move>()
  triggerTimelineForm = new Subject<Move>()
  confirmProposal = new Subject<Move>()
  constructor() { }
}
