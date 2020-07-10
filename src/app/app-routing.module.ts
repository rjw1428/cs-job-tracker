import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: "charts",
    loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule),
  },
  {
    path: "reports",
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),
  },
  {
    path: "search",
    loadChildren: () => import('./search/search.module').then(m => m.SearchModule),
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
