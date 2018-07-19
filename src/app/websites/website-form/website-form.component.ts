import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { WebsiteService } from '../shared/website.service';

@Component({
  selector: 'app-website-form',
  templateUrl: './website-form.component.html',
  styleUrls: ['./website-form.component.less']
})
export class WebsiteFormComponent {
    form: FormGroup;

    constructor(
        private snackBar: MdSnackBar,
        private websiteService: WebsiteService,
        private fb: FormBuilder,
        private router: Router
    ) {
        const pattern = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
        this.form = fb.group({
            'url': ['', [Validators.required, Validators.pattern(pattern)]],
        });
    }

    onSubmit(form: any): void {
        if (this.form.valid) {
            this.websiteService.create(form.url)
                .then(result => {
                    this.snackBar.open(result.message, 'ok', {duration: 4500});
                    this.router.navigate(['/website', result.id]);
                })
                .catch(result => {
                    this.snackBar.open(result.message, 'ok', {duration: 4500});
                });
        }

    }
}
