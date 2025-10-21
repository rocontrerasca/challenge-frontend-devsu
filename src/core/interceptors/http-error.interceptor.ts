import { HttpInterceptorFn } from '@angular/common/http';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe();
  // Puedes agregar manejo global de errores y headers aquí si lo necesitas.
};