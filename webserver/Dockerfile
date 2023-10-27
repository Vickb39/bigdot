FROM oven/bun:latest as oven-builder

FROM python:3.11-slim
COPY --from=oven-builder /usr/local/bin/bun /usr/local/bin

RUN apt update && apt install git -y && apt install graphviz -y
RUN pip install attrs pydeps

WORKDIR /workspaces/bigdot/webserver
COPY . /workspaces/bigdot/webserver

RUN /usr/local/bin/bun install

CMD ["/usr/local/bin/bun", "run", "/workspaces/bigdot/webserver/index.ts"]
