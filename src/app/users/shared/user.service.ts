import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Config } from '../../shared/config';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
    isLoggedIn = false;

    private headers = new Headers({'Content-Type': 'application/json'});
    private url = Config.apiUrl;

    constructor(private http: Http) {
        this.isLoggedIn = this.checkToken();
    }

    register(email: string, password: string, firstName: string, lastName: string): Promise<any> {
        const data = JSON.stringify({'email': email, 'password': password, 'firstName': firstName, 'lastName': lastName});
        return this.http
            .post(this.url + '/api/register', data, {headers: this.headers})
            .toPromise()
            .then(response => {
                const result = response.json();
                this.setToken(result.token);
                return result.message;
            })
            .catch(this.handleError);
    }

    login(email: string, password: string): Promise<any> {
        return this.http
            .post(this.url + '/api/login', JSON.stringify({'email': email, 'password': password}), {headers: this.headers})
            .toPromise()
            .then(response => {
                const result = response.json();
                this.setToken(result.token);
                return result.message;
            })
            .catch(this.handleError);
    }

    getToken(): string {
        return localStorage.getItem('token');
    }

    setToken(token: string): void {
        localStorage.setItem('token', token);
        this.isLoggedIn = true;
    }

    checkToken() {
        const token = this.getToken();
        let payload;

        if (token) {
            payload = token.split('.')[1];
            payload = window.atob(payload);
            payload = JSON.parse(payload);

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    }

    getUserInfo() {
        if (this.checkToken()) {
            const token = this.getToken();
            const payload =  window.atob(token.split('.')[1]);
            const obj = JSON.parse(payload);

            return {
                email: obj.email,
                firstName: obj.firstName,
                lastName: obj.lastName
            };
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.isLoggedIn = false;
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.json());
    }
}
