import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { ClientService } from '../../core/services/client.service';
import {
  AccountCreateDto,
  AccountUpdateDto,
  AccountResponseDto,
} from '../../core/models/account';
import { ClientResponseDto } from '../../core/models/client';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-accounts-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage {
  private fb = inject(FormBuilder);
  private accountsApi = inject(AccountService);
  private clientsApi = inject(ClientService);
  private toast = inject(ToastService);

  clients = signal<ClientResponseDto[]>([]);
  accounts = signal<AccountResponseDto[]>([]);
  loading = signal(false);
  submitted = false;
  editMode = signal(false);
  editAccountId = signal<string | null>(null);

  // búsqueda local
  searchTerm = signal('');
  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.accounts();
    if (!term) return list;
    return list.filter(a => {
      const num = a.accountNumber?.toLowerCase() ?? '';
      const name = a.client?.fullName?.toLowerCase() ?? '';
      return num.includes(term) || name.includes(term);
    });
  });

  form = this.fb.group({
    clientRefId: ['', Validators.required], // solo para CREAR
    accountNumber: ['', [Validators.required, Validators.minLength(5)]],
    accountType: [1 as number, [Validators.required]],
    initialBalance: [0, [Validators.required, Validators.min(1)]], // solo crear
    active: [true, [Validators.required]],
  });

  ngOnInit() {
    this.loadClientsAndAccounts();
  }

  loadClientsAndAccounts() {
    this.loading.set(true);
    this.clientsApi.getAll().subscribe({
      next: r => {
        const cl = r?.data ?? [];
        this.clients.set(cl);
        if (cl.length && !this.form.value.clientRefId) {
          this.form.patchValue({ clientRefId: cl[0].clientId });
        }
        this.refreshList();
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
        this.toast.error(err?.error?.data ?? err.message);
      }
    });
  }

  onClientChange(value: string) {
    this.form.patchValue({ clientRefId: value });
  }

  onSearchInput(v: string) { this.searchTerm.set(v); }
  onSearchClear() { this.searchTerm.set(''); }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading.set(true);

    if (this.editMode()) {
      const dto: AccountUpdateDto = {
        accountId: this.editAccountId()!,
        accountNumber: this.form.value.accountNumber!,
        accountType: this.form.value.accountType!,
        active: this.form.value.active!,
      };
      this.accountsApi.update(dto).subscribe({
        next: _ => {
          this.loading.set(false);
          this.toast.success('Cuenta actualizada');
          this.cancelEdit();
          this.resetFormAfterCreate();
          this.refreshList();
        },
        error: err => {
          console.error(err);
          this.loading.set(false);
          this.toast.error(err?.error?.data ?? err.message);
        }
      });
    } else {
      const dto: AccountCreateDto = {
        clientRefId: this.form.value.clientRefId!,
        accountNumber: this.form.value.accountNumber!,
        accountType: this.form.value.accountType!,
        initialBalance: this.form.value.initialBalance!,
        active: this.form.value.active!,
      };
      this.accountsApi.create(dto).subscribe({
        next: _ => {
          this.loading.set(false);
          this.toast.success('Cuenta creada');
          this.resetFormAfterCreate();
          this.refreshList();
        },
        error: err => {
          console.error(err);
          this.loading.set(false);
          this.toast.error(err?.error?.data ?? err.message);
        }
      });
    }
  }

  edit(a: AccountResponseDto) {
    this.editMode.set(true);
    this.editAccountId.set(a.accountId);
    this.form.patchValue({
      clientRefId: a.clientRefId,          // se muestra pero no se usa en update
      accountNumber: a.accountNumber,
      accountType: a.accountType,
      initialBalance: a.initialBalance,    // informativo
      active: a.active,
    });
    this.form.controls.clientRefId.disable();
    this.form.controls.initialBalance.disable();
  }

  cancelEdit() {
    this.editMode.set(false);
    this.editAccountId.set(null);
    this.form.controls.clientRefId.enable();
    this.form.controls.initialBalance.enable();
    this.submitted = false;
  }

  remove(a: AccountResponseDto) {
    if (!confirm(`¿Eliminar la cuenta ${a.accountNumber}?`)) return;
    this.loading.set(true);
    this.accountsApi.delete(a.accountId).subscribe({
      next: _ => {
        this.loading.set(false);
        this.toast.success('Cuenta eliminada');
        this.refreshList();
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
        this.toast.error('No se pudo eliminar la cuenta');
      }
    });
  }

  resetFormAfterCreate() {
    const clientId = this.form.getRawValue().clientRefId;
    this.form.reset({
      clientRefId: clientId ?? '',
      accountNumber: '',
      accountType: 1,
      initialBalance: 0,
      active: true,
    });
    this.submitted = false;
  }

  typeLabel(t: number) {
    switch (t) {
      case 1: return 'Ahorros';
      case 2: return 'Corriente';
      default: return `Tipo ${t}`;
    }
  }

  refreshList() {
    this.accountsApi.listAll().subscribe({
      next: r => { this.accounts.set(r?.data ?? []); this.loading.set(false); },
      error: err => {
        console.error(err);
        this.loading.set(false);
        this.toast.error('Error cargando cuentas');
      }
    });
  }
}
