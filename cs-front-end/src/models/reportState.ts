import { RawTimeShortcut } from './rawTimeShortcut';
import { ReportConfig } from './reportConfig';

export interface ReportState {
    reportConfigs: ReportConfig[]
    selectedTime: { start: number, end: number }
    timeShortcuts: RawTimeShortcut[]
    activeTab: number
    initialConfigId: string
    initialTimeRange: string
    reportSpecificTimeShortcuts: RawTimeShortcut[]
}