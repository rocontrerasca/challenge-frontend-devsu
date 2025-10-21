import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { MoveService } from '../../core/services/move.service';
import { ClientResponseDto } from '../../core/models/client';
import { MoveReportRow } from '../../core/models/report';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-moves-report-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './moves-report.page.html',
  styleUrls: ['./moves-report.page.scss']
})
export class MovesReportPage {
  private fb = inject(FormBuilder);
  private clientsApi = inject(ClientService);
  private movesApi = inject(MoveService);
  private toast = inject(ToastService);

  clients = signal<ClientResponseDto[]>([]);
  loading = signal(false);
  rows = signal<MoveReportRow[]>([]);
  submitted = false;

  form = this.fb.group({
    clientId: ['', Validators.required],
    from: ['', Validators.required],  // yyyy-MM-dd
    to: ['', Validators.required],    // yyyy-MM-dd
  });

  ngOnInit() {
    this.bootstrap();
  }

  private bootstrap() {
    this.loading.set(true);
    this.clientsApi.getAll().subscribe({
      next: r => {
        const list = r?.data ?? [];
        this.clients.set(list);

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.form.patchValue({
          clientId: list[0]?.clientId ?? '',
          from: `${yyyy}-${mm}-${dd}`,
          to:   `${yyyy}-${mm}-${dd}`,
        });

        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
        this.toast.error('Error cargando clientes');
      }
    });
  }

  onSearch() {
    this.submitted = true;
    if (this.form.invalid) return;

    const startISO = this.startOfDayISO(this.form.value.from!);
    const endISO   = this.endOfDayISO(this.form.value.to!);
    const clientId = this.form.value.clientId!;

    this.loading.set(true);
    this.movesApi.report(startISO, endISO, clientId).subscribe({
      next: r => {
        this.rows.set(r?.data ?? []);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
        this.toast.error('No se pudo obtener el reporte');
      }
    });
  }

  private startOfDayISO(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    return dt.toISOString();
  }
  private endOfDayISO(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d, 23, 59, 59, 999);
    return dt.toISOString();
  }

  typeBadge(t: string) {
    return t;
  }
}
