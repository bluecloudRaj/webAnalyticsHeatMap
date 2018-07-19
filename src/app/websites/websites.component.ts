import { Component, OnInit } from '@angular/core';
import { MdSnackBar } from '@angular/material';

import { WebsiteService } from './shared/website.service';

@Component({
    selector: 'app-websites',
    templateUrl: './websites.component.html',
    styleUrls: ['./websites.component.less'],
    providers: [WebsiteService]
})

export class WebsitesComponent implements OnInit {
    websites = [];

    constructor(
        private websiteService: WebsiteService,
        private snackBar: MdSnackBar
    ) { }

    ngOnInit() {
        this.websiteService.getWebsites().then(websites => this.websites = websites);
    }

    onDelete(website) {
        this.websiteService.delete(website._id)
            .then(result => {
                this.snackBar.open(result.message, 'ok', {duration: 4500});
                this.websites = this.websites.filter(w => w !== website);
            })
            .catch(result => {
                this.snackBar.open(result.message, 'ok', {duration: 4500});
            });
    }
}
