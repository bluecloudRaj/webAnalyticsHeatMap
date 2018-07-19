/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WebsiteService } from './website.service';

describe('WebsiteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebsiteService]
    });
  });

  it('should ...', inject([WebsiteService], (service: WebsiteService) => {
    expect(service).toBeTruthy();
  }));
});
