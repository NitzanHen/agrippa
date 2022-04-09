import { Blocks } from '../Blocks';
import { Import } from '../Import';
import {  Imports } from '../Imports';
import { ComposerPlugin } from './ComposerPlugin';

/**
 * A simple `ComponentComposer` plugin to add an import to the component.
 */
export class ImportPlugin implements ComposerPlugin {

  public readonly import: Import;

  constructor(i: Import) {
    this.import = i;
  }

  onCompose(_: Blocks, imports: Imports): void {
    imports.add(this.import);
  }
}