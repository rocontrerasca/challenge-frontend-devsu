import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import {
  ClientResponseDto,
  ClientCreateDto,
  ClientUpdateDto,
} from '../../core/models/client';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-clients-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage {
  private fb = inject(FormBuilder);
  private api = inject(ClientService);
  private toast = inject(ToastService);

  clients = signal<ClientResponseDto[]>([]);
  loading = signal(false);
  submitted = false;
  editId: string | null = null;

  // Buscador (client-side) + (server-side opcional)
  searchTerm = signal('');
  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.clients();
    if (!term) return list;

    return list.filter(c => {
      const name = c.fullName?.toLowerCase() ?? '';
      const idn = c.identificationNumber?.toLowerCase() ?? '';
      const phone = c.phoneNumber?.toLowerCase() ?? '';
      return name.includes(term) || idn.includes(term) || phone.includes(term);
    });
  });

  form = this.fb.group({
    // para crear
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    gender: ['', [Validators.required]],
    age: [0, [Validators.required, Validators.min(0), Validators.max(120)]],
    identificationNumber: ['', [Validators.required, Validators.minLength(5)]],
    address: ['', [Validators.required, Validators.minLength(3)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(5)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    active: [true, [Validators.required]],
  });

  ngOnInit() { this.reload(); }

  // Carga listado (si tu API soporta ?q= se puede pasar término)
  reload() {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (r) => {
        this.clients.set(r?.data ?? []);
        this.loading.set(false);
        this.onSearchInput("")
      },
      error: (err) => {
        this.toast.error('Error cargando clientes: ' + (err?.error?.data ?? err.message));
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  // UI helpers
  reset() {
    this.submitted = false;
    this.editId = null;
    this.form.reset({
      fullName: '',
      gender: '',
      age: 0,
      identificationNumber: '',
      address: '',
      phoneNumber: '',
      password: '',
      active: true,
    });
  }

  edit(c: ClientResponseDto) {
    this.editId = c.clientId;
    this.form.setValue({
      fullName: c.fullName,
      gender: c.gender,
      age: c.age,
      identificationNumber: c.identificationNumber,
      address: c.address,
      phoneNumber: c.phoneNumber,
      password: '',
      active: c.active,
    });
    this.submitted = false;
  }

  remove(c: ClientResponseDto) {
    if (!confirm(`¿Eliminar cliente "${c.fullName}"?`)) return;
    this.loading.set(true);
    this.api.delete(c.clientId).subscribe({
      next: () => {
        this.toast.success('Cliente eliminado correctamente');
        this.loading.set(false);
        this.reload();
      },
      error: (err) => {
        this.toast.error('No se pudo eliminar el cliente: ' + (err?.error?.data ?? err.message));
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  // Crear / Actualizar según haya editId o no
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading.set(true);

    if (this.editId) {
      const payload: ClientUpdateDto = {
        clientId: this.editId,
        password: this.form.value.password!,         // requerido por tu backend
        active: this.form.value.active!,
        fullName: this.form.value.fullName!,
        gender: this.form.value.gender! as 'M' | 'F',
        age: this.form.value.age!,
        identificationNumber: this.form.value.identificationNumber!,
        address: this.form.value.address!,
        phoneNumber: this.form.value.phoneNumber!,
      };
      this.api.update(this.editId, payload).subscribe({
        next: () => {
          this.toast.success('Cliente actualizado correctamente');
          this.loading.set(false);
          this.reset();
          this.reload();
        },
        error: (err) => {
          this.toast.error('No se pudo actualizar el cliente: ' + (err?.error?.data ?? err.message));
          console.error(err);
          this.loading.set(false);
        },
      });
    } else {
      const payload: ClientCreateDto = {
        fullName: this.form.value.fullName!,
        gender: this.form.value.gender! as 'M' | 'F',
        age: this.form.value.age!,
        identificationNumber: this.form.value.identificationNumber!,
        address: this.form.value.address!,
        phoneNumber: this.form.value.phoneNumber!,
        password: this.form.value.password!,         // requerido por tu backend
        active: this.form.value.active!,
      };
      this.api.create(payload).subscribe({
        next: () => {
          this.toast.success('Cliente creado correctamente');
          this.loading.set(false);
          this.reset();
          this.reload();
        },
        error: (err) => {
          this.toast.error('No se pudo crear el cliente: ' + (err?.error?.data ?? err.message));
          console.error(err);
          this.loading.set(false);
        },
      });
    }
  }

  // Buscador: filtra en front y opcionalmente pega al server
  onSearchInput(value: string) {
    this.searchTerm.set(value);
    // Filtrado inmediato en front (filtered())
  }
  onSearchSubmit() {
    // Si quieres buscar en el servidor cuando presionas Enter o “Buscar”:
    this.reload();
  }
}
