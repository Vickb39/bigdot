const http = require('http');
const url = require('url');
const fs = require('fs');


function parseRepoIdentifier(url: string) {
    // Use a regular expression to match the repository identifier
    // Return 'cli/cli' from https://github.com/cli/cli/pull/1475

    const regex = /github\.com\/([^\/]+\/[^\/]+)/;
    const match = url.trim().match(regex);
    if (match && match[1]) {
        return match[1];
    } else {
        throw new Error('Invalid GitHub URL');
    }
}

function depgraph(repo_url: string): Response {
    // const repoIdentifier = parseRepoIdentifier(repo_url);
    const repoIdentifier = 'https://github.com/python-attrs/attrs.git'
    const repoDest = '/tmp/attrs';

    const rmProc = fs.spawnSync(['rm', '-rf', repoDest]);

    const cloneProc = fs.spawnSync(['git', 'clone', repoIdentifier, repoDest, '--depth=1']);
    if (!cloneProc.success) {
        throw new Error('Failed to clone repository\n' + cloneProc.stderr);
    }

    const depgraphDest = '/tmp/attrs-depgraph.png'

    const depgraphProc = fs.spawnSync(['pydeps', '--no-show', '-Tpng', `-o=${depgraphDest}`, `${repoDest}/src/attrs`]);
    if (!depgraphProc.success) {
        throw new Error('Failed to generate dependency graph\n' + depgraphProc.stderr);
    }

    return new Response(Bun.file(depgraphDest))
}


// Create an HTTP server
const server = http.createServer((req: Request, res: Response) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === "/") {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Home page!');
    } else if (parsedUrl.pathname.startsWith("/") && req.method === 'GET') {
        const response = depgraph('');  // Assuming depgraph returns a string or Buffer
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(response);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404!');
    }
});

// Specify the port number and start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// Log the port number to the console
console.log(`Listening on http://localhost:${server.port}`);
