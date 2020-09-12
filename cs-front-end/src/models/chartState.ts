import { ChartConfig } from './chartConfig';
import { RawTimeShortcut } from './rawTimeShortcut';
import { TimeShortcut } from './timeShortcut';

export interface ChartState {
    chartConfigs: ChartConfig[]
    selectedTime: { start: number, end: number }
    timeShortcuts: RawTimeShortcut[]
    activeTab: number
    initialConfigId: string
    initialTimeRange: string
    chartSpecificTimeShortcuts: RawTimeShortcut[]
}