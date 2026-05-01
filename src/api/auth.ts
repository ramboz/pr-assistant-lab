const TOKEN_ENV_VAR = 'GITHUB_TOKEN';

export class MissingTokenError extends Error {
  constructor() {
    super(`${TOKEN_ENV_VAR} is not set in the environment`);
    this.name = 'MissingTokenError';
  }
}

/**
 * Read the GitHub API token from the environment. Throws if unset, since
 * unauthenticated requests are rate-limited far below what reviewing a
 * single PR needs.
 */
export function getGithubToken(env: NodeJS.ProcessEnv = process.env): string {
  const token = env[TOKEN_ENV_VAR];
  if (!token || token.length === 0) {
    throw new MissingTokenError();
  }
  return token;
}

/**
 * Build the Authorization header value for a GitHub REST request.
 */
export function buildAuthHeader(token: string): string {
  return `Bearer ${token}`;
}
