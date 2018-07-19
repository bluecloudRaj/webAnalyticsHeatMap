import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { WebsiteService } from '../../shared/website.service';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.less']
})
export class ReportsComponent implements OnInit {
    visitors = [];
    visitor;
    sessions = [];

    constructor(
        private websiteService: WebsiteService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    calcLength(first, last): string {
        const seconds = Math.round((new Date(last).getTime() - new Date(first).getTime()) / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds - (m * 60);

        let result;
        result = m < 10 ? '0' + m : m;
        result += ':';
        result += s < 10 ? '0' + s : s;

        return result;
    }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.websiteService.getWebsiteVisitors(params['id']))
            .subscribe(users => {
                this.visitors = users;
            });

        this.route.queryParams
            .switchMap(params => {
                if (!params['visitor']) {
                    return Observable.of([]);
                } else {
                    this.visitor = params['visitor'] ? params['visitor'] : 0;

                    return this.websiteService.getVisitorSessions(this.route.snapshot.params['id'], this.visitor);
                }
            })
            .subscribe(sessions => {
                if (this.visitor) {
                    this.sessions = sessions;
                }
            });
    }
}
