# Stage 1: Build stage
FROM gcc:13 AS build

RUN apt-get update && apt-get install -y \
    curl \
    cmake 

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL=/root/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH

# Copy the source code into the container
COPY . /app
# Set the working directory
WORKDIR /app

# Build ui
RUN bun install --cwd web
RUN bun --cwd web build

# Compile in release mode  
RUN cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
RUN cmake --build build -j$(nproc) 

# Production 
FROM scratch

COPY --from=build /app/build/mortgage-service /mortgage-service
COPY --from=build /app/build/assets /assets


CMD [ "/mortgage-service" ]