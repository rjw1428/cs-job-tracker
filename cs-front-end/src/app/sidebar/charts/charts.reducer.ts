import { createReducer, on } from '@ngrx/store'
import { ChartState } from 'src/models/chartState'
import { ChartsActions } from './charts.action-types'

import { ChartConfig } from 'src/models/chartConfig';
import { TitleCasePipe } from '@angular/common';
import { convertRawShortcut } from 'src/app/shared/utility';

export const initialChartState: ChartState = {
    selectedTime: { start: null, end: null },
    initialTimeRange: null,
    chartSpecificTimeShortcuts: [],
    activeTab: 0,
    initialConfigId: null
}


export const chartReducer = createReducer(
    initialChartState,
    on(ChartsActions.initCharts, (state) => state),
    on(ChartsActions.storeChartConfigs, (state, action) => {
        console.log(action.chartConfigs)
        return { ...state, chartConfigs: action.chartConfigs }
    }),
    on(ChartsActions.storeTimeShortcuts, (state, action) => {
        return {
            ...state,
            timeShortcuts: action.timeShortcuts,
        }
    }),
    on(ChartsActions.setInitialChartId, (state, action) => {
        return { ...state, initialConfigId: action.chartId }
    }),
    on(ChartsActions.setSelectedTab, (state, action) => {
        return { ...state, activeTab: action.index }
    }),
    // on(ChartsActions.setSelectedChartById, (state) => {
    //     // ONLY RUNS I THERE IS AN ID SET IN URL
    //     const matchingIndex = state.chartConfigs.findIndex(chart => chart.id == state.initialConfigId)
    //     const activeTab = matchingIndex == -1 ? 0 : matchingIndex
    //     return {
    //         ...state,
    //         activeTab,
    //         initialConfigId: null
    //     }
    // }),
    // on(ChartsActions.setSelectedChartByIndex, (state, action) => {
    //     return {
    //         ...state,
    //         activeTab: action.index,
    //         initialTimeRange: state.chartConfigs[action.index].defaultTime
    //             ? state.chartConfigs[action.index].defaultTime
    //             : 'last_year'
    //     }
    // }),
    // on(ChartsActions.addDataToConfig, (state, action) => {
    //     const updatedConfigList = state.chartConfigs.map(config => {
    //         return config.id == action.config.id
    //             ? setChartFromData(action.data, action.config)
    //             : config
    //     })
    //     const currentCOnfig = state.chartConfigs[state.activeTab]
    //     const exclusionList = currentCOnfig.excludedTimes
    //         ? currentCOnfig.excludedTimes
    //         : []
    //     return {
    //         ...state,
    //         chartConfigs: updatedConfigList,
    //         chartSpecificTimeShortcuts: state.timeShortcuts.filter(shortcut => !exclusionList.includes(shortcut.id))
    //     }
    // }),
    on(ChartsActions.setSelectedTime, (state, action) => {
        return {
            ...state,
            selectedTime: { start: action.start, end: action.end }
        }
    })
)


// function setChartFromData(resp: any[], chart: ChartConfig): ChartConfig {
//     let newChart = { ...chart }
//     if (!resp.length) return { ...newChart, dataSource: [], dataSource1: [], dataSource2: [] }
//     const titlePipe = new TitleCasePipe()
//     newChart = { ...newChart, xAxisLabel: titlePipe.transform(Object.keys(resp[0])[0]) }
//     newChart = { ...newChart, yAxisLabel: titlePipe.transform(Object.keys(resp[0])[1]) }
//     switch (chart.chartType) {
//         case ('bar_vertical'):
//             return { ...newChart, dataSource: barChart(resp) }

//         case ('bar_horizontal'):
//             return { ...newChart, dataSource: barChart(resp) }

//         case ('single_line'):
//             return { ...newChart, dataSource: singleLineChart(resp, chart.seriesName) }

//         case ('pie'):
//             return { ...newChart, dataSource: barChart(resp) }

//         case ('pie_advanced'):
//             return { ...newChart, dataSource: barChart(resp) }

//         case ('gantt'):
//             return { ...newChart, dataSource: resp }
//         case ('combo'):
//             const source1 = barChart(resp.map(dataPoint => {
//                 const keys = Object.keys(dataPoint)
//                 return { [keys[0]]: dataPoint[keys[0]], [keys[1]]: dataPoint[keys[1]] }
//             }))
//             const source2 = singleLineChart(resp.map(dataPoint => {
//                 const keys = Object.keys(dataPoint)
//                 return { [keys[0]]: dataPoint[keys[0]], [keys[2]]: dataPoint[keys[2]] }
//             }), chart.seriesName)
//             return { ...chart, dataSource1: source1, dataSource2: source2 }
//     }
// }

// function singleLineChart(data: any[], name) {
//     const series = data.map(dataPoint => {
//         const keys = Object.keys(dataPoint)
//         return {
//             name: dataPoint[keys[0]],
//             value: dataPoint[keys[1]]
//         }
//     })
//     return [{ name, series }]
// }

// function barChart(data: any[]) {
//     return data.map(dataPoint => {
//         const keys = Object.keys(dataPoint)
//         return {
//             name: dataPoint[keys[0]],
//             value: dataPoint[keys[1]]
//         }
//     });
// }
