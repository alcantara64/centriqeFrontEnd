/** Frank - Init version: Feature check */
import { environment } from '../../../environments/environment';

export function isPathActive(path: string): boolean {
  let isActive: boolean = true;

  //need to map to any because the environment may not always have the feature flags at this point.
  const env: any = environment;

  if (env.featureFlags && env.featureFlags.disabledPaths) {
    isActive = !env.featureFlags.disabledPaths.includes(path);
  }

  return isActive;
}
