// Import the necessary libraries from Bun
import Bun from "bun";

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

    const rmProc = Bun.spawnSync(['rm', '-rf', repoDest]);

    const cloneProc = Bun.spawnSync(['git', 'clone', repoIdentifier, repoDest, '--depth=1']);
    if (!cloneProc.success) {
        throw new Error('Failed to clone repository\n' + cloneProc.stderr);
    }

    const depgraphDest = '/tmp/attrs-depgraph.png'
    const depgraphProc = Bun.spawnSync(['pydeps', '--no-show', '-Tpng', `-o=${depgraphDest}`, `${repoDest}/src/attrs`]);
    if (!depgraphProc.success) {
        throw new Error('Failed to generate dependency graph\n' + depgraphProc.stderr);
    }


    return new Response(Bun.file(depgraphDest))

}

// Define the server
const server = Bun.serve({
    port: 3000,  // Specify the port number
    fetch(req: Request) {
        const url = new URL(req.url);
        if (url.pathname === "/") return new Response("Home page!");
        if (url.pathname === "/depgraph" && req.method === 'GET') return depgraph('');
        return new Response("404!");
    },
});

// Log the port number to the console
console.log(`Listening on http://localhost:${server.port}`);
