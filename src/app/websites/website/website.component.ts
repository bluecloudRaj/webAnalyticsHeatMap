import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MdDialog } from '@angular/material';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

import { IntegrationComponent } from './integration/integration.component';
import { TitleService } from '../../shared/title.service';
import { WebsiteService } from '../shared/website.service';
import { Website } from '../shared/website';
import { Config } from '../../shared/config';

@Component({
    selector: 'app-website',
    templateUrl: './website.component.html',
    styleUrls: ['./website.component.less']
})
export class WebsiteComponent implements OnInit {
    website: Website;

    constructor(
        private titleService: TitleService,
        private websiteService: WebsiteService,
        private route: ActivatedRoute,
        private dialog: MdDialog,
        private router: Router
    ) {
        this.website = new Website();
    }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.websiteService.getWebsite(params['id']))
            .subscribe(
                data => {
                    this.website = data;
                    this.titleService.setTitle('Website detail - ' + data.url);
                },
                err => this.router.navigate(['/websites'])
            );
    }

    showIntegration() {
        const dialogRef = this.dialog.open(IntegrationComponent, {
            data: { key: this.website.publicKey, apiUrl: Config.apiUrl }
        });
    }
}
