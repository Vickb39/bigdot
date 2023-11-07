FROM python:3.11-slim

RUN apt update && apt install git -y && apt install graphviz -y && apt install nodejs -y 
RUN pip install attrs pydeps

WORKDIR /workspaces/bigdot/server
COPY . /workspaces/bigdot/server

RUN /usr/local/bin/bun install

CMD ["/usr/local/bin/bun", "run", "/workspaces/bigdot/server/index.ts"]
