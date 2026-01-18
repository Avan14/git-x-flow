/**
 * GitHub API Helpers
 * Functions for fetching and processing GitHub data with FULL PAGINATION
 */

import type { GitHubEvent, GitHubRepo } from "@/types";

/**
 * 🚀 PAGINATION HELPER - Fetch ALL pages from GitHub API
 * This solves the problem of only getting 6-10 repos!
 */
export async function fetchAllPages<T>(
  url: string,
  accessToken: string,
  maxPages: number = 20
): Promise<T[]> {
  let allData: T[] = [];
  let page = 1;
  const perPage = 100; // Maximum allowed by GitHub

  console.log(`🔄 Starting pagination for: ${url}`);

  while (page <= maxPages) {
    try {
      const separator = url.includes('?') ? '&' : '?';
      const fullUrl = `${url}${separator}per_page=${perPage}&page=${page}`;

      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(`❌ Page ${page} failed: ${response.status}`);
        break;
      }

      const data = await response.json();

      // If no data or empty array, we're done
      if (!data || data.length === 0) {
        console.log(`✅ No more data at page ${page}`);
        break;
      }

      allData = allData.concat(data);
      console.log(`✅ Page ${page}: +${data.length} items (Total: ${allData.length})`);

      // If we got less than perPage, this was the last page
      if (data.length < perPage) {
        console.log(`✅ Last page reached (got ${data.length} < ${perPage})`);
        break;
      }

      page++;
    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error);
      break;
    }
  }

  console.log(`🎉 Total items fetched: ${allData.length}`);
  return allData;
}

/**
 * Fetch user events from GitHub API with pagination
 */
export async function fetchUserEvents(
  accessToken: string,
  username: string,
  days: number
): Promise<GitHubEvent[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Fetch ALL events using pagination
  const events = await fetchAllPages<GitHubEvent>(
    `https://api.github.com/users/${username}/events`,
    accessToken,
    10 // Up to 10 pages (1000 events)
  );

  // Filter events within the time range
  return events.filter((event) => {
    const eventDate = new Date(event.created_at);
    return eventDate >= since;
  });
}

/**
 * Fetch ALL user repositories with pagination
 */
export async function fetchAllUserRepos(
  accessToken: string
): Promise<GitHubRepo[]> {
  console.log('📚 Fetching ALL repositories...');
  
  const repos = await fetchAllPages<GitHubRepo>(
    'https://api.github.com/user/repos?sort=updated&affiliation=owner,collaborator,organization_member',
    accessToken,
    20 // Up to 20 pages (2000 repos max)
  );

  console.log(`✅ Total repositories: ${repos.length}`);
  return repos;
}

/**
 * Fetch repository details
 */
export async function fetchRepoDetails(
  accessToken: string,
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Check if this is user's first contribution to a repo
 */
export async function isFirstContribution(
  accessToken: string,
  owner: string,
  repo: string,
  username: string
): Promise<boolean> {
  try {
    // Check commits by user
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?author=${username}&per_page=2`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return false;
    }

    const commits = await response.json();
    return commits.length === 1;
  } catch {
    return false;
  }
}

/**
 * Parse full repo name (owner/repo) into parts
 */
export function parseRepoName(fullName: string): { owner: string; repo: string } {
  const [owner, repo] = fullName.split("/");
  return { owner, repo };
}