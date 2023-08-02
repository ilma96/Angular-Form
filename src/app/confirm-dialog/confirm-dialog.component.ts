import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
  <h2 mat-dialog-title>Confirm Removal</h2>
  <mat-dialog-content>
    Are you sure you want to remove this claimant?
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close>No</button>
    <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Yes</button>
  </mat-dialog-actions>
`,
})
export class ConfirmDialogComponent {
}

