FROM python:3.11-slim AS production

ENV CODOAI_HOMEPAGE "https://codoai.com"
LABEL homepage=$CODOAI_HOMEPAGE

ENV CODOAI_SOURCE_CODE "https://github.com/codoai/codoai-judge"
LABEL source_code=$CODOAI_SOURCE_CODE

ENV CODOAI_MAINTAINER "CodoAI Team <team@codoai.com>"
LABEL maintainer=$CODOAI_MAINTAINER

# Install system dependencies and compilers for our 5 languages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      gcc \
      g++ \
      default-jdk \
      nodejs \
      npm \
      ruby \
      ruby-dev \
      libpq-dev \
      build-essential \
      sudo \
      curl \
      wget \
      git \
      pkg-config \
      libcap-dev && \
    gem install rails bundler && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Java environment
ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH="/usr/local/bin:$PATH"

EXPOSE 2358

WORKDIR /api

# Copy application files
COPY . .

# Install Ruby gems
RUN bundle install --without development test

# Create user
RUN useradd -u 1000 -m -r codoai && \
    echo "codoai ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers && \
    chown -R codoai: /api

USER codoai

ENV CODOAI_VERSION "1.0.0"
LABEL version=$CODOAI_VERSION

# Simple startup script
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "2358"]

FROM production AS development

CMD ["sleep", "infinity"]