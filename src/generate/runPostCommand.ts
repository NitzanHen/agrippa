import { exec as execCB } from 'child_process';
import { promisify } from 'util';

import { gray } from 'chalk';

import { Logger } from '../logger';
import { substituteVars, PostCommandVariables } from '../utils/substitutePaths';

import { Config } from './Config';

const exec = promisify(execCB);

export async function runPostCommand(postCommandVars: PostCommandVariables, config: Config, logger: Logger) {
  const { postCommand: rawPostCommand } = config;

  if (rawPostCommand) {
    logger.debug(`Raw post command (before filling in actual paths): ${gray(rawPostCommand)}`);

    const postCommand = substituteVars(rawPostCommand, postCommandVars);

    logger.info(`Running post command: ${gray(postCommand)}`);
    const { stdout, stderr } = await exec(postCommand);

    if (stdout) {
      logger.info(stdout);
    }
    if (stderr) {
      logger.error(stderr);
    }
  }
  else {
    logger.debug('No post command provided.');
  }
}