import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { WebsiteService } from '../../../shared/website.service';

@Component({
    selector: 'app-visitor',
    templateUrl: './visitor.component.html',
    styleUrls: ['./visitor.component.less']
})
export class VisitorComponent implements OnInit {
    session;
    currentIndex = 0;
    playing = false;

    private page;
    private scaleX = 1;
    private scaleY = 1;
    private time = 0;
    private interval;

    constructor(
        private websiteService: WebsiteService,
        private route: ActivatedRoute
    ) { }

    getCurrentProgress(): number {
        if (!this.session) {
            return 0;
        }

        const start = new Date(this.session.actions[0].createdAt).getTime();
        const end = new Date(this.session.actions[this.session.actions.length - 1].createdAt).getTime();

        if (end - start - this.time < 250) {
            this.time = end - start;
        }

        return (this.time) / ((end - start) / 100);
    }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.websiteService.getWebsiteSession(params['id'], params['sid']))
            .subscribe(data => {
                this.page = data.page;
                this.session = data.session;

                this.setup();
            });
    }

    pause(): void {
        this.playing = false;
        clearInterval(this.interval);
    }

    play(): void {
        if (this.session) {
            this.playing = true;
            const t = this;
            this.interval = setInterval(function() {
                t.time += 250;
            }, 250);
            this.action();
        }
    }

    stop(): void {
        this.reset();
    }

    private action(): void {
        if (!this.playing) {
            this.currentIndex -= 1;
            return;
        }

        const actions = this.session.actions;
        const cursor = document.getElementById('cursor');
        const action = actions[this.currentIndex];
        let timeDiff = 150;

        if (this.currentIndex + 1 < actions.length) {
            timeDiff = new Date(actions[this.currentIndex + 1].createdAt).getTime() - new Date(action.createdAt).getTime();
        }

        if (action.type === 1) {
            cursor.style.transition = 'top ' + timeDiff + 'ms, left ' + timeDiff + 'ms';
            cursor.style.top = action.y + 'px';
            cursor.style.left = action.x + 'px';
        } else if (action.type === 2) {
            const node = document.createElement('div');
            node.className = 'click';
            node.style.top = action.y + 'px';
            node.style.left = action.x + 'px';
            document.getElementById('cursors').appendChild(node);
            setTimeout(function() {
                document.getElementById('cursors').removeChild(node);
            }, 1000);
        } else if (action.type === 3) {
            const iframe = document.getElementById('live-iframe');
            const iWindow = (<HTMLIFrameElement> iframe).contentWindow;
            iWindow.scrollTo(action.x, action.y);
        }

        if (this.playing) {
            if (this.currentIndex + 1 < actions.length) {
                const t = this;

                setTimeout(function() {
                    t.currentIndex++;
                    t.action();
                }, timeDiff);
            } else {
                this.reset();
            }
        }
    }

    private reset() {
        this.playing = false;
        this.currentIndex = this.time = 0;
        clearInterval(this.interval);
        const cursor = document.getElementById('cursor');

        cursor.style.left = this.session.actions[this.currentIndex].x + 'px';
        cursor.style.top = this.session.actions[this.currentIndex].y + 'px';

        const iframe = document.getElementById('live-iframe');
        const iWindow = (<HTMLIFrameElement> iframe).contentWindow;
        iWindow.scrollTo(this.session.meta.scrollX, this.session.meta.scrollY);
    }

    private setup(): void {
        const iframe = document.getElementById('live-iframe');
        const iWindow = (<HTMLIFrameElement> iframe).contentWindow;
        iWindow.document.open();
        iWindow.document.writeln(this.page.content);
        iWindow.document.close();

        const pageContent = document.getElementById('page-content');
        const container = document.getElementById('tracking-container');
        const cursors = document.getElementById('cursors');
        const cursor = document.getElementById('cursor');

        const containerHeight = Math.min(pageContent.offsetHeight - 110, this.session.meta.height);
        container.style.height = containerHeight + 'px';

        if (this.session.meta.width > container.offsetWidth) {
            const scaleX = this.scaleX = this.scaleY = container.offsetWidth / this.session.meta.width;
            iframe.style.transform = cursors.style.transform = 'scale(' + scaleX + ',' + scaleX + ')';

            if (container.offsetHeight > this.session.meta.height * scaleX) {
                container.style.height = containerHeight * this.scaleY + 'px';
            }
        }
        if (this.session.meta.height > container.offsetHeight) {
            const scaleY = this.scaleX = this.scaleY = container.offsetHeight / this.session.meta.height;
            iframe.style.transform = cursors.style.transform = 'scale(' + scaleY + ',' + scaleY + ')';
        }

        const paddingLeft = (container.offsetWidth - this.session.meta.width * this.scaleX) / 2;

        iframe.style.width = cursors.style.width = this.session.meta.width + 'px';
        iframe.style.height = cursors.style.height = this.session.meta.height + 'px';
        container.style.padding = '0 0 0 ' + paddingLeft + 'px';

        cursor.style.left = this.session.actions[0].x + 'px';
        cursor.style.top = this.session.actions[0].y + 'px';

        let t = this;
        iframe.onload = function() {
            iWindow.scrollTo(t.session.meta.scrollX , t.session.meta.scrollY);
        };
    }
}
