import { ChartConfig } from './chartConfig';
import { RawTimeShortcut } from './rawTimeShortcut';
import { TimeShortcut } from './timeShortcut';

export interface ChartState {
    selectedTime: { start: number, end: number }
    activeTab: number
    initialConfigId: string
    initialTimeRange: string
    chartSpecificTimeShortcuts: RawTimeShortcut[]
}