import { DeepPartial, kebabCase, pascalCase } from '../utils';
import { assignDefaults } from '../utils/object';
import { Options } from './Options';
import { Environment } from './Environment';
import { Styling } from './Styling';

export interface InputOptions extends DeepPartial<Options> {
  name: string;
}


export const defaultEnvironment = (packageJson: any): Options['environment'] => {
  const dependencies: Record<string, string> = packageJson?.dependencies ?? {};

  if ('react-native' in dependencies) {
    return Environment.REACT_NATIVE;
  }
  else if ('preact' in dependencies) {
    return Environment.PREACT;
  }
  else if ('solid-js' in dependencies) {
    return Environment.SOLIDJS;
  }
  else if ('react' in dependencies) {
    return Environment.REACT;
  }

  return '';
};

export function createOptions(input: InputOptions, envFiles: Record<string, any>): Options {
  const { packageJson, tsconfig } = envFiles;

  const { styling } = input;

  const name = pascalCase(input.name);
  input.name = name;

  const environment = input.environment ?? defaultEnvironment(packageJson);

  const importReact = tsconfig?.compilerOptions?.jsx
    ? !/^react-jsx/.test(tsconfig.compilerOptions.jsx)
    : true;

  const createStylesFile = ([Styling.CSS, Styling.SCSS, Styling.STYLED_COMPONENTS] as any[]).includes(styling);
  const stylesFileExtension = (() => {
    switch (styling) {
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'styled-components': return 'ts';
      default: return '';
    }
  })();

  const defaults: Options = {
    name,
    kebabName: kebabCase(name),
    componentOptions: {
      exportType: 'named',
      declaration: 'const'
    },

    environment,
    reactOptions: environment === Environment.REACT || environment === Environment.REACT_NATIVE ? {
      importReact,
      propTypes: false
    } : undefined,
    solidjsOptions: environment === Environment.SOLIDJS ? {} : undefined,
    preactOptions: environment === Environment.PREACT ? {} : undefined,
    reactNativeOptions: environment === Environment.REACT_NATIVE ? {} : undefined,

    typescript: !!tsconfig,
    typescriptOptions: (!!tsconfig || input.typescript) ? {
      propDeclaration: 'interface'
    } : undefined,

    styling,
    createStylesFile,
    styleFileOptions: createStylesFile ? {
      extension: stylesFileExtension,
      module: true,
    } : undefined,

    baseDir: process.cwd(),
    destination: '.',
    allowOutsideBase: false,

    overwrite: false,
    pure: false,
    reportTelemetry: true,
    lookForUpdates: true,
    debug: false
  };

  return assignDefaults(defaults, input as Options);
}