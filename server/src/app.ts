import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'fs';
import childProcess from 'child_process';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

function depgraph(repo_url: string): string {
  // const repoIdentifier = parseRepoIdentifier(repo_url);
  const repoIdentifier = 'https://github.com/python-attrs/attrs.git'
  const repoDest = '/tmp/attrs';

  const rmProc = childProcess.spawnSync('rm', ['-rf', repoDest]);

  const cloneProc = childProcess.spawnSync('git', ['clone', repoIdentifier, repoDest, '--depth=1']);
  if (cloneProc.error) {
    throw new Error('Failed to clone repository\n' + cloneProc.stderr);
  }

  const depgraphDest = '/tmp/attrs-depgraph.png';

  const depgraphProc = childProcess.spawnSync('/home/codespace/.python/current/bin/pydeps', ['--no-show', '-Tpng', `-o=${depgraphDest}`, `${repoDest}/src/attrs`]);
  if (depgraphProc.error) {
    throw new Error('Failed to generate dependency graph\n' + depgraphProc.stderr);
  }

  return depgraphDest;
}


app.get<{}, MessageResponse>('/depgraph', (req, res) => {
  const filename = depgraph(req.url);

  res.sendFile(filename, (err) => {
    if (err) {
      console.error('File sending failed:', err);
      res.status(500).send(err);
    } else {
      console.log('File sent successfully');
    }
  });

});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
