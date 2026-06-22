package processes

import "strings"

var kernelPrefixes = []string{
	"kworker/", "ksoftirqd/", "migration/", "cpuhp/", "idle_inject/", "irq/", "rcu_", "watchdog/", "ksmd", "khugepaged", "kcompactd", "kdevtmpfs", "writeback", "kblockd", "kintegrityd", "kthrotld",

	"systemd-userwork", "systemd-journal", "systemd-udevd", "systemd-network", "systemd-resolve", "systemd-logind",
}

var interactiveTerminals = map[string]bool{
	"kitty": true, "alacritty": true, "gnome-terminal": true, "konsole": true, "xterm": true, "tmux": true, "tmux: server": true, "screen": true,
}

var shellNames = map[string]bool{
	"zsh": true, "bash": true, "sh": true, "fish": true,
}

var ignoredNames = map[string]bool{
	"kitty": true, "alacritty": true, "gnome-terminal": true, "konsole": true, "xterm": true, "tmux": true, "screen": true, "Web Content": true, "WebExtensions": true, "Privileged Cont": true, "RDD Process": true, "Socket Process": true, "Utility Process": true, "bwrap": true, "gpu-process": true, "Isolated Service": true,
}

var ignoredParents = map[string]bool{
	"zen-bin": true, "firefox": true, "chrome": true, "chromium": true, "brave": true, "electron": true,
}

// i will add this properly next time
// var trustedPathPrefixes = []string{
// 	"/usr/bin/", "/usr/sbin/", "/bin/", "/sbin/", "/usr/lib/", "/usr/libexec/", "/opt/",
// }

func ShouldIgnore(proc ProcessInfo, parentName string) bool {
	if proc.Name == "" || proc.User == "" {
		return true
	}
	for _, prefix := range kernelPrefixes {
		if strings.HasPrefix(proc.Name, prefix) {
			return true
		}
	}

	// if proc.CmdLine != "" && !isFromTrustedPath(proc.CmdLine) {
	// 	return false
	// }

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

// func isFromTrustedPath(cmdline string) bool {
// 	for _, prefix := range trustedPathPrefixes {
// 		if strings.HasPrefix(cmdline, prefix) {
// 			return true
// 		}
// 	}

// 	return !strings.HasPrefix(cmdline, "/")
// }
