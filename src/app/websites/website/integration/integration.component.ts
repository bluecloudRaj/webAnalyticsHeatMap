import { Component, Inject } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-integration',
    templateUrl: './integration.component.html',
    styleUrls: ['./integration.component.less']
})
export class IntegrationComponent {
    constructor(
        @Inject(MD_DIALOG_DATA) public data: any
    ) { }
}
