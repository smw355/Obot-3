# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Production stage
FROM ghcr.io/obot-platform/mcp-images-phat:main

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=builder /app/dist ./dist
COPY LICENSE ./

# Create nanobot.yaml config file
RUN cat > /app/nanobot.yaml <<'EOF'
publish:
  mcpServers: [obot-3-explorer]
mcpServers:
  obot-3-explorer:
    command: node
    args: ["/app/dist/index.js"]
    env:
      NODE_ENV: production
EOF

# Set ownership and switch to non-root user
USER root
RUN chown -R 1000:1000 /app
USER 1000

# Use EXPOSE to document the port
EXPOSE 8080

ENTRYPOINT ["nanobot"]
CMD ["run", "--listen-address", ":8080", "/app/nanobot.yaml"]