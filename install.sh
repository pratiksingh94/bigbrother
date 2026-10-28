#!/bin/sh
# Installs the Big Brother agent and sets it up to run as a service.
#
#   curl -fsSL https://raw.githubusercontent.com/pratiksingh94/bigbrother/master/install.sh | sh -s -- --server http://bb.example.com:8000
#
# It downloads the release that fits the machine, writes the config, installs
# the systemd unit and starts the agent. The id of the agent is printed at the
# end, it is how the host shows up in the dashboard.

set -eu

REPO="${BIG_BROTHER_REPO:-pratiksingh94/bigbrother}"

# Everything is installed below this, so it can be pointed somewhere else to
# try the script out without touching the system.
ROOT="${BIG_BROTHER_ROOT:-/}"

SERVER=""
AGENT_ID=""
VERSION=""
UNINSTALL="no"

BINARY="${ROOT}/usr/local/bin/lilbro"
CONFIG_DIR="${ROOT}/etc/lilbro"
CONFIG="${CONFIG_DIR}/config.json"
UNIT="${ROOT}/etc/systemd/system/lilbro.service"

die() {
    echo "$1" >&2
    exit 1
}

usage() {
    cat <<EOF
usage: install.sh --server URL [options]

  --server URL    url of the Big Brother server
  --id ID         id of this agent, one is made when it is left out
  --version TAG   release to install, the latest one by default
  --uninstall     remove the agent and its service
  -h, --help      show this
EOF
}

while [ $# -gt 0 ]; do
    case "$1" in
        --server) SERVER="${2:-}"; shift 2 ;;
        --id) AGENT_ID="${2:-}"; shift 2 ;;
        --version) VERSION="${2:-}"; shift 2 ;;
        --uninstall) UNINSTALL="yes"; shift ;;
        -h|--help) usage; exit 0 ;;
        *) echo "unknown option: $1" >&2; usage >&2; exit 1 ;;
    esac
done

download() {
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$1" -o "$2"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO "$2" "$1"
    else
        die "neither curl nor wget is installed"
    fi
}

detect_asset() {
    os=$(uname -s | tr '[:upper:]' '[:lower:]')
    arch=$(uname -m)

    case "$arch" in
        x86_64|amd64) arch="amd64" ;;
        aarch64|arm64) arch="arm64" ;;
        *) die "unsupported architecture: $arch" ;;
    esac

    case "$os" in
        linux) ;;
        *) die "the agent only runs on linux, this is ${os}" ;;
    esac

    echo "lilbro-${os}-${arch}"
}

# The redirect of the latest release points at the tag, so the version can be
# read without asking the api for it.
resolve_version() {
    if [ -n "$VERSION" ]; then
        echo "$VERSION"
        return
    fi

    if command -v curl >/dev/null 2>&1; then
        curl -fsSL -o /dev/null -w '%{url_effective}' "https://github.com/${REPO}/releases/latest" |
            sed 's|.*/tag/||'
    else
        wget -qO- --server-response "https://github.com/${REPO}/releases/latest" 2>&1 |
            sed -n 's|.*/tag/\([^ ]*\).*|\1|p' | tail -1
    fi
}

new_id() {
    if command -v uuidgen >/dev/null 2>&1; then
        uuidgen | tr '[:upper:]' '[:lower:]'
    elif [ -r /proc/sys/kernel/random/uuid ]; then
        cat /proc/sys/kernel/random/uuid
    else
        die "could not make an id, pass one with --id"
    fi
}

# The id of an agent that is already set up, so that installing it a second
# time does not leave the old one behind.
read_id() {
    sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$1" | head -1
}

# Check that the server answers, so a wrong url is found out right away
# instead of the agent reporting nothing and nobody noticing.
check_server() {
    health="${SERVER%/}/health"

    if command -v curl >/dev/null 2>&1; then
        curl -fs --max-time 5 -o /dev/null "$health"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO /dev/null --timeout=5 "$health"
    else
        return 0
    fi
}

uninstall_agent() {
    if command -v systemctl >/dev/null 2>&1; then
        systemctl disable --now lilbro >/dev/null 2>&1 || true
    fi

    rm -f "$UNIT" "$BINARY"
    rm -rf "$CONFIG_DIR"

    if command -v systemctl >/dev/null 2>&1; then
        systemctl daemon-reload >/dev/null 2>&1 || true
    fi

    echo "removed the agent and its service"
    echo "the config is gone as well, so the id of this host is lost"
}

install_agent() {
    [ -n "$SERVER" ] || die "--server is required"

    if [ "$ROOT" = "/" ]; then
        [ "$(id -u)" = "0" ] || die "this has to run as root"
    fi

    asset=$(detect_asset)
    version=$(resolve_version)
    [ -n "$version" ] || die "could not work out which release to install, pass one with --version"

    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT

    echo "installing ${asset} ${version}"

    download "https://github.com/${REPO}/releases/download/${version}/${asset}" "${tmp}/${asset}"

    if download "https://github.com/${REPO}/releases/download/${version}/checksums.txt" "${tmp}/checksums.txt"; then
        expected=$(grep "  ${asset}\$" "${tmp}/checksums.txt" | awk '{print $1}')
        actual=$(sha256sum "${tmp}/${asset}" | awk '{print $1}')
        if [ -n "$expected" ] && [ "$expected" != "$actual" ]; then
            die "the checksum of ${asset} does not match, not installing it"
        fi
        echo "checksum is good"
    else
        echo "no checksums for this release, skipping the check"
    fi

    mkdir -p "$(dirname "$BINARY")" "$CONFIG_DIR" "$(dirname "$UNIT")"
    chmod 0700 "$CONFIG_DIR"
    install -m 0755 "${tmp}/${asset}" "$BINARY"

    # an agent that is already set up keeps its id, so that installing it a
    # second time does not leave the old one behind in the dashboard
    if [ -z "$AGENT_ID" ] && [ -f "$CONFIG" ]; then
        AGENT_ID=$(read_id "$CONFIG")
        [ -n "$AGENT_ID" ] && echo "keeping the agent id ${AGENT_ID}"
    fi
    [ -n "$AGENT_ID" ] || AGENT_ID=$(new_id)

    cat > "$CONFIG" <<EOF
{
  "id": "${AGENT_ID}",
  "server_url": "${SERVER}"
}
EOF
    chmod 0600 "$CONFIG"

    download "https://raw.githubusercontent.com/${REPO}/${version}/lilbro/lilbro.service" "$UNIT"
    chmod 0644 "$UNIT"

    if [ "$ROOT" = "/" ] && command -v systemctl >/dev/null 2>&1; then
        systemctl daemon-reload
        systemctl enable --now lilbro
    else
        echo "systemd was not touched, start the agent by hand:"
        echo "  ${BINARY} --config ${CONFIG}"
    fi

    echo
    echo "installed lilbro ${version}"
    echo "  agent id  : ${AGENT_ID}"
    echo "  config    : ${CONFIG}"
    echo "  service   : systemctl status lilbro"
    echo "  logs      : journalctl -u lilbro -f"

    if check_server; then
        echo "  server    : ${SERVER} answers"
    else
        echo "  WARNING   : nothing answers at ${SERVER%/}/health"
        echo "               the agent cannot report until it does"
    fi
}

if [ "$UNINSTALL" = "yes" ]; then
    uninstall_agent
else
    install_agent
fi
