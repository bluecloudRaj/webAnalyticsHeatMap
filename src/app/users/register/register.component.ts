import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { UserService } from '../shared/user.service';
import { validateEmail } from '../../shared/email.validator';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.less']
})

export class RegisterComponent {
    registerForm: FormGroup;

    constructor(
        private snackBar: MdSnackBar,
        private userService: UserService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.registerForm = fb.group({
            'firstName': '',
            'lastName': '',
            'email': ['', [Validators.required, validateEmail]],
            'passwords': fb.group({
                'password': ['', [Validators.required, Validators.minLength(6)]],
                'passwordConfirm': ['', Validators.required]
            }, {validator: this.passwordEqual})
        });
    }

    onSubmit(form: any): void {
        if (this.registerForm.valid) {
            this.userService.register(form.email, form.passwords.password, form.firstName, form.lastName)
                .then(message => {
                    this.snackBar.open(message, 'ok', {duration: 4500});
                    this.router.navigate(['/websites']);
                })
                .catch(result => {
                    this.snackBar.open(result.message, 'ok', {duration: 4500});
                });
        }
    }

    passwordEqual(group: any) {
        const password = group.controls.password;
        const confirm = group.controls.passwordConfirm;

        if (password.pristine || confirm.pristine) {
            return null;
        }

        if (password.value === confirm.value) {
            return null;
        }

        return {
            match: true
        };
    }
}
