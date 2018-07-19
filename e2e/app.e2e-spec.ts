import { HeaterPage } from './app.po';

describe('heater App', function() {
  let page: HeaterPage;

  beforeEach(() => {
    page = new HeaterPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
