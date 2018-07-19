import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';

import { WebsitesRoutingModule } from './websites-routing.module';
import { WebsitesComponent } from './websites.component';
import { WebsiteFormComponent } from './website-form/website-form.component';
import { WebsiteService } from './shared/website.service';
import { WebsiteComponent } from './website/website.component';
import { IntegrationComponent } from './website/integration/integration.component';
import { LiveTrackingComponent } from './website/live-tracking/live-tracking.component';
import { VisitorsComponent } from './website/visitors/visitors.component';
import { VisitorComponent } from './website/visitors/visitor/visitor.component';
import { HeatMapsComponent } from './website/heat-maps/heat-maps.component';
import { SettingsComponent } from './website/settings/settings.component';
import { ReportsComponent } from './website/reports/reports.component';
import { HelpComponent } from './website/help/help.component';
import { UiComponent } from './website/ui/ui.component';

@NgModule({
    imports: [
        CommonModule,
        WebsitesRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule.forRoot()
    ],
    declarations: [
        WebsitesComponent,
        WebsiteFormComponent,
        WebsiteComponent,
        IntegrationComponent,
        LiveTrackingComponent,
        VisitorsComponent,
        VisitorComponent,
        HeatMapsComponent,
        SettingsComponent,
        ReportsComponent,
        HelpComponent,
        UiComponent
    ],
    providers: [WebsiteService],
    entryComponents: [IntegrationComponent]
})
export class WebsitesModule { }
