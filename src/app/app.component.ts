import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MdSnackBar } from '@angular/material';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { UserService } from './users/shared/user.service';
import { TitleService } from './shared/title.service';

@Component({
    selector: 'app-heater',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})

export class AppComponent implements OnInit {
    title: string;
    description: string;

    constructor(
        private location: Location,
        private snackBar: MdSnackBar,
        private router: Router,
        private titleService: TitleService,
        private activatedRoute: ActivatedRoute,
        public userService: UserService,
    ) { }

    ngOnInit() {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route;
            })
            .filter(route => route.outlet === 'primary')
            .mergeMap(route => route.data)
            .subscribe((event) => {
                this.titleService.setTitle(event['title']);
                this.titleService.setDescription(event['description']);
            });

        this.titleService.title.subscribe((value: string) => {
            this.title = value;
        });
        this.titleService.description.subscribe((value: string) => {
            this.description = value;
        });
    }

    goBack() {
        this.location.back();
    }

    logout() {
        this.userService.logout();
        this.snackBar.open('Logout was successful', 'ok', {duration: 4500});
        this.router.navigate(['/']);
    }
}
