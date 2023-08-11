import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ClaimantServiceService } from '../claimant-service.service';
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

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private claimantService: ClaimantServiceService
  ) {}

  ngOnInit() {
    this.claimantForm = this.formBuilder.group({
      ClaimantFirstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern("[a-zA-Z][a-zA-Z .'-]*"),
        ],
      ],
      ClaimantLastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern("^[a-zA-Z]+(?:['-][a-zA-Z]+)*(?: [a-zA-Z]+)*$"),
        ],
      ],
      ClaimantSuffix: ['', Validators.maxLength(15)],
      GroupRepresentativeEmail: ['', [Validators.required, Validators.email]],
      ClaimantEmailAddress: [''],
      DateofBirth: [
        '',
        [
          Validators.required,
          this.validateDateOfBirth,
          this.futureDateValidator,
        ],
      ],
      ClaimantInjured: [null, Validators.required],
      ClaimantProperty: [null, Validators.required],
      ClaimantLossIncurred: this.processLossIncurred(),
      ClaimantInsurance: [null],
      subClaimants: this.formBuilder.array([]),
    });
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
        let optionControl = this.claimantForm.get('ClaimantLossIncurred');
        if (value === 'no') {
          optionControl = this.getSelectedLossIncurred();
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

  private futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();
    const minDate = new Date('1900-01-01');
    if (selectedDate > currentDate) {
      return { futureDate: true };
    }
    if (selectedDate < minDate) {
      return { pastDate: true };
    }
    return null;
  }

  processLossIncurred(): FormArray {
    const formArray = this.formBuilder.array([]);
    this.lossList.forEach(() => formArray.push(this.formBuilder.control(null)));
    return formArray;
  }

  get subClaimants(): FormArray {
    return this.claimantForm.get('subClaimants') as FormArray;
  }

  getGroupRepEmail(): string {
    let mainClaimantEmail = this.claimantForm.value.GroupRepresentativeEmail;
    return mainClaimantEmail;
  }

  addSubClaimant() {
    const groupRepEmail = this.claimantForm?.get('GroupRepresentativeEmail');
    const dependentMembers = this.formBuilder.group({
      ClaimantFirstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern("[a-zA-Z][a-zA-Z .'-]*"),
        ],
      ],
      ClaimantLastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(55),
          Validators.pattern("^[a-zA-Z]+(?:['-][a-zA-Z]+)*(?: [a-zA-Z]+)*$"),
        ],
      ],
      ClaimantSuffix: [''],
      GroupRepresentativeEmail: [groupRepEmail?.value],
      ClaimantEmailAddress: ['', Validators.email],
      DateofBirth: ['', [Validators.required, this.futureDateValidator]],
      ClaimantInjured: [null, Validators.required],
      ClaimantProperty: [null, Validators.required],
      ClaimantLossIncurred: this.processLossIncurred(),
      ClaimantInsurance: [null],
    });
    this.subClaimants.push(dependentMembers);
    this.showRemoveButton = true;
  }

  removeSubClaimant(index: number) {
    this.subClaimants.removeAt(index);
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

  getSelectedLossIncurred(): string {
    let counter: any = 0;
    let finalLossIncurredOptions = '';
    this.claimantForm.value.ClaimantLossIncurred.forEach((element: boolean) => {
      if (element === true) {
        finalLossIncurredOptions =
          finalLossIncurredOptions + this.lossList[counter] + ';';
      }
      counter++;
    });
    if (finalLossIncurredOptions != '') {
      finalLossIncurredOptions = finalLossIncurredOptions.slice(0, -1);
    }
    return finalLossIncurredOptions;
  }

  getSelectedLossIncurredForSubClaimants(index: number): string {
    let counter: any = 0;
    let finalLossIncurredOptions = '';
    const subClaimant = this.claimantForm.value.subClaimants[index];

    if (subClaimant && Array.isArray(subClaimant.ClaimantLossIncurred)) {
      subClaimant.ClaimantLossIncurred.forEach((element: boolean) => {
        if (element === true) {
          finalLossIncurredOptions =
            finalLossIncurredOptions + this.lossList[counter] + ';';
        }
        counter++;
      });
    }

    if (finalLossIncurredOptions != '') {
      finalLossIncurredOptions = finalLossIncurredOptions.slice(0, -1);
    }

    return finalLossIncurredOptions;
  }

  processJSONData() {
    const mainClaimantData = {
      'Claimant First Name': this.claimantForm.get('ClaimantFirstName').value,
      'Claimant Last Name': this.claimantForm.get('ClaimantLastName').value,
      'Claimant Suffix': this.claimantForm.get('ClaimantSuffix').value,
      'Group Representative Email': this.claimantForm.get(
        'GroupRepresentativeEmail'
      ).value,
      'Claimant Email Address': this.claimantForm.get(
        'GroupRepresentativeEmail'
      ).value,
      'Date of Birth': this.claimantForm.get('DateofBirth').value,
      'Claimant Injured': this.claimantForm.get('ClaimantInjured').value,
      'Claimant Property': this.claimantForm.get('ClaimantProperty').value,
      'Claimant Loss Incurred': this.getSelectedLossIncurred(),
      'Claimant Insurance': this.claimantForm.get('ClaimantInsurance').value,
    };
    const dependentClaimants = this.claimantForm.get(
      'subClaimants'
    ) as FormArray;
    const dependentClaimantsData = dependentClaimants.controls.map(
      (dependentClaimant: AbstractControl<any, any>) => {
        const dependentClaimantGroup = dependentClaimant as FormGroup;
        return {
          'Claimant First Name':
            dependentClaimantGroup.get('ClaimantFirstName')?.value,
          'Claimant Last Name':
            dependentClaimantGroup.get('ClaimantLastName')?.value,
          'Claimant Suffix':
            dependentClaimantGroup.get('ClaimantSuffix')?.value,
          'Group Representative Email': dependentClaimantGroup.get(
            'GroupRepresentativeEmail'
          )?.value,
          'Claimant Email Address': dependentClaimantGroup.get(
            'ClaimantEmailAddress'
          )?.value,
          'Date of Birth': dependentClaimantGroup.get('DateofBirth')?.value,
          'Claimant Injured':
            dependentClaimantGroup.get('ClaimantInjured')?.value,
          'Claimant Property':
            dependentClaimantGroup.get('ClaimantProperty')?.value,
          'Claimant Loss Incurred': dependentClaimantGroup.get(
            'ClaimantLossIncurred'
          )?.value,
          'Claimant Insurance':
            dependentClaimantGroup.get('ClaimantInsurance')?.value,
        };
      }
    );
    for (let index = 0; index < dependentClaimants.length; index++) {
      const subClaimantLossIncurred =
        this.getSelectedLossIncurredForSubClaimants(index);
      dependentClaimantsData[index]['Claimant Loss Incurred'] =
        subClaimantLossIncurred;
    }
    return {
      claimantrequest: {
        ...mainClaimantData,
        'Dependent Members': dependentClaimantsData,
      },
    };
  }

  onSubmit() {
    if (this.claimantForm.valid) {
      const claimantsData = this.processJSONData();
      console.log('JSON Format:', JSON.stringify(claimantsData));
      // this.claimantService.postClaimantsData(claimantsData).subscribe(
      //   (response) => {
      //     console.log('Success:', response);
      //   },
      //   (error) => {
      //     console.error('Error:', error);
      //   }
      // );
    } else {
      console.log('Invalid Form');
    }
  }
}
