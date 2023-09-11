import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ClaimantFormComponent } from './claimant-form/claimant-form.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  {
    path: 'claimant-form',
    component: ClaimantFormComponent,
  },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
