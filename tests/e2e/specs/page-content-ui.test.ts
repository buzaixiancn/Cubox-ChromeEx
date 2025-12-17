describe('Content UI Injection', () => {
  it('should locate the injected content UI all div on any page', async () => {
    await browser.url('https://www.google.com');

    const contentAllDiv = await $('#CEB-extension-all').getElement();
    await expect(contentAllDiv).toBeDisplayed();
  });
});
