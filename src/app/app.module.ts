import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClaimantFormComponent } from './claimant-form/claimant-form.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { HomepageComponent } from './homepage/homepage.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    ClaimantFormComponent,
    ConfirmDialogComponent,
    HomepageComponent,
    ConfirmationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
