import 'zone.js/dist/zone';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface Data {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
}

type RowData = {
  [x in keyof Data]: FormControl<Data[x]>;
}

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h1>FormArray Test</h1>
    <hr/>
    <form [formGroup]="packs">
      <table formArrayName="contents">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>X</th>
          <th>Y</th>
          <th>Z</th>
          <th></th>
        </tr>
        <tr *ngFor="let x of arrayRef.controls; index as i" [formGroupName]="i">
          <td>
            <input type="number" formControlName="id" />
          </td>
          <td>
            <input type="text" formControlName="name" />
          </td>
          <td>
            <input type="number" formControlName="x" />
          </td>
          <td>
            <input type="number" formControlName="y" />
          </td>
          <td>
            <input type="number" formControlName="z" />
          </td>
          <td>
            <button (click)="remove(i)">Remove</button>
          </td>
        </tr>
      </table>
    </form>
    <hr/>
    <button (click)="add()">Add Row</button>
    <hr/>
    <pre>{{ values | json }}</pre>
  `,
})
export class App implements OnDestroy {
  private _subscriptions = new Array<Subscription>();
  private set subscription(value: Subscription) {
    this._subscriptions.push(value);
  }

  public packs = this.fb.group({
    contents: this.fb.array<FormGroup<RowData>>([]),
  });

  public get values() {
    return this.packs.value;
  }

  public get arrayRef() {
    return this.packs.get('contents') as FormArray<FormGroup<RowData>>;
  }

  constructor(
    private fb: FormBuilder,
  ) { }

  public add(defaultValue: Partial<Data> = {}) {
    const newGroup = this.fb.group<RowData>({
      id: this.fb.control(this.arrayRef.length ? this.arrayRef.length + 1 : 1),
      name: this.fb.control(defaultValue.name || ''),
      x: this.fb.control(defaultValue.x || 0),
      y: this.fb.control(defaultValue.y || 0),
      z: this.fb.control(defaultValue.z || 0),
    });
    
    // Listen changes in row
    this.subscription = newGroup.valueChanges.pipe(
      debounceTime(500),
    ).subscribe(state => {
      console.log(state);
    });

    this.arrayRef.push(newGroup);
  }

  public remove(at: number) {
    this.arrayRef.removeAt(at);
  }

  public ngOnDestroy() {
    for (const subs of this._subscriptions) {
      subs.unsubscribe();
    }
  }
}

bootstrapApplication(App);
