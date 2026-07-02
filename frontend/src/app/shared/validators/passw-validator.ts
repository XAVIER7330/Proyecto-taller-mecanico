import {RootFieldContext, SchemaPath, validate} from '@angular/forms/signals';
export function passwordMisMatch(passwR: SchemaPath<string>, passwN: SchemaPath<string>) {

  return  validate(passwR, (ctx : RootFieldContext<string>) : {kind: string; message: string} | null => {
    const pR = ctx.value();
    const pN = ctx.valueOf(passwN);
    if (pR === pN) return null;
    return {
      kind: 'errorCofirmacion',
      message: 'Nueva contraseña y confirmación no coinciden',
    }
   });

     
 

}

export function passworStrength(passwN: SchemaPath<string>) {
    return validate(passwN, (ctx : RootFieldContext<string>) : {kind: string; message: string} | null => {
        const valor = ctx.value();
        if (!valor) return null;
        const hasUppercase = /[A-Z]+/.test(valor);
        const hasLowercase = /[a-z]+/.test(valor);
        const hasDigit = /[0-9]+/.test(valor);
        const hasSpecial = /[#-&*@]+/.test(valor);
        if (hasUppercase && hasLowercase && hasDigit && hasSpecial) {
            return null;
        }
        return {
            kind: 'erroPasswordStrength',
            message: 'La contraseña debe contener al menos  letra mayúscula,  letra minúscula,  número y  carácter especial (#-&*@)',
        };
    })
}