import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { UserService } from '../users/shared/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    canActivate() {
        if (this.userService.isLoggedIn) {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }
}
