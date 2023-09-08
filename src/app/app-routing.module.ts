import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ClaimantFormComponent } from './claimant-form/claimant-form.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ClaimantFormGuardGuard } from './claimant-form-guard.guard';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  {
    path: 'claimant-form',
    component: ClaimantFormComponent,
    canActivateChild: [ClaimantFormGuardGuard],
  },
  { path: 'confirmation', component: ConfirmationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
