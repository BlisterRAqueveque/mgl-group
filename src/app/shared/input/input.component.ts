import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'custom-input',
  standalone: true,
  imports: [
    InputTextModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {

  @Input() id!: string
  @Input() label!: string
  @Input() type!: string

  /** @description return selected value */
  @Input() set inputText(value: any) {
    this._inputText = value
    this.inputTextChange.emit(this._inputText);
  }
  get inputText(): any {
    return this._inputText;
  }

  private _inputText!: any;
  @Output() inputTextChange = new EventEmitter<any>()
  changeInput() {
    this.inputTextChange.emit(this.inputText)
  }

}
