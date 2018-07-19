import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { UserService } from '../shared/user.service';
import { validateEmail } from '../../shared/email.validator';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less']
})
export class LoginComponent {
    loginForm: FormGroup;

    constructor(
        private snackBar: MdSnackBar,
        private userService: UserService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.loginForm = fb.group({
            'email': ['', [Validators.required, validateEmail]],
            'password': ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(form: any): void {
        if (this.loginForm.valid) {
            this.userService.login(form.email, form.password)
                .then(message => {
                    this.snackBar.open(message, 'ok', {duration: 4500});
                    this.router.navigate(['/websites']);
                })
                .catch(result => {
                    this.snackBar.open(result.message, 'ok', {duration: 4500});
                });
        }
    }
}
