import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpecialReportComponent } from './special-report/special-report.component';


const routes: Routes = [
  {
    path: 'estimating', component: SpecialReportComponent
  },
  {
    path: "dashboard",
    loadChildren: () => import('./sidebar/dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: "charts",
    loadChildren: () => import('./sidebar/charts/charts.module').then(m => m.ChartsModule),
  },
  {
    path: "reports",
    loadChildren: () => import('./sidebar/reports/reports.module').then(m => m.ReportsModule),
  },
  {
    path: "search",
    loadChildren: () => import('./sidebar/search/search.module').then(m => m.SearchModule),
  },
  {
    path: "**", redirectTo: "/dashboard", pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
