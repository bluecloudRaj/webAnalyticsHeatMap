import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { UserService } from '../../users/shared/user.service';
import { Config } from '../../shared/config';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class WebsiteService {
    private headers;
    private socket;
    private url = Config.apiUrl;

    constructor(
        private http: Http,
        private userService: UserService
    ) { }

    create(url: string) {
        this.createHeaders();

        return this.http
            .post(this.url + '/api/websites', JSON.stringify({'url': url}), {headers: this.headers})
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    delete(id: string) {
        this.createHeaders();

        return this.http
            .delete(this.url + '/api/websites/' + id, {headers: this.headers})
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    update(id: string, viewportDesktop: number) {
        this.createHeaders();

        return this.http
            .put(this.url + '/api/websites/' + id, JSON.stringify({'viewportDesktop': viewportDesktop}), {headers: this.headers})
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getWebsites() {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites', {headers: this.headers})
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getWebsite(id: string): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id, {headers: this.headers})
            .toPromise()
            .then(response => response.json().website)
            .catch(this.handleError);
    }

    getWebsiteSessions(id: string, offset: number, limit: number): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/sessions?offset=' + offset + '&limit=' + limit, {headers: this.headers})
            .toPromise()
            .then(response => response.json().sessions)
            .catch(this.handleError);
    }

    getWebsiteSessionsCount(id: string): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/sessions-count', {headers: this.headers})
            .toPromise()
            .then(response => response.json().count)
            .catch(this.handleError);
    }

    getWebsiteSession(id: string, sid: string): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/sessions/' + sid, {headers: this.headers})
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    deleteSession(id: string) {
        this.createHeaders();

        return this.http
            .delete(this.url + '/api/sessions/' + id, {headers: this.headers})
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
    }

    getWebsitePages(id: string): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/pages', {headers: this.headers})
            .toPromise()
            .then(response => response.json().website)
            .catch(this.handleError);
    }

    getWebsitePageActions(id: string, page: string, width: number, height: number): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/actions/' + width + '/' + height + '?page=' + page, {headers: this.headers})
            .toPromise()
            .then(response => response.json().sessions)
            .catch(this.handleError);
    }

    getWebsitePageContent(id: string, page: string): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/content?page=' + page, {headers: this.headers})
            .toPromise()
            .then(response => response.json().content)
            .catch(this.handleError);
    }

    getWebsitePageSuggestions(id: string, page: string): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/suggestions?page=' + page, {headers: this.headers})
            .toPromise()
            .then(response => response.json().suggestions)
            .catch(this.handleError);
    }

    getWebsiteVisitors(id: string): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/visitors', {headers: this.headers})
            .toPromise()
            .then(response => response.json().visitors)
            .catch(this.handleError);
    }

    getVisitorSessions(id: string, vid: string): Promise<any> {
        this.createHeaders();

        return this.http
            .get(this.url + '/api/websites/' + id + '/visitor-sessions/' + vid, {headers: this.headers})
            .toPromise()
            .then(response => response.json().sessions)
            .catch(this.handleError);
    }

    private createHeaders() {
        this.headers = new Headers({'Content-Type': 'application/json'});
        this.headers.append('Authorization', 'Bearer ' + this.userService.getToken());
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.json());
    }
}
