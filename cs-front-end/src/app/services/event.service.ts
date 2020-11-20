import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Job } from 'src/models/job';
import { ChartConfig } from 'src/models/chartConfig';

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
  createGanttChart = new Subject<ChartConfig>()
  searchMoveFormCanceled = new Subject<{jobId: number}>()
  constructor() { }
}
