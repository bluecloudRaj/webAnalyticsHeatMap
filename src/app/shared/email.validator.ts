import { FormControl } from '@angular/forms';

export function validateEmail(c: FormControl) {
    const EMAIL_REGEXP = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,6})+$/;

    return EMAIL_REGEXP.test(c.value) ? null : {
        validateEmail: {
            valid: false
        }
    };
}
