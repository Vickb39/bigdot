import fs from 'fs';
import path from 'path';
import ts, { Query } from 'tree-sitter';
// @ts-expect-error
import TreeSitterPython from 'tree-sitter-python';

function isFirstParty(dottedImport: string, packageRoot: string): boolean {
  const packageName = packageRoot.slice(packageRoot.lastIndexOf(path.sep) + 1);
  return dottedImport.startsWith(packageName);
}


function pyModuleToFilepath(moduleName: string): string {
  let parts = moduleName.split('.');
  const n = parts.length;
  if (parts[n - 1] === '__init__') {
    parts.pop(); // remove '__init__'
  }
  return path.join(...parts) + '.py';
}

function pyFilepathToModule(filepath: string): string {
  if (filepath.startsWith(path.sep)) {
    filepath = filepath.slice(1);
  }

  let parts = filepath.split(path.sep);
  const n = parts.length;
  if (parts[n - 1] === '__init__.py') {
    parts.pop(); // remove '__init__.py'
  } else if (parts[n - 1].endsWith('.py')) {
    parts[n - 1] = parts[n - 1].slice(0, -3); // remove '.py'
  }
  return parts.join('.');
}


// Returns absolute import path
function absolute(dottedImport: string, filepath: string): string {
  // already absolute
  if (!dottedImport.startsWith('.')) {
    return dottedImport;
  }
  if (filepath.startsWith(path.sep)) {
    filepath = filepath.slice(1);
  }
  const parts = filepath.split(path.sep);
  const numDots = dottedImport.match(/^\.+/)?.[0].length || 0;
  parts.splice(parts.length - numDots, numDots);
  return parts.join('.') + '.' + dottedImport.slice(numDots);
}

// Returns Python module
//   Given an absolute filename, it returns the Pythonn (e.g. /tmp/attrs/src/attr/_make -> 'attr._make')
//   Given an import statement (non-relative), its returns the Python module (e.g. 'attr._make.ABC' -> 'attr._make')
//   Other imports get trimmed to their root name (e.g. 'typing.ABC' -> 'typing')
function findModule(filenameOrImport: string, packageRoot: string): string {
  const packageName = packageRoot.slice(packageRoot.lastIndexOf(path.sep) + 1);

  if (filenameOrImport.endsWith('.py')) {
    const filename = filenameOrImport;
    if (filename.startsWith(packageRoot)) {
      const trim = packageRoot.slice(0, packageRoot.lastIndexOf(path.sep)); // tmp/attrs/src
      const relative = path.relative(trim, filename); // attr/__init__.py
      return pyFilepathToModule(relative);
    } else {
      return pyFilepathToModule(filename);
    }
  } else {
    const importt = filenameOrImport;
    if (!importt.startsWith(packageName)) {
      if (importt.includes('.')) {
        return importt.slice(0, importt.indexOf('.')); // e.g. 'attr'
      } else {
        return importt;
      }
    } else {
      const fullname = path.resolve(packageName, pyModuleToFilepath(importt));
      if (fs.existsSync(fullname)) {
        return importt;
      }
      return importt.slice(0, importt.lastIndexOf('.')); // lop off the symbol e.g. 'attr._make.ABC' -> 'attr._make'
    }
  }
}

