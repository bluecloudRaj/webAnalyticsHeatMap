import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class TitleService {
    title: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    description: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    constructor(
        private titleService: Title
    ) { }

    setTitle(title: string) {
        this.titleService.setTitle(title);
        this.title.next(title);
    }

    setDescription(description: string) {
        this.description.next(description);
    }
}
