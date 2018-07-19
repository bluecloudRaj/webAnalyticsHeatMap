import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MdSnackBar } from '@angular/material';

import 'rxjs/add/operator/catch';

import { WebsiteService } from '../../shared/website.service';
import { Website } from '../../shared/website';

@Component({
    selector: 'app-visitors',
    templateUrl: './visitors.component.html',
    styleUrls: ['./visitors.component.less']
})
export class VisitorsComponent implements OnInit {
    page: number;
    sessions = [];

    private pagination = [];
    private pages: number;
    private offset: number;
    private perPage: number;

    constructor(
        private websiteService: WebsiteService,
        private route: ActivatedRoute,
        private snackBar: MdSnackBar
    ) {
        this.offset = 0;
        this.perPage = 10;
        this.pages = 0;
        this.page = 1;
    }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => {
                /*alert(1);*/ return this.websiteService.getWebsiteSessionsCount(params['id']);
            })
            .subscribe(count => {
                this.pages = Math.ceil(count / this.perPage);
                this.fillPagination();
            });

        this.route.params
            .switchMap(params => {
                // alert(2);
                this.page = +params['page'] || 1;
                this.fillPagination();
                return this.websiteService.getWebsiteSessions(
                    this.route.snapshot.params['id'], this.page * this.perPage - this.perPage, this.perPage
                );
            })
            .subscribe(
                data => this.sessions = data,
                err => {
                    this.snackBar.open(err.message, 'ok', {duration: 4500});
                }
            );

        // proper way but angular is using new syntax
        // this.route.queryParams
        //     .switchMap(params => {
        //         alert(3;
        //         this.page = +params['page'] || 1;
        //         this.fillPagination();
        //         return this.websiteService.getWebsiteSessions(
        //             this.route.snapshot.params['id'], this.page * this.perPage - this.perPage, this.perPage
        //         );
        //     })
        //     .subscribe(sessions => {
        //         this.sessions = sessions;
        //     });
    }

    onDelete(session) {
        this.websiteService.deleteSession(session._id)
            .then(result => {
                this.snackBar.open(result.message, 'ok', {duration: 4500});
                this.sessions = this.sessions.filter(s => s !== session);
                this.reload();
            })
            .catch(result => {
                console.log(result);
                this.snackBar.open(result.message, 'ok', {duration: 4500});
            });
    }

    reload() {
        this.websiteService
            .getWebsiteSessionsCount(this.route.snapshot.params['id'])
            .then(count => {
                this.pages = Math.ceil(count / this.perPage);
                this.fillPagination();
            });

        this.websiteService
            .getWebsiteSessions(this.route.snapshot.params['id'], this.page * this.perPage - this.perPage, this.perPage)
            .then(sessions => {
                this.sessions = sessions;
            });
    }

    private fillPagination() {
        this.pagination = [];
        let last = -1;

        for (let i = 1; i < 4; i++) {
            if (i <= this.pages && i > 0 && !(this.pagination.indexOf(i) > -1)) {
                this.pagination.push(i);
                last = i;
            }
        }

        for (let i = this.page - 2; i < this.page; i++) {
            if (i <= this.pages && i > 0 && !(this.pagination.indexOf(i) > -1)) {
                if (last + 1 !== i) {
                    this.pagination.push(-1);
                }
                this.pagination.push(i);
                last = i;
            }
        }

        for (let i = this.page; i < this.page + 3; i++) {
            if (i <= this.pages && !(this.pagination.indexOf(i) > -1)) {
                if (last + 1 !== i) {
                    this.pagination.push(-1);
                }
                this.pagination.push(i);
                last = i;
            }
        }

        for (let i = this.pages - 2; i <= this.pages; i++) {
            if (i <= this.pages && i > 0 && !(this.pagination.indexOf(i) > -1)) {
                if (last + 1 !== i) {
                    this.pagination.push(-1);
                }
                this.pagination.push(i);
                last = i;
            }
        }
    }
}
