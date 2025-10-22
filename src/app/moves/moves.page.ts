import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MoveService } from '../../core/services/move.service';
import { AccountService } from '../../core/services/account.service';
import { ClientService } from '../../core/services/client.service';
import { MoveResponseDto, MoveCreateDto } from '../../core/models/move';
import { AccountResponseDto } from '../../core/models/account';
import { ClientResponseDto } from '../../core/models/client';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-moves-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './moves.page.html',
  styleUrls: ['./moves.page.scss'],
})
export class MovesPage {
  private fb = inject(FormBuilder);
  private movesApi = inject(MoveService);
  private accountsApi = inject(AccountService);
  private clientsApi = inject(ClientService);
  private toast = inject(ToastService);

  // estado
  clients = signal<ClientResponseDto[]>([]);
  accounts = signal<AccountResponseDto[]>([]);
  moves = signal<MoveResponseDto[]>([]);
  loading = signal(false);
  submitted = false;

  // búsqueda local
  searchTerm = signal('');
  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.moves();
    if (!term) return list;
    return list.filter(m => {
      const typeLabel = this.typeLabel(m.moveType).toLowerCase();
      const acc = (m.account?.accountNumber ?? '').toLowerCase();
      const clientName = this.clientNameById(m.account?.clientRefId ?? '').toLowerCase();
      const amt = String(m.amount).toLowerCase();
      return (
        typeLabel.includes(term) ||
        acc.includes(term) ||
        clientName.includes(term) ||
        amt.includes(term)
      );
    });
  });

  // formulario crear
  form = this.fb.group({
    clientRefId: ['', Validators.required],
    accountRefId: ['', Validators.required],
    moveType: [2 as 1 | 2, Validators.required],   // 1=Crédito, 2=Débito
    amount: [0, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.loading.set(true);
    // 1) clientes
    this.clientsApi.getAll().subscribe({
      next: r => {
        const cls = r?.data ?? [];
        this.clients.set(cls);
        if (cls.length && !this.form.value.clientRefId) {
          this.form.patchValue({ clientRefId: cls[0].clientId });
          this.onClientChange(cls[0].clientId); // carga cuentas del primer cliente
        }
        // 2) movimientos (siempre todos)
        this.movesApi.listAll().subscribe({
          next: res => {
            this.moves.set(res?.data ?? []);
            this.loading.set(false);
          },
          error: err => {
            console.error(err);
            this.loading.set(false);
            this.toast.error('Error cargando movimientos');
          }
        });
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
        this.toast.error('Error cargando clientes');
      }
    });
  }

  // cuando cambia el cliente → cargar cuentas de ese cliente
  onClientChange(clientId: string) {
    if (!clientId) { this.accounts.set([]); this.form.patchValue({ accountRefId: '' }); return; }
    this.accountsApi.listByClient(clientId).subscribe({
      next: r => {
        const accs = r?.data ?? [];
        this.accounts.set(accs);
        // seleccionar primera cuenta si hay
        if (accs.length) this.form.patchValue({ accountRefId: accs[0].accountId });
        else this.form.patchValue({ accountRefId: '' });
      },
      error: err => {
        console.error(err);
        this.toast.error(err?.error?.data ?? err.message);
      }
    });
  }

  onSearchInput(v: string) { this.searchTerm.set(v); }
  onSearchClear() { this.searchTerm.set(''); }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    const dto: MoveCreateDto = {
      moveType: this.form.value.moveType!,
      amount: this.form.value.amount!,
      accountRefId: this.form.value.accountRefId!,
    };

    this.loading.set(true);
    this.movesApi.create(dto).subscribe({
      next: r => {
        this.loading.set(false);
        this.toast.success('Movimiento creado');
        this.refreshList();
        this.form.patchValue({ amount: 0, moveType: 2 });
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
        this.toast.error(err?.error?.data ?? err.message);
        this.refreshList();
      }
    });
  }

  typeLabel(t: 1 | 2) { return t === 1 ? 'Crédito' : 'Débito'; }

  clientNameById(clientId: string): string {
    if (!clientId) return '';
    const c = this.clients().find(x => x.clientId === clientId);
    return c?.fullName ?? '';
  }
}
