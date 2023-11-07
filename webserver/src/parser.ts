
import Parser from 'tree-sitter';
import graphviz from 'graphviz';
import fs from 'fs';
import path from 'path';

// @ts-expect-error
import Python from 'tree-sitter-python';



function extractImports(filePath: string, language: any): string[] {
    const code: string = fs.readFileSync(filePath, 'utf-8');
    const parser: Parser = new Parser();
    parser.setLanguage(language);
    const tree = parser.parse(code);

    const imports: string[] = [];
    const cursor = tree.walk();
    do {
        const nodeType: string = cursor.nodeType;
        if (nodeType === 'import_statement' || nodeType === 'include_statement') {
            // Assuming the import statement's text is the entire node's text
            imports.push(cursor.currentNode.text);
        }
    } while (cursor.gotoNextSibling());

    return imports;
}

function constructDependencyGraph(directory: string, language: any): graphviz.Graph {
    const g: graphviz.Graph = graphviz.graph('G');

    fs.readdirSync(directory).forEach(file => {
        if (file.endsWith('.js')) {  // Adjust the file extension based on the language
            const filePath: string = path.join(directory, file);
            const fileNode = g.addNode(filePath);
            const imports: string[] = extractImports(filePath, language);
            imports.forEach(imp => {
                const impNode = g.addNode(imp);  // This is simplified; you may need to resolve the import to a file path
                g.addEdge(fileNode, impNode);
            });
        }
    });

    return g;
}

function exportToDot(g: graphviz.Graph, outputFile: string = 'graph.dot'): void {
    fs.writeFileSync(outputFile, g.to_dot());
}

// Usage
const directory: string = '/workspaces/attrs/src/attrs';
const g: graphviz.Graph = constructDependencyGraph(directory, Python);
exportToDot(g);
