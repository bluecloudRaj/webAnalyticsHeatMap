import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { WebsiteService } from '../../shared/website.service';
import { Website } from '../../shared/website';
import { Visitor } from '../../shared/visitor';
import { Config } from '../../../shared/config';

import * as io from 'socket.io-client';

@Component({
    selector: 'app-live-tracking',
    templateUrl: './live-tracking.component.html',
    styleUrls: ['./live-tracking.component.less']
})

export class LiveTrackingComponent implements OnInit, OnDestroy, AfterViewInit {
    website: Website;
    users = [];
    page: any;

    private url = Config.apiUrl;
    private socket: any;
    private iframeHeight: number;
    private iframeWidth: number;
    private mouseOver;
    private mouseMove;
    private mouseOut;
    private lastElem;
    private scale = 1;

    constructor(
        private websiteService: WebsiteService,
        private route: ActivatedRoute
    ) {
        this.website = new Website();
        // @todo ak ostane cas skusit poriesit
        this.mouseOver = new MouseEvent('mouseover');
        this.mouseMove = new MouseEvent('mousemove');
        this.mouseOut = new MouseEvent('mouseout');
    }

    down(): void {
        const iframe = document.getElementById('live-iframe');
        const iWindow = (<HTMLIFrameElement> iframe).contentWindow;

        let move = 100;
        if (iWindow.scrollY + 100 > iWindow.document.body.offsetHeight - 500) {
            move = iWindow.document.body.offsetHeight - 500 - iWindow.scrollY;
        }

        iWindow.scrollTo(iWindow.scrollX, iWindow.scrollY + move);

        const cursors = document.getElementById('live-cursors');
        cursors.style.top = (cursors.offsetTop - (move * this.scale)) + 'px';
    }

    ngAfterViewInit() {
        const iframe = document.getElementById('live-iframe');
        this.iframeHeight = iframe.offsetHeight;
        this.iframeWidth = iframe.offsetWidth;
    }

