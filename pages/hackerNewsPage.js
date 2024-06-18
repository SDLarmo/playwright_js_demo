/**
 * Page class for HackerNewsPage
 */
export default class HackerNewsPage {
  constructor(page) {
    this.page = page;
    this.ui = {
      ageLabel: this.page.locator('.age'),
      rankLabel: this.page.locator('.rank'),
      moreButton: this.page.locator('.morelink'),
      reloadButton: this.page.locator('//a[text()="reload"]'),
    };
    this.url = 'https://news.ycombinator.com/newest';
  }

  /**
   * Navigates to current page URL
   */
  async open() {
    await this.page.goto(this.url);
  }

  /**
   * Returns article ages for the required number of articles
   * @param {number} numberOfArticles
   * @returns {Promise<number[]>}
   */
  async gatherArticleDates(numberOfArticles) {
    const articleAgesInMinutes = [];
    let articlesLeft = numberOfArticles;
    while (true) {
      const newPageAges = await this.#gatherArticleDatesFromCurrentPage(articlesLeft);
      articleAgesInMinutes.push(...newPageAges);
      articlesLeft -= newPageAges.length;
      // Break cycle if we've reached the article limit
      if (articlesLeft <= 0) break;
      // Open next page
      await this.ui.moreButton.click();
    }

    return articleAgesInMinutes;
  }

  /**
   * Returns article ages for all articles on the current page
   * @param {number} articlesLeft
   * @returns {Promise<number[]>}
   */
  async #gatherArticleDatesFromCurrentPage(articlesLeft) {
    // Reloads page if the website is rate limiting our requests
    if (!await this.ui.ageLabel.first().isVisible({ timeout: 500 })) {
      await this.page.waitForTimeout(1000);
      if (await this.ui.reloadButton.isVisible()) await this.ui.reloadButton.click();
      // Restarts scrapping process if the page was reloaded
      return this.#gatherArticleDatesFromCurrentPage(articlesLeft);
    }
    const articleAgesInMinutes = [];
    const ageLabels = await this.ui.ageLabel.all();
    for (let i = 0; i < ageLabels.length; i += 1) {
      const text = await ageLabels[i].textContent();
      const minutes = this.#transformTextToMinutes(text);
      articleAgesInMinutes.push(minutes);
      // Break cycle if we've reached the article limit
      if (articleAgesInMinutes.length >= articlesLeft) break;
    }

    return articleAgesInMinutes;
  }

  /**
   * Extracts numeric value from text and transforms it to the number of minutes
   * @param {string} text
   * @returns {number}
   */
  #transformTextToMinutes(text) {
    let minutes = 0;
    // use regular expression to remove all non-digit characters
    const numberFromText = Number(text.replace(/\D/g, '').trim());
    if (text.includes('minute')) {
      minutes = numberFromText;
    } else if (text.includes('hour')) {
      minutes = numberFromText * 60;
    } else if (text.includes('day')) {
      minutes = numberFromText * 60 * 24;
    }
    return minutes;
  }
}
