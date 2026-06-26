
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


export const loginGuard: CanActivateFn = (route, state) => {
const router = inject(Router);
const authSrv = inject(AuthService);

if (authSrv.isLoggedIn()) {
  router.navigate(['/home']);
}

    return !authSrv.isLoggedIn();
}