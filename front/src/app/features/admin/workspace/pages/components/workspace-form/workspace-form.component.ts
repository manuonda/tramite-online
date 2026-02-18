import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ColorPicker } from 'primeng/colorpicker';
import { Select } from 'primeng/select';
import { Fluid } from 'primeng/fluid';
import { Message } from 'primeng/message';
import { Workspace, generateSlug } from '../../../models/workspace.model';

@Component({
  selector: 'app-workspace-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    Textarea,
    ButtonModule,
    ColorPicker,
    Select,
    Fluid,
    Message
  ],
  templateUrl: './workspace-form.component.html',
  styleUrls: ['./workspace-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() workspace?: Workspace;
  @Input() submitLabel = 'Create Workspace';
  @Output() submitForm = new EventEmitter<Partial<Workspace>>();
  @Output() cancel = new EventEmitter<void>();

  workspaceForm!: FormGroup;

  iconOptions = [
    { label: 'Briefcase', value: 'pi-briefcase', icon: 'pi pi-briefcase' },
    { label: 'Megaphone', value: 'pi-megaphone', icon: 'pi pi-megaphone' },
    { label: 'Users', value: 'pi-users', icon: 'pi pi-users' },
    { label: 'Headphones', value: 'pi-headphones', icon: 'pi pi-headphones' },
    { label: 'Chart Line', value: 'pi-chart-line', icon: 'pi pi-chart-line' },
    { label: 'Shopping Cart', value: 'pi-shopping-cart', icon: 'pi pi-shopping-cart' },
    { label: 'Cog', value: 'pi-cog', icon: 'pi pi-cog' },
    { label: 'Building', value: 'pi-building', icon: 'pi pi-building' },
  ];

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.workspaceForm = this.fb.group({
      name: [this.workspace?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [this.workspace?.description || ''],
      color: [this.workspace?.color || '#3B82F6'],
      icon: [this.workspace?.icon || 'pi-briefcase']
    });
  }

  onSubmit() {
    if (this.workspaceForm.valid) {
      const formValue = this.workspaceForm.value;
      const data: Partial<Workspace> = {
        ...formValue,
        slug: generateSlug(formValue.name)
      };
      this.submitForm.emit(data);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  get nameControl() {
    return this.workspaceForm.get('name');
  }

  get previewSlug(): string {
    const name = this.workspaceForm.get('name')?.value || '';
    return generateSlug(name);
  }
}
