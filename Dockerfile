FROM alpine:3.18

RUN apk add --no-cache \
    expect \
    curl \
    jq \
    ca-certificates \
    bash

# Huawei CLI installation (may need adjustment for Alpine)
RUN curl -sSL -o /tmp/hcloud_install.sh \
    https://hwcloudcli.obs.cn-north-1.myhuaweicloud.com/cli/latest/hcloud_install.sh \
 && bash /tmp/hcloud_install.sh -y \
 && rm -f /tmp/hcloud_install.sh

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
