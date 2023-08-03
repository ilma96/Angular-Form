import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-claimant-form',
  templateUrl: './claimant-form.component.html',
  styleUrls: ['./claimant-form.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('500ms ease-in-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ClaimantFormComponent implements OnInit {
  @ViewChild('firstConditionSection') firstConditionSection!: ElementRef;
  @ViewChild('secondConditionSection') secondConditionSection!: ElementRef;
  showFirstCondition: boolean = false;
  showSecondCondition: boolean = false;
  showRemoveButton: boolean = false;
  claimantForm: any = FormGroup;
  lossIncurredForm: any = FormGroup;
  lossList: string[] = [
    'Home Loss',
    'Tree Damage',
    'Partial Home Loss',
    'Smoke Damage',
    'Water Damage',
  ];

  constructor(private formBuilder: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.claimantForm = this.formBuilder.group({
      ClaimantFirstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
      ],
      ClaimantLastName: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(15),
        ],
      ],
      ClaimantSuffix: [''],
      GroupRepresentativeEmail: ['', [Validators.required, Validators.email]],
      ClaimantEmailAddress: ['', Validators.email],
      DateofBirth: ['', [Validators.required, this.validateDateOfBirth]],
      ClaimantInjured: [null, Validators.required],
      ClaimantProperty: [null, Validators.required],
      ClaimantLossIncurred: this.processLossIncurred(),
      ClaimantInsurance: [null],
      claimants: this.formBuilder.array([]),
    });
    // const claimantsArray = this.claimantForm.get('claimants') as FormArray;
    // const jsonData = JSON.parse(
    //   '{"Claimants" : [{"Claimant First Name" : null, "Claimant  Nam" : null, "Claimant Suffix" : null, "Group Representative Email" : null, "Claimant Email Address" : null, "Date of Birth" : null, "Claimant Injured" : null, "Claimant Property" : null, "Claimant Loss Incurred": null, "Claimant Insurance" : null }]}'
    // );
    // jsonData.Claimants.forEach((claimant: any) => {
    //   claimantsArray.push(this.createMainClaimantFormGroup(claimant));
    // });
    // console.log(claimantsArray);
    this.claimantForm
      .get('ClaimantInjured' || 'ClaimantProperty')
      ?.valueChanges.subscribe((value: string) => {
        const insuranceControl = this.claimantForm.get('ClaimantInsurance');
        if (value === 'no') {
          insuranceControl.setValue(null);
        } else {
          this.showFirstCondition = true;
          setTimeout(() => this.scrollSectionIntoView(), 0);
        }
      });
    this.claimantForm
      .get('ClaimantProperty')
      ?.valueChanges.subscribe((value: string) => {
        const optionControl = this.claimantForm.get('ClaimantLossIncurred');
        if (value === 'no') {
          optionControl.setValue([null, null, null, null, null]);
        } else {
          this.showSecondCondition = true;
          setTimeout(() => this.scrollSectionIntoView(), 0);
        }
      });
  }

  private validateDateOfBirth(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - selectedDate.getFullYear();
    //const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDay() - selectedDate.getDay();
    if (
      dayDiff < 0 ||
      (dayDiff === 0 && today.getDate() < selectedDate.getDate())
    ) {
      age--;
    }
    return age >= 18 ? null : { underAge: true };
  }

  processLossIncurred(): FormArray {
    const formArray = this.formBuilder.array([]);
    this.lossList.forEach(() => formArray.push(this.formBuilder.control(null)));
    return formArray;
  }

  // get lossIncurred() {
  //   return this.lossIncurredForm.get('ClaimantLossIncurred') as FormArray;
  // }

  // getLossIncurredControl(index: number): FormControl {
  //   return this.lossIncurred?.controls[index] as FormControl;
  // }

  get claimants(): FormArray {
    return this.claimantForm.get('claimants') as FormArray;
  }

  addSubClaimant() {
    const groupRepEmail = this.claimantForm?.get('GroupRepresentativeEmail');
    const dependentMembers = this.formBuilder.group({
      ClaimantFirstName: ['', Validators.required],
      ClaimantLastName: ['', Validators.required],
      ClaimantSuffix: [''],
      GroupRepresentativeEmail: [groupRepEmail?.value],
      ClaimantEmailAddress: ['', Validators.email],
      DateofBirth: ['', Validators.required],
      ClaimantInjured: [null, Validators.required],
      ClaimantProperty: [null, Validators.required],
      ClaimantLossIncurred: this.processLossIncurred(),
      ClaimantInsurance: [null],
    });
    this.claimants.push(dependentMembers);
    this.showRemoveButton = true;
    console.log(dependentMembers);
  }

  removeSubClaimant(index: number) {
    this.claimants.removeAt(index);
  }

  showConfirmationMessage(index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.removeSubClaimant(index);
      }
    });
  }

  private scrollSectionIntoView() {
    this.firstConditionSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }

  getSelectedLossIncurred(lossIncurred: boolean[]): string {
    return this.lossList
      .filter((option, index) => lossIncurred[index])
      .join('; ');
  }

  onSubmit() {
    if (this.claimantForm.valid) {
      // this.claimants.value.forEach((claimant: any) => {
      //   claimant.lossIncurred = this.getSelectedLossIncurred(
      //     claimant.lossIncurred
      //   );
      // });
      // this.subClaimants.value.forEach((claimant: any) => {
      //   claimant.lossIncurred = this.getSelectedLossIncurred(
      //     claimant.lossIncurred
      //   );
      // });
      console.log(this.claimantForm.value);
    } else {
      console.log('Invalid Form');
    }
  }
}
