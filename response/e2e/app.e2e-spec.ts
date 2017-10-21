import { ResponsePage } from './app.po';

describe('response App', () => {
  let page: ResponsePage;

  beforeEach(() => {
    page = new ResponsePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