    ngOnDestroy() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.websiteService.getWebsitePages(params['id']))
            .subscribe(website => {
                this.website = website;

                if (this.website.settings.layout === 1 && this.iframeWidth < this.website.settings.viewportDesktop) {
                    const iframe = document.getElementById('live-iframe');
                    const cursors = document.getElementById('live-cursors');
                    const container = document.getElementById('live-tracking-container');
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
        if (this.socket) {
            this.socket.disconnect();
        }

        this.page = this.website.pages.filter(page => page._id === event.value).pop();

        this.websiteService.getWebsitePageContent(this.route.snapshot.params['id'], this.page.page)
            .then(content => {
                this.page.content = content;

                const iframe = document.getElementById('live-iframe');
                const iWindow = (<HTMLIFrameElement> iframe).contentWindow;
                iWindow.document.open();
                iWindow.document.writeln(this.page.content);
                iWindow.document.close();

                const t = this;
                iframe.onload = function() {
                    document.getElementById('live-cursors').style.height = iWindow.document.body.offsetHeight + 'px';
                };
            });

        this.socket = io(this.url, {query: 'live=' + this.website.privateKey + '&page=' + this.page._id});

        this.socket.on('userConnected', (user) => {
            if (this.website.settings.layout === 1) {
                user.scaleX = 1;
                user.scaleY = 1;
            } else {
                user.scaleX = this.iframeWidth / user.width;
                user.scaleY = this.iframeHeight / user.height;
            }

            user.scrollX = parseFloat(user.scrollX);
            user.scrollY = parseFloat(user.scrollY);

            this.users.push(user);
            this.createCursor(user.visitor);
        });

        this.socket.on('userDisconnected', (id) => {
            this.users = this.users.filter(user => user.visitor !== id);
            this.deleteCursor(id);
        });

        this.socket.on('userList', (users) => {
            document.getElementById('live-cursors').innerHTML = '';
            this.users = [];
            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                user.scrollX = parseFloat(user.scrollX);
                user.scrollY = parseFloat(user.scrollY);

                this.createCursor(user.visitor, user.x, user.y, user.scrollX, user.scrollY);

                delete user.x;
                delete user.y;

                if (this.website.settings.layout === 1) {
                    user.scaleX = 1;
                    user.scaleY = 1;
                } else {
                    user.scaleX = this.iframeWidth / user.width;
                    user.scaleY = this.iframeHeight / user.height;
                }

                this.users.push(user);
            }
        });

        this.socket.on('action', (data) => {
            const visitor = data.visitor;
            data = data.data;
            data.visitor = visitor;

            const user = this.users.filter(u => u.visitor === data.visitor).pop();

            if (this.website.settings.layout === 1 && data.type !== 3) {
                data.x += (this.iframeWidth - user.width) / 2;
            }

            if (data.type === 1) {
                if (document.getElementById(data.visitor)) {
                    const elem = document.getElementById(data.visitor);
                    elem.style.top = (data.y + user.scrollY) * user.scaleY + 'px';
                    elem.style.left = (data.x + user.scrollX) * user.scaleX + 'px';

                    // @todo ak ostane cas skusit vyriesit
                    // const element = iWindow.document.elementFromPoint(
                    //     (data.x + user.scrollX) * user.scaleX,
                    //     (data.y + user.scrollY) * user.scaleY
                    // );

                    // @todo new mouseevent pozriet parametre, netreba ani elementFromPoint
                    // var elem3 = iWindow.document.getElementById('main-nav').children[0].children[0].children[0];
                    // var elem4 = elem3.children[1].children[1];

                    // elem3.dispatchEvent(this.mouseOver);
                    // elem3.dispatchEvent(this.mouseMove);
                    // elem4.dispatchEvent(this.mouseOver);


                    // if (element) {
                    //     element.dispatchEvent(this.mouseOver);
                    //     element.dispatchEvent(this.mouseMove);

                        
                    // }

                    // if (element) {
                    //     if (element === this.lastElem) {
                    //         element.dispatchEvent(this.mouseMove);
                    //         console.log('same mousemove');
                    //     } else {
                    //         element.dispatchEvent(this.mouseOver);
                    //         element.dispatchEvent(this.mouseMove);

                    //         if (element.parentElement && element.parentElement.nodeName === 'LI') {
                    //             element.parentNode.dispatchEvent(this.mouseOver);
                    //             element.parentNode.dispatchEvent(this.mouseMove);
                    //         }

                    //         if (this.lastElem) {
                    //             this.lastElem.dispatchEvent(this.mouseOut);
                    //             if (this.lastElem.parentElement && this.lastElem.parentElement.nodeName === 'LI') {
                    //                 this.lastElem.parentNode.dispatchEvent(this.mouseOut);
                    //             }
                    //             console.log(this.lastElem);
                    //             console.log('mouse out');
                    //         }
                    //     }
                    // }

                    // this.lastElem = element;
                }
            } else if (data.type === 2) {
                const node = document.createElement('div');
                node.className = 'click';
                node.style.top = (data.y + user.scrollY) * user.scaleY + 'px';
                node.style.left = (data.x + user.scrollX) * user.scaleX + 'px';
                document.getElementById('live-cursors').appendChild(node);
                setTimeout(function() {
                    document.getElementById('live-cursors').removeChild(node);
                }, 1000);
            } else if (data.type === 3) {
                user.scrollX = data.x;
                user.scrollY = data.y;
            }
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

        const cursors = document.getElementById('live-cursors');
        cursors.style.top = (cursors.offsetTop + (move * this.scale)) + 'px';
    }

    private createCursor(id, x = -1000, y = -1000, scrollX = 0, scrollY = 0) {
        if (!document.getElementById(id)) {
            const node = document.createElement('div');
            node.id = id;
            node.className = 'cursor';
            node.style.left = (x + scrollX) + 'px';
            node.style.top = (y + scrollY) + 'px';
            document.getElementById('live-cursors').appendChild(node);
        }
    }

    private deleteCursor(id) {
        if (document.getElementById(id)) {
            document.getElementById('live-cursors').removeChild(document.getElementById(id));
        }
    }
}
