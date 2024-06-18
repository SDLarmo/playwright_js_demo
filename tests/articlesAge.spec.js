import { test, expect } from '@playwright/test';
import HackerNewsPage from '../pages/hackerNewsPage';

let hackerNewsPage;
const numberOfArticles = 100;

test.beforeEach(async ({ page }) => {
  // create Page object
  hackerNewsPage = new HackerNewsPage(page);
});

test('Verify that first 100 articles are ordered by date', async () => {
  // open the required page
  await hackerNewsPage.open();

  // gather article ages in minutes
  const articleAgesInMinutes = await hackerNewsPage.gatherArticleDates(numberOfArticles);

  // check that array contains ages for 100 articles
  expect(articleAgesInMinutes).toHaveLength(numberOfArticles);

  // copy array and sort it
  const sortedArticleAges = [...articleAgesInMinutes].sort((a, b) => a - b);

  // compare initial array with the sorted array
  expect(articleAgesInMinutes).toEqual(sortedArticleAges);
});
