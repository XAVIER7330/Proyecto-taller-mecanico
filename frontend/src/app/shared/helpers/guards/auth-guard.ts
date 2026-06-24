import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log(route.data['roles']);
  console.log('User role: ', authService.userActualS());
  if (authService.isLoggedIn()) {
    if(Object(route.data).length !== 0 && route.data['roles'].indexOf(authService.userActualS().rol) === -1 ) {
    router.navigate(['error403']);
    return false;
    }
    return true;
  } else {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }
};
