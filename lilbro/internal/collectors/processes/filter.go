package processes

import (
	"strings"
)

const commLen = 15

var kernelPrefixes = newPrefixes(
	"kworker/", "ksoftirqd/", "migration/", "cpuhp/", "idle_inject/", "irq/", "rcu_",
	"watchdog/", "ksmd", "khugepaged", "kcompactd", "kdevtmpfs", "writeback", "kblockd",
	"kintegrityd", "kthrotld",

	"kthreadd", "khungtaskd", "kprobe-optimizer", "ksgxd", "oom_reaper",
	"pool_workqueue_release", "rcub/", "scsi_eh_", "watchdogd", "hwrng", "kauditd",
	"krfcommd", "card1-crtc",

	"systemd-userwork", "systemd-journal", "systemd-udevd", "systemd-network",
	"systemd-resolve", "systemd-logind", "systemd-timesyn", "systemd-userdbd",
)

var interactiveTerminals = newSet(
	"kitty", "alacritty", "gnome-terminal", "konsole", "xterm",
	"tmux", "tmux: client", "tmux: server", "screen",
)

var shellNames = newSet(
	"zsh", "bash", "sh", "fish",
)

var ignoredNames = newSet(
	"kitty", "alacritty", "gnome-terminal", "konsole", "xterm",
	"tmux", "tmux: client", "tmux: server", "screen",
	"Web Content", "WebExtensions", "Privileged Cont", "RDD Process", "Socket Process",
	"Utility Process", "Isolated Service", "Isolated Web Content",
	"bwrap", "gpu-process", "kitten",

	"at-spi-bus-launcher", "at-spi2-registryd", "blueman-applet", "blueman-tray",
	"dconf-service", "dbus-broker", "dbus-broker-launch", "fcitx5", "gvfsd",
	"gvfsd-fuse", "gvfsd-metadata", "gvfsd-network", "gvfsd-trash",
	"gvfs-udisks2-volume-monitor", "gnome-keyring-daemon", "keyboxd", "keyd",
	"mozc_server", "pipewire", "pipewire-pulse", "polkitd", "power-profiles-daemon",
	"rtkit-daemon", "udisksd", "upowerd", "wireplumber", "xdg-desktop-portal",
	"xdg-document-portal", "xdg-permission-store",
	"NetworkManager", "bluetoothd", "iwd", "Xwayland", "greetd",
	"(sd-pam)", "(udev-worker)",

	"containerd", "containerd-shim", "docker-proxy", "dockerd",

	"antigravity", "codium", "code", "gopls", "language_server", "opencode",

	"sleep",
)

var ignoredParents = newSet(
	"zen-bin", "firefox", "chrome", "chromium", "brave", "electron",
	"codium", "code", "antigravity", "opencode", "gopls", "language_server",
)

func ShouldIgnore(proc ProcessInfo, parentName string) bool {
	if proc.Name == "" || proc.User == "" {
		return true
	}
	for _, prefix := range kernelPrefixes {
		if strings.HasPrefix(proc.Name, prefix) {
			return true
		}
	}

	if shellNames[proc.Name] && interactiveTerminals[parentName] {
		return true
	}

	if ignoredNames[proc.Name] {
		return true
	}

	if ignoredParents[parentName] {
		return true
	}

	return false
}

func comm(name string) string {
	if len(name) > commLen {
		return name[:commLen]
	}
	return name
}

func newSet(names ...string) map[string]bool {
	set := make(map[string]bool, len(names)*2)
	for _, name := range names {
		set[name] = true
		if len(name) > commLen {
			set[name[:commLen]] = true
		}
	}
	return set
}

func newPrefixes(names ...string) []string {
	prefixes := make([]string, 0, len(names)*2)
	for _, name := range names {
		prefixes = append(prefixes, name)
		if len(name) > commLen {
			prefixes = append(prefixes, name[:commLen])
		}
	}
	return prefixes
}
