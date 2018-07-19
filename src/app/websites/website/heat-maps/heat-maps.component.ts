import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { WebsiteService } from '../../shared/website.service';

@Component({
    selector: 'app-heat-maps',
    templateUrl: './heat-maps.component.html',
    styleUrls: ['./heat-maps.component.less']
})
export class HeatMapsComponent implements OnInit, AfterViewInit {
    page;
    loading = false;

    private website;
    private pages = [];
    private sessions = [];
    private iframeHeight: number;
    private iframeWidth: number;
    private scale = 1;

    constructor(
        private websiteService: WebsiteService,
        private route: ActivatedRoute
    ) { }

    down(): void {
        const iframe = document.getElementById('live-iframe');
        const iWindow = (<HTMLIFrameElement> iframe).contentWindow;

        let move = 100;
        if (iWindow.scrollY + 100 > iWindow.document.body.offsetHeight - 500) {
            move = iWindow.document.body.offsetHeight - 500 - iWindow.scrollY;
        }

        iWindow.scrollTo(iWindow.scrollX, iWindow.scrollY + move);

        const cursors = document.getElementById('cursors');
        cursors.style.top = (cursors.offsetTop - (move * this.scale)) + 'px';
    }

    toggle(event, type): void {
        if (event.checked) {
            const elem = document.getElementsByClassName(type);
            for (let i = 0; i < elem.length; i++) {
                const e = <HTMLScriptElement> elem[i];
                e.style.display = 'block';
            }
        } else {
            const elem = document.getElementsByClassName(type);
            for (let i = 0; i < elem.length; i++) {
                const e = <HTMLScriptElement> elem[i];
                e.style.display = 'none';
            }
        }
    }

    ngAfterViewInit() {
        const iframe = document.getElementById('live-iframe');
        this.iframeHeight = iframe.offsetHeight;
        this.iframeWidth = iframe.offsetWidth;
    }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.websiteService.getWebsitePages(params['id']))
            .subscribe(website => {
                this.pages = website.pages;

                delete website.pages;
                this.website = website;

                if (this.website.settings.layout === 1 && this.iframeWidth < this.website.settings.viewportDesktop) {
                    const iframe = document.getElementById('live-iframe');
                    const cursors = document.getElementById('cursors');
                    const container = document.getElementById('tracking-container');
                    const scale = this.scale = this.iframeWidth / this.website.settings.viewportDesktop;

                    iframe.style.minWidth = cursors.style.minWidth = (this.website.settings.viewportDesktop) + 'px';
                    iframe.style.transform = cursors.style.transform = 'scale(' + scale + ',' + scale + ')';
                    this.iframeWidth = this.website.settings.viewportDesktop;

                    if (this.iframeHeight > iframe.offsetHeight * scale) {
                        container.style.height = iframe.offsetHeight * scale + 'px';
                    }
                }
            });
    }

    onChange(event): void {
        this.page = this.pages.filter(page => page._id === event.value).pop();
        this.loading = true;

        const iframe = document.getElementById('live-iframe');
        const iWindow = (<HTMLIFrameElement> iframe).contentWindow;
        const cursors = document.getElementById('cursors');

        while (cursors.hasChildNodes()) {
            cursors.removeChild(cursors.lastChild);
        }

        this.websiteService.getWebsitePageContent(this.route.snapshot.params['id'], this.page.page)
            .then(content => {
                this.page.content = content;

                iWindow.document.open();
                iWindow.document.writeln(this.page.content);
                iWindow.document.close();

                iframe.onload = function() {
                    cursors.style.height = iWindow.document.body.offsetHeight + 'px';
                };
            });

        this.websiteService.getWebsitePageActions(this.route.snapshot.params['id'], this.page.page, this.iframeWidth, this.iframeHeight)
            .then(sessions => {
                this.sessions = sessions;
                this.load();
            });
    }

    up(): void {
        const iframe = document.getElementById('live-iframe');
        const iWindow = (<HTMLIFrameElement> iframe).contentWindow;

        let move = 100;
        if (iWindow.scrollY - 100 < 0) {
            move = iWindow.scrollY;
        }

        iWindow.scrollTo(iWindow.scrollX, iWindow.scrollY - move);

        const cursors = document.getElementById('cursors');
        cursors.style.top = (cursors.offsetTop + (move * this.scale)) + 'px';
    }

    private load(): void {
        const positions = [];
        const container = document.getElementById('tracking-container');

        for (let i = 0; i < this.sessions.length; i++) {
            const action = this.sessions[i];

            const cursor = document.createElement('div');
            const cursor2 = document.createElement('div');

            cursor.className = 'cursor2';
            cursor.style.top = action.y + 'px';
            cursor.style.left = action.x + 'px';
            cursor.style.opacity = action.m;

            document.getElementById('cursors').appendChild(cursor);

            cursor2.className = 'click2';
            cursor2.style.top = action.y + 'px';
            cursor2.style.left = action.x + 'px';
            cursor2.style.opacity = action.c;

            document.getElementById('cursors').appendChild(cursor2);
        }

        this.loading = false;
    }
}
