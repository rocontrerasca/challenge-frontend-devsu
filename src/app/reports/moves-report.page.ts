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
    this.loadClients();
  }

  private loadClients() {
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
          to: `${yyyy}-${mm}-${dd}`,
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
    const endISO = this.endOfDayISO(this.form.value.to!);
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

  exportPdfBase64() {
    this.submitted = true;
    if (this.form.invalid) return;

    const startISO = this.startOfDayISO(this.form.value.from!);
    const endISO = this.endOfDayISO(this.form.value.to!);
    const clientId = this.form.value.clientId!;

    this.loading.set(true);
    this.movesApi.reportPdf(startISO, endISO, clientId).subscribe({
      next: r => {
        const { base64, fileName } = r.data;
        const blob = this.base64ToBlob(base64, 'application/pdf');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        this.toast.success('PDF generado exitosamente');
      },
      error: err => {
        console.error(err);
        this.toast.error(err?.error?.data ?? err.message);
      }
    });
  }

  // ===== Exportar JSON =====
  exportJson() {
    const data = this.rows();
    if (!data.length) {
      this.toast.info('No hay datos para exportar');
      return;
    }

    // Formateadores iguales a la tabla
    const fmtDate = (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    };
    const fmtNum = (n: number) =>
      (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Mapear a los nombres de columna en español
    const mapped = data.map(r => ({
      'Fecha': fmtDate(r.transactionDate),
      'Cliente': r.client,
      'Número cuenta': r.account,
      'Tipo': r.accountType,                 // ya viene como "Ahorros"/"Corriente"
      'Saldo inicial': fmtNum(r.initialBalance),
      'Estado': r.success ? 'Éxito' : 'Falló',
      'Movimiento': fmtNum(r.amount),
      'Saldo final': fmtNum(r.finalBalance),
    }));

    const filename = this.buildFilename('reporte-movimientos', 'json'); // ya lo tienes
    const json = JSON.stringify(mapped, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    this.downloadBlob(blob, filename);
    this.toast.success('JSON exportado con encabezados de tabla');
  }

  // ===== Utils de descarga y nombres =====
  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  private buildFilename(base: string, ext: string) {
    const f = this.form.value.from || '';
    const t = this.form.value.to || '';
    const safe = `${base}_${f || 'SIN-FECHA'}_${t || 'SIN-FECHA'}.${ext}`.replace(/[^\w.\-]+/g, '_');
    return safe;
  }

  private base64ToBlob(base64: string, type = 'application/octet-stream') {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type });
  }
}
