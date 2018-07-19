import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { WebsiteService } from '../../shared/website.service';

@Component({
    selector: 'app-ui',
    templateUrl: './ui.component.html',
    styleUrls: ['./ui.component.less']
})
export class UiComponent implements OnInit {
    page;
    loading = false;
    suggestions = [];

    private pages = [];

    constructor(
        private websiteService: WebsiteService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.websiteService.getWebsitePages(params['id']))
            .subscribe(website => {
                this.pages = website.pages;
            });
    }

    onChange(event): void {
        this.suggestions = [];
        this.page = this.pages.filter(page => page._id === event.value).pop();
        this.loading = true;
        this.websiteService.getWebsitePageSuggestions(this.route.snapshot.params['id'], this.page.page)
            .then(suggestions => {
                this.loading = false;
                this.suggestions = suggestions;
            });
    }

}
