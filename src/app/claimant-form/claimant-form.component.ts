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
  @ViewChild('subSectionCondition') subSectionCondition!: ElementRef;
  @ViewChild('secondConditionSection') secondConditionSection!: ElementRef;
  @ViewChild('deceasedConditionSection') deceasedConditionSection!: ElementRef;
  showFirstCondition: boolean = false;
  showSubConditions: boolean = false;
  showSecondCondition: boolean = false;
  showDeceasedCondition: boolean = false;
  showDeceasedConditions: boolean = false;
  showRemoveButton: boolean = false;
  claimantForm: any = FormGroup;
  states: string[] = ['---', 'CA', 'NV', 'NY', 'PA'];
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
      state: ['', Validators.required],
      ClaimantFirstName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern("^[a-zA-Z]+(?:['-][a-zA-Z]+)*(?: [a-zA-Z]+)*$"),
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
      ClaimantSuffix: [
        '',
        [Validators.maxLength(15), Validators.pattern('w+s+Jr.?|Sr.?|I{1,3}$')], // this needs some fixing
      ],
      ClaimantEmailAddress: [''],
      DateofBirth: [
        '',
        [
          Validators.required,
          this.validateDateOfBirth,
          this.futurePastDateValidator,
        ],
      ],
      ClaimantDeceased: ['', Validators.required],
      ClaimantNextOfKin: ['', Validators.required],
      DateofPassing: ['', [Validators.required, this.deceasedDateValidator]],
      RelationshipWithDeceased: [null, Validators.required], //radio-button, single-choice question
      OtherOption: [
        null,
        Validators.pattern("^[a-zA-Z]+(?:['-][a-zA-Z]+)*(?: [a-zA-Z]+)*$"),
      ],
      ProbateCondition: ['', Validators.required],
      //Has the estate of the decescendent completed the probate process?
      GroupRepresentativeEmail: ['', [Validators.required, Validators.email]],
      ClaimantInjured: [null, Validators.required],
      ClaimantProperty: [null, Validators.required],
      ClaimantLossIncurred: this.processLossIncurred(), // make it required maybe?
      ClaimantInsurance: [null, Validators.required],
      subClaimants: this.formBuilder.array([]),
    });
    this.claimantForm
      .get('ClaimantInjured' || 'ClaimantProperty')
      ?.valueChanges.subscribe((value: string) => {
        const insuranceControl = this.claimantForm.get('ClaimantInsurance');
        if (value === 'no') {
          insuranceControl.setValue('N/A');
        } else {
          this.showFirstCondition = true;
          setTimeout(() => this.scrollSectionIntoView(), 0);
        }
      });

    this.claimantForm
      .get('ClaimantDeceased')
      ?.valueChanges.subscribe((value: string) => {
        const nextOfKinControl = this.claimantForm.get('ClaimantNextOfKin');
        const dateOfPassingControl = this.claimantForm.get('DateofPassing');
        const relationshipWithDeceasedControl = this.claimantForm.get(
          'RelationshipWithDeceased'
        );
        const probateConditionControl =
          this.claimantForm.get('ProbateCondition');
        if (value === 'no') {
          nextOfKinControl?.setValue('N/A');
          dateOfPassingControl?.setValue('');
          relationshipWithDeceasedControl?.setValue('N/A');
          probateConditionControl?.setValue('N/A');
        } else {
          this.showDeceasedCondition = true;
          setTimeout(() => this.scrollDeceasedSectionIntoView(), 0);
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

    this.claimantForm
      .get('subClaimants')
      ?.valueChanges.subscribe((subClaimantsArray: any[]) => {
        for (let i = 0; i < subClaimantsArray.length; i++) {
          const subClaimantGroup = this.subClaimants.at(i) as FormGroup;
          const insuranceControl = subClaimantGroup.get('ClaimantInsurance');
          const injuredValue = subClaimantGroup.get('ClaimantInjured')?.value;
          const propertyValue = subClaimantGroup.get('ClaimantProperty')?.value;

          if (injuredValue === 'no' || propertyValue === 'no') {
            insuranceControl?.setValue('N/A', { emitEvent: false });
          } else {
            this.showSubConditions = true;
            setTimeout(() => this.scrollSubSectionIntoView(), 0);
          }
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

  private futurePastDateValidator(control: any) {
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

  private deceasedDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      return { invalidDate: true };
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
          Validators.pattern("^[a-zA-Z]+(?:['-][a-zA-Z]+)*(?: [a-zA-Z]+)*$"),
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
      DateofBirth: ['', [Validators.required, this.futurePastDateValidator]],
      ClaimantInjured: [null, Validators.required],
      ClaimantProperty: [null, Validators.required],
      ClaimantLossIncurred: this.processLossIncurred(),
      ClaimantInsurance: [null, Validators.required],
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

  private scrollDeceasedSectionIntoView() {
    this.deceasedConditionSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }

  private scrollSubSectionIntoView() {
    if (this.subSectionCondition) {
      this.subSectionCondition.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
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

  processJSObject() {
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
      'Date of Passing': this.claimantForm.get('DateofPassing').value,
      'Claimant Deceased': this.claimantForm.get('ClaimantDeceased').value,
      'Claimant Next of Kin': this.claimantForm.get('ClaimantNextOfKin').value,
      'Relationship With Deceased Claimant': this.claimantForm.get(
        'RelationshipWithDeceased'
      ).value,
      'Probate Process': this.claimantForm.get('ProbateCondition').value,
      'Claimant Injured': this.claimantForm.get('ClaimantInjured').value,
      'Claimant Property': this.claimantForm.get('ClaimantProperty').value,
      'Claimant Loss Incurred': this.getSelectedLossIncurred(),
      'Claimant Insurance': this.claimantForm.get('ClaimantInsurance').value,
    };

    if (mainClaimantData['Date of Passing'] === null) {
      delete mainClaimantData['Date of Passing'];
    }
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
      const claimantsDataObject = this.processJSObject();
      const claimantsJSONData = JSON.stringify(claimantsDataObject);
      console.log('JSON Format:', claimantsJSONData);
      this.claimantService
        .postClaimantsData(claimantsJSONData)
        .subscribe({ error: console.error });
    } else {
      console.log('Invalid Form');
    }
  }
}
