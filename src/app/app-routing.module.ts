import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ClaimantFormComponent } from './claimant-form/claimant-form.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'claimant-form', component: ClaimantFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
