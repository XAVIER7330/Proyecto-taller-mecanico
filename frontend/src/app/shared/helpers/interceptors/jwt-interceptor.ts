import { HttpInterceptorFn } from '@angular/common/http';
import { TokensService } from '../../services/tokens.service';
import { inject } from '@angular/core';



export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokensService).token;
  
  const cloneReq = req.clone({

    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(cloneReq);
};