// Function to traverse the syntax tree
function findDottedImports(root: ts.SyntaxNode, filepath: string, packageRoot: string): string[] {
  const deps: string[] = [];

  // https://tree-sitter.github.io/tree-sitter/playground
  const q = new Query(TreeSitterPython, `
    (import_statement "import" (dotted_name) @import_modules)
    (import_statement "import" (aliased_import (dotted_name) @import_modules))
    (import_from_statement "from" (dotted_name) @import_from_base  "import" (dotted_name) @import_from_names)
    (import_from_statement "from" (dotted_name) @import_from_base  "import" (aliased_import (dotted_name) @import_from_names))
    (import_from_statement "from" (dotted_name) @import_from_base "import" (wildcard_import))  
    (import_from_statement "from" (relative_import (import_prefix) @relative_depth (dotted_name) @relative_import_from_base)  "import" (dotted_name) @import_from_names)
    (import_from_statement "from" (relative_import (import_prefix) @relative_depth (dotted_name) @relative_import_from_base)  "import" (aliased_import (dotted_name) @import_from_names))
  `);

  q.matches(root).forEach((match: ts.QueryMatch) => {
    if (match.pattern === 0) {
      deps.push(...match.captures.map(c => c.node.text));
    } else if (match.pattern === 1) {
      deps.push(...match.captures.map(c => c.node.text));
    } else if (match.pattern === 2) {
      const [base, ...rest] = match.captures;
      deps.push(...rest.map(c => `${base.node.text}.${c.node.text}`));
    } else if (match.pattern === 3) {
      const [base, ...rest] = match.captures;
      deps.push(...rest.map(c => `${base.node.text}.${c.node.text}`));
    } else if (match.pattern === 4) {
      deps.push(match.captures[0].node.text);
    } else if (match.pattern === 5) {
      const [depth, base, ...rest] = match.captures;
      const trim = packageRoot.slice(0, packageRoot.lastIndexOf(path.sep)); // tmp/attrs/src
      const relative = path.relative(trim, filepath); // attr/__init__.py
      deps.push(...rest.map(c => absolute(`${depth.node.text}${base.node.text}.${c.node.text}`, relative)));
    } else if (match.pattern === 6) {
      const [depth, base, ...rest] = match.captures;
      const trim = packageRoot.slice(0, packageRoot.lastIndexOf(path.sep)); // tmp/attrs/src
      const relative = path.relative(trim, filepath); // attr/__init__.py      
      deps.push(...rest.map(c => absolute(`${depth.node.text}${base.node.text}.${c.node.text}`, relative)));
    }
  });

  return deps.map(d => findModule(d, packageRoot)).filter(d => isFirstParty(d, packageRoot));
}




// Function to parse Python code
function parsePythonCode(code: string): ts.SyntaxNode {
  // Create a new parser
  const parser = new ts();

  // Set the language to Python
  parser.setLanguage(TreeSitterPython);

  // Parse the code
  const tree = parser.parse(code);

  // Get the root node of the syntax tree
  const rootNode = tree.rootNode;

  // Print the syntax tree (for debugging purposes)
  // console.log(rootNode.toString());
  return rootNode;
}

function walkDirectory(dir: string, fn: (filepath: string) => void) {
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      walkDirectory(filePath, fn);  // Recursively walk through files
    } else if (stats.isFile()) {
      fn(filePath);  // Run function on file
    }
  }
}

function parsePythonPackage(packageRoot: string): Map<string, string[]> {
  // Map from filepath to set of local modules
  const fileMap = new Map<string, string[]>();

  walkDirectory(packageRoot, (filepath: string) => {
    if (!filepath.endsWith('.py')) {
      return;
    }
    const code = fs.readFileSync(filepath, 'utf8');

    const dottedImports = findDottedImports(parsePythonCode(code), filepath, packageRoot);
    fileMap.set(findModule(filepath, packageRoot), dottedImports);
  });

  return fileMap;
}

function generateDotGraph(fileMap: Map<string, string[]>): string {
  let graph = 'digraph G {\n';

  for (const [file, dependencies] of fileMap.entries()) {
    for (const dependency of dependencies) {
      graph += `    "${file}" -> "${dependency}";\n`;
    }
  }

  graph += '}\n';


  return graph;
}

function main(packageRoot: string): void {
  const fileMap = parsePythonPackage(packageRoot);
  console.log('fileMap: ' + fileMap.entries());
  const graph = generateDotGraph(fileMap);
  fs.writeFileSync('graph.dot', graph);
}


main('/tmp/requests/src/requests');