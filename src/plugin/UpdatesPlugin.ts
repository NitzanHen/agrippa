import axios from 'axios';
import semver from 'semver';
import { bold, italic, styles } from '../logger';
import { pkgJson } from '../utils/pkgJson';
import { Plugin } from './Plugin';

const { diff, gt, lt } = semver;

/**
 * A plugin that checks if a newer version of Agrippa exists.
 * Pings the npm registry and compares the latest version there to the version of this running instance.
 * 
 * This plugin runs assuming updates are meant to be looked for; if that's not desired (in pure mode or if
 * the user disables it) the plugin shouldn't be registered.
 */
export class UpdatesPlugin extends Plugin {
  /** @todo add version as an accessible context/options field (instead of accessing pkgJson here). */
  private currentVersion: string = pkgJson.version;
  private requestPromise: Promise<string> | null = null;

  async pingRegistry() {
    const { logger } = this.context;

    logger.debug('UpdatesPlugin: pinging the npm registry');
    const sendTime = Date.now();

    const res = await axios.get<{ version: string }>('https://registry.npmjs.org/agrippa/latest');

    const endTime = Date.now();
    logger.debug(`UpdatesPlugin: request resolved with status ${res.status}, took ${endTime - sendTime}ms`);

    const latestVersion = res.data.version;

    return latestVersion;
  }

  onPipelineStart() {
    this.requestPromise = this.pingRegistry();
  }

  async onPipelineEnd() {
    const { logger } = this.context;

    const currentVersion = this.currentVersion;
    const latestVersion = await this.requestPromise;

    logger.debug(`Current version: ${italic(currentVersion)}, Latest version: ${italic(latestVersion)}`);
    if (!currentVersion || !latestVersion) {
      logger.warn('Error in UpdatesPlugin: currentVersion or latestVersion are not set.');
      return;
    }

    if (gt(latestVersion, currentVersion)) {
      const df = diff(latestVersion, currentVersion);
      logger.info(
        bold(`New ${df} version available: ${latestVersion}!`),
        bold(`please update now by typing ${styles.command('npm i -g agrippa')} into the terminal`),
      );
    }
    else if (lt(latestVersion, currentVersion)) {
      logger.debug('Current version is greater than the latest stable release');
    }

    //nothing to do.
  }
}