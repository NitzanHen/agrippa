import { join } from 'path';
import { execSync } from 'child_process';
import { mkdirSync, readdirSync, readFileSync } from 'fs';
import { sync as fgSync } from 'fast-glob';

const safeTry = <T>(fn: () => T): { ok: true, data: T } | { ok: false, err: Error } => {
  try {
    return { ok: true, data: fn() };
  }
  catch (e) {
    return { ok: false, err: e };
  }
};

/** Simple representation of a file found in an integration test case */
interface TestFile {
  path: string;
  data: string;
}
/** Simple representation of a directory found in an integration test case */
interface TestDir {
  path: string;
}

/** The files and dirs returned from scanDir(). */
interface ScannedDir {
  files: TestFile[];
  dirs: TestDir[];
}
/** The data returned from runCase(); contains the scanned solution and output directories, ready to be compared. */
interface TestCase {
  name: string;
  solution: ScannedDir;
  output: ScannedDir;
}
/** The structure of a testinfo.json file for a given test case. */
interface TestInfo {
  name: string;
  description?: string;
  command: string;
}

const isTestFile = (ent: TestFile | TestDir): ent is TestFile => 'data' in ent;

/** 
 * Scans the directory resolved from the given path.
 * Returns all files and folders in that directory, as a `ScannedDir` object.
 */
const scanDir = (dirPath: string): ScannedDir =>
  fgSync('**/*', {
    cwd: dirPath,
    onlyFiles: false,
    markDirectories: true,
  })
    .map(path =>
      path.endsWith('/')
        ? { path }
        : {
          path,
          data: readFileSync(join(dirPath, path), 'utf-8')
        }
    )
    .reduce(({ files, dirs }, ent) =>
      isTestFile(ent)
        ? { files: [...files, ent], dirs }
        : { files, dirs: [...dirs, ent] },
      { files: [] as TestFile[], dirs: [] as TestDir[] }
    );

/** 
 * Runs a test case, specified by its name. 
 * This entails:
 * - Scanning the solution dir & testinfo.json
 * - Creating an output directory and running the Agrippa command there
 * - Scanning the output directory after the command finished
 */
const runCase = (caseName: string): TestCase => {
  const casePath = join(__dirname, caseName);

  //Scan solution files & dirs

  const solutionDir = join(casePath, 'solution');
  const solution = scanDir(solutionDir);

  const testInfo = safeTry(() =>
    JSON.parse(
      readFileSync(join(casePath, 'testinfo.json'), 'utf-8')
    ) as TestInfo
  );

  if (!testInfo.ok) {
    throw new Error(`Reading testinfo.json failed for case ${caseName}. Please make sure the file exists.`);
  }

  const { name, command } = testInfo.data;

  // Run Agrippa & scan output files

  const outputDir = join(casePath, 'output');
  try {
    mkdirSync(outputDir);
  }
  catch(e) {
    if(e.code !== 'EEXIST') {
      console.warn(`output directory for case ${caseName} already exists.`);
      throw e;
    }
  }

  const logs = safeTry(() => execSync(command, { cwd: outputDir }));
  if (logs.ok) {
    console.log(logs.data.toString());
  }
  else {
    console.error((logs as any).err);
  }

  const output = scanDir(outputDir);

  return { name, solution, output };
};

const caseNames = readdirSync(__dirname, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

describe.each(caseNames)('Case $#: %s', (name) => {
  const { solution, output } = runCase(name);

  // Compare solution & output

  test('Solution and output have the same number of directories', () => {
    expect(output.dirs.length).toBe(solution.dirs.length);
  });

  test('Solution and output have the same number of files', () => {
    expect(output.files.length).toBe(solution.files.length);
  });

  const outputDirPaths = output.dirs.map(d => d.path);
  solution.dirs.length && test.each(solution.dirs)('Dir $path generated', ({ path }) => {
    expect(outputDirPaths).toContain(path);
  });

  solution.files.length && test.each(solution.files)('File $path generated', ({ path, data }) => {
    const outputFile = output.files.find(f => f.path === path);

    expect(outputFile).toBeTruthy();
    expect(outputFile?.data).toBe(data);
  });
});