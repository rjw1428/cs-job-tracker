import { ChartConfig } from './chartConfig';
import { TimeShortcut } from './timeShortcut';

export interface ChartState {
    chartConfigs: ChartConfig[]
    selectedTimeShortcut: TimeShortcut
    timeShortcuts: TimeShortcut[]
    activeTab: number
    initialConfigId: string
}