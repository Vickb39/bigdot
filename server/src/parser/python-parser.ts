import fs from 'fs';
import path from 'path';
import ts, { Query } from 'tree-sitter';
// @ts-expect-error
import TreeSitterPython from 'tree-sitter-python';


// Function to check if a module corresponds to a local file
function isLocalModule(moduleName: string): boolean {
  if (moduleName.includes('e')) {
    return true;
  }
  return false;
}

function pyModuleToFilepath(moduleName: string): string {
  // todo: handle __init__.py
  return moduleName.replace(/\./g, '/') + '.py';
}

// Function to traverse the syntax tree
function findDottedImports(root: ts.SyntaxNode): string[] {
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
    }
    // } else if (match.pattern === 5) {

    // }
    // if (capture.name === 'import_modules') {
    //   deps.push(capture.node.text);
    // } else if (capture.name === 'import_from_base') {
    //   deps.push(capture.node.text);
    // } else if (capture.name === 'import_from_names') {
    //   deps.push(capture.node.text);
    // } else if (capture.name === 'relative_import_from_base') {
    //   deps.push(capture.node.text);
    // }
  });


  const visit = (node: ts.SyntaxNode): void => {
    if (node.type === 'import_statement') {

      const text = node.text;
      const dottedModules = text       // import a, b.c 
        .slice('import'.length).trim() // a, b.c 
        .split(',')                    // ['a', 'b.c ']
        .map(m => m.trim());           // ['a', 'b.c']

      deps.push(...dottedModules);
    } else if (node.type === 'import_from_statement') {
      const text = node.text;
      const [base, ...rest] = text        // from a import b, c.d 
        .slice('from'.length).trim()      // a import b, c.d 
        .split(' ');                      // ['a', 'import', 'b,', 'c.d ']

      const names = rest.join(' ').trim() // import b, c.d 
        .slice('import'.length).trim()    // b, c.d 
        .split(',').map(n => n.trim());   // ['b', 'c.d']

      deps.push(...names.map(n => `${base}.${n}`));
    }


    // Recursively visit the children of the current node
    for (const child of node.children) {
      visit(child);
    }
  };

  visit(root);
  return deps;
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

function parsePythonPackage(pyPackage: string): Map<string, string[]> {
  // Map from filepath to set of local modules
  const fileMap = new Map<string, string[]>();

  walkDirectory(pyPackage, (filepath: string) => {
    if (!filepath.endsWith('.py')) {
      return;
    }
    const code = fs.readFileSync(filepath, 'utf8');

    const dottedImports = findDottedImports(parsePythonCode(code));
    const localModules = dottedImports.filter(isLocalModule);
    const localFilepaths = localModules.map(pyModuleToFilepath);
    fileMap.set(filepath, localFilepaths);
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

function main(pyPackage: string): void {
  const fileMap = parsePythonPackage(pyPackage);
  console.log('fileMap: ' + fileMap.entries());
  const graph = generateDotGraph(fileMap);
  fs.writeFileSync('graph.dot', graph);
}


main('/tmp/attrs/src/attr');