FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# 1. Install system dependencies in ONE cached layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    expect \
    curl \
    jq \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# 2. Install Huawei CLI (pin + reduce rebuild cost)
# Download installer separately so it can be cached
RUN curl -sSL -o /tmp/hcloud_install.sh \
    https://hwcloudcli.obs.cn-north-1.myhuaweicloud.com/cli/latest/hcloud_install.sh \
 && bash /tmp/hcloud_install.sh -y \
 && rm -f /tmp/hcloud_install.sh

# 3. Copy entrypoint LAST (best cache behavior)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
