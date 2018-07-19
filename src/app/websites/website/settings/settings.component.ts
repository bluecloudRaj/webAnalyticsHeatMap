import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { Router, Params, ActivatedRoute } from '@angular/router';

import { WebsiteService } from '../../shared/website.service';
import { Website } from '../../shared/website';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit {
    website: Website;
    form: FormGroup;

    constructor(
        private snackBar: MdSnackBar,
        private websiteService: WebsiteService,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            'viewportDesktop': ['', [Validators.required, Validators.pattern(/^\d+$/)]],
        });
    }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.websiteService.getWebsite(params['id']))
            .subscribe(website => {
                this.website = website;
                this.form.setValue({viewportDesktop: website.settings.viewportDesktop});
            });
    }

    onSubmit(form: any): void {
        if (this.form.valid) {
            this.websiteService.update(this.route.snapshot.params['id'], form.viewportDesktop)
                .then(result => {
                    this.snackBar.open(result.message, 'ok', {duration: 4500});
                    this.router.navigate(['/website', this.route.snapshot.params['id']]);
                })
                .catch(result => {
                    this.snackBar.open(result.message, 'ok', {duration: 4500});
                });
        }

    }

}
