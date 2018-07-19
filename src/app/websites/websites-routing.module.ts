import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth-guard.service';
import { WebsitesComponent } from './websites.component';
import { WebsiteComponent } from './website/website.component';
import { WebsiteFormComponent } from './website-form/website-form.component';
import { LiveTrackingComponent } from './website/live-tracking/live-tracking.component';
import { VisitorsComponent } from './website/visitors/visitors.component';
import { VisitorComponent } from './website/visitors/visitor/visitor.component';
import { HeatMapsComponent } from './website/heat-maps/heat-maps.component';
import { SettingsComponent } from './website/settings/settings.component';
import { ReportsComponent } from './website/reports/reports.component';
import { UiComponent } from './website/ui/ui.component';
import { HelpComponent } from './website/help/help.component';

const routes: Routes = [
    {
        path: 'websites',
        canActivate: [AuthGuard],
        component: WebsitesComponent,
        data: {title: 'Websites', description: 'List of your websites'}
    },
    {
        path: 'websites/add',
        canActivate: [AuthGuard],
        component: WebsiteFormComponent,
        data: {title: 'Add a new website'}
    },
    {
        path: 'website/:id',
        canActivate: [AuthGuard],
        component: WebsiteComponent,
        data: {title: 'Website detail'}
    },
    // @todo maybe child routes? - not important
    {
        path: 'website/:id/live-tracking',
        canActivate: [AuthGuard],
        component: LiveTrackingComponent,
        data: {title: 'Live tracking'}
    },
    {
        path: 'website/:id/visitors',
        canActivate: [AuthGuard],
        component: VisitorsComponent,
        data: {title: 'Visitors'}
    },
    {
        path: 'website/:id/visitors/:sid',
        canActivate: [AuthGuard],
        component: VisitorComponent,
        data: {title: 'Visitor'}
    },
    {
        path: 'website/:id/heat-maps',
        canActivate: [AuthGuard],
        component: HeatMapsComponent,
        data: {title: 'Heat maps'}
    },
    {
        path: 'website/:id/settings',
        canActivate: [AuthGuard],
        component: SettingsComponent,
        data: {title: 'Settings'}
    },
    {
        path: 'website/:id/reports',
        canActivate: [AuthGuard],
        component: ReportsComponent,
        data: {title: 'Reports'}
    },
    {
        path: 'website/:id/user-interface',
        canActivate: [AuthGuard],
        component: UiComponent,
        data: {title: 'User interface analyser'}
    },
    {
        path: 'website/:id/help',
        canActivate: [AuthGuard],
        component: HelpComponent,
        data: {title: 'Help'}
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class WebsitesRoutingModule { }
