import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Form } from '@features/admin/workspace/features/form-builder/models/form-builder.models';
import { FormBuilderService } from '@features/admin/workspace/features/form-builder/services/form-builder.service';
import { Workspace } from '@features/admin/workspace/models/workspace.model';
import { WorkspaceService } from '@features/admin/workspace/services/workspace.service';
import { Submission } from '@features/admin/submissions/models/submission.model';
import { SubmissionService } from '@features/admin/submissions/services/submission.service';
import { AnswerMap } from '../models/portal.model';

export interface WorkspaceCatalogEntry {
    workspace: Workspace;
    publishedForms: Form[];
}

@Injectable({ providedIn: 'root' })
export class PublicFormService {
    private readonly workspaceSvc    = inject(WorkspaceService);
    private readonly formBuilderSvc  = inject(FormBuilderService);
    private readonly submissionSvc   = inject(SubmissionService);

    /** Todos los workspaces activos con sus formularios publicados */
    getPublicCatalog(): WorkspaceCatalogEntry[] {
        return this.workspaceSvc.workspaces()
            .filter(ws => ws.status === 'ACTIVE')
            .map(ws => ({
                workspace: ws,
                publishedForms: this.formBuilderSvc
                    .getFormsForWorkspace(ws.id)
                    .filter(f => f.status === 'published')
            }))
            .filter(e => e.publishedForms.length > 0);
    }

    /** Busca un form en todos los workspaces (la URL pública no expone workspaceId) */
    findFormById(formId: string): { form: Form; workspace: Workspace } | undefined {
        for (const ws of this.workspaceSvc.workspaces()) {
            const form = this.formBuilderSvc.getForm(ws.id, formId);
            if (form) return { form, workspace: ws };
        }
        return undefined;
    }

    submitForm(workspace: Workspace, form: Form, answers: AnswerMap): Observable<Submission> {
        const allQuestions = form.sections
            .sort((a, b) => a.order - b.order)
            .flatMap(s => s.questions.sort((a, b) => a.order - b.order));

        const payload: Omit<Submission, 'id'> = {
            workspaceId:   workspace.id,
            workspaceName: workspace.name,
            formId:        form.id,
            formName:      form.name,
            submittedBy:   'Ciudadano',
            submittedAt:   new Date().toISOString(),
            status:        'pending',
            answers: allQuestions.map(q => ({
                questionId:    q.id,
                questionLabel: q.label,
                questionType:  q.type,
                value:         answers[q.id] ?? null
            }))
        };

        return this.submissionSvc.create(payload);
    }
}
