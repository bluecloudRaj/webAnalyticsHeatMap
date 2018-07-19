import 'hammerjs';

import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { UsersModule } from './users/users.module';
import { WebsitesModule } from './websites/websites.module';

import { HomepageComponent } from './homepage/homepage.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { UserService } from './users/shared/user.service';
import { TitleService } from './shared/title.service';


@NgModule({
    declarations: [
        AppComponent,
        HomepageComponent,
        PageNotFoundComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        MaterialModule,
        UsersModule,
        WebsitesModule,
        AppRoutingModule,
        FormsModule
    ],
    providers: [UserService, Title, TitleService],
    bootstrap: [AppComponent]
})
export class AppModule { }
