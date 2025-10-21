import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _list = signal<Toast[]>([]);
  list = this._list.asReadonly();
  private seq = 0;

  show(message: string, type: ToastType = 'info', timeout = 3500) {
    const id = ++this.seq;
    const toast: Toast = { id, type, message, timeout };
    this._list.set([toast, ...this._list()]);
    if (timeout > 0) {
      setTimeout(() => this.dismiss(id), timeout);
    }
  }

  success(msg: string, timeout = 2500) { this.show(msg, 'success', timeout); }
  error(msg: string, timeout = 4500) { this.show(msg, 'error', timeout); }
  info(msg: string, timeout = 3000) { this.show(msg, 'info', timeout); }
  warning(msg: string, timeout = 4000) { this.show(msg, 'warning', timeout); }

  dismiss(id: number) {
    this._list.set(this._list().filter(t => t.id !== id));
  }
  clear() { this._list.set([]); }
}
